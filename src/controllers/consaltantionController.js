const ConsultationPage = require("../models/consaltantion");

const getConsultationPage = async (req, res) => {
  try {
    const storeId = req.user.storeId;

    let page = await ConsultationPage.findOne({ storeId });

    if (!page) {
      page = await ConsultationPage.create({ storeId });
    }

    res.status(200).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPublicConsultationPage = async (req, res) => {
  try {
    const { storeId } = req.params;

    const page = await ConsultationPage.findOne({ storeId });

    if (!page) {
      return res
        .status(404)
        .json({ success: false, message: "Page not found" });
    }

    res.status(200).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateConsultationPage = async (req, res) => {
  try {
    const storeId = req.user.storeId;
    const { hero, social, whatsapp, faq } = req.body;

    let page = await ConsultationPage.findOne({ storeId });

    if (!page) {
      page = await ConsultationPage.create({
        storeId,
        hero,
        social,
        whatsapp,
        faq,
      });
    } else {
      if (hero !== undefined) page.hero = hero;
      if (social !== undefined) page.social = social;
      if (whatsapp !== undefined) page.whatsapp = whatsapp;
      if (faq !== undefined) page.faq = faq;

      await page.save();
    }

    res.status(200).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getConsultationPage,
  getPublicConsultationPage,
  updateConsultationPage,
};
