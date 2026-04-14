const slugify = require("slugify");
const Product = require("../models/Product");
const { sendResponse } = require("../utils/response");
const ProductVariant = require("../models/ProductVariant");
const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────
// Helper: ownership check — storeId based
// ─────────────────────────────────────────────────────────────────
const isOwnerOrAdmin = (req, product) => {
  if (req.user.role === "admin") return true;
  return product.storeId?.toString() === req.user.storeId?.toString();
};

// ─────────────────────────────────────────────────────────────────
// Helper: build aggregation pipeline
// ─────────────────────────────────────────────────────────────────
const buildPipeline = ({
  productMatch,
  variantMatch,
  page,
  limit,
  download,
}) => {
  const pipeline = [
    { $match: productMatch },
    {
      $lookup: {
        from: "categories",
        localField: "category_id",
        foreignField: "_id",
        as: "category",
      },
    },
    { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "discounts",
        localField: "discount_id",
        foreignField: "_id",
        as: "discount",
      },
    },
    { $unwind: { path: "$discount", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdByUser",
      },
    },
    { $unwind: { path: "$createdByUser", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "productvariants",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$product_id", "$$productId"] },
              ...variantMatch,
            },
          },
          {
            $lookup: {
              from: "brands",
              localField: "brand_id",
              foreignField: "_id",
              as: "brand",
            },
          },
          {
            $lookup: {
              from: "types",
              localField: "type_id",
              foreignField: "_id",
              as: "type",
            },
          },
          {
            $lookup: {
              from: "fabrics",
              localField: "fabric_id",
              foreignField: "_id",
              as: "fabric",
            },
          },
          {
            $lookup: {
              from: "colors",
              localField: "color_id",
              foreignField: "_id",
              as: "color",
            },
          },
          {
            $lookup: {
              from: "sizes",
              localField: "size_id",
              foreignField: "_id",
              as: "size",
            },
          },
          {
            $addFields: {
              brand_id: { $arrayElemAt: ["$brand", 0] },
              type_id: { $arrayElemAt: ["$type", 0] },
              fabric_id: { $arrayElemAt: ["$fabric", 0] },
              color_id: { $arrayElemAt: ["$color", 0] },
              size_id: { $arrayElemAt: ["$size", 0] },
            },
          },
          {
            $addFields: {
              labels: {
                $map: { input: "$labels", as: "l", in: { $toObjectId: "$$l" } },
              },
            },
          },
          {
            $lookup: {
              from: "labels",
              localField: "labels",
              foreignField: "_id",
              as: "labelsInfo",
            },
          },
        ],
        as: "variants",
      },
    },
    { $match: { "variants.0": { $exists: true } } },
    { $sort: { createdAt: -1 } },
  ];

  if (!download) {
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
  }

  return pipeline;
};

// ═══════════════════════════════════════════════════════════════════
// PUBLIC — Frontend mate (domain thhi storeId resolve)
// ═══════════════════════════════════════════════════════════════════
const getPublicProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 50,
      search = "",
      isDownload = "false",
      categories,
      brands,
      sizes,
      types,
      fabrics,
      colors,
      minPrice,
      maxPrice,
    } = req.query;

    const download = isDownload.toString().toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);

    const productMatch = { status: "active" };
    if (search) productMatch.name = { $regex: search, $options: "i" };

    if (!req.storeFilter || !req.storeFilter.storeId) {
      return res.json({
        success: true,
        data: { products: [], total: 0, page, pages: 0 },
      });
    }
    productMatch.storeId = new mongoose.Types.ObjectId(req.storeFilter.storeId);

    if (categories) {
      const categoryArray = Array.isArray(categories) ? categories : String(categories).split(",");
      productMatch.category_id = {
        $in: categoryArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const variantMatch = {};
    if (brands) {
      const brandsArray = Array.isArray(brands) ? brands : (typeof brands === "string" ? brands.split(",") : []);
      variantMatch.brand_id = {
        $in: brandsArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (sizes) {
      const sizesArray = Array.isArray(sizes) ? sizes : String(sizes).split(",");
      variantMatch.size_id = {
        $in: sizesArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (types) {
      const typesArray = Array.isArray(types) ? types : String(types).split(",");
      variantMatch.type_id = {
        $in: typesArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (fabrics) {
      const fabricsArray = Array.isArray(fabrics) ? fabrics : String(fabrics).split(",");
      variantMatch.fabric_id = {
        $in: fabricsArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (colors) {
      const colorsArray = Array.isArray(colors) ? colors : String(colors).split(",");
      variantMatch.color_id = {
        $in: colorsArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (minPrice || maxPrice) {
      variantMatch.price = {};
      if (minPrice) variantMatch.price.$gte = Number(minPrice);
      if (maxPrice) variantMatch.price.$lte = Number(maxPrice);
    }

    const pipeline = buildPipeline({
      productMatch,
      variantMatch,
      page,
      limit,
      download,
    });
    const products = await Product.aggregate(pipeline);

    const countPipeline = [
      { $match: productMatch },
      {
        $lookup: {
          from: "productvariants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$productId"] },
                ...variantMatch,
              },
            },
          ],
          as: "variants",
        },
      },
      { $match: { "variants.0": { $exists: true } } },
      { $count: "total" },
    ];
    const countResult = await Product.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    res.json({
      success: true,
      data: {
        products,
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err) {
    console.error("❌ getPublicProducts error:", err);
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
const getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 50,
      search = "",
      isDownload = "false",
      status,
    } = req.query;

    const download = isDownload.toString().toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);

    const productMatch = { ...req.storeFilter };
    if (search) productMatch.name = { $regex: search, $options: "i" };
    if (status) productMatch.status = status;

    const variantMatch = {};

    const pipeline = buildPipeline({
      productMatch,
      variantMatch,
      page,
      limit,
      download,
    });
    const products = await Product.aggregate(pipeline);

    const countPipeline = [
      { $match: productMatch },
      {
        $lookup: {
          from: "productvariants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$product_id", "$$productId"] },
              },
            },
          ],
          as: "variants",
        },
      },
      { $match: { "variants.0": { $exists: true } } },
      { $count: "total" },
    ];
    const countResult = await Product.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    sendResponse(
      res,
      true,
      {
        products,
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
      },
      "Products retrieved successfully",
    );
  } catch (err) {
    console.error("❌ getProducts error:", err);
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /products/public/:id — No auth needed
// ═══════════════════════════════════════════════════════════════════
const getPublicProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name")
      .populate("discount_id")
      // .populate("offer_ids") // ✅ populate offers
      .lean();

    if (!product) return sendResponse(res, false, null, "Product not found");

    const variants = await ProductVariant.find({ product_id: product._id })
      .populate("brand_id", "name")
      .populate("fabric_id", "name")
      .populate("type_id", "name")
      .populate("size_id", "name")
      .populate("color_id", "name code")
      .lean();

    sendResponse(
      res,
      true,
      { ...product, variants },
      "Product retrieved successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// GET /products/:id — Auth required
// ═══════════════════════════════════════════════════════════════════
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name")
      .populate("discount_id")
      // .populate("offer_ids") // ✅ populate offers
      .lean();

    if (!product) return sendResponse(res, false, null, "Product not found");

    if (req.user.role === "store_owner") {
      if (!isOwnerOrAdmin(req, product)) {
        return sendResponse(res, false, null, "Forbidden: Not your product");
      }
    }

    const variants = await ProductVariant.find({ product_id: product._id })
      .populate("brand_id", "name")
      .populate("fabric_id", "name")
      .populate("type_id", "name")
      .populate("size_id", "name")
      .populate("color_id", "name code")
      .lean();

    sendResponse(
      res,
      true,
      { ...product, variants },
      "Product retrieved successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// POST /products
// ═══════════════════════════════════════════════════════════════════
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category_id,
      status,
      discount_id,
      // offer_ids,
      variants,
    } = req.body;

    let productImages = [];
    if (req.files && req.files.length > 0) {
      productImages = req.files.map((file) => `/uploads/${file.filename}`);
    } else if (req.body.images) {
      productImages = Array.isArray(req.body.images)
        ? req.body.images
        : [req.body.images];
    }

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const product = new Product({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description,
      category_id,
      discount_id: discount_id || null,
      // ✅ Save offer_ids array (filter empty strings)
      // offer_ids: Array.isArray(offer_ids) ? offer_ids.filter((id) => id) : [],
      status: status || "active",
      images: productImages,
      createdBy: req.user._id,
      storeId,
    });

    const savedProduct = await product.save();

    let savedVariants = [];
    if (Array.isArray(variants) && variants.length > 0) {
      const variantDocs = variants.map((v, idx) => ({
        ...v,
        product_id: savedProduct._id,
        status: v.status || "active",
        images: Array.isArray(v.images) ? v.images : [],
        labels: Array.isArray(v.labels) ? v.labels : [],
        sku: v.sku || `SKU-${Date.now()}-${idx}`,
        description: v.description || "",
        price: Number(v.price),
        stock_quantity: Number(v.stock_quantity),
        is_featured: !!v.is_featured,
        is_best_seller: !!v.is_best_seller,
        is_trending: !!v.is_trending,
      }));
      savedVariants = await ProductVariant.insertMany(variantDocs);
    }

    sendResponse(
      res,
      true,
      { product: savedProduct, variants: savedVariants },
      "Product created with variants successfully",
    );
  } catch (err) {
    console.error("Error creating product:", err);
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// PUT /products/:id
// ═══════════════════════════════════════════════════════════════════
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { variants, ...productData } = req.body;

    const product = await Product.findById(id);
    if (!product) return sendResponse(res, false, null, "Product not found");
    if (!isOwnerOrAdmin(req, product)) {
      return sendResponse(res, false, null, "Forbidden: Not your product");
    }

    // ✅ Update offer_ids array
    // if (Array.isArray(offer_ids)) {
    //   productData.offer_ids = offer_ids.filter((oid) => oid);
    // }

    const updatedProduct = await Product.findByIdAndUpdate(id, productData, {
      new: true,
    });

    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v._id) {
          await ProductVariant.findByIdAndUpdate(v._id, v, { new: true });
        } else {
          const newVariant = new ProductVariant({ ...v, product_id: id });
          await newVariant.save();
        }
      }
    }

    sendResponse(
      res,
      true,
      updatedProduct,
      "Product and variants updated successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// PUT /products/:id/status
// ═══════════════════════════════════════════════════════════════════
const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const product = await Product.findById(id);
    if (!product) return sendResponse(res, false, null, "Product not found");
    if (!isOwnerOrAdmin(req, product)) {
      return sendResponse(res, false, null, "Forbidden: Not your product");
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );
    sendResponse(res, true, updated, `Product status updated to ${status}`);
  } catch (err) {
    console.error("❌ updateProductStatus error:", err);
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// DELETE /products/:id
// ═══════════════════════════════════════════════════════════════════
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendResponse(res, false, null, "Product not found");
    if (!isOwnerOrAdmin(req, product)) {
      return sendResponse(res, false, null, "Forbidden: Not your product");
    }

    await Product.findByIdAndDelete(req.params.id);
    await ProductVariant.deleteMany({ product_id: req.params.id });
    sendResponse(
      res,
      true,
      null,
      "Product and its variants deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

// ═══════════════════════════════════════════════════════════════════
// POST /products/bulk-delete
// ═══════════════════════════════════════════════════════════════════
const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    let deleteQuery = { _id: { $in: ids } };
    if (req.user.role === "store_owner") {
      deleteQuery.storeId = req.user.storeId;
    }

    const result = await Product.deleteMany(deleteQuery);
    await ProductVariant.deleteMany({ product_id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Products and their variants deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPublicProducts,
  getPublicProductById,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  updateProductStatus,
};
