const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const {
  getBalance,
  getHistory,
  addMoney,
  debitWalletForOrder,
  refundWalletForOrder,
  adminGetAllWallets,
  adminAddBalanceToUser,
  adminGetUserWalletDetails,
} = require("../controllers/walletController");

router.get("/balance", authMiddleware, getBalance);
router.get("/history", authMiddleware, getHistory);
router.post("/add-money", authMiddleware, addMoney);
router.post("/debit", authMiddleware, debitWalletForOrder);
router.post("/refund", authMiddleware, refundWalletForOrder);

router.get("/all", authMiddleware, adminGetAllWallets);
router.get("/user/:userId", authMiddleware, adminGetUserWalletDetails);
router.post(
  "/add-balance/:userId",
  authMiddleware,
  adminAddBalanceToUser,
);

module.exports = router;
