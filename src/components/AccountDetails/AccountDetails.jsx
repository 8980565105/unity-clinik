import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../ui/Button";
import {
  fetchOwnProfile,
  updateOwnProfile,
} from "../../features/auth/authThunk";
import toast from "react-hot-toast";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

function AccountDetails() {
  const { user, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    gender: "",
    date_of_birth: "",
  });

  const [pwData, setPwData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErrors, setPwErrors] = useState({});

  useEffect(() => {
    dispatch(fetchOwnProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      const dob = user.date_of_birth
        ? new Date(user.date_of_birth).toISOString().split("T")[0]
        : "";
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile_number: user.mobile_number || "",
        gender: user.gender || "",
        date_of_birth: dob,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePwChange = (e) => {
    setPwData({ ...pwData, [e.target.name]: e.target.value });
    setPwErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  // ── Profile update ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("mobile_number", formData.mobile_number);
    data.append("gender", formData.gender);
    data.append("date_of_birth", formData.date_of_birth);

    const res = await dispatch(updateOwnProfile(data));
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Profile updated successfully!", {
        position: "top-center",
      });
    } else {
      toast.error(res.payload || "Update failed!", { position: "top-center" });
    }
  };

  // ── Password change ───────────────────────────────────────────────────
  const validatePw = () => {
    const errors = {};
    if (!pwData.currentPassword.trim())
      errors.currentPassword = "Current password is required";
    if (!pwData.newPassword.trim())
      errors.newPassword = "New password is required";
    else if (pwData.newPassword.length < 6)
      errors.newPassword = "Password must be at least 6 characters";
    if (!pwData.confirmPassword.trim())
      errors.confirmPassword = "Please confirm your new password";
    else if (pwData.newPassword !== pwData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";
    return errors;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errors = validatePw();
    if (Object.keys(errors).length > 0) {
      setPwErrors(errors);
      return;
    }

    setPwLoading(true);
    try {
      // Step 1: verify current password by attempting login
      const verifyRes = await api.post(ROUTES.auth.login, {
        email: user.email,
        password: pwData.currentPassword,
      });

      if (!verifyRes.data?.data?.token) {
        setPwErrors({ currentPassword: "Current password is incorrect" });
        setPwLoading(false);
        return;
      }

      // Step 2: update with new password
      const data = new FormData();
      data.append("name", user.name);
      data.append("email", user.email);
      data.append("password", pwData.newPassword);

      const res = await dispatch(updateOwnProfile(data));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Password changed successfully!", {
          position: "top-center",
        });
        setPwData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setPwErrors({});
      } else {
        toast.error(res.payload || "Failed to change password", {
          position: "top-center",
        });
      }
    } catch (err) {
      setPwErrors({ currentPassword: "Current password is incorrect" });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <p className="font-medium mb-3">Account Settings</p>

      <div className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col mb-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
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
              className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
          </div>

          <div className="flex flex-col">
            <input
              type="text"
              name="mobile_number"
              placeholder="Enter mobile number"
              maxLength={10}
              value={formData.mobile_number}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setFormData({
                  ...formData,
                  mobile_number: value.slice(0, 10),
                });
              }}
              className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
          </div>

          <div className="flex flex-col">
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex flex-col">
            <input
              type={formData.date_of_birth ? "date" : "text"}
              placeholder="Date of Birth"
              onFocus={(e) => (e.target.type = "date")}
              onBlur={(e) => {
                if (!e.target.value) e.target.type = "text";
              }}
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
            />
          </div>

          <Button type="submit" disabled={loading} variant="common">
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>

        <div className="mt-6">
          <p className="font-medium mb-3">Change Password</p>
          <form className="space-y-4" onSubmit={handlePasswordChange}>
            <div className="flex flex-col">
              <input
                type="password"
                name="currentPassword"
                placeholder="Current password"
                value={pwData.currentPassword}
                onChange={handlePwChange}
                className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
              />
              {pwErrors.currentPassword && (
                <span className="text-red-500 text-sm mt-1">
                  {pwErrors.currentPassword}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <input
                type="password"
                name="newPassword"
                placeholder="New password (min 6 characters)"
                value={pwData.newPassword}
                onChange={handlePwChange}
                className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
              />
              {pwErrors.newPassword && (
                <span className="text-red-500 text-sm mt-1">
                  {pwErrors.newPassword}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={pwData.confirmPassword}
                onChange={handlePwChange}
                className="w-full border light-border rounded-md px-5 py-3 focus:outline-none focus:ring-2"
              />
              {pwErrors.confirmPassword && (
                <span className="text-red-500 text-sm mt-1">
                  {pwErrors.confirmPassword}
                </span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={pwLoading} variant="common">
                {pwLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default AccountDetails;
