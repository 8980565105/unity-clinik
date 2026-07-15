const Wallet = require("../models/Wallet");
const Reffrel = require("../models/reffrel");
const Payment = require("../models/Payment");

const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    wallet = await Wallet.create({
      userId,
      balance: 0,
      totalEarned: 0,
      totalUsed: 0,
      transactions: [],
    });
  }
  return wallet;
};

const getWallet = async (userId) => {
  const wallet = await getOrCreateWallet(userId);
  return {
    balance: wallet.balance,
    totalEarned: wallet.totalEarned,
    totalUsed: wallet.totalUsed,
    updated_at: wallet.updatedAt,
  };
};

const getHistory = async (userId, limit = 50) => {
  const wallet = await getOrCreateWallet(userId);
  return wallet.transactions
    .slice()
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

const creditWallet = async (userId, points, reason, extra = {}) => {
  const wallet = await getOrCreateWallet(userId);
  wallet.balance += points;
  wallet.totalEarned += points;
  wallet.transactions.push({
    type: "credit",
    reason,
    points,
    orderId: extra.orderId || null,
    refUserId: extra.refUserId || null,
  });
  await wallet.save();
  return wallet;
};

const debitWallet = async (userId, points, reason, extra = {}) => {
  const wallet = await getOrCreateWallet(userId);
  if (wallet.balance < points) {
    const err = new Error("Insufficient wallet balance");
    err.code = "INSUFFICIENT_BALANCE";
    throw err;
  }
  wallet.balance -= points;
  wallet.totalUsed += points;
  wallet.transactions.push({
    type: "debit",
    reason,
    points,
    orderId: extra.orderId || null,
  });
  await wallet.save();
  return wallet;
};

function getChargeAmount(entry, baseAmount) {
  if (entry.chargeType === "percentage") {
    return Math.round((Number(baseAmount) * Number(entry.charge)) / 100);
  }
  return Number(entry.charge) || 0;
}

const getApplicableBonus = async (amount) => {
  const settings = await Reffrel.findOne({ key: "referral" });
  if (!settings) return 0;

  const numericAmount = Number(amount);

  const matchedBox = (settings.walletbox || []).find(
    (b) => Number(b.amount) === numericAmount,
  );
  if (matchedBox) {
    return getChargeAmount(matchedBox, numericAmount);
  }

  if (!Array.isArray(settings.walletOffers)) return 0;

  const eligibleOffers = settings.walletOffers.filter(
    (o) => numericAmount >= Number(o.minAmount),
  );
  if (eligibleOffers.length === 0) return 0;

  const bestOffer = eligibleOffers.reduce((max, curr) =>
    curr.minAmount > max.minAmount ? curr : max,
  );

  return getChargeAmount(bestOffer, numericAmount);
};

const addMoney = async (userId, amount, transaction_id, razorpay_order_id) => {
  const wallet = await getOrCreateWallet(userId);
  const numericAmount = Number(amount);
  const bonusPoints = await getApplicableBonus(numericAmount);

  wallet.balance += numericAmount;
  wallet.totalEarned += numericAmount;
  wallet.transactions.push({
    type: "credit",
    reason: "Wallet Top Up",
    points: numericAmount,
    transaction_id,
    razorpay_order_id,
  });

  if (bonusPoints > 0) {
    wallet.balance += bonusPoints;
    wallet.totalEarned += bonusPoints;
    wallet.transactions.push({
      type: "credit",
      reason: `Wallet Top Up Bonus (₹${numericAmount}+ offer)`,
      points: bonusPoints,
      transaction_id,
      razorpay_order_id,
    });
  }

  await wallet.save();
  await Payment.create({
    order_id: null,
    user_id: userId,
    payment_method: "Razorpay",
    amount_paid: numericAmount,
    transaction_id: transaction_id || "",
    status: "completed",
    type: "wallet_recharge",
  });
  return wallet;
};

module.exports = {
  getOrCreateWallet,
  getWallet,
  getHistory,
  addMoney,
  creditWallet,
  debitWallet,
};
