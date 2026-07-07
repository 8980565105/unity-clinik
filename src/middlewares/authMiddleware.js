const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendResponse } = require("../utils/response");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return sendResponse(res, false, null, "Unauthorized: No token provided");

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.storeId) {
      user = await User.findOne({
        _id: decoded.id,
        storeId: decoded.storeId,
      }).select("-password");
    } else {
      user = await User.findById(decoded.id).select("-password");
    }

    if (!user)
      return sendResponse(res, false, null, "Unauthorized: User not found");
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return sendResponse(res, false, null, "Unauthorized: Token Expired");
    }

    return sendResponse(res, false, null, "Unauthorized: Invalid token");
  }
};

const authorizeRoles =
  (...allowedRoles) =>
  (req, res, next) => {
    if (!req.user)
      return sendResponse(res, false, null, "Unauthorized: No user attached");
    if (!allowedRoles.includes(req.user.role))
      return sendResponse(res, false, null, "Forbidden: You don't have access");
    next();
  };

const roleHierarchy = { store_user: 1, admin: 2 };

const authorizeMinRole = (minRole) => (req, res, next) => {
  if (!req.user)
    return sendResponse(res, false, null, "Unauthorized: User not found");
  if (roleHierarchy[req.user.role] < roleHierarchy[minRole])
    return sendResponse(res, false, null, "Forbidden: Insufficient role");
  next();
};

const checkStoreOwnership = async (req, res, next) => {
  if (!req.user) return sendResponse(res, false, null, "Unauthorized: No user");
  if (req.user.role === "admin") return next();
  return sendResponse(res, false, null, "Forbidden: Insufficient role");
};

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token =
      req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { ...decoded, _id: decoded.id || decoded._id };
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

module.exports = {
  authMiddleware,
  authorizeRoles,
  authorizeMinRole,
  checkStoreOwnership,
  optionalAuthMiddleware,
};
