
const injectOwnershipFilter = async (req, res, next) => {
  if (!req.user) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No user" });
  }
  req.storeFilter = {};
  req.ownershipQuery = {};
  next();
};

const injectPublicStoreFilter = async (req, res, next) => {
  req.storeFilter = {};
  req.ownershipQuery = {};
  next();
};

const applyOwnershipFilter = (req, baseQuery = {}) => {
  return baseQuery;
};

// const ownershipMiddleware = (field = "storeId") => {
//   return async (req, res, next) => {
//     req.ownershipQuery = {};
//     next();
//   };
// };

module.exports = {
  injectOwnershipFilter,
  injectPublicStoreFilter,
  applyOwnershipFilter,
  // ownershipMiddleware,
};
