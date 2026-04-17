const Cart = require("../models/Cart");
const Product = require("../models/Product");
const User = require("../models/User");
const { sendResponse } = require("../utils/response");

const getCarts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", isDownload = "false" } = req.query;
    const download = isDownload.toLowerCase() === "true";

    const userRole = req.user?.role;
    const userId = req.user?._id;

    let query = {};

    if (userRole === "store_owner") {
      query["items.store_owner_id"] = userId;
    } else if (userRole === "admin") {
    } else {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const userIds = matchingUsers.map((u) => u._id);
      query.user_id = { $in: userIds };
    }

    if (download) {
      let carts = await Cart.find(query)
        .populate("user_id", "name email")
        .populate("items.product_id", "name image images")
        .populate("items.variant_id", "price color size sku image images")
        .sort({ createdAt: -1 });

      if (userRole === "store_owner") {
        carts = carts
          .map((cart) => ({
            ...cart.toObject(),
            items: cart.items.filter(
              (item) => item.store_owner_id?.toString() === userId.toString(),
            ),
          }))
          .filter((cart) => cart.items.length > 0);
      }

      return sendResponse(res, true, { carts }, "All carts for download");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Cart.countDocuments(query);

    let carts = await Cart.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("user_id", "name email")
      .populate("items.product_id", "name image images")
      .populate("items.variant_id", "price color size sku image images");

    if (userRole === "store_owner") {
      carts = carts
        .map((cart) => ({
          ...cart.toObject(),
          items: cart.items.filter(
            (item) => item.store_owner_id?.toString() === userId.toString(),
          ),
        }))
        .filter((cart) => cart.items.length > 0);
    }

    sendResponse(res, true, {
      carts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate("user_id", "name email")
      .populate({
        path: "items.product_id",
        select: "name price image images discount_id createdBy",
        populate: { path: "discount_id", select: "type value" },
      })
      .populate("items.variant_id", "color size sku price image images");

    if (!cart) return sendResponse(res, false, null, "Cart not found");
    sendResponse(res, true, cart, "Cart retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createCart = async (req, res) => {
  try {
    const cart = new Cart(req.body);
    const savedCart = await cart.save();
    sendResponse(res, true, savedCart, "Cart created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const addCartItem = async (req, res) => {
  try {
    const { cart_id, product_id, variant_id, quantity } = req.body;

    const cart = await Cart.findById(cart_id);
    if (!cart) return sendResponse(res, false, null, "Cart not found");

    let store_owner_id = null;
    try {
      const product = await Product.findById(product_id).select("createdBy");
      if (product?.createdBy) {
        store_owner_id = product.createdBy;
      }
    } catch (e) {
      console.error("store_owner_id resolve failed:", e.message);
    }

    const existingItem = cart.items.find(
      (item) => item.variant_id.toString() === variant_id,
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      if (!existingItem.store_owner_id && store_owner_id) {
        existingItem.store_owner_id = store_owner_id;
      }
    } else {
      cart.items.push({ product_id, variant_id, quantity, store_owner_id });
    }

    await cart.save();
    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product_id",
        select: "name price image images discount_id createdBy",
        populate: { path: "discount_id", select: "type value" },
      })
      .populate("items.variant_id", "color size sku price image images");

    sendResponse(res, true, populatedCart, "Item added to cart successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateCartItem = async (req, res) => {
  try {
    const { cart_id, item_id, quantity } = req.body;

    const cart = await Cart.findById(cart_id);
    if (!cart) return sendResponse(res, false, null, "Cart not found");

    const item = cart.items.id(item_id);
    if (!item) return sendResponse(res, false, null, "Item not found");

    item.quantity = quantity;
    await cart.save();

    sendResponse(res, true, { item }, "Cart item updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteCartItem = async (req, res) => {
  try {
    const { cart_id, item_id } = req.body;

    const cart = await Cart.findById(cart_id);
    if (!cart) return sendResponse(res, false, null, "Cart not found");

    cart.items = cart.items.filter((item) => item._id.toString() !== item_id);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({
        path: "items.product_id",
        select: "name price image images discount_id",
        populate: { path: "discount_id", select: "type value" },
      })
      .populate("items.variant_id", "color size sku price image images");

    sendResponse(res, true, populatedCart, "Cart item deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteCart = async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedCart) return sendResponse(res, false, null, "Cart not found");
    sendResponse(res, true, null, "Cart deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteCartItems = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, false, null, "No item IDs provided");
    }

    const result = await Cart.updateMany(
      { "items._id": { $in: ids } },
      { $pull: { items: { _id: { $in: ids } } } },
    );

    if (result.modifiedCount === 0) {
      return sendResponse(res, false, null, "No matching cart items found");
    }

    sendResponse(res, true, result, "Selected cart items deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getCarts,
  getCartById,
  createCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  bulkDeleteCartItems,
};
