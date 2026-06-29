const AboutPage = require("../models/Aboutpage");
const { sendResponse } = require("../utils/response");

const getPublicAboutPage = async (req, res) => {
  try {
    const doc = await AboutPage.findOne().lean();
    if (!doc) return sendResponse(res, true, null, "No data found");

    const filtered = {
      ...doc,
      contentSections: (doc.contentSections || []).filter((s) => s.status),
      missionItems: (doc.missionItems || []).filter((m) => m.status),
    };

    sendResponse(res, true, filtered, "About page retrieved");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getAboutPage = async (req, res) => {
  try {
    const doc = await AboutPage.findOne().lean();
    sendResponse(res, true, doc || {}, "About page retrieved");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateAboutPage = async (req, res) => {
  try {
    const {
      title,
      description,
      contentSections,
      missionSectionTitle,
      missionSectionDescription,
      missionItems,
    } = req.body;

    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (missionSectionTitle !== undefined)
      updateData.missionSectionTitle = missionSectionTitle;
    if (missionSectionDescription !== undefined)
      updateData.missionSectionDescription = missionSectionDescription;

    if (Array.isArray(contentSections)) {
      updateData.contentSections = contentSections.map((s) => ({
        ...(s._id ? { _id: s._id } : {}),
        image: s.image || "",
        title: s.title || "",
        description: s.description || "",
        buttonText: s.buttonText || "",
        buttonLink: s.buttonLink || "",
        status: s.status !== undefined ? Boolean(s.status) : true,
      }));
    }

    if (Array.isArray(missionItems)) {
      updateData.missionItems = missionItems.map((m) => ({
        ...(m._id ? { _id: m._id } : {}),
        icon: m.icon || "",
        title: m.title || "",
        description: m.description || "",
        status: m.status !== undefined ? Boolean(m.status) : true,
      }));
    }

    const doc = await AboutPage.findOneAndUpdate(
      {},
      { $set: updateData },
      { returnDocument: "after", upsert: true },
    );

    sendResponse(res, true, doc, "About page updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPublicAboutPage,
  getAboutPage,
  updateAboutPage,
};
