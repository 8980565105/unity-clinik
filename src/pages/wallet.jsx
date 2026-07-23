import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Gift,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  UserPlus,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  addWalletMoney,
  fetchBalance,
  fetchHistory,
} from "../features/wallet/walletThunk";
import Sharelink from "../components/product/Sharelink";
import toast from "react-hot-toast";
import {
  createRazorpayOrder,
  markPaymentFailed,
  verifyRazorpayPayment,
} from "../features/payments/paymentThunk";
import { fetchReferralSettings } from "../features/reffrel/reffrelThunk";
import { getImageUrl } from "../components/utils/helper";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";

const palette = {
  bg: "#F4F7FB",
  card: "#1E4FA3",
  cardSoft: "#2E6BD6",
  accent: "#F2A93B",
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

function getBoxResultAmount(box) {
  if (box.chargeType === "percentage") {
    return Math.round(box.amount + (box.amount * box.charge) / 100);
  }
  return Math.round(box.amount + box.charge);
}

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div
      className="border rounded-xl overflow-hidden"
      style={{ borderColor: palette.border }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold" style={{ color: palette.text }}>
          {item.question}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
          style={{ color: palette.muted }}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 -mt-1">
          <p
            className="text-sm leading-relaxed"
            style={{ color: palette.muted }}
          >
            {item.answer}
          </p>
        </div>
      )}
    </div>
  );
}
export default function Wallet() {
  const dispatch = useDispatch();
  const faqRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const MIN_AMOUNT = 50;
  const MAX_AMOUNT = 20000;
  const [amount, setAmount] = useState(500);
  const isValidAmount =
    Number(amount) >= MIN_AMOUNT && Number(amount) <= MAX_AMOUNT;
  const { balance, totalEarned, totalUsed, transactions } = useSelector(
    (state) => state.wallet,
  );
  const visibleTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 10);
  const { walletOffers, walletbox, points, faqs, referrerPoints } = useSelector(
    (state) => state.reffrel,
  );
  const referralCode =
    useSelector((state) => state.auth?.user?.referralCode) || "";
  useEffect(() => {
    dispatch(fetchBalance());
    dispatch(fetchHistory({ limit: 50 }));
    dispatch(fetchReferralSettings());
  }, [dispatch]);

  function getChargeAmount(entry, baseAmount) {
    if (entry.chargeType === "percentage") {
      return Math.round((baseAmount * entry.charge) / 100);
    }
    return entry.charge;
  }

  const applicableOffer = useMemo(() => {
    return (walletOffers || [])
      .filter((o) => Number(amount) >= o.minAmount)
      .sort((a, b) => b.minAmount - a.minAmount)[0];
  }, [walletOffers, amount]);

  const { finalBonus } = useMemo(() => {
    if (selectedBox && Number(amount) === selectedBox.amount) {
      return {
        finalBonus: getChargeAmount(selectedBox, selectedBox.amount),
      };
    }
    if (applicableOffer) {
      return {
        finalBonus: getChargeAmount(applicableOffer, Number(amount)),
      };
    }
    return { finalBonus: 0 };
  }, [selectedBox, amount, applicableOffer]);

  const creditForAmount = Number(amount) + finalBonus;

  const handleCopy = async () => {
    try {
      const referralLink = `${window.location.origin}/?ref=${referralCode}`;
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
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

  const handleBoxClick = (box) => {
    setSelectedBox(box);
    setAmount(box.amount);
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

  const handleWalletPayment = async (payAmount, bonusAmount = 0) => {
    try {
      const finalPayAmount = payAmount ?? Number(amount);
      const finalBonusAmount = bonusAmount ?? finalBonus;

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load Razorpay SDK");
        return;
      }
      const razorRes = await dispatch(
        createRazorpayOrder({ amount: finalPayAmount }),
      );
      if (!createRazorpayOrder.fulfilled.match(razorRes)) {
        toast.error("Unable to create payment");
        return;
      }
      const order = razorRes.payload;
      const userLS = JSON.parse(localStorage.getItem("user") || "null");
      let failureAlreadyRecorded = false;
      const handleFailure = async (transactionId = "") => {
        if (failureAlreadyRecorded) return;
        failureAlreadyRecorded = true;
        await dispatch(
          markPaymentFailed({
            user_id: userLS?._id,
            payment_method: "Razorpay",
            amount: finalPayAmount,
            type: "wallet_recharge",
            transaction_id: transactionId,
          }),
        );
      };
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: order.amount,
        currency: "INR",
        name: "Zyfolixo (unity clinic )",
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
                amount: finalPayAmount,
                bonus: finalBonusAmount,
                transaction_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              }),
            );

            if (addWalletMoney.fulfilled.match(walletRes)) {
              toast.success(
                finalBonusAmount > 0
                  ? `₹${finalPayAmount} + ₹${finalBonusAmount} bonus added!`
                  : "Money Added",
              );
              dispatch(fetchBalance());
              dispatch(fetchHistory());
              setAmount(500);
              setSelectedBox(null);
            }
          } catch (err) {
            toast.error("Something went wrong");
          }
        },

        modal: {
          ondismiss() {
            toast.error("Payment Cancelled");
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

  const scrollToFaq = () => {
    if (showFaq) {
      setShowFaq(false);
      setOpenFaqIndex(null);
      return;
    }

    setShowFaq(true);

    setTimeout(() => {
      faqRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

      setOpenFaqIndex(0);
    }, 100);
  };

  return (
    <>
      <Section>
        <Row>
          <div className="mb-6">
            <h1
              className="text-[24px] font-semibold"
              style={{ color: palette.text }}
            >
              Unity Wallet
            </h1>
            <p
              className="text-xs tracking-[0.2em] uppercase mb-1 font-medium"
              style={{ color: palette.muted }}
            >
              Your Rewards
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-[50%] space-y-4">
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: `linear-gradient(155deg, ${palette.cardSoft}, ${palette.card})`,
                  boxShadow: "0 12px 30px rgba(30,79,163,0.28)",
                }}
              >
                <div className="p-3 md:p-6">
                  <span
                    className="text-xs tracking-wide"
                    style={{ color: palette.mutedOnCard }}
                  >
                    Available balance
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span
                      className="text-[28px] tabular-nums"
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

                <div
                  className="px-3 md:px-6 pt-4 pb-5 flex items-center justify-between border-t"
                  style={{ borderColor: palette.line }}
                >
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
                    style={{
                      backgroundColor: palette.accent,
                      color: "#3A2408",
                    }}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
              </div>

              <div
                className="w-full flex items-center justify-between rounded-2xl px-5 py-4 hidden lg:flex "
                style={{
                  background: `linear-gradient(120deg, ${palette.cardSoft}, ${palette.card})`,
                }}
              >
                <div className="text-left">
                  <p
                    className="text-sm font-medium"
                    style={{ color: palette.textOnCard }}
                  >
                    Invite a friend, earn ₹ {referrerPoints || 100}
                  </p>
                  <p className="text-xs" style={{ color: palette.mutedOnCard }}>
                    Reward lands after their first order
                  </p>
                </div>
                <Sharelink
                  shareUrl={`${window.location.origin}/?ref=${referralCode}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#F2A93B] hover:bg-[#FBDDA5]"
                />
              </div>

              <div className="hidden lg:block">
                <div className="grid grid-cols-2 gap-3">
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

                <div className="mb-3 flex items-center justify-between">
                  <h2
                    className="text-sm font-semibold"
                    style={{ color: palette.text }}
                  >
                    Transaction History
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
                    {visibleTransactions.map((t) => {
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
                              className="text-[12px] md:text-[14px] truncate font-medium"
                              style={{ color: palette.text }}
                            >
                              {t.reason}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: palette.muted }}
                            >
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
                          onClick={() =>
                            setShowAllTransactions(!showAllTransactions)
                          }
                          className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: palette.card,
                            color: "#fff",
                          }}
                        >
                          {showAllTransactions ? "View Less" : "View More"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full lg:w-[50%]">
              <div
                className="rounded-2xl border p-2 md:p-5"
                style={{
                  backgroundColor: palette.surface,
                  borderColor: palette.border,
                }}
              >
                <p
                  className="text-center text-sm font-medium"
                  style={{ color: palette.muted }}
                >
                  Enter Amount
                </p>
                <div className="flex justify-center">
                  <div
                    className="border rounded-2xl px-6 py-3 inline-flex items-center gap-2"
                    style={{
                      borderColor: palette.border,
                      backgroundColor: "#F7F9FC",
                    }}
                  >
                    <span
                      className="text-3xl font-bold"
                      style={{ color: palette.text }}
                    >
                      ₹
                    </span>
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
                        setSelectedBox(null);
                      }}
                      className="text-3xl font-bold outline-none bg-transparent w-[160px] text-center"
                    />
                  </div>
                </div>
                {applicableOffer && (
                  <div className="flex justify-center mt-3">
                    <span
                      className="inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full"
                      style={{
                        backgroundColor: "#E7F7EF",
                        color: palette.green,
                      }}
                    >
                      <Sparkles size={14} />
                      Get ₹{creditForAmount.toLocaleString()} in your wallet
                    </span>
                  </div>
                )}
                {amount > 0 && amount < MIN_AMOUNT && (
                  <p className="text-red-500 text-sm text-center mt-3">
                    Minimum amount should be ₹{MIN_AMOUNT}
                  </p>
                )}
                {amount >= MAX_AMOUNT && (
                  <p className="text-green-600 text-sm text-center mt-3">
                    Maximum limit ₹{MAX_AMOUNT.toLocaleString()} reached.
                  </p>
                )}
                {walletbox && walletbox.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {walletbox.map((box, index) => {
                      const resultAmount = getBoxResultAmount(box);
                      const isSelected = Number(amount) === box.amount;
                      const borderColors = [
                        "border-[#1E4FA3]",
                        "border-[#C9DCE8]",
                        "border-[#F2D48C]",
                      ];
                      const bonusColors = [
                        "text-[#1E4FA3]",
                        "text-gray-400",
                        "text-[#D98300]",
                      ];
                      const footerColors = [
                        "text-[#0D8A78]",
                        "text-[#0D8A78]",
                        "text-[#D98300]",
                      ];

                      return (
                        <button
                          key={index}
                          onClick={() => handleBoxClick(box)}
                          className={`
            relative overflow-hidden rounded-2xl bg-white
            border-2 transition-all duration-300
            hover:-translate-y-1 hover:shadow-xl
            h-fit
            ${
              isSelected
                ? "border-[#1E4FA3] shadow-lg scale-[1.02]"
                : borderColors[index % 3]
            }
          `}
                        >
                          <div className="bg-[#F8F8F8] py-2">
                            <p
                              className={`text-[15px] font-extrabold uppercase ${
                                bonusColors[index % 3]
                              }`}
                            >
                              {box.chargeType === "percentage"
                                ? `${box.charge}% BONUS`
                                : `₹${box.charge} BONUS`}
                            </p>
                          </div>

                          <div className="py-2 md:py-4">
                            <h3 className="text-[20px] lg:text-[40px] leading-none font-extrabold text-[#1B1B1B]">
                              ₹{box.amount.toLocaleString()}
                            </h3>

                            <p className="mt-3 text-[16px] lg:text-[24px] font-bold text-[#0B8E83]">
                              Get ₹{resultAmount.toLocaleString()}
                            </p>
                          </div>

                          <div className="pb-3 h-7 flex justify-center items-center">
                            {box.badge ? (
                              <span
                                className={`text-[14px] lg:text-[18px] font-bold ${
                                  footerColors[index % 3]
                                }`}
                              >
                                {box.badge}
                              </span>
                            ) : (
                              <span className="opacity-0">.</span>
                            )}
                          </div>

                          {isSelected && (
                            <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#1E4FA3] flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {points && points.length > 0 && (
                  <div className="mt-5 space-y-2.5">
                    {points.map((p, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        {p.image ? (
                          <img
                            src={getImageUrl(p.image)}
                            alt=""
                            className="w-5 h-5 object-contain shrink-0"
                          />
                        ) : (
                          <Gift size={16} className="text-gray-400 shrink-0" />
                        )}
                        <p className="text-sm" style={{ color: palette.text }}>
                          {p.text}
                          {idx === points.length - 1 && (
                            <button
                              type="button"
                              onClick={scrollToFaq}
                              className="ml-1 font-semibold text-[#1E4FA3] hover:underline"
                            >
                              Check FAQs
                            </button>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
                {showFaq && faqs && faqs.length > 0 && (
                  <div ref={faqRef} className="mt-5">
                    <div className="space-y-2">
                      {faqs.map((item, idx) => (
                        <FaqItem
                          key={idx}
                          item={item}
                          isOpen={openFaqIndex === idx}
                          onToggle={() =>
                            setOpenFaqIndex(openFaqIndex === idx ? null : idx)
                          }
                        />
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  disabled={!isValidAmount}
                  variant="common"
                  onClick={() =>
                    handleWalletPayment(Number(amount), finalBonus)
                  }
                  className={`w-full rounded-xl py-3.5 font-semibold transition mt-6 sticky bottom-0 lg:static lg:bottom-0}`}
                >
                  Add Money
                </Button>
              </div>

              <div
                className="w-full flex items-center justify-between rounded-2xl px-5 py-4 mt-5 lg:hidden"
                style={{
                  background: `linear-gradient(120deg, ${palette.cardSoft}, ${palette.card})`,
                }}
              >
                <div className="text-left">
                  <p
                    className="text-sm font-medium"
                    style={{ color: palette.textOnCard }}
                  >
                    Invite a friend, earn ₹ {referrerPoints || 100}
                  </p>
                  <p className="text-xs" style={{ color: palette.mutedOnCard }}>
                    Reward lands after their first order
                  </p>
                </div>
                <Sharelink
                  shareUrl={`${window.location.origin}/?ref=${referralCode}`}
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-[#F2A93B] hover:bg-[#FBDDA5]"
                />
              </div>

              <div className="lg:hidden mt-4">
                <div className="grid grid-cols-2 gap-3">
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
                <div className="my-3 flex items-center justify-between">
                  <h2
                    className="text-sm font-semibold"
                    style={{ color: palette.text }}
                  >
                    Transaction History
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
                    {visibleTransactions.map((t) => {
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
                              className="text-[12px] md:text-[14px] truncate font-medium"
                              style={{ color: palette.text }}
                            >
                              {t.reason}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: palette.muted }}
                            >
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
                          onClick={() =>
                            setShowAllTransactions(!showAllTransactions)
                          }
                          className="px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105"
                          style={{
                            backgroundColor: palette.card,
                            color: "#fff",
                          }}
                        >
                          {showAllTransactions ? "View Less" : "View More"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Row>
      </Section>
    </>
  );
}
