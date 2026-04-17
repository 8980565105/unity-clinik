// import Logo from "../assets/my_logo.png";
import LoginSlider from "../components/login/loginSlider";
import { FaPlay } from "react-icons/fa";
import Button from "../components/ui/Button";
import { X, Eye, EyeOff, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword, resetPassword } from "../features/auth/authThunk";
import { clearPasswordResetState } from "../features/auth/authSlice";
import toast, { Toaster } from "react-hot-toast";
import HeaderLogo from "../assets/logo.png";

const steps = [
  { icon: Mail, label: "Email" },
  { icon: ShieldCheck, label: "OTP" },
  { icon: KeyRound, label: "New Password" },
];

const StepBar = ({ current }) => (
  <div className="flex items-center justify-center gap-1 mb-8">
    {steps.map((s, i) => {
      const Icon = s.icon;
      const done = i < current;
      const active = i === current;
      return (
        <div key={i} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                done
                  ? "bg-color text-[var(--secondary-color)]"
                  : active
                    ? "border-2 border-[var(--primary-color)] text-[var(--primary-color)]"
                    : "border-2 border-[var(--secondary-color)] text-[var(--secondary-color)]"
              }`}
            >
              <Icon size={16} />
            </div>
            <span
              className={`text-[10px] font-medium ${
                active
                  ? "text-[--primary-color]"
                  : done
                    ? "text-[var(--secondary-color)]"
                    : "text-[var(--secondary-color)]"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={`w-10 h-[2px] mb-4 transition-all duration-300 ${
                done
                  ? "bg-[var(--primary-color)]"
                  : "bg-[var(--secondary-color)]"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
);

const OtpInput = ({ value, onChange }) => {
  const refs = useRef([]);
  const arr = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const update = (idx, char) => {
    const next = [...arr];
    next[idx] = char;
    onChange(next.join(""));
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      if (arr[idx]) {
        update(idx, "");
      } else if (idx > 0) {
        update(idx - 1, "");
        refs.current[idx - 1]?.focus();
      }
      return;
    }
    if (e.key === "ArrowLeft" && idx > 0) refs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleInput = (e, idx) => {
    const digit = e.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    update(idx, digit);
    if (idx < 5) refs.current[idx + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    const focusIdx = Math.min(pasted.length, 5);
    refs.current[focusIdx]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center my-5">
      {arr.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleInput(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          className={`w-11 h-13 py-3 text-center text-xl font-bold border-2 rounded-lg
            focus:outline-none transition-all duration-200
            ${d ? "border-[var(--primary-color)] text-[var(--primary-color)]" : "border-[var(--secondary-color)] bg-white text-gray-800"}
            focus:border-[var(--primary-color)] focus:ring-2 focus:ring-[var(--primary-color)]`}
        />
      ))}
    </div>
  );
};

const ResendTimer = ({ onResend, loading }) => {
  const [secs, setSecs] = useState(60);

  useEffect(() => {
    if (secs <= 0) return;
    const t = setTimeout(() => setSecs((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);

  const handle = () => {
    onResend();
    setSecs(60);
  };

  return (
    <p className="text-center text-sm text-gray-500 mt-1">
      {secs > 0 ? (
        <>
          Resend OTP in{" "}
          <span className="text-[var(--primary-color)] font-semibold">
            {secs}s
          </span>
        </>
      ) : (
        <button
          type="button"
          onClick={handle}
          disabled={loading}
          className="text-[var(--primary-color)] font-semibold underline disabled:opacity-50"
        >
          {loading ? "Sending…" : "Resend OTP"}
        </button>
      )}
    </p>
  );
};

const PasswordField = ({ name, placeholder, value, onChange }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required
        className="input-common w-full border light-border rounded-md px-5 py-3 pr-11 focus:outline-none focus:ring-2"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
};

const strength = (pw) => {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    { label: "Too short", color: "bg-red-400" },
    { label: "Weak", color: "bg-orange-400" },
    { label: "Fair", color: "bg-yellow-400" },
    { label: "Good", color: "bg-blue-400" },
    { label: "Strong", color: "bg-green-500" },
  ];
  return { score: s, ...map[s] };
};

const StrengthBar = ({ password }) => {
  const { score, label, color } = strength(password);
  if (!password) return null;
  return (
    <div className="mt-1">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i <= score ? color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p
        className={`text-xs ${score <= 1 ? "text-red-400" : score <= 2 ? "text-yellow-500" : "text-green-600"}`}
      >
        {label}
      </p>
    </div>
  );
};

const ForgetForm = ({ onClose, onSwitch }) => {
  const dispatch = useDispatch();
  const {
    otpLoading,
    otpSent,
    otpError,
    resetLoading,
    resetSuccess,
    resetError,
    token,
  } = useSelector((state) => state.auth);

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { info: storeInfo } = useSelector((state) => state.store);

  // ✅ Handle OTP sent success
  useEffect(() => {
    if (otpSent && step === 0) {
      console.log("✅ OTP sent successfully!");
      toast.success("OTP sent! Check your email.", { position: "top-center" });
      setStep(1);
    }
  }, [otpSent, step]);

  // ✅ Handle OTP error
  useEffect(() => {
    if (otpError) {
      console.error("❌ OTP Error:", otpError);
      toast.error(otpError, { position: "top-center" });
    }
  }, [otpError]);

  // ✅ Handle reset success - AUTO LOGIN
  useEffect(() => {
    if (resetSuccess) {
      console.log("✅ Password reset successfully!");
      console.log("Token:", token);

      toast.success("Password reset successfully! Logging you in...", {
        position: "top-center",
      });

      // Clear the reset state
      dispatch(clearPasswordResetState());

      // Close modal and redirect after 1.5 seconds
      setTimeout(() => {
        onClose();
        window.location.href = "/"; // Force redirect to home
      }, 1500);
    }
  }, [resetSuccess, token, dispatch, onClose]);

  // ✅ Handle reset error
  useEffect(() => {
    if (resetError) {
      console.error("❌ Reset Error:", resetError);
      toast.error(resetError, { position: "top-center" });
    }
  }, [resetError]);

  // Cleanup on unmount
  useEffect(() => () => dispatch(clearPasswordResetState()), [dispatch]);

  const handleSendOtp = async (e) => {
    e?.preventDefault();

    if (!email) {
      return toast.error("Please enter your email.", {
        position: "top-center",
      });
    }

    console.log("📧 Sending OTP to:", email);
    console.log("🌐 Current domain:", window.location.host);

    const result = await dispatch(forgotPassword({ email }));

    console.log("📨 OTP Result:", result);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();

    const cleanOtp = otp.replace(/\D/g, "");

    if (cleanOtp.length < 6) {
      return toast.error("Please enter the full 6-digit OTP.", {
        position: "top-center",
      });
    }

    console.log("✅ OTP verified, moving to password reset step");
    setStep(2);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters.", {
        position: "top-center",
      });
    }

    if (newPassword !== confirmPassword) {
      return toast.error("Passwords do not match.", { position: "top-center" });
    }

    console.log("🔐 Resetting password...");
    console.log("Email:", email);
    console.log("OTP:", otp);
    console.log("Domain:", window.location.host);

    const result = await dispatch(
      resetPassword({
        email,
        otp: otp.replace(/\D/g, ""),
        newPassword,
      }),
    );

    console.log("🔐 Reset Result:", result);
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
      <Toaster />
      <div className="flex items-center justify-center">
        <div className="bg-white box-shadow rounded-lg flex w-full overflow-hidden max-w-[1062px] mx-auto">
          <div className="w-1/3 md:flex items-center justify-center light-color hidden">
            <LoginSlider />
          </div>

          <div className="w-full md:w-2/3 px-5 py-12 relative md:mx-0 md:px-20">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 bg-color p-[8px]"
            >
              <X className="text-white" size={20} />
            </button>

            <div className="mb-4 text-center">
              {/* <img src={Logo} className="mx-auto mb-5" alt="Logo" /> */}

              <img
                src={dynamicLogoUrl || HeaderLogo}
                alt="Logo"
                className="mx-auto mb-6"
              />
              <h3 className="mb-11 text-[var(--secondary-color)]">
                Welcome to {storeInfo?.name || "maycra store"}
              </h3>

              {/* <p className="text-light text-[14px] mb-6">
                Women's wear collection/label/line. The high street giant is
                launching a designer womenswear collection.
              </p> */}
              <h3 className="text-[var(--primary-color)] text-bold text-[26px]">
                Forgot Password
              </h3>
            </div>

            <StepBar current={step} />

            {/* STEP 1: Email Input */}
            {step === 0 && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-sm text-[var(--secondary-color)] text-center mb-2">
                  Enter your registered email and we'll send you a 6-digit OTP.
                </p>

                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2 "
                />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={onSwitch}
                    className="text-[var(--primary-color)] text-[14px] hover:underline"
                  >
                    Back to Sign In?
                  </button>
                  <Button
                    type="submit"
                    disabled={otpLoading}
                    variant="common"
                    className="!min-w-[185px] flex items-center justify-between"
                  >
                    {otpLoading ? "Sending OTP…" : "Send OTP"}
                    <FaPlay size={8} />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 2: OTP Verification */}
            {step === 1 && (
              <form onSubmit={handleVerifyOtp} className="space-y-2">
                <p className="text-sm text-[var(--secondary-color)] text-center">
                  We sent a 6-digit OTP to{" "}
                  <span className="font-semibold text-[var(--primary-color)]">
                    {email}
                  </span>
                </p>

                <OtpInput value={otp} onChange={setOtp} />

                <ResendTimer
                  loading={otpLoading}
                  onResend={() => dispatch(forgotPassword({ email }))}
                />

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(0);
                      setOtp("");
                    }}
                    className="text-[var(--primary-color)]   text-[14px] hover:underline"
                  >
                    ← Change Email
                  </button>
                  <Button
                    type="submit"
                    variant="common"
                    className="!min-w-[185px] flex items-center justify-between"
                  >
                    Verify OTP
                    <FaPlay size={8} />
                  </Button>
                </div>
              </form>
            )}

            {/* STEP 3: New Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-sm text-gray-500 text-center mb-2">
                  OTP verified! Set your new password.
                </p>

                <div>
                  <PasswordField
                    name="newPassword"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <StrengthBar password={newPassword} />
                </div>

                <PasswordField
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {confirmPassword && (
                  <p
                    className={`text-xs ${
                      newPassword === confirmPassword
                        ? "text-green-600"
                        : "text-red-400"
                    }`}
                  >
                    {newPassword === confirmPassword
                      ? "✓ Passwords match"
                      : "✗ Passwords do not match"}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-[var(--primary-color)] text-[14px] hover:underline"
                  >
                    ← Back
                  </button>
                  <Button
                    type="submit"
                    disabled={resetLoading}
                    variant="common"
                    className="!min-w-[185px] flex items-center justify-between"
                  >
                    {resetLoading ? "Resetting…" : "Reset Password"}
                    <FaPlay size={8} />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgetForm;
