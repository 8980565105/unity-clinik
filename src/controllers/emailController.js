const Email = require("../models/Email");
const { sendResponse } = require("../utils/response");

const getEmail = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status, isDownload } = req.query;
    const query = {};
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }

    if (isDownload === "true") {
      const emails = await Email.find(query).sort({ createdAt: -1 });
      return sendResponse(res, true, { emails, total: emails.length }, "Emails fetched");
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Email.countDocuments(query);
    const emails = await Email.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    sendResponse(res, true, { emails, total }, "Emails fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) return sendResponse(res, false, null, "Email not found");
    sendResponse(res, true, email, "Email retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createEmails = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendResponse(res, false, null, "Email is required");

    const existing = await Email.findOne({ email });
    if (existing) return sendResponse(res, false, null, "Email already exists");

    const newEmail = await Email.create({ email });
    sendResponse(res, true, newEmail, "Email created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateEmails = async (req, res) => {
  try {
    const { email } = req.body;
    const updated = await Email.findByIdAndUpdate(
      req.params.id,
      { email },
      { returnDocument: 'after', runValidators: true }
    );
    if (!updated) return sendResponse(res, false, null, "Email not found");
    sendResponse(res, true, updated, "Email updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteEmails = async (req, res) => {
  try {
    const deleted = await Email.findByIdAndDelete(req.params.id);
    if (!deleted) return sendResponse(res, false, null, "Email not found");
    sendResponse(res, true, null, "Email deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteEmails = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return sendResponse(res, false, null, "No IDs provided");
    await Email.deleteMany({ _id: { $in: ids } });
    sendResponse(res, true, null, "Emails deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPublicEmail = async (req, res) => {
  try {
    const emails = await Email.find({}).sort({ email: 1 });
    res.json({ success: true, data: emails });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getEmail,
  getEmailById,
  createEmails,
  updateEmails,
  deleteEmails,
  bulkDeleteEmails,
  getPublicEmail,
};