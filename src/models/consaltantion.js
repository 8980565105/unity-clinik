const mongoose = require("mongoose");

const BulletItemSchema = new mongoose.Schema({
  text: { type: String, default: "" },
});

const StatItemSchema = new mongoose.Schema({
  label: { type: String, default: "" },
  sub: { type: String, default: "" },
});

const HeroSchema = new mongoose.Schema({
  status: { type: Boolean, default: true },
  badge: { type: String, default: "" },
  heading: { type: String, default: "" },
  headingHighlight: { type: String, default: "" },
  para1: { type: String, default: "" },
  para2: { type: String, default: "" },
  para3: { type: String, default: "" },
  bullets: [BulletItemSchema],
  stats: [StatItemSchema],
  withoutList: [BulletItemSchema],
  withList: [BulletItemSchema],
  withoutImage: { type: String, default: "" },
  withImage: { type: String, default: "" },
});

const SocialPlatformSchema = new mongoose.Schema({
  handle: { type: String, default: "" },
  followers: { type: String, default: "" },
  subscribers: { type: String, default: "" },
  tags: [{ type: String }],
  buttonText: { type: String, default: "" },
  buttonLink: { type: String, default: "" },
  image: { type: String, default: "" },
});

const SocialSchema = new mongoose.Schema({
  status: { type: Boolean, default: true },
  sectionTitle: { type: String, default: "" },
  sectionSubtitle: { type: String, default: "" },
  instagram: { type: SocialPlatformSchema, default: () => ({}) },
  facebook: { type: SocialPlatformSchema, default: () => ({}) },
  youtube: { type: SocialPlatformSchema, default: () => ({}) },
});

const ChatMessageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["doctor", "patient"], default: "patient" },
  text: { type: String, default: "" },
  time: { type: String, default: "" },
});

const ChatItemSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  messages: [ChatMessageSchema],
});

const WhatsappSchema = new mongoose.Schema({
  status: { type: Boolean, default: true },
  sectionTitle: { type: String, default: "" },
  sectionSubtitle: { type: String, default: "" },
  images: [{ type: String }],
  chats: [ChatItemSchema],
});

const FaqItemSchema = new mongoose.Schema({
  q: { type: String, default: "" },
  a: { type: String, default: "" },
});

const FaqSchema = new mongoose.Schema({
  status: { type: Boolean, default: true },
  sectionTitle: { type: String, default: "" },
  items: [FaqItemSchema],
});

const ConsultationPageSchema = new mongoose.Schema(
  {
    hero: { type: HeroSchema, default: () => ({}) },
    social: { type: SocialSchema, default: () => ({}) },
    whatsapp: { type: WhatsappSchema, default: () => ({}) },
    faq: { type: FaqSchema, default: () => ({}) },
  },
  { timestamps: true },
);

module.exports = mongoose.model("ConsultationPage", ConsultationPageSchema);
