const User = require("../models/User");
const Store = require("../models/Store");
const { sendResponse } = require("../utils/response");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

const deleteOldProfilePicture = (filename) => {
  if (!filename || filename.startsWith("http")) return;

  // const filePath = path.join(__dirname, "../uploads", filename);

  const safeFilename = path.basename(filename);
  const filePath = path.join(__dirname, "../uploads", safeFilename);

  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error("[Upload] Error:", err.message);
    });
  }

  // if (fs.existsSync(filePath)) {
  //   fs.unlink(filePath, (err) => {
  //     if (err)
  //       console.error("[Upload] Failed to delete old image:", err.message);
  //   });
  // }
};

const getUsers = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      search = "",
      isDownload = "false",
      is_active,
      role: roleFilter,
    } = req.query;
    const download = isDownload.toLowerCase() === "true";
    const loggedInUser = req.user;

    if (!loggedInUser)
      return sendResponse(res, false, null, "User not authenticated");

    const baseQuery = {};

    if (loggedInUser.role === "admin") {
      if (roleFilter) baseQuery.role = roleFilter;
    } else if (loggedInUser.role === "store_owner") {
      if (!loggedInUser.storeId)
        return sendResponse(res, false, null, "Store not found for this owner");
      baseQuery.storeId = loggedInUser.storeId;
      baseQuery.role = "store_user";
    } else {
      return sendResponse(res, false, null, "Access denied: Unauthorized role");
    }

    if (search) {
      baseQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (is_active === "true") baseQuery.is_active = true;
    else if (is_active === "false") baseQuery.is_active = false;

    if (download) {
      const users = await User.find(baseQuery)
        .sort({ createdAt: -1 })
        .select("-password")
        .populate("storeId");
      return sendResponse(
        res,
        true,
        { users },
        "All users downloaded successfully",
      );
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const total = await User.countDocuments(baseQuery);
    const users = await User.find(baseQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select("-password")
      .populate("storeId");

    return sendResponse(
      res,
      true,
      { users, total, page, pages: Math.ceil(total / limit) },
      "Users retrieved successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to retrieve users: " + err.message,
    );
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("storeId");
    if (!user) return sendResponse(res, false, null, "User not found");
    return sendResponse(res, true, user, "User details retrieved successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to retrieve user: " + err.message,
    );
  }
};

const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "store_user",
      mobile_number,
      address,
      gender,
      date_of_birth,
      domain,
      storeId: bodyStoreId,
    } = req.body;
    const profile_picture = req.files?.profile_picture?.[0]?.filename || null;

    let resolvedStoreId = bodyStoreId || null;
    let storeDomain = domain || "";

    // if (!resolvedStoreId && domain) {
    //   const store = await Store.findOne({
    //     domain: domain.toLowerCase().trim(),

    //   });
    //   if (store) {
    //     resolvedStoreId = store._id;
    //     storeDomain = store.domain;
    //   }
    // }

    if (!resolvedStoreId && domain) {
      // સુરક્ષા માટે: પહેલા ખાતરી કરો કે domain એક સ્ટ્રિંગ જ છે
      const safeDomain =
        typeof domain === "string"
          ? domain.toLowerCase().trim()
          : String(domain).toLowerCase().trim();

      const store = await Store.findOne({
        domain: safeDomain,
      });

      if (store) {
        resolvedStoreId = store._id;
        storeDomain = store.domain;
      }
    }

    if (!resolvedStoreId && req.user?.role === "store_owner") {
      resolvedStoreId = req.user.storeId;
      if (!storeDomain) {
        const store = await Store.findById(resolvedStoreId).select("domain");
        if (store) storeDomain = store.domain;
      }
    }

    if (role === "store_user" && !resolvedStoreId)
      return sendResponse(
        res,
        false,
        null,
        "storeId or domain is required for store_user",
      );

    if (resolvedStoreId) {
      const exists = await User.findOne({ email, storeId: resolvedStoreId });
      if (exists)
        return sendResponse(
          res,
          false,
          null,
          "A user with this email is already registered in this store",
        );
    }

    const newUser = await User.create({
      name,
      email,
      password: password || "Temp1234!",
      role,
      mobile_number,
      address,
      gender,
      date_of_birth,
      profile_picture,
      domain: storeDomain,
      storeId: resolvedStoreId,
    });

    return sendResponse(
      res,
      true,
      { user: { ...newUser.toObject(), password: undefined } },
      "User created successfully",
    );
  } catch (err) {
    if (err.code === 11000)
      return sendResponse(
        res,
        false,
        null,
        "A user with this email is already registered in this store",
      );
    return sendResponse(
      res,
      false,
      null,
      "Failed to create user: " + err.message,
    );
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const existingUser = await User.findById(userId);
    if (!existingUser) return sendResponse(res, false, null, "User not found");

    const {
      name,
      email,
      password,
      role,
      mobile_number,
      address,
      gender,
      date_of_birth,
    } = req.body;
    const newProfilePicture = req.files?.profile_picture?.[0]?.filename;

    if (email && email !== existingUser.email) {
      const dup = await User.findOne({
        email,
        storeId: existingUser.storeId,
        _id: { $ne: userId },
      });
      if (dup)
        return sendResponse(
          res,
          false,
          null,
          "This email is already in use in this store",
        );
    }

    const updateData = {
      name,
      email,
      mobile_number,
      address,
      gender,
      date_of_birth,
    };

    if (newProfilePicture) {
      deleteOldProfilePicture(existingUser.profile_picture);
      updateData.profile_picture = newProfilePicture;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }
    if (role && req.user.role === "admin") updateData.role = role;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");
    return sendResponse(
      res,
      true,
      { user: updatedUser },
      "User updated successfully",
    );
  } catch (err) {
    if (err.code === 11000)
      return sendResponse(
        res,
        false,
        null,
        "This email is already in use in this store",
      );
    return sendResponse(
      res,
      false,
      null,
      "Failed to update user: " + err.message,
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, false, null, "User not found");
    if (req.user._id.toString() === user._id.toString())
      return sendResponse(
        res,
        false,
        null,
        "You cannot delete your own account",
      );
    deleteOldProfilePicture(user.profile_picture);
    await User.findByIdAndDelete(user._id);
    return sendResponse(res, true, null, "User deleted successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete user: " + err.message,
    );
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { is_active } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return sendResponse(res, false, null, "User not found");
    if (req.user._id.toString() === req.params.id)
      return sendResponse(
        res,
        false,
        null,
        "You cannot change your own status",
      );
    user.is_active = Boolean(is_active);
    await user.save();
    return sendResponse(
      res,
      true,
      { user },
      "User status updated successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to update user status: " + err.message,
    );
  }
};

const bulkDeleteUsers = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0)
      return sendResponse(
        res,
        false,
        null,
        "No user IDs provided for deletion",
      );
    const users = await User.find({ _id: { $in: ids } });
    users.forEach((u) => deleteOldProfilePicture(u.profile_picture));
    await User.deleteMany({ _id: { $in: ids } });
    return sendResponse(
      res,
      true,
      { deletedCount: ids.length },
      "Selected users deleted successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete users: " + err.message,
    );
  }
};

const getOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("storeId");
    if (!user) return sendResponse(res, false, null, "User not found");
    return sendResponse(res, true, { user }, "Profile fetched successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to fetch profile: " + err.message,
    );
  }
};

const updateOwnProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      mobile_number,
      address,
      gender,
      date_of_birth,
      password,
    } = req.body;
    const newProfilePicture = req.files?.profile_picture?.[0]?.filename;
    const updateData = {
      name,
      email,
      mobile_number,
      address,
      gender,
      date_of_birth,
    };

    if (email && email !== req.user.email) {
      const dup = await User.findOne({
        email,
        storeId: req.user.storeId,
        _id: { $ne: req.user._id },
      });
      if (dup)
        return sendResponse(
          res,
          false,
          null,
          "This email is already in use in this store",
        );
    }
    if (newProfilePicture) {
      const cur = await User.findById(req.user._id);
      if (cur?.profile_picture) deleteOldProfilePicture(cur.profile_picture);
      updateData.profile_picture = newProfilePicture;
    }
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
    }).select("-password");
    return sendResponse(
      res,
      true,
      { user: updatedUser },
      "Profile updated successfully",
    );
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to update profile: " + err.message,
    );
  }
};

const deleteOwnProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user?.profile_picture) deleteOldProfilePicture(user.profile_picture);
    await User.findByIdAndDelete(req.user._id);
    return sendResponse(res, true, null, "Account deleted successfully");
  } catch (err) {
    return sendResponse(
      res,
      false,
      null,
      "Failed to delete account: " + err.message,
    );
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getOwnProfile,
  updateOwnProfile,
  deleteOwnProfile,
  updateUserStatus,
};
