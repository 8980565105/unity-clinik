const Cart = require("../models/Cart");
const User = require("../models/User");
const { sendResponse } = require("../utils/response");

// ─── Helper ───────────────────────────────────────────────────────────
const findCart = async (identifier) => {
  if (identifier.user_id) return Cart.findOne({ user_id: identifier.user_id });
  if (identifier.guest_id)
    return Cart.findOne({ guest_id: identifier.guest_id });
  return null;
};

// ─── GET ALL CARTS (admin only) ───────────────────────────────────────
const getCarts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", isDownload = "false" } = req.query;
    const download = isDownload.toLowerCase() === "true";
    const userRole = req.user?.role;

    if (userRole !== "admin") {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }

    let query = {};

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
      const carts = await Cart.find(query)
        .populate("user_id", "name email")
        .populate("items.product_id", "name image images")
        .populate(
          "items.variant_id",
          "price offerprice color size sku image images",
        )
        .sort({ createdAt: -1 });
      return sendResponse(res, true, { carts }, "All carts for download");
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const total = await Cart.countDocuments(query);

    const carts = await Cart.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate("user_id", "name email")
      .populate("items.product_id", "name image images")
      .populate(
        "items.variant_id",
        "price offerprice color size sku image images",
      );

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

// ─── GET CART BY MONGO ID ─────────────────────────────────────────────
const getCartById = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id)
      .populate("user_id", "name email")
      .populate({
        path: "items.product_id",
        select: "name price offerprice image images category_id",
      })
      .populate(
        "items.variant_id",
        "price offerprice color size sku image images brand_id type_id",
      );

    if (!cart) return sendResponse(res, false, null, "Cart not found");
    sendResponse(res, true, cart, "Cart retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── GET CART BY guest_id OR user_id ─────────────────────────────────
// const getCartByIdentifier = async (req, res) => {
//   try {
//     const { guest_id, user_id } = req.query;
//     if (!guest_id && !user_id)
//       return sendResponse(res, false, null, "Provide guest_id or user_id");

//     const cart = await Cart.findOne(guest_id ? { guest_id } : { user_id })
//       .populate({
//         path: "items.product_id",
//         select: "name price image images category_id",
//       })
//       .populate(
//         "items.variant_id",
//         "price offerprice color size sku image images",
//       );

//     if (!cart) return sendResponse(res, true, { items: [] }, "No cart found");
//     sendResponse(res, true, cart, "Cart retrieved successfully");
//   } catch (err) {
//     sendResponse(res, false, null, err.message);
//   }
// };

const getCartByIdentifier = async (req, res) => {
  try {
    const { user_id, guest_id } = req.query;

    if (!user_id && !guest_id) {
      return sendResponse(res, false, null, "user_id or guest_id required");
    }

    const query = user_id ? { user_id } : { guest_id };
    const cart = await Cart.findOne(query).populate(
      "items.product_id items.variant_id",
    );

    if (!cart) {
      return sendResponse(res, true, null, "Cart not found");
    }

    return sendResponse(res, true, cart, "Cart fetched");
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

// ─── CREATE CART ──────────────────────────────────────────────────────
const createCart = async (req, res) => {
  try {
    const { user_id, guest_id } = req.body;
    if (!user_id && !guest_id)
      return sendResponse(res, false, null, "Provide user_id or guest_id");

    const existing = await findCart({ user_id, guest_id });
    if (existing)
      return sendResponse(res, true, existing, "Cart already exists");

    const cart = new Cart({
      user_id: user_id || null,
      guest_id: guest_id || null,
    });
    const saved = await cart.save();
    sendResponse(res, true, saved, "Cart created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── ADD ITEM TO CART ─────────────────────────────────────────────────
const addCartItem = async (req, res) => {
  try {
    const {
      cart_id,
      product_id,
      variant_id,
      quantity,
      price,
      original_price,
      pack_of,
    } = req.body;

    const cart = await Cart.findById(cart_id);
    if (!cart) return sendResponse(res, false, null, "Cart not found");

    const existingItem = cart.items.find(
      (item) =>
        item.variant_id.toString() === variant_id.toString() &&
        Number(item.pack_of) === Number(pack_of),
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity || 1);
      existingItem.price = Number(price || 0);
      existingItem.original_price = Number(original_price || 0);
      existingItem.pack_of = Number(pack_of || 1);
    } else {
      cart.items.push({
        product_id,
        variant_id,
        quantity: Number(quantity || 1),
        price: Number(price || 0),
        original_price: Number(original_price || 0),
        pack_of: Number(pack_of || 1),
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({ path: "items.product_id", select: "name price image images" })
      .populate(
        "items.variant_id",
        "color size sku price offerprice image images",
      );

    sendResponse(res, true, populatedCart, "Item added to cart successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── UPDATE CART ITEM ─────────────────────────────────────────────────
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

// ─── DELETE CART ITEM ─────────────────────────────────────────────────
const deleteCartItem = async (req, res) => {
  try {
    const { cart_id, item_id } = req.body;

    const cart = await Cart.findById(cart_id);
    if (!cart) return sendResponse(res, false, null, "Cart not found");

    cart.items = cart.items.filter((item) => item._id.toString() !== item_id);
    await cart.save();

    const populatedCart = await Cart.findById(cart._id)
      .populate({ path: "items.product_id", select: "name price image images" })
      .populate(
        "items.variant_id",
        "color size sku price offerprice image images",
      );

    sendResponse(res, true, populatedCart, "Cart item deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── DELETE ENTIRE CART ───────────────────────────────────────────────
const deleteCart = async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedCart) return sendResponse(res, false, null, "Cart not found");
    sendResponse(res, true, null, "Cart deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── BULK DELETE CART ITEMS ───────────────────────────────────────────
const bulkDeleteCartItems = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No item IDs provided");

    const result = await Cart.updateMany(
      { "items._id": { $in: ids } },
      { $pull: { items: { _id: { $in: ids } } } },
    );

    if (result.modifiedCount === 0)
      return sendResponse(res, false, null, "No matching cart items found");

    sendResponse(res, true, result, "Selected cart items deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── MERGE GUEST CART → USER CART ────────────────────────────────────
const mergeGuestCart = async (req, res) => {
  try {
    const { guest_id, user_id } = req.body;
    if (!guest_id || !user_id)
      return sendResponse(
        res,
        false,
        null,
        "Provide both guest_id and user_id",
      );

    const guestCart = await Cart.findOne({ guest_id });

    if (!guestCart || guestCart.items.length === 0) {
      let userCart = await Cart.findOne({ user_id });
      if (!userCart) userCart = await Cart.create({ user_id });
      return sendResponse(res, true, userCart, "No guest cart to merge");
    }

    let userCart = await Cart.findOne({ user_id });

    if (!userCart) {
      guestCart.user_id = user_id;
      guestCart.guest_id = null;
      await guestCart.save();
      return sendResponse(res, true, guestCart, "Cart merged successfully");
    }

    for (const gItem of guestCart.items) {
      const existing = userCart.items.find(
        (i) =>
          i.variant_id.toString() === gItem.variant_id.toString() &&
          Number(i.pack_of) === Number(gItem.pack_of),
      );
      if (existing) {
        existing.quantity += gItem.quantity;
      } else {
        userCart.items.push({ ...gItem.toObject(), _id: undefined });
      }
    }

    await userCart.save();
    await Cart.findByIdAndDelete(guestCart._id);

    const populated = await Cart.findById(userCart._id)
      .populate({ path: "items.product_id", select: "name price image images" })
      .populate(
        "items.variant_id",
        "color size sku price offerprice image images",
      );

    sendResponse(res, true, populated, "Cart merged successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ─── EXPORTS ──────────────────────────────────────────────────────────
module.exports = {
  getCarts,
  getCartById,
  getCartByIdentifier,
  createCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  deleteCart,
  bulkDeleteCartItems,
  mergeGuestCart,
};
