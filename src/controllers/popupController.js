const Popup = require("../models/Popup");
const { sendResponse } = require("../utils/response");

const VALID_TYPES = ["coupon", "consultation", "BookConsultation"];

const getPublicPopup = async (req, res) => {
  try {
    const coupon = await Popup.findOne({
      type: "coupon",
      status: "active",
    });

    const consultation = await Popup.findOne({
      type: "consultation",
      status: "active",
    });

    const bookConsultation = await Popup.findOne({
      type: "BookConsultation",
      status: "active",
    });

    sendResponse(
      res,
      true,
      {
        coupon,
        consultation,
        bookConsultation,
      },
      "Popup data",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPopups = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      status,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";

    const query = {};
    if (search) {
      query.$or = [
        { "coupon.title": { $regex: search, $options: "i" } },
        { "coupon.couponCode": { $regex: search, $options: "i" } },
        { "consultation.title1": { $regex: search, $options: "i" } },
        { "consultation.heading": { $regex: search, $options: "i" } },
      ];
    }
    if (status && ["active", "inactive"].includes(status)) {
      query.status = status;
    }

    if (download) {
      const popups = await Popup.find(query).sort({ createdAt: -1 });
      return sendResponse(
        res,
        true,
        { popups },
        "All popups retrieved for download",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Popup.countDocuments(query);
    const popups = await Popup.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    sendResponse(res, true, {
      popups,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const getPopupById = async (req, res) => {
  try {
    const popup = await Popup.findById(req.params.id);
    if (!popup) return sendResponse(res, false, null, "Popup not found");
    sendResponse(res, true, popup, "Popup retrieved successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const createPopup = async (req, res) => {
  try {
    const {
      type = "coupon",
      title,
      couponCode,
      description,
      buttonText,
      discount,
      status,
      title1,
      title2,
      image,
      heading,
      price,
      offerPrice,
      coupon,
      consultation,
      BookConsultation,
    } = req.body;

    if (!type || !VALID_TYPES.includes(type)) {
      return sendResponse(res, false, null, "Valid popup type required");
    }
    const exists = await Popup.findOne({ type });
    if (exists) {
      return sendResponse(
        res,
        false,
        null,
        `${type.charAt(0).toUpperCase() + type.slice(1)} popup already exists`,
      );
    }

    const popupData = {
      type,
      status: status || "active",
      createdBy: req.user ? req.user._id : null,
    };

    if (type === "coupon") {
      const cTitle = coupon?.title ?? title;
      const cCode = coupon?.couponCode ?? couponCode;
      const cDesc = coupon?.description ?? description ?? "";
      const cBtnText = coupon?.buttonText ?? buttonText ?? "SIGN UP NOW";
      const cDiscount = coupon?.discount ?? discount ?? 0;

      if (!cTitle) return sendResponse(res, false, null, "Title is required");
      if (!cCode)
        return sendResponse(res, false, null, "Coupon code is required");

      popupData.coupon = {
        title: cTitle,
        couponCode: cCode.toUpperCase().trim(),
        description: cDesc,
        buttonText: cBtnText,
        discount: Number(cDiscount),
      };
    } else if (type === "consultation") {
      const cTitle1 = consultation?.title1 ?? title1;
      const cTitle2 = consultation?.title2 ?? title2;
      const cImage = consultation?.image ?? image;
      const cHeading = consultation?.heading ?? heading;
      const cPrice = consultation?.price ?? price;
      const cOfferPrice = consultation?.offerPrice ?? offerPrice;
      const cDesc = consultation?.description ?? description ?? "";
      const cBtnText =
        consultation?.buttonText ?? buttonText ?? "Book Consultation";

      if (!cTitle1)
        return sendResponse(res, false, null, "Title 1 is required");
      if (!cTitle2)
        return sendResponse(res, false, null, "Title 2 is required");
      if (!cImage) return sendResponse(res, false, null, "Image is required");
      if (!cHeading)
        return sendResponse(res, false, null, "Heading is required");
      if (cPrice === undefined || cPrice === null)
        return sendResponse(res, false, null, "Price is required");
      if (cOfferPrice === undefined || cOfferPrice === null)
        return sendResponse(res, false, null, "Offer price is required");

      popupData.consultation = {
        title1: cTitle1,
        title2: cTitle2,
        image: cImage,
        heading: cHeading,
        price: Number(cPrice),
        offerPrice: Number(cOfferPrice),
        description: cDesc,
        buttonText: cBtnText,
      };
    } else if (type === "BookConsultation") {
      if (!BookConsultation) {
        return sendResponse(
          res,
          false,
          null,
          "Book Consultation data is required",
        );
      }

      popupData.BookConsultation = {
        productTitle: BookConsultation.productTitle || "",
        subtitle: BookConsultation.subtitle || "",
        tag: BookConsultation.tag || "",
        image: BookConsultation.image || "",
        popupTitle: BookConsultation.popupTitle || "",
        popupDescription: BookConsultation.popupDescription || "",
        product_id: BookConsultation.product_id || null,
        productPrice: Number(BookConsultation.productPrice ?? 0),
        productOfferPrice: Number(BookConsultation.productOfferPrice ?? 0),
        voicePrice: Number(BookConsultation.voicePrice ?? 0),
        videoPrice: Number(BookConsultation.videoPrice ?? 0),
      };
    }

    const popup = new Popup(popupData);
    const savedPopup = await popup.save();
    sendResponse(res, true, savedPopup, "Popup created successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatePopup = async (req, res) => {
  try {
    const existing = await Popup.findById(req.params.id);
    if (!existing) return sendResponse(res, false, null, "Popup not found");

    const {
      BookConsultation,
      type,
      status,
      title,
      couponCode,
      description,
      buttonText,
      discount,
      title1,
      title2,
      image,
      heading,
      price,
      offerPrice,
      coupon,
      consultation,
    } = req.body;

    const resolvedType = type || existing.type;

    const updateData = {};
    if (type && VALID_TYPES.includes(type)) {
      updateData.type = type;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    if (resolvedType === "coupon") {
      const existingCoupon = existing.coupon || {};
      const cTitle = coupon?.title ?? title ?? existingCoupon.title ?? "";
      const cCode =
        coupon?.couponCode ?? couponCode ?? existingCoupon.couponCode ?? "";
      const cDesc =
        coupon?.description ?? description ?? existingCoupon.description ?? "";
      const cBtnText =
        coupon?.buttonText ??
        buttonText ??
        existingCoupon.buttonText ??
        "SIGN UP NOW";
      const cDiscount =
        coupon?.discount ?? discount ?? existingCoupon.discount ?? 0;

      updateData.coupon = {
        title: cTitle,
        couponCode: cCode ? cCode.toUpperCase().trim() : "",
        description: cDesc,
        buttonText: cBtnText,
        discount: Number(cDiscount),
      };
      // Explicitly clean up consultation when updating coupon type
      updateData.$unset = { consultation: "" };
    } else if (resolvedType === "consultation") {
      const existingConsultation = existing.consultation || {};
      const cTitle1 =
        consultation?.title1 ?? title1 ?? existingConsultation.title1 ?? "";
      const cTitle2 =
        consultation?.title2 ?? title2 ?? existingConsultation.title2 ?? "";
      const cImage =
        consultation?.image ?? image ?? existingConsultation.image ?? "";
      const cHeading =
        consultation?.heading ?? heading ?? existingConsultation.heading ?? "";
      const cPrice =
        consultation?.price ?? price ?? existingConsultation.price ?? 0;
      const cOfferPrice =
        consultation?.offerPrice ??
        offerPrice ??
        existingConsultation.offerPrice ??
        0;
      const cDesc =
        consultation?.description ??
        description ??
        existingConsultation.description ??
        "";
      const cBtnText =
        consultation?.buttonText ??
        buttonText ??
        existingConsultation.buttonText ??
        "Book Consultation";

      updateData.consultation = {
        title1: cTitle1,
        title2: cTitle2,
        image: cImage,
        heading: cHeading,
        price: Number(cPrice),
        offerPrice: Number(cOfferPrice),
        description: cDesc,
        buttonText: cBtnText,
      };
      updateData.$unset = { coupon: "" };
    } else if (resolvedType === "BookConsultation") {
      const existingBook = existing.BookConsultation || {};

      // updateData.BookConsultation = {
      //   productTitle:
      //     BookConsultation?.productTitle || existingBook.productTitle,

      //   subtitle: BookConsultation?.subtitle || existingBook.subtitle,

      //   productPrice: Number(
      //     BookConsultation?.productPrice || existingBook.productPrice,
      //   ),

      //   productOfferPrice: Number(
      //     BookConsultation?.productOfferPrice || existingBook.productOfferPrice,
      //   ),

      //   tag: BookConsultation?.tag || existingBook.tag,

      //   image: BookConsultation?.image || existingBook.image,

      //   popupTitle: BookConsultation?.popupTitle || existingBook.popupTitle,

      //   popupDescription:
      //     BookConsultation?.popupDescription || existingBook.popupDescription,

      //   voicePrice: Number(
      //     BookConsultation?.voicePrice || existingBook.voicePrice,
      //   ),

      //   videoPrice: Number(
      //     BookConsultation?.videoPrice || existingBook.videoPrice,
      //   ),
      //   product_id:
      //     BookConsultation?.product_id ?? existingBook.product_id ?? null,
      // };
      updateData.BookConsultation = {
        productTitle:
          BookConsultation?.productTitle ?? existingBook.productTitle,

        subtitle: BookConsultation?.subtitle ?? existingBook.subtitle,

        productPrice: Number(
          BookConsultation?.productPrice ?? existingBook.productPrice ?? 0,
        ),

        productOfferPrice: Number(
          BookConsultation?.productOfferPrice ??
            existingBook.productOfferPrice ??
            0,
        ),

        tag: BookConsultation?.tag ?? existingBook.tag,

        image: BookConsultation?.image ?? existingBook.image,

        popupTitle: BookConsultation?.popupTitle ?? existingBook.popupTitle,

        popupDescription:
          BookConsultation?.popupDescription ?? existingBook.popupDescription,

        voicePrice: Number(
          BookConsultation?.voicePrice ?? existingBook.voicePrice ?? 0,
        ),

        videoPrice: Number(
          BookConsultation?.videoPrice ?? existingBook.videoPrice ?? 0,
        ),

        product_id:
          BookConsultation?.product_id ?? existingBook.product_id ?? null,
      };

      updateData.$unset = {
        coupon: "",
        consultation: "",
      };

      updateData.$unset = {
        coupon: "",
        consultation: "",
      };
    }

    const updatedPopup = await Popup.findByIdAndUpdate(
      req.params.id,
      updateData,
      { returnDocument: "after", runValidators: true },
    );

    sendResponse(res, true, updatedPopup, "Popup updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const updatePopupStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!["active", "inactive"].includes(status)) {
      return sendResponse(res, false, null, "Invalid status value");
    }

    const popup = await Popup.findByIdAndUpdate(
      id,
      { status },
      { returnDocument: "after" },
    );
    if (!popup) return sendResponse(res, false, null, "Popup not found");

    sendResponse(res, true, popup, "Popup status updated successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const deletePopup = async (req, res) => {
  try {
    const deletedPopup = await Popup.findByIdAndDelete(req.params.id);
    if (!deletedPopup) return sendResponse(res, false, null, "Popup not found");
    sendResponse(res, true, null, "Popup deleted successfully");
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

const bulkDeletePopups = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return sendResponse(res, false, null, "No IDs provided");
    }

    const result = await Popup.deleteMany({ _id: { $in: ids } });
    sendResponse(
      res,
      true,
      { deletedCount: result.deletedCount },
      "Popups deleted successfully",
    );
  } catch (err) {
    sendResponse(res, false, null, err.message);
  }
};

module.exports = {
  getPublicPopup,
  getPopups,
  getPopupById,
  createPopup,
  updatePopup,
  updatePopupStatus,
  deletePopup,
  bulkDeletePopups,
};
