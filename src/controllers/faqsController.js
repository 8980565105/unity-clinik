const Faq = require("../models/Faqs");
const { sendResponse } = require("../utils/response");
const { applyOwnershipFilter } = require("../middlewares/ownershipFilter");

const getPublicFaqs = async (req, res) => {
  try {
    let { category, search } = req.query;

    category = typeof category === "string" ? category.trim() : undefined;
    search = typeof search === "string" ? search.trim() : undefined;

    if (category !== undefined && category.length === 0) {
      category = undefined;
    }
    if (search !== undefined && search.length === 0) {
      search = undefined;
    }

    const filter = { status: "active" };

    if (req.storeFilter?.storeId) {
      filter.storeId = req.storeFilter.storeId;
    }

    if (category && typeof category === "string" && category !== "all") {
      filter.category = { $regex: category, $options: "i" };
    }

    if (search && typeof search === "string") {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const faqs = await Faq.find(filter).sort({ createdAt: -1 });

    sendResponse(
      res,
      true,
      { faqs, total: faqs.length },
      "FAQs retrieved successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getfaqs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;
    const filter = { ...req.ownershipQuery };

    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Faq.countDocuments(filter);
    const faqs = await Faq.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    sendResponse(res, true, { faqs, total }, "FAQs retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getfaqsById = async (req, res) => {
  try {
    const faq = await Faq.findById(req.params.id);
    if (!faq) return sendResponse(res, false, null, "FAQ not found");
    sendResponse(res, true, faq, "FAQ retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createfaqs = async (req, res) => {
  try {
    const { category, question, answer, status } = req.body;

    if (!question)
      return sendResponse(res, false, null, "Question is required");

    const storeId =
      req.user.role === "admin" ? req.body.storeId || null : req.user.storeId;

    const existing = await Faq.findOne({ question, storeId });
    if (existing) {
      return sendResponse(
        res,
        false,
        null,
        `Question "${question}" already exists. Please use a different question.`,
      );
    }

    const newFaq = new Faq({
      question,
      answer,
      status: status || "active",
      category,
      storeId,
    });

    const saved = await newFaq.save();
    sendResponse(res, true, saved, "FAQ created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(res, false, null, `FAQ already exists.`);
    }
    sendResponse(res, false, null, err.message);
  }
};

const updatefaqs = async (req, res) => {
  try {
    const updated = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) return sendResponse(res, false, null, "FAQ not found");
    sendResponse(res, true, updated, "FAQ updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatefaqsStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const updated = await Faq.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return sendResponse(res, false, null, "FAQ not found");
    sendResponse(res, true, updated, "FAQ status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deletefaqs = async (req, res) => {
  try {
    const deleted = await Faq.findByIdAndDelete(req.params.id);
    if (!deleted) return sendResponse(res, false, null, "FAQ not found");
    sendResponse(res, true, null, "FAQ deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeletefaqs = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");

    const result = await Faq.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "FAQs deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const saveFaqBanner = async (req, res) => {
  try {
    const storeId =
      req.user.role === "admin"
        ? req.body.storeId || null
        : req.user.storeId;

    let image = "";

    if (req.file) {
      image = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // 🔥 find any faq of this store
    let faq = await Faq.findOne({ storeId });

    if (!faq) {
      faq = new Faq({ storeId });
    }

    // ✅ update banner
    faq.banner = {
      image: image || faq.banner?.image || "",
      title: req.body.title || "",
      description: req.body.desc || "",
    };

    await faq.save();

    res.json({ success: true, data: faq });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

const getFaqBanner = async (req, res) => {
  try {
    const filter = {};

    if (req.storeFilter?.storeId) {
      filter.storeId = req.storeFilter.storeId;
    }

    const faq = await Faq.findOne(filter);

    res.json({
      success: true,
      data: faq?.banner || null,
    });

  } catch (err) {
    res.json({ success: false, message: err.message });
  }
};

module.exports = {
  saveFaqBanner,
  getFaqBanner,
  getPublicFaqs, 
  getfaqs,
  createfaqs,
  updatefaqs,
  updatefaqsStatus,
  deletefaqs,
  bulkDeletefaqs,
  getfaqsById,
};
