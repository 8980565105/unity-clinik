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

// const shoppageSlideSchema = new mongoose.Schema(
//   {
//     title: { type: String, default: "" },
//     description: { type: String, default: "" },
//     button_name: { type: String, default: "SHOP NOW" },
//     button_link: { type: String, default: "/shop" },
//     badge: { type: String, default: "" },

//     bgImageUrl: {
//       type: String,
//       default: null,
//     },

//     productimgUrl: {
//       type: String,
//       default: null,
//     },

//     order: {
//       type: Number,
//       default: 0,
//     },

//     status: {
//       type: String,
//       enum: ["active", "inactive"],
//       default: "active",
//     },
//   },
//   { _id: true },
// );

const shoppageSlideSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    button_name: { type: String, default: "SHOP NOW" },
    button_link: { type: String, default: "/shop" },
    badge: { type: String, default: "" },
    bgImage: { type: String, default: null }, // ✅ renamed from bgImageUrl
    productimg: { type: String, default: null }, // ✅ renamed from productimgUrl
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
    shoppageSlides: {
      type: [shoppageSlideSchema],
      default: undefined,
    },
  },
  { timestamps: true },
);

sliderSectionSchema.index({ section: 1, status: 1 });

module.exports = mongoose.model("Slider", sliderSectionSchema);
