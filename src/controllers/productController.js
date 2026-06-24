const slugify = require("slugify");
const Product = require("../models/Product");
const { sendResponse } = require("../utils/response");
const ProductVariant = require("../models/ProductVariant");
const mongoose = require("mongoose");

const SECTION_ITEM_FIELDS = {
  "Root Cause Section": ["image"],
  "How Does It Do It Section": ["name", "description", "image"],
  "Benefits Section": ["name", "description", "image"],
  "Ingredients Section": ["name", "description", "image"],
  "Treatment Kit Section": ["name", "description", "image"],
  "Treatment Journey Section": ["title", "description", "image"],
  "Daily Usage Section": ["title", "description", "image"],
  "How to use": ["title", "description", "image"],
  "Image Banner Section": ["title", "description", "image"],
  "Why Choose Unity Hair": ["title", "description", "image"],
  "Before & After": ["title", "description", "beforeImage", "afterImage"],
  "FAQ 1": [],
  "FAQ 2": [],
  "Solution By Stage Section": ["title", "description", "image", "product_id"],
  "Product Recommendation Section": ["title", "description", "product_id"],
  "Other Recommended Solutions": ["title", "description", "product_id"],
  "use and Others points": ["name", "description"],
  "Product Attribute Section": ["key", "value"],
  "Additional Information Section": [
    "net_quantity",
    "manufactured_by",
    "marketed_by",
    "country_origin",
    "product_dimensions",
    "best_before",
  ],
  "Result Section": [
    "beforeImage",
    "afterImage",
    "reviewDescription",
    "customerName",
    "customerAge",
    "verifiedReview",
    "stageLabel",
  ],
};

const pickFields = (obj, fields) => {
  const result = {};
  for (const f of fields) {
    result[f] = obj[f] ?? "";
    if (f === "product_id") {
      result[f] =
        obj.product_id && mongoose.Types.ObjectId.isValid(obj.product_id)
          ? obj.product_id
          : null;
    }
  }
  return result;
};

const normalizeSections = (sections = []) => {
  return (Array.isArray(sections) ? sections : []).map((section) => {
    const type = section.type || "";
    const data = section?.data || {};
    const allowedFields = SECTION_ITEM_FIELDS[type];

    const isFaq = type === "FAQ 1" || type === "FAQ 2";

    const normalizedData = {
      status: data.status ?? true,
      title: data.title || "",
      description: data.description || "",
      image: data.image || "",
      questions: [],
      items: [],
      steps: [],
    };

    if (isFaq) {
      normalizedData.questions = (data.questions || []).map((q) => ({
        question: q.question || "",
        answer: q.answer || "",
        image: q.image || "",
      }));
    } else if (type === "Multi Step Selection") {
      normalizedData.steps = (data.steps || []).map((step) => ({
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
      }));
    } else if (allowedFields !== undefined) {
      normalizedData.items = (data.items || []).map((item) =>
        pickFields(item, allowedFields),
      );
    } else {
      normalizedData.items = (data.items || []).map((item) => ({
        name: item.name || "",
        title: item.title || "",
        description: item.description || "",
        image: item.image || "",
      }));
    }

    return { type, data: normalizedData };
  });
};

const buildPipeline = ({
  productMatch,
  variantMatch,
  page,
  limit,
  download,
}) => {
  const hasVariantFilter = Object.keys(variantMatch).length > 0;

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
              ...(hasVariantFilter ? variantMatch : {}),
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
              from: "productlabels",
              localField: "labels",
              foreignField: "_id",
              as: "labelsInfo",
            },
          },
        ],
        as: "variants",
      },
    },
    {
      $lookup: {
        from: "customerreviews",
        let: { productId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$product_id", "$$productId"] },
              is_approved: true,
            },
          },
          { $project: { rating: 1 } },
        ],
        as: "reviews",
      },
    },
    {
      $addFields: {
        reviewStats: {
          total: { $size: "$reviews" },
          average: {
            $cond: [
              { $gt: [{ $size: "$reviews" }, 0] },
              { $round: [{ $avg: "$reviews.rating" }, 1] },
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        reviews: 0,
      },
    },

    ...(hasVariantFilter
      ? [{ $match: { "variants.0": { $exists: true } } }]
      : []),

    {
      $sort: {
        order: 1,
        createdAt: -1,
      },
    },
  ];

  if (!download) {
    pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });
  }

  return pipeline;
};

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
    sendResponse(res, false, null, err.message);
  }
};

const getProducts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
      categories,
      brands,
      types,
      minPrice,
      maxPrice,
    } = req.query;

    const download = isDownload.toString().toLowerCase() === "true";
    page = parseInt(page);
    limit = parseInt(limit);

    const productMatch = {};

    if (search && search.trim()) {
      productMatch.name = { $regex: search.trim(), $options: "i" };
    }

    if (status) {
      productMatch.status = status;
    }

    if (categories) {
      const categoryArray = Array.isArray(categories)
        ? categories
        : String(categories).split(",");
      productMatch.category_id = {
        $in: categoryArray.map((id) => new mongoose.Types.ObjectId(id.trim())),
      };
    }

    const variantMatch = {};

    if (brands) {
      const brandsArray = Array.isArray(brands)
        ? brands
        : String(brands).split(",");
      variantMatch.brand_id = {
        $in: brandsArray.map((id) => new mongoose.Types.ObjectId(id.trim())),
      };
    }

    if (types) {
      const typesArray = Array.isArray(types)
        ? types
        : String(types).split(",");
      variantMatch.type_id = {
        $in: typesArray.map((id) => new mongoose.Types.ObjectId(id.trim())),
      };
    }

    if (minPrice || maxPrice) {
      variantMatch.price = {};
      if (minPrice) variantMatch.price.$gte = Number(minPrice);
      if (maxPrice) variantMatch.price.$lte = Number(maxPrice);
    }

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
                ...(Object.keys(variantMatch).length ? variantMatch : {}),
              },
            },
          ],
          as: "variants",
        },
      },
      ...(Object.keys(variantMatch).length
        ? [{ $match: { "variants.0": { $exists: true } } }]
        : []),
      { $count: "total" },
    ];

    const countResult = await Product.aggregate(countPipeline);
    const totalCount = countResult[0]?.total || 0;

    const pipeline = buildPipeline({
      productMatch,
      variantMatch,
      page,
      limit,
      download,
    });

    const products = await Product.aggregate(pipeline);

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
    sendResponse(res, false, null, err.message);
  }
};

const getPublicProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name")
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

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category_id", "name")
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

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      steps,
      category_id,
      status,
      order,
      variants,
      sections,
    } = req.body;

    let productImages = "";

    if (req.file) {
      productImages = `/uploads/${req.file.filename}`;
    } else if (req.body.images) {
      productImages = req.body.images;
    }

    const product = new Product({
      name,
      order: Number(order) || 999,
      slug: slugify(name, {
        lower: true,
        strict: true,
      }),
      description,
      steps,
      category_id: Array.isArray(category_id) ? category_id : [category_id],
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

    let parsedSections = [];

    if (sections) {
      parsedSections =
        typeof sections === "string" ? JSON.parse(sections) : sections;
    }

    product.name = productData.name || product.name;

    product.description = productData.description || "";
    product.order = Number(productData.order) || "";
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
            { returnDocument: "after" },
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
    sendResponse(res, false, null, err.message);
  }
};

const updateProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const product = await Product.findById(id);
    if (!product) return sendResponse(res, false, null, "Product not found");
    const updated = await Product.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    sendResponse(res, true, updated, `Product status updated to ${status}`);
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return sendResponse(res, false, null, "Product not found");
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

const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");
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

const duplicateProduct = async (req, res) => {
  try {
    const original = await Product.findById(req.params.id).lean();
    if (!original) return sendResponse(res, false, null, "Product not found");

    const timestamp = Date.now();
    const newSlug = `${original.slug}-copy-${timestamp}`;

    const duplicatedProduct = new Product({
      ...original,
      _id: undefined,
      __v: undefined,
      slug: newSlug,
      name: `${original.name} (Copy)`,
      sections: normalizeSections(original.sections || []),
      createdAt: undefined,
      updatedAt: undefined,
    });

    const saved = await duplicatedProduct.save();

    const originalVariants = await ProductVariant.find({
      product_id: original._id,
    }).lean();

    let savedVariants = [];
    if (originalVariants.length > 0) {
      const variantDocs = originalVariants.map((v, idx) => ({
        ...v,
        _id: undefined,
        __v: undefined,
        product_id: saved._id,
        sku: `${v.sku}-copy-${timestamp}`,
        barcode: `${v.barcode}-copy`,
        createdAt: undefined,
        updatedAt: undefined,
      }));
      savedVariants = await ProductVariant.insertMany(variantDocs);
    }

    sendResponse(
      res,
      true,
      { product: saved, variants: savedVariants },
      "Product duplicated successfully",
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
  duplicateProduct,
};
