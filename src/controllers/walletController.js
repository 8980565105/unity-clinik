const Wallet = require("../models/Wallet");
const walletService = require("../services/walletService");
const { sendResponse } = require("../utils/response");

const getBalance = async (req, res) => {
  try {
    const wallet = await walletService.getWallet(req.user.id);
    res.json({
      success: true,
      data: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalUsed: wallet.totalUsed,
        updated_at: wallet.updated_at,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const transactions = await walletService.getHistory(req.user.id, limit);
    res.json({
      success: true,
      data: { transactions },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

const addMoney = async (req, res) => {
  try {
    const { amount, transaction_id, razorpay_order_id } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Amount",
      });
    }
    const wallet = await walletService.addMoney(
      req.user.id,
      amount,
      transaction_id,
      razorpay_order_id,
    );
    res.json({
      success: true,
      message: "Money Added Successfully",
      data: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalUsed: wallet.totalUsed,
        transactions: wallet.transactions,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const debitWalletForOrder = async (req, res) => {
  try {
    const { amount, order_id } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Amount",
      });
    }
    const wallet = await walletService.debitWallet(
      req.user.id,
      Number(amount),
      "Used on Order",
      { orderId: order_id },
    );
    res.json({
      success: true,
      message: "Wallet amount debited successfully",
      data: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalUsed: wallet.totalUsed,
        transactions: wallet.transactions,
      },
    });
  } catch (err) {
    if (err.code === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        success: false,
        message: "Insufficient wallet balance",
      });
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const refundWalletForOrder = async (req, res) => {
  try {
    const { amount, order_id, reason } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Amount",
      });
    }
    const wallet = await walletService.creditWallet(
      req.user.id,
      Number(amount),
      reason || "Order Payment Refund (Payment Cancelled/Failed)",
      { orderId: order_id },
    );
    res.json({
      success: true,
      message: "Wallet amount refunded successfully",
      data: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalUsed: wallet.totalUsed,
        transactions: wallet.transactions,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const adminGetAllWallets = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const wallets = await Wallet.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "user.name": { $regex: search, $options: "i" } },
                  { "user.email": { $regex: search, $options: "i" } },
                  { "user.mobile_number": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 1,
          balance: 1,
          totalEarned: 1,
          totalUsed: 1,
          updatedAt: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.mobile_number": 1,
          "user.profile_picture": 1,
        },
      },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
    ]);
    const totalCountAgg = await Wallet.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      ...(search
        ? [
            {
              $match: {
                $or: [
                  { "user.name": { $regex: search, $options: "i" } },
                  { "user.email": { $regex: search, $options: "i" } },
                  { "user.mobile_number": { $regex: search, $options: "i" } },
                ],
              },
            },
          ]
        : []),
      { $count: "total" },
    ]);
    const total = totalCountAgg[0]?.total || 0;
    const data = wallets.map((w) => ({
      _id: w.user._id,
      walletId: w._id,
      name: w.user.name,
      email: w.user.email,
      mobile_number: w.user.mobile_number,
      profile_picture: w.user.profile_picture,
      balance: w.balance,
      totalEarned: w.totalEarned,
      totalUsed: w.totalUsed,
    }));
    res.json({
      success: true,
      data: { users: data, total },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const adminAddBalanceToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount, reason } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid Amount",
      });
    }
    const wallet = await walletService.creditWallet(
      userId,
      Number(amount),
      `Unity Clinic Bonus ₹${amount}`,
      {},
    );
    res.json({
      success: true,
      message: "Balance added successfully",
      data: {
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalUsed: wallet.totalUsed,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const adminGetUserWalletDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { days } = req.query;
    const wallet = await Wallet.findOne({ userId }).populate(
      "userId",
      "name email mobile_number profile_picture",
    );
    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found for this user",
      });
    }
    let transactions = wallet.transactions
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt);

    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - Number(days));
      transactions = transactions.filter((t) => t.createdAt >= cutoff);
    }
    res.json({
      success: true,
      data: {
        user: {
          _id: wallet.userId._id,
          name: wallet.userId.name,
          email: wallet.userId.email,
          mobile_number: wallet.userId.mobile_number,
          profile_picture: wallet.userId.profile_picture,
        },
        balance: wallet.balance,
        totalEarned: wallet.totalEarned,
        totalUsed: wallet.totalUsed,
        transactions,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  getBalance,
  getHistory,
  addMoney,
  debitWalletForOrder,
  refundWalletForOrder,
  adminGetAllWallets,
  adminAddBalanceToUser,
  adminGetUserWalletDetails,
};
