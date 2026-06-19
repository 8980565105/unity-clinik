import React, { useEffect, useRef, useState } from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import { useDispatch, useSelector } from "react-redux";
import defaultimg from "../../assets/default-avatar.webp";
import { ChevronRight, Heart, ListOrdered, Pencil } from "lucide-react";
import { uploadProfilePicture } from "../../features/user/userThunk";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Address from "../Address/Address";
import AccountDetails from "../AccountDetails/AccountDetails";
import { logout } from "../../features/auth/authSlice";

export default function UserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { loading } = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(user?.profile_picture || defaultimg);

  const [activeTab, setActiveTab] = useState("account");
  const { pages, slugLoading } = useSelector((state) => state.pages);
  const accountPage = pages?.find((page) => page.slug === "account");

  useEffect(() => {
    setPreview(user?.profile_picture || defaultimg);
  }, [user?.profile_picture]);
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    const result = await dispatch(uploadProfilePicture(file));
    if (uploadProfilePicture.fulfilled.match(result)) {
      const newUrl = result.payload?.profile_picture;
      if (newUrl) setPreview(newUrl);
      toast.success("Profile picture updated!", { position: "top-center" });
    } else {
      setPreview(user?.profile_picture || defaultimg);
      toast.error(result.payload || "Upload failed", {
        position: "top-center",
      });
    }
    URL.revokeObjectURL(localUrl);
    e.target.value = "";
  };

  return (
    <>
      <Section className="bg-theme !pb-[0px] relative">
        <Row className="flex flex-col md:flex-row justify-between items-center md:items-center gap-x-[10px] md:gap-x-[30px] !max-w-[1122px]">
          <div className="text-start md:text-left flex-1 order-2">
            <p className="text-[24px] md:text-[48px] text-black font-bold mb-[10px] leading">
              Hello {user?.name}
            </p>
            <p className="text-[16px] md:text-[20px]">{user?.email}</p>
          </div>

          <div className="relative w-[150px] h-[150px] mb-4 order-1">
            <img
              src={preview}
              alt="Profile"
              className={`w-full h-full rounded-full border-4 circle-border object-cover transition-opacity duration-300 ${
                loading ? "opacity-50" : "opacity-100"
              }`}
              onError={(e) => {
                e.target.src = defaultimg;
              }}
            />

            {loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/20">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            <div
              className={`absolute bottom-1 right-1 box-shadow bg-color text-white p-2 rounded-full cursor-pointer ${
                loading ? "pointer-events-none opacity-60" : ""
              }`}
              onClick={() => !loading && fileInputRef.current.click()}
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
          <div className="order-3 hidden md:block">
            <button
              onClick={() => {
                dispatch(logout());
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("cart_id");
                localStorage.removeItem("recently_viewed_products");
                navigate("/");
              }}
              className="px-6 py-3 bg-black text-white w-[200px] rounded-full text-[16px] font-bold hover:bg-gray-800 transition-all"
            >
              Logout
            </button>
          </div>
        </Row>

        <div className="relative bottom-[-30px] w-[90%] md:w-[90%] lg:max-w-[1440px] left-1/2 -translate-x-1/2 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center justify-between px-5 py-5 rounded-xl bg-white shadow-sm border transition-all hover:shadow-md ${
              activeTab === "account" ? "border-primary" : "border-gray-100"
            }`}
          >
            <div className="text-left">
              <p className="text-[16px] font-semibold text-gray-800">
                Account Details
              </p>
              <p className="text-[13px] text-gray-400 mt-1">Edit Now</p>
            </div>
            <span className="text-gray-400 text-xl">
              <ChevronRight />
            </span>
          </button>

          <button
            onClick={() => setActiveTab("address")}
            className={`flex items-center justify-between px-5 py-5 rounded-xl bg-white shadow-sm border transition-all hover:shadow-md ${
              activeTab === "address" ? "border-primary" : "border-gray-100"
            }`}
          >
            <div className="text-left">
              <p className="text-[16px] font-semibold text-gray-800">Address</p>
              <p className="text-[13px] text-gray-400 mt-1">View Saved</p>
            </div>
            <span className="text-gray-400 text-xl"> <ChevronRight /></span>
          </button>

          <button
            onClick={() => navigate("/orders")}
            className="flex items-center justify-between px-5 py-5 rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md"
          >
            <div className="text-left">
              <p className="text-[16px] font-semibold text-gray-800">Orders</p>
              <p className="text-[13px] text-gray-400 mt-1">View History</p>
            </div>
            <span className="text-gray-400 text-xl"> <ChevronRight /></span>
          </button>

          <button
            onClick={() => navigate("/wishlist")}
            className="flex items-center justify-between px-5 py-5 rounded-xl bg-white shadow-sm border border-gray-100 transition-all hover:shadow-md"
          >
            <div className="text-left">
              <p className="text-[16px] font-semibold text-gray-800">
                Wishlist
              </p>
              <p className="text-[13px] text-gray-400 mt-1">View Saved</p>
            </div>
            <span className="text-gray-400 text-xl"> <ChevronRight /></span>
          </button>
          <div className="md:hidden">
            <button
              onClick={() => {
                dispatch(logout());
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                localStorage.removeItem("cart_id");
                localStorage.removeItem("recently_viewed_products");
                navigate("/");
              }}
              className="px-6 py-3 bg-black text-white w-full rounded-full text-[16px] font-bold hover:bg-gray-800 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </Section>

      <Section className="my-5">
        <Row className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-1 min-w-0 pb-8">
            {activeTab === "address" && <Address />}
            {activeTab === "account" && <AccountDetails />}
          </div>
        </Row>
      </Section>
    </>
  );
}
