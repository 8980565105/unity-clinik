const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Store = require("../models/Store");
const nodemailer = require("nodemailer");
const escapeHtml = require("escape-html");
const { sendResponse } = require("../utils/response");

const otpStore = {};

const createTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
};

const sendOtpEmail = async (toEmail, otp, storeName = "MyApp") => {
  const transporter = createTransporter();
  if (!transporter)
    throw new Error("SMTP not configured. Set SMTP_USER and SMTP_PASS in .env");

  const safeStoreName = escapeHtml(storeName);
  const safeOtp = escapeHtml(otp);

  await transporter.sendMail({
    from: `"${safeStoreName}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Password Reset OTP — ${safeStoreName}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px;">
        <h2 style="color:#333;">${safeStoreName}</h2>
        <p style="color:#555;">Your OTP for password reset:</p>
        <div style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#e91e8c;margin:24px 0;text-align:center;">${safeOtp}</div>
        <p style="color:#888;font-size:13px;">Expires in <strong>10 minutes</strong>. Do not share it.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
        <p style="color:#aaa;font-size:12px;">If you did not request this, ignore this email.</p>
      </div>`,
  });
};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, storeId: user.storeId || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN},
  );

const cleanDomain = (raw) => {
  if (!raw) return "";
  try {
    const withProto = raw.startsWith("http") ? raw : `http://${raw}`;
    const parsed = new URL(withProto);
    if (parsed.hostname === "localhost") {
      return `localhost:${parsed.port || "3000"}`;
    }
    return parsed.host
      .replace(/^www\./i, "")
      .toLowerCase()
      .trim();
  } catch {
    return raw
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .toLowerCase()
      .trim();
  }
};

const findUserForOtp = async (email, rawDomain) => {
  const domain = cleanDomain(rawDomain);

  if (domain) {
    const store = await Store.findOne({ domain })
      .select("_id name domain")
      .lean();

    if (store) {
      const user = await User.findOne({ email, storeId: store._id });

      if (user) {
        const otpKey = `${email}__${store._id.toString()}`;
        return { user, storeName: store.name, otpKey };
      }
    } else {
      const allDomains = await Store.find({}).select("domain name").lean();
    }
  }

  const user = await User.findOne({
    email,
    role: { $in: ["admin", "store_owner"] },
  });
  if (user) {
    const otpKey = `${email}__${user.storeId?.toString() || "global"}`;
    return { user, storeName: process.env.STORE_NAME || "MyApp", otpKey };
  }

  return { user: null, storeName: null, otpKey: null };
};

const login = async (req, res) => {
  try {
    const { email, password, domain: rawDomain } = req.body;
    if (!email || !password)
      return sendResponse(res, false, null, "Email and password are required");

    let user = null;

    if (rawDomain) {
      const domain = cleanDomain(rawDomain);
      const store = await Store.findOne({ domain });
      if (store) {
        user = await User.findOne({ email, storeId: store._id }).populate(
          "storeId",
        );
      }
    }

    if (!user) {
      user = await User.findOne({ email }).populate("storeId");
    }

    if (!user) return sendResponse(res, false, null, "Invalid credentials");
    if (!user.is_active)
      return sendResponse(res, false, null, "Account inactive");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendResponse(res, false, null, "Invalid credentials");

    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;

    return sendResponse(
      res,
      true,
      { token, user: userObj },
      "Login successful",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "store_user",
      mobile_number,
      domain,
      gender,
      date_of_birth,
      address,
      storeName,
      storeEmail,
      storegstno,
      storePhone,
      storeLogo,
      storeBanner,
      storeDescription,
      storeTheme,
      storeAddress,
    } = req.body;

    if (!name || !email || !password)
      return sendResponse(
        res,
        false,
        null,
        "Name, email and password are required",
      );

    const parseIfString = (val) => {
      if (!val) return null;
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      }
      return val;
    };
    const isEmptyObj = (obj) =>
      !obj || Object.values(obj).every((v) => !v || v === "");
    const parsedAddress = parseIfString(address);
    const cleanAddress = isEmptyObj(parsedAddress) ? null : parsedAddress;
    const profile_picture =
      req.files?.profile_picture?.[0]?.filename ||
      req.file?.filename ||
      (typeof req.body.profile_picture === "string"
        ? req.body.profile_picture
        : null) ||
      null;

    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists)
        return sendResponse(res, false, null, "Admin already exists");
      const user = await User.create({
        name,
        email,
        password,
        role: "store_user",
        domain: "",
        storeId: null,
        mobile_number: mobile_number || null,
        gender: gender || undefined,
        date_of_birth: date_of_birth || null,
        address: cleanAddress,
        profile_picture,
      });
      const token = generateToken(user);
      const userObj = user.toObject();
      delete userObj.password;
      return sendResponse(
        res,
        true,
        { token, user: userObj },
        "Admin registered successfully",
      );
    }

    if (role === "store_owner") {
      if (!storeName || !storeEmail)
        return sendResponse(
          res,
          false,
          null,
          "Store name and email are required",
        );

      const emailTaken = await User.findOne({
        email,
        role: { $in: ["admin", "store_owner"] },
      });
      if (emailTaken)
        return sendResponse(
          res,
          false,
          null,
          "A store owner with this email already exists",
        );

      const parsedTheme = parseIfString(storeTheme) || {};
      const parsedStoreAddr = parseIfString(storeAddress);
      const cleanStoreAddr = isEmptyObj(parsedStoreAddr) ? {} : parsedStoreAddr;

      const store = await Store.create({
        name: storeName,
        email: storeEmail,
        phone: storePhone || "",
        gst_number: storegstno || "",
        logo: storeLogo || "",
        banner: storeBanner || "",
        description: storeDescription || "",
        theme: parsedTheme,
        address: cleanStoreAddr,
        status: "active",
      });

      const user = await User.create({
        name,
        email,
        password,
        role,
        mobile_number: mobile_number || null,
        gender: gender || undefined,
        date_of_birth: date_of_birth || null,
        address: cleanAddress,
        profile_picture,
      });

      const token = generateToken(user);
      const userObj = user.toObject();
      delete userObj.password;
      userObj.storeId = store;
      
      return sendResponse(
        res,
        true,
        { token, user: userObj },
        "Store owner registered successfully",
      );
    }

    const alreadyUser = await User.findOne({ email });

    if (alreadyUser) {
      return sendResponse(
        res,
        false,
        null,
        "Email already registered. Please login.",
      );
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      mobile_number: mobile_number || null,
      gender: gender || undefined,
      date_of_birth: date_of_birth || null,
      address: cleanAddress,
      profile_picture,
    });
    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;
    return sendResponse(
      res,
      true,
      { token, user: userObj },
      "User registered successfully",
    );
  } catch (err) {
    if (err.code === 11000) {
      const keys = err.keyPattern || {};
      if (keys.email && keys.storeId)
        return sendResponse(
          res,
          false,
          null,
          "You are already registered in this store. Please login.",
        );
      return sendResponse(res, false, null, "Duplicate entry error");
    }
    return sendResponse(res, false, null, err.message);
  }
};

const registerStoreOwner = async (req, res) => {
  req.body.role = "store_owner";
  return register(req, res);
};

const forgotPassword = async (req, res) => {
  try {
    const { email, domain: rawDomain } = req.body;
    if (!email)
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });

    const { user, storeName, otpKey } = await findUserForOtp(email, rawDomain);

    if (!user || !otpKey) {
      return res.status(200).json({
        success: true,
        data: null,
        message: "If this email exists, an OTP has been sent.",
      });
    }

    const otp = generateOtp();
    otpStore[otpKey] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    await sendOtpEmail(email, otp, storeName);

    return res.status(200).json({
      success: true,
      data: null,
      message: "OTP sent to your email address",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Failed to send OTP",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, domain: rawDomain } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({
        success: false,
        message: "Email, OTP and new password are required",
      });

    const { user, otpKey } = await findUserForOtp(email, rawDomain);

    if (!user || !otpKey)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const record = otpStore[otpKey];

    if (!record)
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });

    if (Date.now() > record.expiresAt) {
      delete otpStore[otpKey];
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request a new one.",
      });
    }

    if (!otp || record.otp !== String(otp).trim())
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP. Please try again." });

    const userDoc = await User.findById(user._id);
    userDoc.password = newPassword;
    await userDoc.save();

    delete otpStore[otpKey];

    const freshUser = await User.findById(user._id)
      .select("-password")
      .populate("storeId");
    const token = generateToken(freshUser);

    return res.status(200).json({
      success: true,
      data: { token, user: freshUser.toObject() },
      message: "Password reset successfully.",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      data: null,
      message: err.message || "Password reset failed",
    });
  }
};

module.exports = {
  login,
  register,
  registerStoreOwner,
  forgotPassword,
  resetPassword,
};
