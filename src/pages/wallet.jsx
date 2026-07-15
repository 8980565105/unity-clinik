import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Gift,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  UserPlus,
  Plus,
  X,
} from "lucide-react";
import {
  addWalletMoney,
  fetchBalance,
  fetchHistory,
} from "../features/wallet/walletThunk";
import Sharelink from "../components/product/Sharelink";
import Button from "../components/ui/Button";
import toast from "react-hot-toast";
import {
  createRazorpayOrder,
  markPaymentFailed,
  verifyRazorpayPayment,
} from "../features/payments/paymentThunk";
import { fetchReferralSettings } from "../features/reffrel/reffrelThunk";

const palette = {
  bg: "#F4F7FB",
  card: "#1E4FA3",
  cardSoft: "#2E6BD6",
  accent: "#F2A93B",
  accentSoft: "#FBDDA5",
  text: "#16223D",
  textOnCard: "#FFFFFF",
  muted: "#6B7A99",
  mutedOnCard: "#BFD3F5",
  rose: "#E0604D",
  green: "#1E9E6B",
  line: "rgba(255,255,255,0.35)",
  surface: "#FFFFFF",
  border: "#E6ECF6",
};

export default function Wallet() {
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const [openBalanceModal, setOpenBalanceModal] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  const MIN_AMOUNT = 50;
  const MAX_AMOUNT = 20000;

  const [amount, setAmount] = useState(500);

  const quickAmounts = [100, 200, 500, 1000];

  const isValidAmount =
    Number(amount) >= MIN_AMOUNT && Number(amount) <= MAX_AMOUNT;

  const { balance, totalEarned, totalUsed, transactions } = useSelector(
    (state) => state.wallet,
  );

  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 10);

  const { walletOffers } = useSelector((state) => state.reffrel);

  const referralCode =
    useSelector((state) => state.auth?.user?.referralCode) || "";

  useEffect(() => {
    dispatch(fetchBalance());
    dispatch(fetchHistory({ limit: 50 }));
    dispatch(fetchReferralSettings());
  }, [dispatch]);

  const applicableOffer = walletOffers
    .filter((o) => Number(amount) >= o.minAmount && o.bonusPoints > 0)
    .sort((a, b) => b.minAmount - a.minAmount)[0];

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `http://localhost:3000/?ref=${referralCode}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const iconMap = {
    "Referral bonus": UserPlus,
    "Welcome bonus": Gift,
    "Used on Order": ShoppingBag,
  };
  const getIcon = (reason) => {
    const key = Object.keys(iconMap).find((k) => reason.includes(k));
    return iconMap[key] || Gift;
  };

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleWalletPayment = async () => {
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load Razorpay SDK");
        return;
      }

      const razorRes = await dispatch(
        createRazorpayOrder({ amount: Number(amount) }),
      );

      if (!createRazorpayOrder.fulfilled.match(razorRes)) {
        toast.error("Unable to create payment");
        return;
      }

      const order = razorRes.payload;
      const userLS = JSON.parse(localStorage.getItem("user") || "null");

      let failureAlreadyRecorded = false;
      // const handleFailure = async () => {
      //   if (failureAlreadyRecorded) return;
      //   failureAlreadyRecorded = true;
      //   await dispatch(
      //     markPaymentFailed({
      //       user_id: userLS?._id,
      //       payment_method: "Razorpay",
      //       amount: Number(amount),
      //       type: "wallet_recharge",
      //       transaction_id: transactionId,
      //     }),
      //   );
      // };
      const handleFailure = async (transactionId = "") => {
        if (failureAlreadyRecorded) return;
        failureAlreadyRecorded = true;
        await dispatch(
          markPaymentFailed({
            user_id: userLS?._id,
            payment_method: "Razorpay",
            amount: Number(amount),
            type: "wallet_recharge",
            transaction_id: transactionId,
          }),
        );
      };

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Unity Clinic",
        description: "Wallet Top Up",
        order_id: order.id,

        handler: async function (response) {
          try {
            const verify = await dispatch(
              verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            );

            if (!verifyRazorpayPayment.fulfilled.match(verify)) {
              toast.error("Payment verification failed");
              await handleFailure();
              return;
            }

            const walletRes = await dispatch(
              addWalletMoney({
                amount: Number(amount),
                transaction_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              }),
            );

            if (addWalletMoney.fulfilled.match(walletRes)) {
              toast.success("Money Added");
              dispatch(fetchBalance());
              dispatch(fetchHistory());
              setOpenBalanceModal(false);
              setAmount(500);
            }
          } catch (err) {
            toast.error("Something went wrong");
          }
        },

        modal: {
          ondismiss() {
            toast("Payment Cancelled");
            handleFailure();
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        toast.error(response.error.description);
        const failedPaymentId = response.error?.metadata?.payment_id || "";
        handleFailure(failedPaymentId);
      });

      razorpay.open();
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  };

  return (
    <>
      <div
        className="min-h-screen w-full flex justify-center px-4 py-8 sm:py-12"
        style={{
          backgroundColor: palette.bg,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div className="w-full max-w-md">
          <div className="mb-6">
            <p
              className="text-xs tracking-[0.2em] uppercase mb-1 font-medium"
              style={{ color: palette.muted }}
            >
              Your Rewards
            </p>
            <h1
              className="text-2xl font-semibold"
              style={{ color: palette.text }}
            >
              My Wallet
            </h1>
          </div>
          <div
            className="relative rounded-3xl overflow-hidden mb-4"
            style={{
              background: `linear-gradient(155deg, ${palette.cardSoft}, ${palette.card})`,
              boxShadow: "0 12px 30px rgba(30,79,163,0.28)",
            }}
          >
            <div className="px-6 pt-6 pb-8">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs tracking-wide"
                  style={{ color: palette.mutedOnCard }}
                >
                  Available balance
                </span>
                <Button
                  onClick={() => setOpenBalanceModal(true)}
                  className="bg-white text-primary flex justify-center items-center"
                >
                  <Plus size={18} /> Add Balance
                </Button>
              </div>

              <div className="flex items-baseline gap-2">
                <span
                  className="text-[24px] tabular-nums"
                  style={{
                    color: palette.accent,
                    fontFamily: 'Georgia, "Times New Roman", serif',
                  }}
                >
                  ₹ {balance}
                </span>
              </div>
              <p
                className="text-xs mt-2"
                style={{ color: palette.mutedOnCard }}
              >
                Not withdrawable — apply as a discount on your next order.
              </p>
            </div>

            <div className="relative h-0">
              <div
                className="absolute left-0 right-0 top-0 border-t border-dashed"
                style={{ borderColor: palette.line }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 22,
                  height: 22,
                  left: -11,
                  top: -11,
                  backgroundColor: palette.bg,
                }}
              />
              <div
                className="absolute rounded-full"
                style={{
                  width: 22,
                  height: 22,
                  right: -11,
                  top: -11,
                  backgroundColor: palette.bg,
                }}
              />
            </div>

            <div className="px-6 pt-6 pb-5 flex items-center justify-between">
              <div>
                <p
                  className="text-[10px] tracking-wide uppercase mb-0.5"
                  style={{ color: palette.mutedOnCard }}
                >
                  Your code
                </p>
                <p
                  className="text-sm tracking-widest"
                  style={{
                    color: palette.textOnCard,
                    fontFamily: "ui-monospace, Menlo, monospace",
                  }}
                >
                  {referralCode}
                </p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-opacity active:opacity-70"
                style={{ backgroundColor: palette.accent, color: "#3A2408" }}
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy link"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: palette.surface,
                borderColor: palette.border,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-wide mb-1 font-medium"
                style={{ color: palette.muted }}
              >
                Total earned
              </p>
              <p
                className="text-lg tabular-nums"
                style={{
                  color: palette.green,
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}
              >
                ₹ +{totalEarned}
              </p>
            </div>
            <div
              className="rounded-2xl p-4 border"
              style={{
                backgroundColor: palette.surface,
                borderColor: palette.border,
              }}
            >
              <p
                className="text-[10px] uppercase tracking-wide mb-1 font-medium"
                style={{ color: palette.muted }}
              >
                Total used
              </p>
              <p
                className="text-lg tabular-nums"
                style={{
                  color: palette.rose,
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}
              >
                ₹ −{totalUsed}
              </p>
            </div>
          </div>

          <div
            className="w-full flex items-center justify-between rounded-2xl px-5 py-4 mb-8 transition-transform "
            style={{
              background: `linear-gradient(120deg, ${palette.cardSoft}, ${palette.card})`,
            }}
          >
            <div className="text-left">
              <p
                className="text-sm font-medium"
                style={{ color: palette.textOnCard }}
              >
                Invite a friend, earn ₹ 100
              </p>
              <p className="text-xs" style={{ color: palette.mutedOnCard }}>
                Reward lands after their first order
              </p>
            </div>
            <Sharelink
              shareUrl={`http://localhost:3000/?ref=${referralCode}`}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#F2A93B] hover:bg-[#FBDDA5]"
            />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <h2
              className="text-sm font-semibold"
              style={{ color: palette.text }}
            >
              Transection History
            </h2>
            <span className="text-xs" style={{ color: palette.muted }}>
              {transactions.length} entries
            </span>
          </div>

          {transactions.length === 0 ? (
            <div
              className="text-center py-12 rounded-2xl border"
              style={{
                backgroundColor: palette.surface,
                borderColor: palette.border,
              }}
            >
              <p className="text-sm" style={{ color: palette.muted }}>
                No activity yet. Invite a friend to start earning.
              </p>
            </div>
          ) : (
            <div
              className="rounded-2xl overflow-hidden border"
              style={{
                backgroundColor: palette.surface,
                borderColor: palette.border,
              }}
            >
              {visibleTransactions.map((t, i) => {
                const Icon = getIcon(t.reason);
                const isCredit = t.type === "credit";

                return (
                  <div
                    key={t._id}
                    className="flex items-center gap-3 px-4 py-3.5"
                    style={{
                      borderBottom: `1px solid ${palette.border}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: isCredit
                          ? "rgba(30,79,163,0.10)"
                          : "rgba(224,96,77,0.10)",
                      }}
                    >
                      <Icon
                        size={15}
                        style={{
                          color: isCredit ? palette.card : palette.rose,
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-[12px] md:text-[16px] truncate font-medium"
                        style={{ color: palette.text }}
                      >
                        {t.reason}
                      </p>
                      <p className="text-xs" style={{ color: palette.muted }}>
                        {t.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {isCredit ? (
                        <ArrowUpRight
                          size={13}
                          style={{ color: palette.green }}
                        />
                      ) : (
                        <ArrowDownRight
                          size={13}
                          style={{ color: palette.rose }}
                        />
                      )}
                      <span
                        className="text-sm tabular-nums font-medium"
                        style={{
                          color: isCredit ? palette.green : palette.rose,
                          fontFamily: "ui-monospace, Menlo, monospace",
                        }}
                      >
                        {isCredit ? "+" : "−"}
                        {t.points}
                      </span>
                    </div>
                  </div>
                );
              })}

              {transactions.length > 10 && (
                <div className="flex justify-center my-4">
                  <button
                    onClick={() => setShowAllTransactions(!showAllTransactions)}
                    className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: palette.card,
                      color: "#fff",
                    }}
                  >
                    {showAllTransactions ? "View Less" : `View More`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {openBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md h-[550px] rounded-3xl bg-white shadow-2xl overflow-y-auto no-scrollbar">
            <div className="bg-[#1E4FA3] px-6 py-5 flex justify-between items-start sticky top-0">
              <div>
                <h2 className="text-white text-xl font-bold">Add Money</h2>

                <p className="text-blue-100 text-sm">
                  Add money to your wallet
                </p>
              </div>

              <button
                onClick={() => setOpenBalanceModal(false)}
                className="bg-white text-primary rounded-full p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-2 md:p-4 lg:p-6 ">
              <label className="text-sm text-gray-600 font-medium">
                Enter Amount
              </label>

              <div className="mt-3 border rounded-2xl p-4 ">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-bold">₹</span>

                  <input
                    type="number"
                    value={amount}
                    min={0}
                    max={MAX_AMOUNT}
                    onChange={(e) => {
                      let value = Number(e.target.value);

                      if (value > MAX_AMOUNT) value = MAX_AMOUNT;

                      if (value < 0) value = 0;

                      setAmount(value);
                    }}
                    className="w-full text-4xl font-bold outline-none"
                  />
                </div>
              </div>

              {applicableOffer && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mt-4">
                  <p className="text-sm text-green-700">
                    🎉 You'll get{" "}
                    <span className="font-semibold">
                      +{applicableOffer.bonusPoints} bonus points
                    </span>{" "}
                    — Total:{" "}
                    <span className="font-semibold">
                      ₹{Number(amount) + applicableOffer.bonusPoints}
                    </span>
                  </p>
                </div>
              )}

              <div className="grid grid-cols-5 gap-2 mt-5">
                {quickAmounts.map((item) => (
                  <button
                    key={item}
                    onClick={() =>
                      setAmount((prev) =>
                        Math.min(Number(prev) + item, MAX_AMOUNT),
                      )
                    }
                    className="rounded-xl border py-2 font-medium hover:bg-blue-50"
                  >
                    +₹{item}
                  </button>
                ))}
              </div>

              {walletOffers.filter((o) => o.bonusPoints > 0).length > 0 && (
                <div className="mt-5 overflow-y-auto h-[300px] no-scrollbar">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Available Offers
                  </p>
                  <div className="space-y-2">
                    {walletOffers
                      .filter((o) => o.bonusPoints > 0)
                      .map((offer, idx) => {
                        const isActive = Number(amount) >= offer.minAmount;
                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between rounded-xl px-4 py-3 border transition ${
                              isActive
                                ? "border-[#1E4FA3] bg-blue-50"
                                : "border-gray-200 bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <Gift
                                size={16}
                                className={
                                  isActive ? "text-[#1E4FA3]" : "text-gray-400"
                                }
                              />
                              <p className="text-sm text-gray-700">
                                Add{" "}
                                <span className="font-semibold">
                                  ₹{offer.minAmount}
                                </span>{" "}
                                or more, get{" "}
                                <span className="font-semibold text-green-600">
                                  +{offer.bonusPoints} points
                                </span>{" "}
                                free
                              </p>
                            </div>
                            {isActive && (
                              <Check
                                size={16}
                                className="text-green-600 shrink-0"
                              />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {amount > 0 && amount < MIN_AMOUNT && (
                <p className="text-red-500 text-sm mt-4">
                  Minimum amount should be ₹50
                </p>
              )}

              {amount >= MAX_AMOUNT && (
                <p className="text-green-600 text-sm mt-4">
                  Maximum limit ₹20,000 reached.
                </p>
              )}

              <div className="bg-blue-50 rounded-xl p-4 mt-5">
                <p className="text-sm text-gray-600">
                  Minimum Add Money :<span className="font-semibold">₹50</span>
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Maximum Add Money :
                  <span className="font-semibold">₹20,000</span>
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setOpenBalanceModal(false)}
                  className="flex-1 border rounded-xl py-3 font-semibold"
                >
                  Cancel
                </button>

                <button
                  disabled={!isValidAmount}
                  onClick={handleWalletPayment}
                  className={`flex-1 rounded-xl py-3 font-semibold transition
            ${
              isValidAmount
                ? "bg-[#1E4FA3] text-white hover:bg-[#19458f]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
