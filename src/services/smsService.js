const axios = require("axios");

const mobileOtpStore = {};

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
// apitxt otp send mate se
// const sendMobileOtp = async (mobile, otp) => {
//   // const response = await axios.get("https://apitxt.com/api/sendOTP", {
//   const response = await axios.get(
//     "http://login.aquasms.com/sendSMS?username=Zyfolixo&message=XXXXXXXXXX&sendername=XYZ&smstype=TRANS&numbers=<mobile_numbers>&apikey=defde3b2-6a92-4aaa-b413-c3846c6aec53",
//     {
//       params: {
//         authkey: process.env.APITXT_KEY,
//         mobile: mobile,
//         otp: String(otp),
//         channel: "sms",
//       },
//     },
//   );
//   console.log(response);

//   if (response.data?.type === "error" || response.data?.status === "error") {
//     throw new Error(response.data?.message || "OTP sending failed");
//   }

//   return response.data;
// };

const sendMobileOtp = async (mobile, otp) => {
  const message = `Hi Welcome to zyfolixo (unity clinic) , OTP to your Login is ${otp}`;

  const url = `http://login.aquasms.com/sendSMS?username=Zyfolixo&message=${encodeURIComponent(
    message,
  )}&sendername=RESTPR&smstype=TRANS&numbers=${mobile}&apikey=defde3b2-6a92-4aaa-b413-c3846c6aec53`;

  try {
    const response = await axios.get(url);

    console.log("AquaSMS Response:", response.data);

    if (
      String(response.data).toLowerCase().includes("error") ||
      String(response.data).toLowerCase().includes("invalid") ||
      String(response.data).toLowerCase().includes("fail")
    ) {
      throw new Error(response.data);
    }

    return response.data;
  } catch (err) {
    console.error("SMS Error:", err.response?.data || err.message);
    throw err;
  }
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
