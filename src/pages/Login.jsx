import { FaPlay } from "react-icons/fa";
import Button from "../components/ui/Button";
import { X, Eye, EyeOff, Mail, Phone } from "lucide-react";
import { loginUser } from "../features/auth/authThunk";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import HeaderLogo from "../assets/logo.webp";
import api from "../services/api";

const LoginForm = ({ onClose, onSwitchRegister, onSwitchForget }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const { token } = useSelector((state) => state.auth);
  const { info: storeInfo } = useSelector((state) => state.store);

  const [mode, setMode] = useState("email");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileLoading, setMobileLoading] = useState(false);

  const [mobileOtpVerified, setMobileOtpVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef(null);

  const googleBtnRef = useRef(null);

  const BASE = process.env.REACT_APP_API_URL_IMAGE;
  const dynamicLogoUrl = (() => {
    const logoPath = storeInfo?.theme?.logoUrl;
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    return `${BASE}${logoPath}`;
  })();

  const startResendTimer = () => {
    setResendTimer(30);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);


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
          text: "signin_with_google",
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
      });
      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "auth/loginUser/fulfilled", payload: res.data });
        toast.success("Google login successful!", { position: "top-center" });
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Google login failed", {
        position: "top-center",
      });
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginData = {
      email: formData.email,
      password: formData.password,
      domain: window.location.origin,
    };
    const res = await dispatch(loginUser(loginData));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success(res.payload?.message || "Login successful!", {
        position: "top-center",
      });
      setTimeout(() => onClose(), 1000);
    } else {
      toast.error(
        res.payload?.message || res.payload || "Invalid email or password",
        { position: "top-center" }
      );
    }
  };



  const handleSendMobileOtp = async () => {
    if (!mobileNumber || mobileNumber.length < 10) {
      toast.error("Valid 10-digit mobile number enter करो", { position: "top-center" });
      return;
    }
    setMobileLoading(true);
    try {
      await api.post("/auth/send-mobile-otp", { mobile_number: mobileNumber });
      setMobileOtpSent(true);
      startResendTimer();
      toast.success("OTP sent!", { position: "top-center" });
    } catch (err) {
      toast.error(err.response?.data?.message || "OTP send failed", { position: "top-center" });
    }
    setMobileLoading(false);
  };

  const handleMobileOtpLogin = async () => {
    if (!mobileOtp || mobileOtp.length < 6) {
      toast.error("6-digit OTP nakho", { position: "top-center" });
      return;
    }
    setMobileLoading(true);
    try {
      const res = await api.post("/auth/mobile-otp-login", {
        mobile_number: mobileNumber,
        otp: mobileOtp,
      });
      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "auth/loginUser/fulfilled", payload: res.data });
        toast.success("Login successful!", { position: "top-center" });
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Login failed",
        { position: "top-center" }
      );
    }
    setMobileLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!mobileOtp || mobileOtp.length < 6) {
      toast.error("6-digit OTP enter karo", { position: "top-center" });
      return;
    }
    setMobileLoading(true);
    try {
      const res = await api.post("/auth/mobile-otp-login", {
        mobile_number: mobileNumber,
        otp: mobileOtp,
      });

      if (res.data?.data?.token) {
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        dispatch({ type: "auth/loginUser/fulfilled", payload: res.data });
        setMobileOtpVerified(true);
        toast.success("OTP Verified & Login Successful! ✓", { position: "top-center" });
        setTimeout(() => onClose(), 800);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP", { position: "top-center" });
    }
    setMobileLoading(false);
  };
  const switchMode = (newMode) => {
    setMode(newMode);
    setMobileOtpSent(false);
    setMobileOtp("");
    setMobileNumber("");
    setMobileOtpVerified(false);
    setFormData({ email: "", password: "" });
  };

  useEffect(() => {
    if (token) {
      const redirectPage = localStorage.getItem("redirectAfterLogin");
      if (redirectPage) {
        navigate(redirectPage);
        localStorage.removeItem("redirectAfterLogin");
      } else {
        navigate("/");
      }
    }
  }, [token]);

  return (
    <>
      <div className="p-10 relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 bg-color p-[8px]"
        >
          <X className="text-white" size={20} />
        </button>

        <div className="mb-6 text-center">
          <img
            src={dynamicLogoUrl || HeaderLogo}
            alt="Logo"
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Login to your Unity Hair account
          </p>
        </div>

        <div className="flex rounded-lg border light-border overflow-hidden mb-5">
          <button
            type="button"
            onClick={() => switchMode("email")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${mode === "email"
              ? "bg-color text-white"
              : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <Mail size={15} />
            Email Login
          </button>
          <button
            type="button"
            onClick={() => switchMode("phone")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all ${mode === "phone"
              ? "bg-color text-white"
              : "text-gray-500 hover:bg-gray-50"
              }`}
          >
            <Phone size={15} />
            Phone Login
          </button>
        </div>

        {mode === "email" && (
          <form className="space-y-4 w-full" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
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

            <div className="flex flex-col sm:flex-row justify-between items-center text-sm gap-4 w-full pt-2">
              <button
                type="button"
                onClick={onSwitchForget}
                className="text-theme text-[14px] hover:underline"
              >
                Forgot password?
              </button>
              <Button
                type="submit"
                disabled={loading}
                variant="common"
                className="!min-w-[185px] flex items-center justify-between"
              >
                {loading ? "Signing in..." : "Sign In"}
                <FaPlay size={8} />
              </Button>
            </div>
          </form>
        )}

        {mode === "phone" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="10-digit Mobile Number"
                value={mobileNumber}
                onChange={(e) =>
                  setMobileNumber(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                maxLength={10}
                className="input-common flex-1 border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
              />
              <button
                type="button"
                onClick={handleSendMobileOtp}
                disabled={mobileLoading || resendTimer > 0}
                className="bg-color text-white px-4 rounded-md text-sm whitespace-nowrap disabled:opacity-60 min-w-[90px]"
              >
                {mobileLoading
                  ? "..."
                  : resendTimer > 0
                    ? `${resendTimer}s`
                    : mobileOtpSent
                      ? "Resend"
                      : "Send OTP"}
              </button>
            </div>

            {mobileOtpSent && (
              <>
                <p className="text-xs text-gray-400 text-center">
                  OTP sent to +91 {mobileNumber}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={mobileOtp}
                    onChange={(e) =>
                      setMobileOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    maxLength={6}
                    disabled={mobileOtpVerified}
                    className={`input-common flex-1 border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2 tracking-widest text-center font-mono text-lg ${mobileOtpVerified ? "bg-green-50 border-green-300" : ""
                      }`}
                  />
                  {mobileOtpVerified ? (
                    <span className="flex items-center justify-center text-green-600 font-semibold text-sm px-3 bg-green-50 rounded-md border border-green-200 min-w-[90px]">
                      ✓ Verified
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={mobileLoading || mobileOtp.length < 6}
                      className="bg-color text-white px-4 rounded-md text-sm disabled:opacity-60 min-w-[90px]"
                    >
                      {mobileLoading ? "..." : "Verify"}
                    </button>
                  )}
                </div>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-xs text-gray-400">
                      Resend OTP in{" "}
                      <span className="font-semibold text-gray-600">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendMobileOtp}
                      disabled={mobileLoading}
                      className="text-xs text-theme hover:underline disabled:opacity-60"
                    >
                      Didn't receive OTP? Resend
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 my-5">
          <hr className="flex-1 border-gray-200" />
          <span className="text-gray-400 text-xs">OR</span>
          <hr className="flex-1 border-gray-200" />
        </div>

        <div ref={googleBtnRef} className="w-full flex justify-center" />

        <div className="text-center mt-6 text-sm text-p">
          <span className="text-gray-500">Don't have an account?</span>
          <span
            onClick={onSwitchRegister}
            className="text-theme hover:underline ps-1 cursor-pointer font-medium"
          >
            Sign Up
          </span>
        </div>
      </div>
    </>
  );
};

export default LoginForm;