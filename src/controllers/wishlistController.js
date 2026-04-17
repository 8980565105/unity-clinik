const Wishlist = require("../models/Wishlist");
const Product = require("../models/Product");
const { sendResponse } = require("../utils/response");

const getWishlist = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", isDownload = "false" } = req.query;
    const download = isDownload.toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);
    const userRole = req.user?.role;
    const userId = req.user?._id;
    const baseMatch = {};
    if (userRole === "store_owner") {
      baseMatch["items.store_owner_id"] = userId;
    } else if (userRole === "admin") {
    } else {
      return sendResponse(res, false, null, "Forbidden: Insufficient role");
    }
    const searchMatch = search
      ? {
          $or: [
            { "userInfo.name": { $regex: search, $options: "i" } },
            { "userInfo.email": { $regex: search, $options: "i" } },
            { "items.productInfo.name": { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const pipeline = [
      { $match: baseMatch },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "products",
          localField: "items.product_id",
          foreignField: "_id",
          as: "productList",
        },
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    productInfo: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$productList",
                            as: "p",
                            cond: { $eq: ["$$p._id", "$$item.product_id"] },
                          },
                        },
                        0,
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      },
      ...(userRole === "store_owner"
        ? [
            {
              $addFields: {
                items: {
                  $filter: {
                    input: "$items",
                    as: "item",
                    cond: {
                      $eq: [
                        { $toString: "$$item.store_owner_id" },
                        userId.toString(),
                      ],
                    },
                  },
                },
              },
            },
            { $match: { "items.0": { $exists: true } } },
          ]
        : []),
      ...(search ? [{ $match: searchMatch }] : []),
    ];
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await Wishlist.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;
    if (!download) {
      pipeline.push({ $skip: (page - 1) * limit });
      pipeline.push({ $limit: limit });
    }
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "_id",
        as: "user_id",
      },
    });
    pipeline.push({
      $unwind: { path: "$user_id", preserveNullAndEmptyArrays: true },
    });

    const wishlists = await Wishlist.aggregate(pipeline);
    const populated = await Wishlist.populate(wishlists, [
      { path: "items.product_id", select: "name image images" },
      { path: "items.variant_id", select: "price color size sku image images" },
    ]);

    return sendResponse(
      res,
      true,
      { wishlists: populated, total, page, pages: Math.ceil(total / limit) },
      "Wishlists retrieved successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const addItemToWishlist = async (req, res) => {
  try {
    const { user_id, items } = req.body;

    if (!user_id || !items || !Array.isArray(items) || items.length === 0) {
      return sendResponse(
        res,
        false,
        null,
        "user_id and items array are required",
      );
    }

    let wishlist = await Wishlist.findOne({ user_id });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id, items: [] });
    }

    for (const { product_id, variant_id } of items) {
      const exists = wishlist.items.some(
        (i) =>
          i.product_id.toString() === product_id &&
          (variant_id ? i.variant_id?.toString() === variant_id : true),
      );

      if (!exists) {
        let store_owner_id = null;
        try {
          const product =
            await Product.findById(product_id).select("createdBy");
          if (product?.createdBy) {
            store_owner_id = product.createdBy;
          }
        } catch (e) {
          console.error(
            "store_owner_id resolve failed for wishlist item:",
            e.message,
          );
        }
        wishlist.items.push({ product_id, variant_id, store_owner_id });
      }
    }
    await wishlist.save();
    wishlist = await wishlist.populate(
      "items.product_id items.variant_id",
      "name price sku image images",
    );
    sendResponse(res, true, wishlist, "Items added to wishlist successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const removeItemFromWishlist = async (req, res) => {
  try {
    const { wishlist_id, item_id } = req.body;
    const wishlist = await Wishlist.findById(wishlist_id);
    if (!wishlist) return sendResponse(res, false, null, "Wishlist not found");
    wishlist.items = wishlist.items.filter(
      (item) => item._id.toString() !== item_id,
    );
    await wishlist.save();
    sendResponse(
      res,
      true,
      wishlist,
      "Item removed from wishlist successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getWishlistByUser = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user_id: req.params.user_id })
      .populate({
        path: "items.product_id",
        populate: { path: "discount_id", select: "type value" },
      })
      .populate("items.variant_id");

    if (!wishlist) return sendResponse(res, false, null, "Wishlist not found");

    sendResponse(res, true, wishlist, "Wishlist retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteWishlistItem = async (req, res) => {
  try {
    const { id } = req.params; // item._id

    const wishlist = await Wishlist.findOne({ "items._id": id });
    if (!wishlist)
      return sendResponse(res, false, null, "Wishlist item not found");

    wishlist.items = wishlist.items.filter(
      (item) => item._id.toString() !== id,
    );

    await wishlist.save();

    sendResponse(res, true, null, "Wishlist item deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};
const bulkDeleteWishlistItems = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, false, null, "No item IDs provided");
    }
    const result = await Wishlist.updateMany(
      { "items._id": { $in: ids } },
      { $pull: { items: { _id: { $in: ids } } } },
    );
    if (result.modifiedCount === 0) {
      return sendResponse(
        res,
        false,
        null,
        "No matching items found to delete",
      );
    }
    sendResponse(
      res,
      true,
      result,
      "Selected wishlist items deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getWishlist,
  addItemToWishlist,
  removeItemFromWishlist,
  getWishlistByUser,
  deleteWishlistItem,
  bulkDeleteWishlistItems,
};
