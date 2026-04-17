

import LoginSlider from "../components/login/loginSlider";
import { FaPlay } from "react-icons/fa";
import SocialButtons from "../components/login/SocialButtons";
import Button from "../components/ui/Button";
import { X } from "lucide-react";
import { loginUser } from "../features/auth/authThunk";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import HeaderLogo from "../assets/logo.png";


const LoginForm = ({ onClose, onSwitchRegister, onSwitchForget }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const { token } = useSelector((state) => state.auth);
  const { info: storeInfo } = useSelector((state) => state.store);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ FIX: domain send karo — store_user ne correct store ma find karse
    const loginData = {
      email: formData.email,
      password: formData.password,
      domain: window.location.origin, // e.g. "http://localhost:3000" or "https://mystore.com"
      // domain: window.location.host, // e.g. "http://localhost:3000" or "https://mystore.com"

    };

    const res = await dispatch(loginUser(loginData));

    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Login successful!", { position: "top-center" });
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

      <div className="flex items-center justify-center ">
        <div className="bg-white box-shadow  rounded-lg flex w-full overflow-hidden  w-full max-w-[1062px] mx-auto ">
          <div className="w-1/3 md:flex items-center justify-center light-color hidden">
            <LoginSlider />
          </div>

          <div className="w-full md:w-2/3 px-5 py-5 sm:py-16 relative  md:mx-0 md:px-20  ">
            <button
              onClick={onClose}
              className="absolute top-0 right-0  bg-color p-[8px]"
            >
              <X className="text-white " size={20} />
            </button>

            <div className="mb-6 text-center ">
              {/* <img src={Logo} className="mx-auto mb-6" /> */}
                  <img
                src={dynamicLogoUrl || HeaderLogo}
                alt="Logo"
                className="mx-auto mb-6"
              />
              {/* <p className="text-light text-[14px] mb-11">
                Women's wear collection/label/line The high street giant is
                launching a designer womenswear collection.
              </p> */}
              <h3 className="mb-11 text-[var(--secondary-color)]">Welcome to {storeInfo?.name || "maycra store"}</h3>

              <h3 className="text-[var(--primary-color)] text-bold text-[26px]">Sign In</h3>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
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
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
                />
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

            <div className="mt-4  sm:mt-10 space-x-4">
              <SocialButtons />
            </div>
            <div className="text-center mt-[40px] text-p">
              <button
                onClick={onSwitchRegister}
                className="text-theme underline"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
