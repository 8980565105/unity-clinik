import React, { useState } from "react";
import {
  Gift,
  Share2,
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingBag,
  UserPlus,
  Lock,
} from "lucide-react";

const palette = {
  ink: "#0E1B1A",
  card: "#143331",
  cardSoft: "#1B4B45",
  gold: "#E8B04B",
  goldSoft: "#F5D89A",
  text: "#ECF2EF",
  muted: "#8FA69E",
  rose: "#E38B7B",
  line: "rgba(232,176,75,0.35)",
};

const transactions = [
  {
    id: 1,
    type: "credit",
    reason: "Referral bonus — Rahul joined",
    date: "05 Jul",
    points: 100,
    icon: UserPlus,
  },
  {
    id: 2,
    type: "debit",
    reason: "Used on Order #4821",
    date: "02 Jul",
    points: 50,
    icon: ShoppingBag,
  },
  {
    id: 3,
    type: "credit",
    reason: "Welcome bonus — your first order",
    date: "28 Jun",
    points: 100,
    icon: Gift,
  },
  {
    id: 4,
    type: "credit",
    reason: "Referral bonus — Priya joined",
    date: "19 Jun",
    points: 100,
    icon: UserPlus,
  },
  {
    id: 5,
    type: "debit",
    reason: "Used on Order #4790",
    date: "12 Jun",
    points: 100,
    icon: ShoppingBag,
  },
];

export default function Wallet() {
  const [copied, setCopied] = useState(false);
  const referralCode = "BHARGAV123";
  const balance = 150;
  const totalEarned = 300;
  const totalUsed = 150;

  const handleCopy = () => {
    navigator.clipboard?.writeText(
      `https://yourwebsite.com/signup?ref=${referralCode}`,
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div
      className="min-h-screen w-full flex justify-center px-4 py-8 sm:py-12"
      style={{
        backgroundColor: palette.ink,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6">
          <p
            className="text-xs tracking-[0.2em] uppercase mb-1"
            style={{ color: palette.muted }}
          >
            Your Rewards
          </p>
          <h1 className="text-2xl font-medium" style={{ color: palette.text }}>
            Wallet
          </h1>
        </div>

        <div
          className="relative rounded-3xl overflow-hidden mb-4 shadow-2xl"
          style={{
            background: `linear-gradient(155deg, ${palette.cardSoft}, ${palette.card})`,
          }}
        >
          <div className="px-6 pt-6 pb-8">
            <div className="flex items-center justify-between mb-4">
              <span
                className="text-xs tracking-wide"
                style={{ color: palette.muted }}
              >
                Available balance
              </span>
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
              >
                <Lock size={11} style={{ color: palette.goldSoft }} />
                <span
                  className="text-[10px]"
                  style={{ color: palette.goldSoft }}
                >
                  Redeem only
                </span>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-5xl tabular-nums"
                style={{
                  color: palette.gold,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                {balance}
              </span>
              <span className="text-sm" style={{ color: palette.muted }}>
                points
              </span>
            </div>
            <p className="text-xs mt-2" style={{ color: palette.muted }}>
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
                backgroundColor: palette.ink,
              }}
            />
            <div
              className="absolute rounded-full"
              style={{
                width: 22,
                height: 22,
                right: -11,
                top: -11,
                backgroundColor: palette.ink,
              }}
            />
          </div>

          <div className="px-6 pt-6 pb-5 flex items-center justify-between">
            <div>
              <p
                className="text-[10px] tracking-wide uppercase mb-0.5"
                style={{ color: palette.muted }}
              >
                Your code
              </p>
              <p
                className="text-sm tracking-widest"
                style={{
                  color: palette.text,
                  fontFamily: "ui-monospace, Menlo, monospace",
                }}
              >
                {referralCode}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-opacity active:opacity-70"
              style={{ backgroundColor: palette.gold, color: palette.ink }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>

        {/* Stat chips */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <p
              className="text-[10px] uppercase tracking-wide mb-1"
              style={{ color: palette.muted }}
            >
              Total earned
            </p>
            <p
              className="text-lg tabular-nums"
              style={{
                color: palette.text,
                fontFamily: "ui-monospace, Menlo, monospace",
              }}
            >
              +{totalEarned}
            </p>
          </div>
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <p
              className="text-[10px] uppercase tracking-wide mb-1"
              style={{ color: palette.muted }}
            >
              Total used
            </p>
            <p
              className="text-lg tabular-nums"
              style={{
                color: palette.text,
                fontFamily: "ui-monospace, Menlo, monospace",
              }}
            >
              −{totalUsed}
            </p>
          </div>
        </div>

        {/* Invite banner */}
        <button
          className="w-full flex items-center justify-between rounded-2xl px-5 py-4 mb-8 transition-transform active:scale-[0.98]"
          style={{ backgroundColor: palette.gold }}
        >
          <div className="text-left">
            <p className="text-sm font-medium" style={{ color: palette.ink }}>
              Invite a friend, earn 100 points
            </p>
            <p className="text-xs" style={{ color: "#3A2A0F" }}>
              Reward lands after their first order
            </p>
          </div>
          <Share2 size={18} style={{ color: palette.ink }} />
        </button>

        {/* Ledger / transaction history */}
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium" style={{ color: palette.text }}>
            History
          </h2>
          <span className="text-xs" style={{ color: palette.muted }}>
            {transactions.length} entries
          </span>
        </div>

        {transactions.length === 0 ? (
          <div
            className="text-center py-12 rounded-2xl"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            <p className="text-sm" style={{ color: palette.muted }}>
              No activity yet. Invite a friend to start earning.
            </p>
          </div>
        ) : (
          <div
            className="rounded-2xl overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
          >
            {transactions.map((t, i) => {
              const Icon = t.icon;
              const isCredit = t.type === "credit";
              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 px-4 py-3.5"
                  style={{
                    borderTop:
                      i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isCredit
                        ? "rgba(232,176,75,0.15)"
                        : "rgba(227,139,123,0.15)",
                    }}
                  >
                    <Icon
                      size={15}
                      style={{ color: isCredit ? palette.gold : palette.rose }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm truncate"
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
                      <ArrowUpRight size={13} style={{ color: palette.gold }} />
                    ) : (
                      <ArrowDownRight
                        size={13}
                        style={{ color: palette.rose }}
                      />
                    )}
                    <span
                      className="text-sm tabular-nums"
                      style={{
                        color: isCredit ? palette.gold : palette.rose,
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
          </div>
        )}
      </div>
    </div>
  );
}
