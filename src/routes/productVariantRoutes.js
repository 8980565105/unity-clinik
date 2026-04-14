const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getVariants,
  createVariants,
  updateVariant,
  deleteVariant,
  bulkDeleteVariants,
} = require("../controllers/productVariantController");
const { authMiddleware, authorizeMinRole } = require("../middlewares/authMiddleware");

router.use(authMiddleware);
router.get("/", getVariants);                         
router.post("/", authorizeMinRole("admin"), createVariants); 
router.put("/:id", authorizeMinRole("admin"), updateVariant); 
router.delete("/:id", authorizeMinRole("admin"), deleteVariant);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeleteVariants);

module.exports = router;
