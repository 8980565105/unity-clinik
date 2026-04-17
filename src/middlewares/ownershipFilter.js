const { resolveStoreByDomain } = require("../config/domainResolver");

const extractDomain = (req) => {
  try {
    const origin = req.headers.origin || "";
    if (origin) {
      const url = new URL(origin);
      return url.host; 
    }

    const host = req.headers.host || "";
    return host.toLowerCase();
  } catch {
    return req.headers.host?.toLowerCase() || "";
  }
};

const injectOwnershipFilter = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: No user" });
    }

    if (user.role === "admin") {
      req.storeFilter = {};
      req.ownershipQuery = {};
      return next();
    }

    if (user.role === "store_owner") {
      if (!user.storeId) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: No store assigned to this owner",
        });
      }
      req.storeFilter = { storeId: user.storeId };
      req.ownershipQuery = { storeId: user.storeId };
      return next();
    }

    const domain = extractDomain(req);
    const storeId = await resolveStoreByDomain(domain);
    if (!storeId) {
      return res.status(404).json({
        success: false,
        message: `No store found for domain: ${domain}`,
      });
    }
    req.storeFilter = { storeId };
    req.ownershipQuery = { storeId };
    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Ownership filter error",
      error: err.message,
    });
  }
};

const injectPublicStoreFilter = async (req, res, next) => {
  try {
    const domain = extractDomain(req);
    const storeId = await resolveStoreByDomain(domain);

    if (!storeId) {
      req.storeFilter = null;
      req.ownershipQuery = {};
    } else {
      req.storeFilter = { storeId };
      req.ownershipQuery = { storeId };
    }
    next();
  } catch (err) {
    req.storeFilter = null;
    req.ownershipQuery = {};
    next();
  }
};

const applyOwnershipFilter = (req, baseQuery = {}) => {
  if (!req.user) return baseQuery;
  if (req.user.role === "admin") return baseQuery;
  if (req.user.role === "store_owner") {
    baseQuery.storeId = req.user.storeId;
    return baseQuery;
  }
  if (req.storeFilter?.storeId) {
    baseQuery.storeId = req.storeFilter.storeId;
  }
  return baseQuery;
};

const ownershipMiddleware = (field = "storeId") => {
  return async (req, res, next) => {
    req.ownershipQuery = {};
    if (!req.user) return next();
    if (req.user.role === "admin") return next();
    if (req.user.role === "store_owner") {
      req.ownershipQuery[field] = req.user.storeId;
      return next();
    }
    const domain = extractDomain(req);
    const storeId = await resolveStoreByDomain(domain);
    if (storeId) req.ownershipQuery[field] = storeId;
    next();
  };
};

module.exports = {
  injectOwnershipFilter,
  injectPublicStoreFilter,
  applyOwnershipFilter,
  ownershipMiddleware,
};
