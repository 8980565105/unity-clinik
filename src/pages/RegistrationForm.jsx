import React, { useRef, useState } from "react";
// import Logo from "../assets/my_logo.png";
import LoginSlider from "../components/login/loginSlider";
import { FaPlay } from "react-icons/fa";
import SocialButtons from "../components/login/SocialButtons";
import defaultimg from "../assets/default-avatar.png";
import { Pencil, X } from "lucide-react";
import Button from "../components/ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authThunk";
import toast, { Toaster } from "react-hot-toast";
import HeaderLogo from "../assets/logo.png";

const RegistrationForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [preview, setPreview] = useState(user?.profile_picture || defaultimg);
  const fileInputRef = useRef(null);
  const [isAccountDetails, setIsAccountDetails] = useState(false);
  const { info: storeInfo } = useSelector((state) => state.store);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, profile_picture: file }));
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
      toast.success("Registration successful!", { position: "top-center" });
      setTimeout(() => {
        onClose();
      }, 1000);
    } else {
      const errorMessage =
        res.payload?.message ||
        "Email already registered or registration failed";
      toast.error(errorMessage, { position: "top-center" });
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
      <div className="flex items-center justify-center">
        <div className="bg-white box-shadow rounded-lg flex w-full overflow-hidden max-w-[1062px] mx-auto">
          <div
            className="w-full md:w-2/3 px-5 py-16 relative md:mx-0 md:px-20 overflow-y-auto"
            style={{ maxHeight: "90vh" }}
          >
            <button
              className="absolute top-0 left-0 bg-color p-[8px]"
              onClick={onClose}
            >
              <X className="text-white" size={20} />
            </button>

            <div className="mb-6 text-center">
              {/* <img src={Logo} className="mx-auto mb-6" alt="Logo" /> */}

              <img
                src={dynamicLogoUrl || HeaderLogo}
                alt="Logo"
                className="mx-auto mb-6"
              />

              <h3 className="mb-11 text-[var(--secondary-color)]">Welcome to {storeInfo?.name || "maycra store"}</h3>
              
              <h3 className="text-[var(--primary-color)] text-bold text-[26px]">Sign Up</h3>
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

              <div>
                <button
                  type="button"
                  className="text-[var(--primary-color)] underline text-sm"
                  onClick={() => setIsAccountDetails(!isAccountDetails)}
                >
                  + Add Account Details
                </button>
              </div>

              {isAccountDetails && (
                <div className="space-y-4 mt-4">
                  <div className="relative w-[150px] h-[150px] mx-auto mb-4">
                    <img
                      src={preview}
                      alt="Profile Preview"
                      className="w-full h-full rounded-full border-4 circle-border object-cover"
                    />
                    <div
                      className="absolute bottom-1 right-1 box-shadow bg-color text-white p-2 rounded-full cursor-pointer"
                      onClick={() => fileInputRef.current.click()}
                    >
                      <Pencil size={16} />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>

                  <input
                    type="text"
                    name="mobile_number"
                    placeholder="Enter mobile number"
                    value={formData.mobile_number}
                    onChange={handleChange}
                    className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
                  />

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    placeholder="Date of Birth"
                    type={formData.date_of_birth ? "date" : "text"}
                    onFocus={(e) => (e.target.type = "date")}
                    onBlur={(e) => {
                      if (!e.target.value) e.target.type = "text";
                    }}
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleChange}
                    className="input-common w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
                  />
                </div>
              )}

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
            </form>

            <div className="mt-4 sm:mt-10 space-x-4">
              <SocialButtons />
            </div>
          </div>

          <div className="w-1/3 md:flex items-center justify-center light-color hidden">
            <LoginSlider />
          </div>
        </div>
      </div>
    </>
  );
};

export default RegistrationForm;
