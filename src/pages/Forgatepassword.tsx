
// import { useDispatch, useSelector } from "react-redux";
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { AppDispatch, RootState } from "../store";
// import { Eye, EyeOff, ArrowLeft } from "lucide-react";
// import { toast } from "sonner";

// // import { forgotPassword, verifyOtp, resetPassword } from "@/features/auth/authThunk";

// function Forgatepassword() {
//     const dispatch = useDispatch<AppDispatch>();
//     const navigate = useNavigate();
//     const { loading } = useSelector((state: RootState) => state.auth);

//     const [step, setStep] = useState(1);
//     const [email, setEmail] = useState("");
//     const [otp, setOtp] = useState("");
//     const [password, setPassword] = useState("");
//     const [confirmPassword, setConfirmPassword] = useState("");
//     const [showPassword, setShowPassword] = useState(false);
//     const [showconfirmPassword, setshowconfirmPassword] = useState(false)

//     const handleEmailSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setStep(2);
//         toast.success("OTP sent to your email!");
//     };

//     const handleOtpSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (otp.length < 4) return toast.error("Enter valid OTP");
//         setStep(3);
//     };

//     const handleResetSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (password !== confirmPassword) return toast.error("Passwords do not match");
//         toast.success("Password changed!");
//         navigate("/login");
//     };
//     return (
//         <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
//             <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-md animate-fade-in">

//                 {step > 1 && (
//                     <button
//                         onClick={() => setStep(step - 1)}
//                         className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition"
//                     >
//                         <ArrowLeft size={16} className="mr-1" /> Back
//                     </button>
//                 )}

//                 <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
//                     {step === 1 && "Forgot Password"}
//                     {step === 2 && "Verify OTP"}
//                     {step === 3 && "New Password"}
//                 </h2>

//                 {step === 1 && (
//                     <form onSubmit={handleEmailSubmit} className="space-y-6">
//                         <div>
//                             <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
//                             <input
//                                 type="email"
//                                 placeholder="email@example.com"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                                 required
//                             />
//                         </div>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
//                         >
//                             {loading ? "Sending..." : "Send OTP"}
//                         </button>
//                     </form>
//                 )}

//                 {step === 2 && (
//                     <form onSubmit={handleOtpSubmit} className="space-y-6">
//                         <div>
//                             <label className="block text-gray-700 mb-2 font-medium text-center">
//                                 Enter the code sent to <br /><span className="text-blue-600">{email}</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 maxLength={6}
//                                 placeholder="000000"
//                                 value={otp}
//                                 onChange={(e) => setOtp(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                                 required
//                             />
//                         </div>
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
//                         >
//                             {loading ? "Verifying..." : "Verify OTP"}
//                         </button>
//                     </form>
//                 )}

//                 {step === 3 && (
//                     <form onSubmit={handleResetSubmit} className="space-y-6">
//                         <div className="relative">
//                             <label className="block text-gray-700 mb-2 font-medium">New Password</label>
//                             <input
//                                 type={showPassword ? "text" : "password"}
//                                 placeholder="••••••••"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 onClick={() => setShowPassword(!showPassword)}
//                                 className="absolute right-3 top-[46px] text-gray-500"
//                             >
//                                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                             </button>
//                         </div>

//                         <div className="relative">
//                             <label className="block text-gray-700 mb-2 font-medium">Confirm Password</label>
//                             <input
//                                 type={showconfirmPassword ? "text" : "password"}
//                                 placeholder="••••••••"
//                                 value={confirmPassword}
//                                 onChange={(e) => setConfirmPassword(e.target.value)}
//                                 className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
//                                 required
//                             />
//                             <button
//                                 type="button"
//                                 onClick={() => setshowconfirmPassword(!showconfirmPassword)}
//                                 className="absolute right-3 top-[46px] text-gray-500"
//                             >
//                                 {showconfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                             </button>
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
//                         >
//                             {loading ? "Updating..." : "Update Password"}
//                         </button>
//                     </form>
//                 )}

//                 <div className="mt-6 text-center">
//                     <button
//                         className="text-blue-600 hover:underline text-sm"
//                         onClick={() => navigate("/login")}
//                     >
//                         Back to Login
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default Forgatepassword;
import { useDispatch, useSelector } from "react-redux";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../store";
import { Eye, EyeOff, ArrowLeft, Mail, ShieldCheck, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword, resetPassword } from "../features/auth/authThunk";
import { clearPasswordResetState } from "../features/auth/authSlice";

// ─── Step Bar ────────────────────────────────────────────────────────────────
const stepConfig = [
    { icon: Mail, label: "Email" },
    { icon: ShieldCheck, label: "Verify OTP" },
    { icon: KeyRound, label: "New Password" },
];

const StepBar = ({ current }: { current: number }) => (
    <div className="flex items-center justify-center gap-1 mb-8">
        {stepConfig.map((s, i) => {
            const Icon = s.icon;
            const done = i < current;
            const active = i === current;
            return (
                <div key={i} className="flex items-center gap-1">
                    <div className="flex flex-col items-center gap-1">
                        <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${done
                                    ? "bg-blue-600 text-white"
                                    : active
                                        ? "border-2 border-blue-500 text-blue-500"
                                        : "border-2 border-gray-200 text-gray-300"
                                }`}
                        >
                            <Icon size={16} />
                        </div>
                        <span
                            className={`text-[10px] font-medium ${active ? "text-blue-500" : done ? "text-gray-600" : "text-gray-300"
                                }`}
                        >
                            {s.label}
                        </span>
                    </div>
                    {i < stepConfig.length - 1 && (
                        <div
                            className={`w-10 h-[2px] mb-4 transition-all duration-300 ${done ? "bg-blue-600" : "bg-gray-200"
                                }`}
                        />
                    )}
                </div>
            );
        })}
    </div>
);

// ─── 6-Box OTP Input ─────────────────────────────────────────────────────────
const OtpInput = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const arr = value.split("").concat(Array(6).fill("")).slice(0, 6);

    const update = (idx: number, char: string) => {
        const next = [...arr];
        next[idx] = char;
        onChange(next.join(""));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
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

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        const digit = e.target.value.replace(/\D/g, "").slice(-1);
        if (!digit) return;
        update(idx, digit);
        if (idx < 5) refs.current[idx + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
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
                    className={`w-11 py-3 text-center text-xl font-bold border-2 rounded-lg
            focus:outline-none transition-all duration-200
            ${d ? "border-blue-400 bg-blue-50 text-blue-600" : "border-gray-300 bg-white text-gray-800"}
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100`}
                />
            ))}
        </div>
    );
};

// ─── Resend Countdown Timer ───────────────────────────────────────────────────
const ResendTimer = ({ onResend, loading }: { onResend: () => void; loading: boolean }) => {
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
        <p className="text-center text-sm text-gray-500 mt-2">
            {secs > 0 ? (
                <>
                    Resend OTP in{" "}
                    <span className="text-blue-500 font-semibold">{secs}s</span>
                </>
            ) : (
                <button
                    type="button"
                    onClick={handle}
                    disabled={loading}
                    className="text-blue-500 font-semibold underline hover:text-blue-700 disabled:opacity-50"
                >
                    {loading ? "Sending…" : "Resend OTP"}
                </button>
            )}
        </p>
    );
};

// ─── Password Strength Bar ────────────────────────────────────────────────────
const getStrength = (pw: string) => {
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

const StrengthBar = ({ password }: { password: string }) => {
    const { score, label, color } = getStrength(password);
    if (!password) return null;
    return (
        <div className="mt-1">
            <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? color : "bg-gray-200"
                            }`}
                    />
                ))}
            </div>
            <p
                className={`text-xs ${score <= 1 ? "text-red-400" : score <= 2 ? "text-yellow-500" : "text-green-600"
                    }`}
            >
                {label}
            </p>
        </div>
    );
};

// ─── Password Field with Toggle ───────────────────────────────────────────────
const PasswordField = ({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-gray-700 mb-2 font-medium">{label}</label>
            <div className="relative">
                <input
                    type={show ? "text" : "password"}
                    placeholder={placeholder || "••••••••"}
                    value={value}
                    onChange={onChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-11 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
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
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
function Forgotpassword() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const otpLoading = useSelector((state: RootState) => (state.auth as any).otpLoading) ?? false;
    const otpSent = useSelector((state: RootState) => (state.auth as any).otpSent) ?? false;
    const otpError = useSelector((state: RootState) => (state.auth as any).otpError) ?? null;
    const resetLoading = useSelector((state: RootState) => (state.auth as any).resetLoading) ?? false;
    const resetSuccess = useSelector((state: RootState) => (state.auth as any).resetSuccess) ?? false;
    const resetError = useSelector((state: RootState) => (state.auth as any).resetError) ?? null;

    const [step, setStep] = useState(0); // 0=email, 1=otp, 2=new password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // ── Move to OTP step when OTP sent successfully ───────────────────────────
    useEffect(() => {
        if (otpSent && step === 0) {
            toast.success("OTP sent to your email!");
            setStep(1);
        }
    }, [otpSent]);

    // ── Show OTP error ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (otpError) toast.error(otpError);
    }, [otpError]);

    // ── On reset success → go to login ────────────────────────────────────────
    useEffect(() => {
        if (resetSuccess) {
            toast.success("Password reset successfully! Please sign in.");
            dispatch(clearPasswordResetState() as any);
            setTimeout(() => navigate("/login"), 1400);
        }
    }, [resetSuccess]);

    // ── Show reset error ───────────────────────────────────────────────────────
    useEffect(() => {
        if (resetError) toast.error(resetError);
    }, [resetError]);

    // Cleanup on unmount
    useEffect(() => () => { dispatch(clearPasswordResetState() as any); }, []);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return toast.error("Please enter your email.");
        dispatch(forgotPassword({ email }) as any);
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.replace(/\D/g, "").length < 6)
            return toast.error("Please enter the full 6-digit OTP.");
        setStep(2);
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6)
            return toast.error("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword)
            return toast.error("Passwords do not match.");
        dispatch(resetPassword({ email, otp, newPassword }) as any);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-md animate-fade-in">

                {/* Back button for step > 0 */}
                {step > 0 && (
                    <button
                        onClick={() => {
                            if (step === 1) { setStep(0); setOtp(""); dispatch(clearPasswordResetState() as any); }
                            if (step === 2) { setStep(1); setNewPassword(""); setConfirmPassword(""); }
                        }}
                        className="flex items-center text-sm text-gray-500 hover:text-blue-600 mb-4 transition"
                    >
                        <ArrowLeft size={16} className="mr-1" />
                        {step === 1 ? "Change Email" : "Back"}
                    </button>
                )}

                {/* Title */}
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                    Forgot Password
                </h2>
                <p className="text-center text-gray-400 text-sm mb-6">
                    {step === 0 && "Enter your email to receive a 6-digit OTP."}
                    {step === 1 && `OTP sent to ${email}`}
                    {step === 2 && "OTP verified! Set your new password."}
                </p>

                {/* Step Indicator */}
                <StepBar current={step} />

                {/* ══ STEP 0 — Email ══ */}
                {step === 0 && (
                    <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                            <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={otpLoading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {otpLoading ? "Sending OTP…" : "Send OTP"}
                        </button>
                    </form>
                )}

                {/* ══ STEP 1 — OTP Verify ══ */}
                {step === 1 && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <p className="text-center text-sm text-gray-500">
                            Enter the 6-digit OTP sent to{" "}
                            <span className="font-semibold text-gray-700">{email}</span>
                        </p>

                        <OtpInput value={otp} onChange={setOtp} />

                        <ResendTimer
                            loading={otpLoading}
                            onResend={() => {
                                dispatch(clearPasswordResetState() as any);
                                dispatch(forgotPassword({ email }) as any);
                            }}
                        />

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mt-2"
                        >
                            Verify OTP
                        </button>
                    </form>
                )}

                {/* ══ STEP 2 — New Password ══ */}
                {step === 2 && (
                    <form onSubmit={handleResetPassword} className="space-y-5">
                        <div>
                            <PasswordField
                                label="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <StrengthBar password={newPassword} />
                        </div>

                        <div>
                            <PasswordField
                                label="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            {confirmPassword && (
                                <p
                                    className={`text-xs mt-1 ${newPassword === confirmPassword ? "text-green-600" : "text-red-400"
                                        }`}
                                >
                                    {newPassword === confirmPassword
                                        ? "✓ Passwords match"
                                        : "✗ Passwords do not match"}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={resetLoading}
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 transition"
                        >
                            {resetLoading ? "Resetting…" : "Reset Password"}
                        </button>
                    </form>
                )}

                {/* Back to Login link */}
                <div className="mt-6 text-center">
                    <button
                        className="text-blue-600 hover:underline text-sm"
                        onClick={() => navigate("/login")}
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Forgotpassword;