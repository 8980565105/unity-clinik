const express = require("express");
const router = express.Router();
const {
    getPublicPopup,
    getPopups,
    getPopupById,
    createPopup,
    updatePopup,
    updatePopupStatus,
    deletePopup,
    bulkDeletePopups,
} = require("../controllers/popupController");

const {
    authMiddleware,
    authorizeMinRole,
} = require("../middlewares/authMiddleware");

router.get("/public", getPublicPopup);
router.use(authMiddleware);
router.get("/", authorizeMinRole("admin"), getPopups);
router.get("/:id", authorizeMinRole("admin"), getPopupById);
router.post("/", authorizeMinRole("admin"), createPopup);
router.put("/:id", authorizeMinRole("admin"), updatePopup);
router.put("/:id/status", authorizeMinRole("admin"), updatePopupStatus);
router.delete("/:id", authorizeMinRole("admin"), deletePopup);
router.post("/bulk-delete", authorizeMinRole("admin"), bulkDeletePopups);

module.exports = router;
