const Slider = require("../models/Slider");
const { sendResponse } = require("../utils/response");

const VALID_SECTIONS = [
  "hero1",
  "banner1",
  "topDoctor",
  "banner2",
  "banner3",
  "banner4",
  "shoppage",
  "successStory",
  "reportCard",
  "honestExpectations",
  "getStarted",
  "timelineResult",
  "holisticApproach",
  "contactSection",
  "featuressection",
];

const OBJECT_SECTIONS = [
  "banner2",
  "banner3",
  "banner4",
  "honestExpectations",
  "timelineResult",
  "contactSection",
];
const ARRAY_SECTION_FIELD_MAP = {
  hero1: "hero1Slides",
  banner1: "banner1Slides",
  topDoctor: "topDoctors",
  shoppage: "shoppageSlides",
  successStory: "successStorySlides",
  reportCard: "reportCardSlides",
  getStarted: "getStartedSteps",
  holisticApproach: "holisticCards",
  featuressection: "featuresCards",
};

const getPublicSlider = async (req, res) => {
  try {
    const { section, page } = req.query;
    const query = { status: "active" };
    if (section && VALID_SECTIONS.includes(section)) {
      query.section = section;
    }
    if (page) {
      query.$or = [
        { showOnPages: { $exists: false } },
        { showOnPages: { $size: 0 } },
        { showOnPages: page },
      ];
    }
    const sections = await Slider.find(query);
    res.json({ success: true, data: sections });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getSlides = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "", status, section } = req.query;

    const query = {};
    if (search && search.trim() !== "") {
      query.section = { $regex: search.trim(), $options: "i" };
    }
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }
    if (section && VALID_SECTIONS.includes(section)) {
      query.section = section;
    }

    const total = await Slider.countDocuments(query);
    const docs = await Slider.find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    sendResponse(res, true, {
      slides: docs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getSlideById = async (req, res) => {
  try {
    const doc = await Slider.findById(req.params.id);
    if (!doc) return sendResponse(res, false, null, "Not found");
    sendResponse(res, true, doc, "Retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createSlide = async (req, res) => {
  try {
    const {
      section,
      status,
      slides,
      banner2,
      banner3,
      banner4,
      showOnPages,
      reportCardTitle,
      honestExpectations,
      timelineResult,
      contactSection,
    } = req.body;

    if (!section || !VALID_SECTIONS.includes(section))
      return sendResponse(res, false, null, "Valid section required");

    const exists = await Slider.findOne({ section });
    if (exists) return sendResponse(res, false, null, "Section already exists");

    const baseData = {
      section,
      status: status || "active",
      showOnPages: Array.isArray(showOnPages) ? showOnPages : [],
    };

    if (section === "banner2") {
      const doc = new Slider({ ...baseData, banner2: banner2 || {} });
      const saved = await doc.save();
      return sendResponse(res, true, saved, "Section created successfully");
    }
    if (section === "banner3") {
      const doc = new Slider({ ...baseData, banner3: banner3 || {} });
      const saved = await doc.save();
      return sendResponse(res, true, saved, "Section created successfully");
    }
    if (section === "banner4") {
      const doc = new Slider({ ...baseData, banner4: banner4 || {} });
      const saved = await doc.save();
      return sendResponse(res, true, saved, "Section created successfully");
    }
    if (section === "honestExpectations") {
      const doc = new Slider({
        ...baseData,
        honestExpectations: honestExpectations || { male: [], female: [] },
      });
      const saved = await doc.save();
      return sendResponse(res, true, saved, "Section created successfully");
    }
    if (section === "timelineResult") {
      const doc = new Slider({
        ...baseData,
        timelineResult: timelineResult || { male: [], female: [] },
      });
      const saved = await doc.save();
      return sendResponse(res, true, saved, "Section created successfully");
    }

    if (section === "contactSection") {
      const doc = new Slider({
        ...baseData,

        contactSection: contactSection || {},
      });

      const saved = await doc.save();

      return sendResponse(res, true, saved, "Section created successfully");
    }

    if (!Array.isArray(slides) || slides.length === 0)
      return sendResponse(
        res,
        false,
        null,
        "slides array is required and must not be empty",
      );

    const slidesField = ARRAY_SECTION_FIELD_MAP[section];
    if (!slidesField)
      return sendResponse(res, false, null, "Unsupported section type");

    const doc = new Slider({
      ...baseData,
      ...(section === "reportCard"
        ? { reportCardTitle: reportCardTitle || "" }
        : {}),
      [slidesField]: slides,
    });

    const saved = await doc.save();
    sendResponse(res, true, saved, "Section created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateSlide = async (req, res) => {
  try {
    const existing = await Slider.findById(req.params.id);
    if (!existing) return sendResponse(res, false, null, "Not found");

    const {
      section,
      status,
      slides,
      banner2,
      banner3,
      banner4,
      reportCardTitle,
      honestExpectations,
      timelineResult,
      contactSection,
      showOnPages,
    } = req.body;

    const updateData = {};
    const resolvedSection = section || existing.section;

    if (section && VALID_SECTIONS.includes(section))
      updateData.section = section;
    if (status !== undefined) updateData.status = status;
    if (Array.isArray(showOnPages)) updateData.showOnPages = showOnPages;

    if (
      resolvedSection === "banner2" &&
      banner2 &&
      typeof banner2 === "object"
    ) {
      updateData.banner2 = {
        image: banner2.image ?? existing.banner2?.image ?? null,
        mobileimg: banner2.mobileimg ?? existing.banner2?.mobileimg ?? null,
      };
    }
    if (
      resolvedSection === "banner3" &&
      banner3 &&
      typeof banner3 === "object"
    ) {
      updateData.banner3 = {
        image: banner3.image ?? existing.banner3?.image ?? null,
        mobileimg: banner3.mobileimg ?? existing.banner3?.mobileimg ?? null,
      };
    }
    if (
      resolvedSection === "banner4" &&
      banner4 &&
      typeof banner4 === "object"
    ) {
      updateData.banner4 = {
        image: banner4.image ?? existing.banner4?.image ?? null,
        mobileimg: banner4.mobileimg ?? existing.banner4?.mobileimg ?? null,
      };
    }
    if (resolvedSection === "reportCard" && reportCardTitle !== undefined) {
      updateData.reportCardTitle = reportCardTitle;
    }
    if (
      resolvedSection === "honestExpectations" &&
      honestExpectations &&
      typeof honestExpectations === "object"
    ) {
      updateData.honestExpectations = {
        male: Array.isArray(honestExpectations.male)
          ? honestExpectations.male
          : (existing.honestExpectations?.male ?? []),
        female: Array.isArray(honestExpectations.female)
          ? honestExpectations.female
          : (existing.honestExpectations?.female ?? []),
      };
    }
    if (
      resolvedSection === "timelineResult" &&
      timelineResult &&
      typeof timelineResult === "object"
    ) {
      updateData.timelineResult = {
        male: Array.isArray(timelineResult.male)
          ? timelineResult.male
          : (existing.timelineResult?.male ?? []),
        female: Array.isArray(timelineResult.female)
          ? timelineResult.female
          : (existing.timelineResult?.female ?? []),
      };
    }

    if (resolvedSection === "contactSection" && contactSection) {
      updateData.contactSection = {
        title: contactSection.title ?? existing.contactSection?.title ?? "",
        numberTitle:
          contactSection.numberTitle ??
          existing.contactSection?.numberTitle ??
          "",
        description:
          contactSection.description ??
          existing.contactSection?.description ??
          "",
        buttonText:
          contactSection.buttonText ??
          existing.contactSection?.buttonText ??
          "",
        buttonLink:
          contactSection.buttonLink ??
          existing.contactSection?.buttonLink ??
          "",
      };
    }

    if (Array.isArray(slides) && slides.length > 0) {
      const fieldName = ARRAY_SECTION_FIELD_MAP[resolvedSection];
      if (fieldName) updateData[fieldName] = slides;
    }

    const updated = await Slider.findByIdAndUpdate(req.params.id, updateData, {
      returnDocument: "after",
    });
    sendResponse(res, true, updated, "Section updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updateSlideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["active", "inactive"].includes(status))
      return sendResponse(res, false, null, "Invalid status");
    const doc = await Slider.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" },
    );
    if (!doc) return sendResponse(res, false, null, "Not found");
    sendResponse(res, true, doc, "Status updated");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deleteSlide = async (req, res) => {
  try {
    const deleted = await Slider.findByIdAndDelete(req.params.id);
    if (!deleted) return sendResponse(res, false, null, "Not found");
    sendResponse(res, true, null, "Deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeleteSlides = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return sendResponse(res, false, null, "No IDs provided");
    const result = await Slider.deleteMany({ _id: { $in: ids } });
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
  getPublicSlider,
  getSlides,
  getSlideById,
  createSlide,
  updateSlide,
  updateSlideStatus,
  deleteSlide,
  bulkDeleteSlides,
};
