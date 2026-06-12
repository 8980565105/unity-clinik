
const express = require("express");
const router = express.Router();

const {
  getResults,
  getResultsById,
  createResults,
  updateResults,
  deleteResults,
  bulkDeleteResults,
  updateResultsStatus,
  getPublicResults,
} = require("../controllers/resultController");

const {
  authMiddleware,
  authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/public", getPublicResults);
router.use(authMiddleware);
router.get("/", getResults);
router.get("/:id", authorizeMinRole("store_owner"), getResultsById);
router.post("/", authorizeMinRole("store_owner"), createResults);
router.post("/bulk-delete", authorizeMinRole("store_owner"), bulkDeleteResults);
router.put("/:id", authorizeMinRole("store_owner"), updateResults);
router.put("/:id/status", authorizeMinRole("store_owner"), updateResultsStatus);
router.delete("/:id", authorizeMinRole("store_owner"), deleteResults);
module.exports = router;