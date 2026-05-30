import React, { useState } from "react";
import { FaPlay } from "react-icons/fa";
import { X, Eye, EyeOff } from "lucide-react";
import Button from "../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authThunk";
import toast, { Toaster } from "react-hot-toast";
import HeaderLogo from "../assets/logo.png";
import LoginForm from "./Login";

const RegistrationForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const { info: storeInfo } = useSelector((state) => state.store);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    mobile_number: "",
    gender: "",
    date_of_birth: "",
    profile_picture: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill all required fields", {
        position: "top-center",
      });
      return;
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("mobile_number", formData.mobile_number);
    data.append("gender", formData.gender);
    data.append("date_of_birth", formData.date_of_birth);
    data.append("domain", window.location.origin);

    if (formData.profile_picture instanceof File) {
      data.append("profile_picture", formData.profile_picture);
    }

    const res = await dispatch(registerUser(data));

    if (res.meta.requestStatus === "fulfilled") {
      toast.success(res.payload?.message || "Registration successful!", {
        position: "top-center",
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      toast.error(
        res.payload?.message ||
          "Email already registered or registration failed",
        { position: "top-center" },
      );
    }
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

      <div
        className="px-5 py-16 relative md:mx-0 md:px-20 "
        style={{ maxHeight: "90vh" }}
      >
        <button
          className="absolute top-0 left-0 bg-color p-[8px]"
          onClick={onClose}
        >
          <X className="text-white" size={20} />
        </button>

        <div className="mb-6 text-center">
          <img
            src={dynamicLogoUrl || HeaderLogo}
            alt="Logo"
            className="mx-auto mb-6"
          />

          <h1 class="text-3xl font-bold text-primary">Create Account</h1>
          <p class="text-gray-500 mt-2">Join the Unity Hair family</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col mb-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
          </div>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
          </div>
          {/* <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
          </div> */}

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
            <Button
              type="submit"
              disabled={loading}
              variant="common"
              className="!min-w-[185px] flex items-center justify-between"
            >
              {loading ? "Signing up..." : "Sign Up"}
              <FaPlay size={8} />
            </Button>
          </div>
          <div className="text-center mt-[30px] text-p">
            <span>Don't have an account?</span>
            <span
              onClick={() => setShowLoginPopup(true)}
              className="text-theme hover:underline ps-1"
            >
              Sing in
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
