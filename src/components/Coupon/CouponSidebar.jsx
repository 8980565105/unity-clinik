import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicPopup } from "../../features/popup/popupThunk";
// import Button from "../ui/Button";
import LoginForm from "../../pages/Login";
import RegistrationForm from "../../pages/RegistrationForm";
import ForgetForm from "../../pages/ForgetForm";
import { useLocation } from "react-router-dom";

export default function CouponSidebar() {
  const dispatch = useDispatch();
  const location = useLocation();
  const { data: popupData, loading } = useSelector((state) => state.popup);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isForgetOpen, setIsForgetOpen] = useState(false);

  const CLOSE_STORAGE_KEY = "couponPopupClosedAt";
  // const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 hours
  const COOLDOWN_MS = 10 * 60 * 1000; 
  const TRIGGER_PATHS = ["/cart", "/checkout"];

  const [closedAt, setClosedAt] = useState(() =>
    localStorage.getItem(CLOSE_STORAGE_KEY),
  );

  const isCooldownActive = (value) => {
    if (!value) return false;
    return Date.now() - Number(value) < COOLDOWN_MS;
  };

  useEffect(() => {
    dispatch(fetchPublicPopup());
  }, [dispatch]);

  useEffect(() => {
    const isTriggerPage = TRIGGER_PATHS.some((path) =>
      location.pathname.toLowerCase().startsWith(path),
    );
    let collapseTimer;
    if (isTriggerPage) {
      setVisible(true);
      setOpen(true);
      collapseTimer = setTimeout(() => {
        setOpen(false);
      }, 5000);
    } else {
      const onCooldown = isCooldownActive(closedAt);
      setVisible(!onCooldown);
      setOpen(!onCooldown);
      if (!onCooldown) {
        collapseTimer = setTimeout(() => {
          setOpen(false);
        }, 5000);
      }
    }
    return () => clearTimeout(collapseTimer);
  }, [location.pathname]);

  useEffect(() => {
    if (!closedAt) return;
    const elapsed = Date.now() - Number(closedAt);
    const remaining = COOLDOWN_MS - elapsed;
    const reveal = () => {
      localStorage.removeItem(CLOSE_STORAGE_KEY);
      setClosedAt(null);
      setVisible(true);
      setOpen(true);
      setTimeout(() => {
        setOpen(false);
      }, 5000);
    };
    if (remaining <= 0) {
      reveal();
      return;
    }
    const timer = setTimeout(reveal, remaining);
    return () => clearTimeout(timer);
  }, [closedAt]);

  useEffect(() => {
    if (!closedAt) return;

    const elapsed = Date.now() - Number(closedAt);
    const remaining = COOLDOWN_MS - elapsed;

    const reveal = () => {
      localStorage.removeItem(CLOSE_STORAGE_KEY);
      setClosedAt(null);
      setVisible(true);
      setOpen(true);
    };

    if (remaining <= 0) {
      reveal();
      return;
    }

    const timer = setTimeout(reveal, remaining);
    return () => clearTimeout(timer);
  }, [closedAt]);

  const handleClose = () => {
    const now = Date.now().toString();
    localStorage.setItem(CLOSE_STORAGE_KEY, now);
    setClosedAt(now);
    setOpen(false);
    setVisible(false);
  };

  const handleSignUpNow = () => {
    const user = localStorage.getItem("user");
    if (user) {
      toast.success("You are already logged in!");
      setOpen(false);
    } else {
      setIsLoginOpen(true);
      setOpen(false);
    }
  };

  const handleCopyCoupon = async () => {
    const couponCode = popupData?.coupon?.coupon?.couponCode;
    if (!couponCode) return;
    try {
      await navigator.clipboard.writeText(couponCode);
      toast.success("Coupon code copied successfully!");
    } catch (error) {
      toast.error("Failed to copy coupon code");
    }
  };

  if (
    loading ||
    !popupData?.coupon ||
    popupData.coupon.status !== "active" ||
    popupData.coupon.type !== "coupon"
  ) {
    return null;
  }
  const isCoupon = popupData.coupon.type === "coupon";
  const coupon = popupData?.coupon;
  const couponData = popupData?.coupon?.coupon;
  if (!isCoupon || !coupon) return null;
  if (!visible) return null;

  return (
    <>
      {open && (
        <div
          className={`fixed inset-0 bg-black/40 z-[999] transition-opacity duration-300 ${
            open ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className="fixed right-0 top-1/2 z-[999] flex items-stretch transition-transform duration-500 ease-in-out"
        style={{
          transform: open
            ? "translate3d(0, -50%, 0)"
            : "translate3d(calc(100% - 25px), -50%, 0)",
        }}
      >
        <div
          onClick={() => setOpen(!open)}
          className="w-8 bg-[#282c3f] hover:bg-[#3e4152] text-white flex flex-col items-center 
                    justify-between py-6 cursor-pointer rounded-l-2xl shadow-2xl border-r border-[#3e4152]/30 select-none h-[260px] md:h-[325px]"
          style={{ alignSelf: "center" }}
        >
          <div className="flex items-center justify-center">
            {open ? (
              <svg
                className="w-4 h-4 text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-white fill-current animate-pulse"
                viewBox="0 0 24 24"
              >
                <path d="M16 5v14l-11-7z" />
              </svg>
            )}
          </div>

          <div
            className="font-bold tracking-wider text-[15px] whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {coupon.coupon.title?.toUpperCase()}
          </div>

          <div className="h-2" />
        </div>

        <div
          className="w-[500px] max-w-[calc(100vw-60px)] bg-gradient-to-br from-[#FFF0F6] via-[#FFF8EE] to-[#FFF9F2] shadow-2xl 
                relative flex flex-col justify-between overflow-hidden border-y border-l border-pink-100"
        >
          <button
            onClick={handleClose}
            aria-label="close"
            className="absolute top-2 right-2 z-10 w-fit p-2 h-7 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#3e4152] shadow"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div className="p-2 md:p-8 flex-1 flex flex-col justify-between h-[250px] md:h-[325px]">
            <div className="flex justify-between items-start gap-6 mt-4">
              <div className="flex-1 text-left">
                <p className="text-[16px] uppercase tracking-widest text-[#7e818c] font-bold mb-1">
                  Avail Upto
                </p>

                <h2 className="text-[30px] md:text-6xl font-black text-[#3e4152] leading-none mb-5">
                  {couponData.title}
                </h2>

                <button
                  onClick={handleCopyCoupon}
                  className="inline-flex items-center gap-1.5 bg-white/70 border border-dashed border-primary rounded-lg px-3.5 py-2 hover:bg-white transition-all cursor-pointer"
                >
                  <span className="text-xs font-semibold text-[#535766]">
                    Coupon Code:
                  </span>
                  <span className="text-sm font-extrabold text-primary tracking-wide select-all">
                    {couponData.couponCode}
                  </span>
                  <span className="text-[10px] bg-primary text-white px-2 py-1 rounded">
                    COPY
                  </span>
                </button>

                <p className="text-[16px] text-[#7e818c] mt-2 font-medium">
                  {couponData.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setIsLoginOpen(false)}
              onSwitchRegister={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
              onSwitchForget={() => {
                setIsLoginOpen(false);
                setIsForgetOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <RegistrationForm
              onClose={() => setIsRegisterOpen(false)}
              onSwitch={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {isForgetOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <ForgetForm
              onClose={() => setIsForgetOpen(false)}
              onSwitch={() => {
                setIsForgetOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
