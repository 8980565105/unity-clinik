const ContactUs = require("../models/ContactUs");
const { sendResponse } = require("../utils/response");

const getContacts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", isDownload = "false" } = req.query;
    const download = isDownload.toLowerCase() === "true";

    const baseQuery = {};
    if (req.user.role === "store_owner") {
      baseQuery.storeId = req.user.storeId;
    }
    if (search) {
      baseQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { order_number: { $regex: search, $options: "i" } },
      ];
    }

    if (download) {
      const contacts = await ContactUs.find(baseQuery).sort({ createdAt: -1 });
      return sendResponse(res, true, { contacts }, "All contacts retrieved");
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await ContactUs.countDocuments(baseQuery);
    const contacts = await ContactUs.find(baseQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      contacts,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getContactById = async (req, res) => {
  try {
    const contact = await ContactUs.findById(req.params.id);
    if (!contact)
      return sendResponse(res, false, null, "Contact message not found");
    sendResponse(res, true, contact, "Contact message retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createContact = async (req, res) => {
  try {
    const storeId = req.storeFilter?.storeId || null;

    const contact = new ContactUs({
      ...req.body,
      storeId,
    });
    const savedContact = await contact.save();
    sendResponse(
      res,
      true,
      savedContact,
      "Contact message submitted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteContact = async (req, res) => {
  try {
    const deletedContact = await ContactUs.findByIdAndDelete(req.params.id);
    if (!deletedContact)
      return sendResponse(res, false, null, "Contact message not found");
    sendResponse(res, true, null, "Contact message deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteContacts = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");
    const result = await ContactUs.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  deleteContact,
  bulkDeleteContacts,
};
