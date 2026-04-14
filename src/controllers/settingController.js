const Setting = require("../models/Setting");
const { sendResponse } = require("../utils/response");

const getUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const storeId = req.user.storeId || null;

    const query = storeId ? { storeId } : { user: userId };
    const setting = await Setting.findOne(query);

    if (!setting) {
      return sendResponse(res, true, null, "No settings found for this user");
    }
    sendResponse(res, true, setting, "User settings fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const storeId = req.user.storeId || null;
    const data = req.body;

    const query = storeId ? { storeId } : { user: userId };

    let setting = await Setting.findOne(query);

    if (setting) {
      setting = await Setting.findOneAndUpdate(query, data, { new: true });
      sendResponse(res, true, setting, "Settings updated successfully");
    } else {
      setting = new Setting({
        ...data,
        user: userId,
        storeId: storeId, 
      });
      await setting.save();
      sendResponse(res, true, setting, "Settings created successfully");
    }
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPublicSettings = async (req, res) => {
  try {
    const storeId = req.storeFilter?.storeId;

    let setting = null;

    if (storeId) {
      setting = await Setting.findOne({ storeId });
    }

    if (!setting) {
      setting = await Setting.findOne({}).sort({ createdAt: -1 });
    }

    if (!setting) {
      return sendResponse(res, true, null, "No settings found");
    }

    sendResponse(res, true, setting, "Public settings fetched successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getUserSettings,
  updateUserSettings,
  getPublicSettings,
};