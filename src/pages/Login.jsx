import { FaPlay } from "react-icons/fa";
import Button from "../components/ui/Button";
import { X, Eye, EyeOff } from "lucide-react";
import { loginUser } from "../features/auth/authThunk";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import HeaderLogo from "../assets/logo.webp";

const LoginForm = ({ onClose, onSwitchRegister, onSwitchForget }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { token } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const { info: storeInfo } = useSelector((state) => state.store);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      const errorMessage =
        res.payload?.message || res.payload || "Invalid email or password";
      toast.error(errorMessage, { position: "top-center" });
    }
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

      <div className="p-10 relative">
        <button
          onClick={onClose}
          className="absolute top-0 right-0  bg-color p-[8px]"
        >
          <X className="text-white " size={20} />
        </button>

        <div className="mb-6 text-center ">
          <img
            src={dynamicLogoUrl || HeaderLogo}
            alt="Logo"
            className="mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-primary">Welcome Back</h1>

          <p className="text-gray-500 mt-2">Login to your Unity Hair account</p>
        </div>

        <form className="space-y-4 w-full" onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Username"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
          </div>
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center text-sm gap-4 w-full pt-[26px]">
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

        <div className="text-center mt-[30px] text-p">
          <span>Don't have an account?</span>
          <span
            onClick={onSwitchRegister}
            className="text-theme hover:underline ps-1"
          >
            Sing Up
          </span>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
