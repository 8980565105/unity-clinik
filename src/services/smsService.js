const axios = require("axios");

const mobileOtpStore = {};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendMobileOtp = async (mobile, otp) => {
  const response = await axios.get("https://apitxt.com/api/sendOTP", {
    params: {
      authkey: process.env.APITXT_KEY,
      mobile: mobile,
      otp: String(otp),
      channel: "sms",
    },
  });

  if (response.data?.type === "error" || response.data?.status === "error") {
    throw new Error(response.data?.message || "OTP sending failed");
  }

  return response.data;
};

const createMobileOtp = (mobile, storeKey = "global") => {
  const key = `${mobile}__${storeKey}`;
  const otp = generateOtp();
  mobileOtpStore[key] = {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  return { otp, key };
};

const verifyMobileOtp = (mobile, otp, storeKey = "global") => {
  const key = `${mobile}__${storeKey}`;
  const record = mobileOtpStore[key];

  if (!record)
    return { success: false, message: "No OTP found. Request a new one." };
  if (Date.now() > record.expiresAt) {
    delete mobileOtpStore[key];
    return { success: false, message: "OTP expired. Request a new one." };
  }
  if (record.otp !== String(otp).trim())
    return { success: false, message: "Invalid OTP." };

  delete mobileOtpStore[key];
  return { success: true };
};

module.exports = { sendMobileOtp, createMobileOtp, verifyMobileOtp };
