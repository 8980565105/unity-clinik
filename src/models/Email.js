const mongoose = require("mongoose");
const emailsSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Emails", emailsSchema);
