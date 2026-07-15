const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Store = require("../models/Store");
const nodemailer = require("nodemailer");
const escapeHtml = require("escape-html");
const { sendResponse } = require("../utils/response");
const { buildDeviceSnapshot } = require("../utils/deviceInfo");
const {
  sendMobileOtp,
  createMobileOtp,
  verifyMobileOtp,
} = require("../services/smsService");
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const otpStore = {};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, storeId: user.storeId || null },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN },
  );

const cleanDomain = (raw) => {
  if (!raw) return "";
  try {
    const withProto = raw.startsWith("http") ? raw : `http://${raw}`;
    const parsed = new URL(withProto);
    if (parsed.hostname === "localhost")
      return `localhost:${parsed.port || "3000"}`;
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
  if (!transporter) throw new Error("SMTP not configured");
  const safeStoreName = escapeHtml(storeName);
  const safeOtp = escapeHtml(otp);
  await transporter.sendMail({
    from: `"${safeStoreName}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: `Password Reset OTP — ${safeStoreName}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:32px;border:1px solid #eee;border-radius:8px;">
      <h2>${safeStoreName}</h2>
      <p>Your OTP for password reset:</p>
      <div style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#e91e8c;margin:24px 0;text-align:center;">${safeOtp}</div>
      <p style="color:#888;font-size:13px;">Expires in <strong>10 minutes</strong>. Do not share it.</p>
    </div>`,
  });
};

const findUserForOtp = async (email, rawDomain) => {
  const adminOrOwner = await User.findOne({ email, role: "admin" });
  if (adminOrOwner) {
    return {
      user: adminOrOwner,
      storeName: process.env.STORE_NAME || "MyApp",
      otpKey: `${email}__${adminOrOwner.storeId?.toString() || "global"}`,
    };
  }
  const regularUser = await User.findOne({ email, role: "user" });
  if (regularUser) {
    return {
      user: regularUser,
      storeName: process.env.STORE_NAME || "MyApp",
      otpKey: `${email}__${regularUser.storeId?.toString() || "global"}`,
    };
  }
  return { user: null, storeName: null, otpKey: null };
};

const recordLoginActivity = async (user, req) => {
  try {
    const snapshot = await buildDeviceSnapshot(req);
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    user.lastDevice = snapshot;
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift({ ...snapshot, loggedInAt: new Date() });
    if (user.loginHistory.length > 20) {
      user.loginHistory = user.loginHistory.slice(0, 20);
    }
    await user.save();
  } catch (e) {
    console.error("[Tracking] Failed to record login activity:", e.message);
  }
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
    if (!user) user = await User.findOne({ email }).populate("storeId");
    if (!user) return sendResponse(res, false, null, "Invalid credentials");
    if (!user.is_active)
      return sendResponse(res, false, null, "Account inactive");

    if (user.authProvider && user.authProvider !== "email") {
      const providerMsg =
        user.authProvider === "google"
          ? "This account uses Google login. Please sign in with Google."
          : "This account uses Phone OTP login. Please use Phone login.";
      return sendResponse(res, false, null, providerMsg);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return sendResponse(res, false, null, "Invalid credentials");

    await recordLoginActivity(user, req);

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
      role = "user",
      mobile_number,
      domain,
      gender,
      date_of_birth,
      address,
      authProvider = "email",
      storeName,
      storeEmail,
      storegstno,
      storePhone,
      storeLogo,
      storeBanner,
      storeDescription,
      storeTheme,
      storeAddress,
      referralCode: usedReferralCode,
    } = req.body;

    if (!name) return sendResponse(res, false, null, "Name are required");

    if (authProvider === "email" && !email)
      return sendResponse(res, false, null, "Email is required");
    if (authProvider === "phone" && !mobile_number)
      return sendResponse(res, false, null, "Mobile number is required");

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

    let referredBy = null;
    if (usedReferralCode) {
      const referrer = await User.findOne({
        referralCode: usedReferralCode.trim().toUpperCase(),
      });
      if (referrer) referredBy = referrer._id;
    }

    const deviceSnapshot = await buildDeviceSnapshot(req);

    if (role === "admin") {
      const adminExists = await User.findOne({ role: "admin" });
      if (adminExists)
        return sendResponse(res, false, null, "Admin already exists");

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
        role: "admin",
        storeId: store._id,
        domain: "",
        mobile_number: mobile_number || null,
        gender: gender || undefined,
        date_of_birth: date_of_birth || null,
        address: cleanAddress,
        profile_picture,
        authProvider: "email",
        referredBy,
        lastLogin: new Date(),
        loginCount: 1,
        lastDevice: deviceSnapshot,
        loginHistory: [{ ...deviceSnapshot, loggedInAt: new Date() }],
      });

      const token = generateToken(user);
      const userObj = user.toObject();
      delete userObj.password;
      userObj.storeId = store;
      return sendResponse(
        res,
        true,
        { token, user: userObj },
        "Admin registered successfully",
      );
    }

    if (authProvider === "email") {
      const alreadyUser = await User.findOne({ email });
      if (alreadyUser)
        return sendResponse(
          res,
          false,
          null,
          "Email already registered. Please login.",
        );
    }

    if (authProvider === "phone") {
      const alreadyPhone = await User.findOne({ mobile_number });
      if (alreadyPhone)
        return sendResponse(
          res,
          false,
          null,
          "Mobile number already registered. Please login.",
        );
    }

    const user = await User.create({
      name,
      email: email || null,
      password,
      role,
      mobile_number: mobile_number || null,
      gender: gender || undefined,
      date_of_birth: date_of_birth || null,
      address: cleanAddress,
      profile_picture,
      authProvider,
      referredBy,
      lastLogin: new Date(),
      loginCount: 1,
      lastDevice: deviceSnapshot,
      loginHistory: [{ ...deviceSnapshot, loggedInAt: new Date() }],
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
    if (record.otp !== String(otp).trim())
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

const sendMobileOtpHandler = async (req, res) => {
  try {
    const { mobile_number } = req.body;
    if (!mobile_number)
      return sendResponse(res, false, null, "Mobile number is required");
    const { otp } = createMobileOtp(mobile_number);
    await sendMobileOtp(mobile_number, otp);
    return sendResponse(res, true, null, "OTP sent to your mobile number");
  } catch (err) {
    return sendResponse(res, false, null, err.message || "Failed to send OTP");
  }
};

const verifyMobileOtpHandler = async (req, res) => {
  try {
    const { mobile_number, otp } = req.body;
    if (!mobile_number || !otp)
      return sendResponse(
        res,
        false,
        null,
        "Mobile number and OTP are required",
      );
    const result = verifyMobileOtp(mobile_number, otp);
    if (!result.success) return sendResponse(res, false, null, result.message);
    return sendResponse(
      res,
      true,
      { verified: true },
      "Mobile verified successfully",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message);
  }
};

const mobileOtpLogin = async (req, res) => {
  try {
    const { mobile_number, otp, referralCode: usedReferralCode } = req.body;
    if (!mobile_number || !otp)
      return sendResponse(res, false, null, "Mobile and OTP required");

    const result = verifyMobileOtp(mobile_number, otp);
    if (!result.success) return sendResponse(res, false, null, result.message);

    let user = await User.findOne({ mobile_number }).populate("storeId");

    if (!user) {
      let referredBy = null;
      if (usedReferralCode) {
        const referrer = await User.findOne({
          referralCode: usedReferralCode.trim().toUpperCase(),
        });
        if (referrer) referredBy = referrer._id;
      }

      const deviceSnapshot = await buildDeviceSnapshot(req);

      user = await User.create({
        name: `User${mobile_number.slice(-4)}`,
        mobile_number,
        email: null,
        password: `phone_${mobile_number}_${Date.now()}`,
        role: "user",
        is_active: true,
        authProvider: "phone",
        referredBy,
        lastLogin: new Date(),
        loginCount: 1,
        lastDevice: deviceSnapshot,
        loginHistory: [{ ...deviceSnapshot, loggedInAt: new Date() }],
      });
      user = await User.findById(user._id).populate("storeId");
    } else {
      if (user.authProvider && user.authProvider !== "phone") {
        const providerMsg =
          user.authProvider === "google"
            ? "This account uses Google login. Please sign in with Google."
            : "This account uses Email/Password login. Please use Email login.";
        return sendResponse(res, false, null, providerMsg);
      }
      if (!user.is_active)
        return sendResponse(res, false, null, "Account is inactive");
      await recordLoginActivity(user, req);
    }

    if (!user.is_active)
      return sendResponse(res, false, null, "Account is inactive");

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

const googleLogin = async (req, res) => {
  try {
    const {
      credential,
      domain: rawDomain,
      referralCode: usedReferralCode,
    } = req.body;
    if (!credential)
      return sendResponse(res, false, null, "Google credential is required");

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email }).populate("storeId");

    if (!user) {
      let referredBy = null;
      if (usedReferralCode) {
        const referrer = await User.findOne({
          referralCode: usedReferralCode.trim().toUpperCase(),
        });
        if (referrer) referredBy = referrer._id;
      }

      const deviceSnapshot = await buildDeviceSnapshot(req);

      user = await User.create({
        name,
        email,
        password: `google_${googleId}_${Date.now()}`,
        role: "user",
        profile_picture: picture,
        is_active: true,
        authProvider: "google",
        referredBy,
        lastLogin: new Date(),
        loginCount: 1,
        lastDevice: deviceSnapshot,
        loginHistory: [{ ...deviceSnapshot, loggedInAt: new Date() }],
      });
      user = await User.findById(user._id).populate("storeId");
    } else {
      if (user.authProvider && user.authProvider !== "google") {
        const providerMsg =
          user.authProvider === "phone"
            ? "This account uses Phone OTP login. Please use Phone login."
            : "This account uses Email/Password login. Please use Email login.";
        return sendResponse(res, false, null, providerMsg);
      }
      if (!user.is_active)
        return sendResponse(res, false, null, "Account is inactive");
      await recordLoginActivity(user, req);
    }

    if (!user.is_active)
      return sendResponse(res, false, null, "Account is inactive");

    const token = generateToken(user);
    const userObj = user.toObject();
    delete userObj.password;
    return sendResponse(
      res,
      true,
      { token, user: userObj },
      "Google login successful",
    );
  } catch (err) {
    return sendResponse(res, false, null, err.message || "Google login failed");
  }
};

module.exports = {
  login,
  register,
  forgotPassword,
  resetPassword,
  sendMobileOtpHandler,
  verifyMobileOtpHandler,
  mobileOtpLogin,
  googleLogin,
};
