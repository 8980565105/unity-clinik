const Results = require("../models/Results");
const { sendResponse } = require("../utils/response");

const getResults = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
    } = req.query;

    const download = isDownload.toString().toLowerCase() === "true";

    const query = {};
    if (search) query.name = { $regex: search, $options: "i" };
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    if (download) {
      const results = await Results.find(query).sort({ createdAt: -1 });
      return sendResponse(
        res,
        true,
        { results, total: results.length },
        "All results for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Results.countDocuments(query);
    const results = await Results.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      results,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getResultsById = async (req, res) => {
  try {
    const result = await Results.findById(req.params.id);
    if (!result) return sendResponse(res, false, null, "Result not found");
    sendResponse(res, true, result, "Result retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createResults = async (req, res) => {
  try {
    const {
      name,
      after_image_url,
      before_image_url,
      gander,
      age,
      description,
      status,
    } = req.body;

    if (!name) return sendResponse(res, false, null, "Name is required");
    if (!after_image_url)
      return sendResponse(res, false, null, "After image is required");
    if (!before_image_url)
      return sendResponse(res, false, null, "Before image is required");

    const existing = await Results.findOne({ name });

    if (existing) {
      return sendResponse(
        res,
        false,
        null,
        `Result "${name}" already exists. Please use a different name.`,
      );
    }

    const newResult = new Results({
      name,
      after_image_url,
      before_image_url,
      description,
      gander,
      age,
      status: status || "active",
    });

    const saved = await newResult.save();
    sendResponse(res, true, saved, "Result created successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(
        res,
        false,
        null,
        `Result "${err.keyValue?.name}" already exists.`,
      );
    }
    sendResponse(res, false, null, err.message);
  }
};

const updateResults = async (req, res) => {
  try {
    const { name, after_image_url, before_image_url, description, status } =
      req.body;

    const result = await Results.findById(req.params.id);
    if (!result) return sendResponse(res, false, null, "Result not found");

    const updated = await Results.findByIdAndUpdate(
      req.params.id,
      { name, after_image_url, before_image_url, description, status },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    sendResponse(res, true, updated, "Result updated successfully");
  } catch (err) {
    if (err.code === 11000) {
      return sendResponse(res, false, null, `Result name already exists.`);
    }
    sendResponse(res, false, null, err.message);
  }
};

const updateResultsStatus = async (req, res) => {
  try {
    const result = await Results.findById(req.params.id);
    if (!result) return sendResponse(res, false, null, "Result not found");

    const updated = await Results.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      {
        returnDocument: "after",
      },
    );
    sendResponse(res, true, updated, "Status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteResults = async (req, res) => {
  try {
    const result = await Results.findById(req.params.id);
    if (!result) return sendResponse(res, false, null, "Result not found");

    await Results.findByIdAndDelete(req.params.id);
    sendResponse(res, true, null, "Result deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteResults = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, false, null, "No IDs provided");
    }

    const query = { _id: { $in: ids } };

    await Results.deleteMany(query);
    sendResponse(res, true, { ids }, "Bulk delete successful");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPublicResults = async (req, res) => {
  try {
    const results = await Results.find({
      status: "active",
    }).sort({ createdAt: -1 });

    sendResponse(res, true, results, "Public results retrieved");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getResults,
  getResultsById,
  createResults,
  updateResults,
  deleteResults,
  bulkDeleteResults,
  updateResultsStatus,
  getPublicResults,
};
