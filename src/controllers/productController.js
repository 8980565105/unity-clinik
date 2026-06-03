const slugify = require("slugify");
const Product = require("../models/Product");
const { sendResponse } = require("../utils/response");
const ProductVariant = require("../models/ProductVariant");
const mongoose = require("mongoose");

// helper function
const normalizeSections = (sections = []) => {
  return (Array.isArray(sections) ? sections : []).map((section) => ({
    type: section.type || "",

    data: {
      status: section?.data?.status ?? true,

      title: section?.data?.title || "",

      description: section?.data?.description || "",

      image: section?.data?.image || "",

      // FAQ
      questions: (section?.data?.questions || []).map((q) => ({
        question: q.question || "",
        answer: q.answer || "",
        image: q.image || "",
      })),

      // Why Choose + Before After
      items: (section?.data?.items || []).map((item) => ({
        name: item.name || "",

        title: item.title || "",

        description: item.description || "",

        image: item.image || "",

        beforeImage: item.beforeImage || "",

        afterImage: item.afterImage || "",

        usPoint: item.usPoint || "",

        otherPoint: item.otherPoint || "",

        product_id:
          item.product_id && mongoose.Types.ObjectId.isValid(item.product_id)
            ? item.product_id
            : null,
      })),

      // Multi Step
      steps: (section?.data?.steps || []).map((step) => ({
        status: step?.status ?? true,

        title: step?.title || "",

        display_type: step?.display_type || "Text",

        description: step?.description || "",

        variants: (step?.variants || []).map((variant) => ({
          title: variant.title || "",

          description: variant.description || "",

          image: variant.image || "",

          slug: variant.slug || "",

          badge: variant.badge || "",

          product_id:
            variant.product_id &&
            mongoose.Types.ObjectId.isValid(variant.product_id)
              ? variant.product_id
              : null,

          price: Number(variant.price || 0),

          offerprice: Number(variant.offerprice || 0),
        })),
      })),
    },
  }));
};

// ─────────────────────────────────────────────────────────────────
// Helper: ownership check — storeId based
// ─────────────────────────────────────────────────────────────────
// const isOwnerOrAdmin = (req, product) => {
//   if (req.user.role === "admin") return true;
//   return product.storeId?.toString() === req.user.storeId?.toString();
// };

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
            $addFields: {
              brand_id: { $arrayElemAt: ["$brand", 0] },
              type_id: { $arrayElemAt: ["$type", 0] },
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

      types,

      minPrice,
      maxPrice,
    } = req.query;

    const download = isDownload.toString().toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);

    const productMatch = {
      status: "active",
    };

    if (search) {
      productMatch.name = {
        $regex: search,
        $options: "i",
      };
    }
    // if (!req.storeFilter || !req.storeFilter.storeId) {
    //   return res.json({
    //     success: true,
    //     data: { products: [], total: 0, page, pages: 0 },
    //   });
    // }
    // productMatch.storeId = new mongoose.Types.ObjectId(req.storeFilter.storeId);

    if (search) {
      productMatch.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (categories) {
      const categoryArray = Array.isArray(categories)
        ? categories
        : String(categories).split(",");
      productMatch.category_id = {
        $in: categoryArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }

    const variantMatch = {};
    if (brands) {
      const brandsArray = Array.isArray(brands)
        ? brands
        : typeof brands === "string"
          ? brands.split(",")
          : [];
      variantMatch.brand_id = {
        $in: brandsArray.map((id) => new mongoose.Types.ObjectId(id)),
      };
    }
    if (types) {
      const typesArray = Array.isArray(types)
        ? types
        : String(types).split(",");
      variantMatch.type_id = {
        $in: typesArray.map((id) => new mongoose.Types.ObjectId(id)),
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

    const productMatch = {};

    if (search) {
      productMatch.name = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      productMatch.status = status;
    }
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
      .lean();

    if (!product) return sendResponse(res, false, null, "Product not found");

    const variants = await ProductVariant.find({ product_id: product._id })
      .populate("brand_id", "name")
      .populate("type_id", "name")
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
      .lean();

    if (!product) return sendResponse(res, false, null, "Product not found");

    // if (req.user.role === "store_owner") {
    // if (!isOwnerOrAdmin(req, product)) {
    //   return sendResponse(res, false, null, "Forbidden: Not your product");
    // }
    // }

    const variants = await ProductVariant.find({ product_id: product._id })
      .populate("brand_id", "name")
      .populate("type_id", "name")
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
      steps,
      category_id,
      status,
      discount_id,
      variants,
      sections,
    } = req.body;

    let productImages = "";

    if (req.file) {
      productImages = `/uploads/${req.file.filename}`;
    } else if (req.body.images) {
      productImages = req.body.images;
    }
    // {
    //       productImages = req.files[0] ? `/uploads/${req.files[0].filename}` : "";
    //     } else if (req.body.images) {
    //       productImages = req.body.images;
    //     }
    // const storeId =
    //   req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    // const product = new Product({
    //   name,
    //   slug: slugify(name, { lower: true, strict: true }),
    //   description,
    //   steps,
    //   category_id: Array.isArray(category_id) ? category_id : [category_id],
    //   discount_id: discount_id || null,
    //   status: status || "active",
    //   images: productImages,

    //   sections: normalizeSections(
    //     typeof sections === "string" ? JSON.parse(sections) : sections,
    //   ),
    // });
    const product = new Product({
      name,
      slug: slugify(name, {
        lower: true,
        strict: true,
      }),
      description,
      steps,
      category_id: Array.isArray(category_id) ? category_id : [category_id],
      discount_id: discount_id || null,
      status: status || "active",
      images: productImages,
      sections: normalizeSections(
        typeof sections === "string" ? JSON.parse(sections) : sections,
      ),
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
        offerprice: Number(v.offerprice),
        barcode: v.barcode || "",
        Manufactured: v.Manufactured,
        steps: v.steps || "",
        Marketed: v.Marketed,
        CountryOrigin: v.CountryOrigin,
        ProductLength: Number(v.ProductLength),
        ProductWidth: Number(v.ProductWidth),
        ProductHeight: Number(v.ProductHeight),
        ProductWeight: Number(v.ProductWeight),
        description: v.description,
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

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { variants, sections, ...productData } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return sendResponse(res, false, null, "Product not found");
    }

    // if (!isOwnerOrAdmin(req, product)) {
    //   return sendResponse(res, false, null, "Forbidden: Not your product");
    // }

    let parsedSections = [];

    if (sections) {
      parsedSections =
        typeof sections === "string" ? JSON.parse(sections) : sections;
    }

    product.name = productData.name || product.name;

    product.description = productData.description || "";

    product.steps = productData.steps || "";

    product.category_id = Array.isArray(productData.category_id)
      ? productData.category_id
      : [productData.category_id];

    product.status = productData.status || product.status;

    if (req.file) {
      product.images = `/uploads/${req.file.filename}`;
    } else if (productData.images) {
      product.images = productData.images;
    }

    product.sections = normalizeSections(parsedSections);
    const updatedProduct = await product.save();

    if (Array.isArray(variants)) {
      for (const v of variants) {
        if (v._id) {
          await ProductVariant.findByIdAndUpdate(
            v._id,
            {
              ...v,
              price: Number(v.price),
              stock_quantity: Number(v.stock_quantity),
              offerprice: Number(v.offerprice),
              ProductWeight: Number(v.ProductWeight),
              ProductHeight: Number(v.ProductHeight),
              ProductWidth: Number(v.ProductWidth),
              ProductLength: Number(v.ProductLength),
            },
            { new: true },
          );
        } else {
          await new ProductVariant({
            ...v,
            product_id: id,
          }).save();
        }
      }
    }

    sendResponse(res, true, updatedProduct, "Product updated successfully");
  } catch (err) {
    console.error("UPDATE ERROR:", err);

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
    // if (!isOwnerOrAdmin(req, product)) {
    //   return sendResponse(res, false, null, "Forbidden: Not your product");
    // }

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
    // if (!isOwnerOrAdmin(req, product)) {
    //   return sendResponse(res, false, null, "Forbidden: Not your product");
    // }

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

    // let deleteQuery = { _id: { $in: ids } };
    // if (req.user.role === "store_owner") {
    //   deleteQuery.storeId = req.user.storeId;
    // }
    const deleteQuery = {
      _id: { $in: ids },
    };

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
