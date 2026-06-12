const mongoose = require("mongoose");

const contentSectionSchema = new mongoose.Schema(
  {
    image: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    buttonText: { type: String, default: "" },
    buttonLink: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  { _id: true }
);

const missionItemSchema = new mongoose.Schema(
  {
    icon: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  { _id: true }
);

const aboutPageSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    contentSections: { type: [contentSectionSchema], default: [] },
    missionSectionTitle: { type: String, default: "" },
    missionSectionDescription: { type: String, default: "" },
    missionItems: { type: [missionItemSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);