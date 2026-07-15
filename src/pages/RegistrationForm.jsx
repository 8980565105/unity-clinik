import React, { useEffect, useRef, useState } from "react";
import { FaPlay } from "react-icons/fa";
import { X, Eye, EyeOff, Phone, Mail } from "lucide-react";
import Button from "../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authThunk";
import toast from "react-hot-toast";
import HeaderLogo from "../assets/logo.webp";
import LoginForm from "./Login";
import api from "../services/api";
import { mergeGuestCart, fetchCart } from "../features/cart/cartThunk";
import { clearGuestCookie } from "../utils/guestId";

const RegistrationForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const { info: storeInfo } = useSelector((state) => state.store);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState("email");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  const googleBtnRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile_number: "",
    referralCode: "",
  });

  useEffect(() => {
    const savedRef = sessionStorage.getItem("referralCode");
    if (savedRef) {
      setFormData((prev) => ({ ...prev, referralCode: savedRef }));
    }
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    const initGoogle = () => {
      if (window.google && googleBtnRef.current) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: "100%",
          text: "signup_with",
          shape: "rectangular",
        });
      }
    };
    if (window.google) {
      initGoogle();
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleCallback = async (response) => {
    try {
      const res = await api.post("/auth/google-login", {
        credential: response.credential,
        domain: window.location.origin,
        referralCode: sessionStorage.getItem("referralCode") || undefined,
      });
      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        try {
          await dispatch(mergeGuestCart(user._id)).unwrap();
        } catch (e) {
          console.warn("Cart merge failed:", e);
        }
        clearGuestCookie();
        localStorage.removeItem("cart_id");
        await dispatch(fetchCart());

        dispatch({ type: "auth/loginUser/fulfilled", payload: res.data });
        toast.success("Google login successful!", { position: "top-center" });
        sessionStorage.removeItem("referralCode");
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Google login failed", {
        position: "top-center",
      });
    }
  };

  const handleSendOtp = async () => {
    if (!formData.mobile_number || formData.mobile_number.length < 10) {
      toast.error("Valid 10-digit mobile number nakho", {
        position: "top-center",
      });
      return;
    }
    setOtpLoading(true);
    try {
      await api.post("/auth/send-mobile-otp", {
        mobile_number: formData.mobile_number,
      });
      setOtpSent(true);
      toast.success("OTP send your mobile number!", {
        position: "top-center",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP moklava ma nishfal", {
        position: "top-center",
      });
    }
    setOtpLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      toast.error("6-digit OTP nakho", { position: "top-center" });
      return;
    }
    setOtpLoading(true);
    try {
      const savedRef = sessionStorage.getItem("referralCode");
      const res = await api.post("/auth/mobile-otp-login", {
        mobile_number: formData.mobile_number,
        otp,
        referralCode: savedRef || undefined,
      });

      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "auth/loginUser/fulfilled", payload: res.data });
        setOtpVerified(true);
        toast.success("OTP Verified & Login Successful! ✓", {
          position: "top-center",
        });
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP", {
        position: "top-center",
      });
    }
    setOtpLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === "email") {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error("Name, Email ane Password jaruri chhe", {
          position: "top-center",
        });
        return;
      }
    }

    if (mode === "phone") {
      if (!formData.name || !formData.mobile_number) {
        toast.error("Name, Mobile number jaruri chhe", {
          position: "top-center",
        });
        return;
      }

      if (mode === "phone") return;

      if (!otpVerified) {
        toast.error("Mobile number verify karo pehla", {
          position: "top-center",
        });
        return;
      }
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("mobile_number", formData.mobile_number);
    data.append("domain", window.location.origin);
    data.append("role", "user");
    data.append("authProvider", mode);
    if (formData.referralCode) {
      data.append("referralCode", formData.referralCode);
    }
    const res = await dispatch(registerUser(data));

    // if (res.meta.requestStatus === "fulfilled") {
    //   toast.success(res.payload?.message || "Registration successful!", {
    //     position: "top-center",
    //   });
    //   sessionStorage.removeItem("referralCode");
    //   setTimeout(() => onClose(), 1000);
    // }
    if (res.meta.requestStatus === "fulfilled") {
      toast.success(res.payload?.message || "Registration successful!", {
        position: "top-center",
      });
      sessionStorage.removeItem("referralCode"); // ← use thai gayo, clear karo
      setTimeout(() => onClose(), 1000);
    } else {
      toast.error(res.payload?.message || "Registration failed. Try again.", {
        position: "top-center",
      });
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
    setFormData({ name: "", email: "", password: "", mobile_number: "" });
  };

  const BASE = process.env.REACT_APP_API_URL_IMAGE;
  const dynamicLogoUrl = (() => {
    const logoPath = storeInfo?.theme?.logoUrl;
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    return `${BASE}${logoPath}`;
  })();

  return (
    <>
      <div
        className="px-5 py-14 relative md:mx-0 md:px-15"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <button
          className="absolute top-0 right-0 bg-color p-[8px]"
          onClick={onClose}
        >
          <X className="text-white" size={20} />
        </button>

        <div className="mb-6 text-center">
          <img
            src={dynamicLogoUrl || HeaderLogo}
            alt="Logo"
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-primary">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Join the Unity Hair family
          </p>
        </div>
        <div className="space-y-3 my-3 flex flex-col ">
          <div className="flex rounded-lg border light-border overflow-hidden">
            <button
              type="button"
              onClick={() => switchMode("email")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                mode === "email"
                  ? "bg-color text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Mail size={15} />
              Email Register
            </button>
            <button
              type="button"
              onClick={() => switchMode("phone")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${
                mode === "phone"
                  ? "bg-color text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Phone size={15} />
              Phone Register
            </button>
          </div>

          <div className="flex items-center gap-3 py-1">
            <hr className="flex-1 border-gray-200" />
            <span className="text-gray-400 text-xs">OR</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <div className="flex justify-center items-center">
            <div
              ref={googleBtnRef}
              className="w-full text-center input-common !w-fit !p-0 flex justify-center"
            />
          </div>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
          />

          {mode === "email" && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
          )}

          {mode === "phone" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="tel"
                  name="mobile_number"
                  placeholder="Mobile Number"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  maxLength={10}
                  disabled={otpVerified}
                  required
                  className="input-common flex-1 border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2 disabled:opacity-60 disabled:bg-gray-50"
                />
                {!otpVerified ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="bg-color text-white px-4 rounded-md text-sm whitespace-nowrap disabled:opacity-60 min-w-[90px]"
                  >
                    {otpLoading ? "..." : otpSent ? "Resend" : "Send OTP"}
                  </button>
                ) : (
                  <span className="flex items-center text-green-600 font-semibold text-sm px-3 bg-green-50 rounded-md border border-green-200">
                    ✓ Verified
                  </span>
                )}
              </div>

              {otpSent && !otpVerified && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    className="input-common flex-1 border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2 tracking-widest text-center font-mono text-lg"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.length < 6}
                    className="bg-color text-white px-4 rounded-md text-sm disabled:opacity-60 min-w-[90px]"
                  >
                    {otpLoading ? "..." : "Verify"}
                  </button>
                </div>
              )}

              {otpSent && !otpVerified && (
                <p className="text-xs text-gray-400 text-center">
                  OTP this {formData.mobile_number} number par send
                </p>
              )}
            </div>
          )}
          {mode === "email" && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-common w-full border light-border rounded-md px-5 py-3 pr-12 focus:outline-none focus:ring-2"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          )}
          <div className="pt-2">
            <Button
              type="submit"
              variant="common"
              className="w-full flex items-center justify-between !min-w-full"
            >
              {loading ? "Creating account..." : "Sign Up"}
              <FaPlay size={8} />
            </Button>
          </div>
          <div className="text-center text-sm text-p pt-1">
            <span className="text-gray-500">Already have an account?</span>
            <span
              onClick={() => setShowLoginPopup(true)}
              className="text-theme hover:underline ps-1 cursor-pointer font-medium"
            >
              Sign In
            </span>
          </div>
        </form>
      </div>

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setShowLoginPopup(false)}
              onSwitch={() => setShowLoginPopup(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default RegistrationForm;
