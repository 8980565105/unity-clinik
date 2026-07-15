const mongoose = require("mongoose");

const hero1SlideSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    button_name: { type: String, default: "SHOP NOW" },
    button_link: { type: String, default: "/shop" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    location: { type: String, default: "" },
    name: { type: String, default: "" },
    age: { type: String, default: "" },
    review: { type: String, default: "" },
    mainImage: { type: String, default: null },
    beforeImage: { type: String, default: null },
    afterImage: { type: String, default: null },
  },
  { _id: true },
);

const shoppageSlideSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    button_name: { type: String, default: "SHOP NOW" },
    button_link: { type: String, default: "/shop" },
    badge: { type: String, default: "" },
    bgImage: { type: String, default: null },
    productimg: { type: String, default: null },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { _id: true },
);

const banner1SlideSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    button_name: { type: String, default: "SHOP NOW" },
    button_link: { type: String, default: "/shop" },
    order: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    badge: { type: String, default: "" },
    bgImage: { type: String, default: null },
    productimg: { type: String, default: null },
  },
  { _id: true },
);

const topDoctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cases: { type: String, default: "" },
    image: { type: String, default: null },
  },
  { _id: true },
);

const banner2Schema = new mongoose.Schema(
  {
    image: { type: String, default: null },
    mobileimg: { type: String, default: null },
  },
  { _id: false },
);
const banner3Schema = new mongoose.Schema(
  {
    image: { type: String, default: null },
    mobileimg: { type: String, default: null },
  },
  { _id: false },
);
const banner4Schema = new mongoose.Schema(
  {
    image: { type: String, default: null },
    mobileimg: { type: String, default: null },
  },
  { _id: false },
);

const successStorySlideSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    age: { type: String, default: "" },
    title: { type: String, default: "" },
    review: { type: String, default: "" },
    mainImage: { type: String, default: null },
    beforeImage: { type: String, default: null },
    afterImage: { type: String, default: null },
    videoUrl: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { _id: true },
);

const reportCardSlideSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    age: { type: String, default: "" },
    stage: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    rating: { type: String, default: "" },
    beforeMonth: { type: String, default: "" },
    afterMonth: { type: String, default: "" },
    beforeImage: { type: String, default: null },
    afterImage: { type: String, default: null },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { _id: true },
);

const honestStageSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    image: { type: String, default: null },
    success: { type: Boolean, default: true },
  },
  { _id: true },
);

const honestExpectationsSchema = new mongoose.Schema(
  {
    male: { type: [honestStageSchema], default: [] },
    female: { type: [honestStageSchema], default: [] },
  },
  { _id: false },
);

const getStartedStepSchema = new mongoose.Schema(
  {
    stepLabel: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: null },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const timelineStageSchema = new mongoose.Schema(
  {
    month: { type: String, default: "" },
    title: { type: String, default: "" },
    image: { type: String, default: null },
  },
  { _id: true },
);

const timelineResultSchema = new mongoose.Schema(
  {
    male: { type: [timelineStageSchema], default: [] },
    female: { type: [timelineStageSchema], default: [] },
  },
  { _id: false },
);

const holisticCardSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: null },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const contactSectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },
    numberTitle: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    buttonText: {
      type: String,
      default: "",
    },
    buttonLink: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

const featuresCardSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    image: { type: String, default: null },
    order: { type: Number, default: 0 },
  },
  { _id: true },
);

const sliderSectionSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    hero1Slides: { type: [hero1SlideSchema], default: undefined },
    banner1Slides: { type: [banner1SlideSchema], default: undefined },
    topDoctors: { type: [topDoctorSchema], default: undefined },
    banner2: { type: banner2Schema, default: undefined },
    banner3: { type: banner3Schema, default: undefined },
    banner4: { type: banner4Schema, default: undefined },
    shoppageSlides: { type: [shoppageSlideSchema], default: undefined },
    successStorySlides: { type: [successStorySlideSchema], default: undefined },
    reportCardSlides: { type: [reportCardSlideSchema], default: undefined },
    reportCardTitle: { type: String, default: "" },

    honestExpectations: { type: honestExpectationsSchema, default: undefined },
    getStartedSteps: { type: [getStartedStepSchema], default: undefined },
    timelineResult: { type: timelineResultSchema, default: undefined },
    holisticCards: { type: [holisticCardSchema], default: undefined },
    contactSection: { type: contactSectionSchema, default: undefined },
    featuresCards: { type: [featuresCardSchema], default: undefined },

    showOnPages: { type: [String], default: [] },
  },
  { timestamps: true },
);

sliderSectionSchema.index({ section: 1, status: 1 });

module.exports = mongoose.model("Slider", sliderSectionSchema);
