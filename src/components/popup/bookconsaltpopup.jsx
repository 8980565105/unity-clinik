import { useState } from "react";
import { X, Phone, Video, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/helper";
import { useDispatch } from "react-redux";
import {
  createConsultationBooking,
  createRazorpayOrder,
  verifyRazorpayPayment,
  updateBookingSlot,
} from "../../features/payments/paymentThunk";
import { useNavigate } from "react-router-dom";
import { BookSlotPopup } from "./BookSlotPopup";

export function BookConsultationPopup({
  isOpen = false,
  onClose,
  onConfirm,
  apiData = null,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [consultationType, setConsultationType] = useState("voice");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [isProcessing, setIsProcessing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [isSlotPopupOpen, setIsSlotPopupOpen] = useState(false);
  const [isSavingSlot, setIsSavingSlot] = useState(false);
  const [lastBookingData, setLastBookingData] = useState(null);

  const bookConsultationData =
    apiData?.bookConsultation ?? apiData?.data?.bookConsultation ?? null;
  const bookConsultation = bookConsultationData?.BookConsultation ?? {};
  const status = bookConsultationData?.status ?? "inactive";

  const productTitle = bookConsultation.productTitle ?? "Derma Roller";
  const subtitle =
    bookConsultation.subtitle ?? "After A Successful Consultation!";
  const tag = bookConsultation.tag ?? "Only For Today!";
  const productPrice = bookConsultation.productPrice ?? 249;
  const productOfferPrice = bookConsultation.productOfferPrice;
  const imageUrl = bookConsultation.image ?? null;
  const popupTitle = bookConsultation.popupTitle ?? "Book Consultation";
  const popupDescription =
    bookConsultation.popupDescription ??
    "Find the exact root cause of your hair fall in under 15 minutes.";
  const voicePrice = bookConsultation.voicePrice ?? 99;
  const videoPrice = bookConsultation.videoPrice ?? 249;
  const product_id =
    bookConsultation.product_id ??
    bookConsultationData?.product_id ??
    apiData?.product_id ??
    null;
  const selectedPrice = consultationType === "voice" ? voicePrice : videoPrice;

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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  const handleConfirm = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (!phoneNumber) {
      toast.error("Please enter your phone number");
      return;
    }
    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (countryCode === "+91" && !phoneRegex.test(phoneNumber.trim())) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    setIsProcessing(true);

    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Failed to load payment gateway");
        setIsProcessing(false);
        return;
      }

      const razorRes = await dispatch(
        createRazorpayOrder({ amount: selectedPrice }),
      );

      if (!createRazorpayOrder.fulfilled.match(razorRes)) {
        toast.error(razorRes.payload || "Payment initialization failed");
        setIsProcessing(false);
        return;
      }

      const razorOrder = razorRes.payload;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY,
        amount: razorOrder.amount,
        currency: "INR",
        name: "Consultation Booking",
        description: `${consultationType === "voice" ? "Voice" : "Video"} Consultation`,
        order_id: razorOrder.id,
        handler: async function (response) {
          try {
            const verifyRes = await dispatch(
              verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            );

            if (!verifyRazorpayPayment.fulfilled.match(verifyRes)) {
              toast.error("Payment verification failed");
              return;
            }

            const bookingRes = await dispatch(
              createConsultationBooking({
                phone: `${countryCode}${phoneNumber}`,
                name: fullName.trim(),
                email: email.trim() || null,
                message: message.trim() || null,
                type:
                  consultationType === "voice" ? "voice call" : "video call",
                transaction_id: response.razorpay_payment_id,
                amount: selectedPrice,
                product_id: product_id || null,
                product_title: productTitle || null,
                user_id:
                  JSON.parse(localStorage.getItem("user") || "null")?._id ||
                  null,
              }),
            );

            if (createConsultationBooking.fulfilled.match(bookingRes)) {
              toast.success(
                `Payment successful! Now pick your ${consultationType === "voice" ? "voice" : "video"} call slot.`,
              );

              const bookingPayload = bookingRes.payload;

              const extractedId =
                bookingPayload?.data?._id ??
                bookingPayload?.data?.id ??
                bookingPayload?._id ??
                bookingPayload?.id ??
                null;

              if (!extractedId) {
                console.error(
                  "Booking created but id missing in response:",
                  bookingPayload,
                );
                toast.error(
                  "Booking saved but reference id missing, please contact support",
                );
                setIsProcessing(false);
                return;
              }

              const bookingData = {
                type: consultationType,
                phone: `${countryCode} ${phoneNumber}`,
                name: fullName.trim(),
                email: email.trim() || null,
                message: message.trim() || null,
                price: selectedPrice,
                transaction_id: response.razorpay_payment_id,
                booking_id: extractedId,
              };

              setLastBookingData(bookingData);

              if (onConfirm) {
                onConfirm(bookingData);
              }

              if (onClose) onClose();
              setIsSlotPopupOpen(true);
            } else {
              toast.error("Booking save failed, please contact support");
            }
          } catch (err) {
            toast.error("Something went wrong after payment");
          }
        },
        prefill: {
          contact: phoneNumber,
        },
        theme: { color: "#000000" },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleSlotSubmit = async ({ date, time, durationMinutes }) => {
    if (!lastBookingData?.booking_id) {
      toast.error("Booking reference missing, please contact support");
      return;
    }

    setIsSavingSlot(true);
    try {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const slot_date = `${y}-${m}-${d}`;

      const res = await dispatch(
        updateBookingSlot({
          booking_id: lastBookingData.booking_id,
          slot_date,
          slot_time: time,
          slot_duration: durationMinutes,
        }),
      );

      if (updateBookingSlot.fulfilled.match(res)) {
        toast.success(`Slot confirmed: ${date.toDateString()} at ${time} 🎉`);
        setIsSlotPopupOpen(false);
        navigate("/");
      } else {
        toast.error(res.payload || "Failed to save slot, please try again");
      }
    } catch (err) {
      toast.error("Failed to save slot, please try again");
    } finally {
      setIsSavingSlot(false);
    }
  };

  return (
    <>
      {isOpen && status === "active" && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 animate-fade-in"
        >
          <div className="relative bg-white w-full max-w-[480px] h-[650px] rounded-[20px] shadow-2xl relative overflow-y-auto animate-scale-up border border-gray-100 flex flex-col hide-scrollbar::-webkit-scrollbar hide-scrollbar">
            <button
              onClick={onClose}
              className="absolute top-2 right-2 z-50 w-8 h-8 rounded-full bg-white flex items-center justify-center transition-all cursor-pointer group"
              aria-label="Close popup"
            >
              <X
                size={16}
                className="text-black group-hover:scale-110 transition-transform"
              />
            </button>

            <div className="bg-[#0b0c0e] h-[175px] px-6 pt-6 pb-4 relative flex justify-between ">
              <div className="z-10 flex flex-col justify-start max-w-[50%] mt-2">
                <h2 className="text-white text-xl md:text-2xl font-black tracking-tight leading-none uppercase">
                  {productTitle}
                </h2>
                <p className="text-gray-400 text-[9px] md:text-[10px] font-black tracking-wider leading-tight uppercase mt-1.5">
                  {subtitle.includes("\n")
                    ? subtitle.split("\n").map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < subtitle.split("\n").length - 1 && <br />}
                        </span>
                      ))
                    : subtitle}
                </p>
              </div>

              <div className="absolute left-2 bottom-[-15px] z-20 pointer-events-none">
                <img
                  src={getImageUrl(imageUrl)}
                  alt={productTitle}
                  className="w-[200px] h-[130px] object-contain filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                />
              </div>

              <div className="z-10 flex flex-col items-end justify-center text-right">
                {tag && (
                  <div className="bg-[#00cfa1] text-white text-[8px] md:text-[9px] font-black tracking-widest px-3 py-1 rounded-full uppercase shadow-sm">
                    {tag}
                  </div>
                )}
                <span className="text-[#ff3b30] line-through text-sm font-extrabold mt-2.5 leading-none">
                  ₹{productPrice}
                </span>
                {productOfferPrice ? (
                  <span className="text-[#00e676] text-3xl md:text-4xl font-black tracking-wide leading-none mt-1">
                    ₹{productOfferPrice}
                  </span>
                ) : (
                  <span className="text-[#00e676] text-3xl md:text-4xl font-black tracking-wide leading-none mt-1">
                    FREE
                  </span>
                )}
                <span className="text-[7px] text-gray-500 font-extrabold tracking-wider uppercase mt-1 opacity-80">
                  *T&C Apply
                </span>
              </div>
            </div>

            <div className="bg-white p-5 flex flex-col">
              <div className="text-center">
                <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-none">
                  {popupTitle}
                </h3>
                <p className="text-gray-400 font-bold text-[12px] md:text-[16px] tracking-wide mt-2 leading-tight">
                  {popupDescription}
                </p>
              </div>

              <form
                onSubmit={handleConfirm}
                className="mt-4 flex flex-col text-left"
              >
                <span className="text-[10px] md:text-[11px] font-black tracking-widest text-[#a0a5b5] uppercase">
                  Choose Consultation Type
                </span>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div
                    onClick={() => setConsultationType("voice")}
                    className={`flex flex-col items-center justify-center p-2 rounded-[20px] cursor-pointer transition-all duration-300 border-2 ${
                      consultationType === "voice"
                        ? "bg-black border-black text-white shadow-xl scale-[1.02]"
                        : "bg-[#fafafc] border-gray-100 text-[#a0a5b5] hover:bg-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase mb-1">
                      <Phone
                        size={13}
                        className={
                          consultationType === "voice"
                            ? "fill-white text-black"
                            : "text-[#a0a5b5]"
                        }
                      />
                      <span>Voice</span>
                    </div>
                    <span
                      className={`text-xl font-black ${consultationType === "voice" ? "text-white" : "text-gray-900"}`}
                    >
                      ₹{voicePrice}
                    </span>
                  </div>

                  <div
                    onClick={() => setConsultationType("video")}
                    className={`flex flex-col items-center justify-center p-2 rounded-[20px] cursor-pointer transition-all duration-300 border-2 ${
                      consultationType === "video"
                        ? "bg-black border-black text-white shadow-xl scale-[1.02]"
                        : "bg-[#fafafc] border-gray-100 text-[#a0a5b5] hover:bg-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black tracking-widest uppercase mb-1">
                      <Video
                        size={13}
                        className={
                          consultationType === "video"
                            ? "fill-white text-black"
                            : "text-[#a0a5b5]"
                        }
                      />
                      <span>Video</span>
                    </div>
                    <span
                      className={`text-xl font-black ${consultationType === "video" ? "text-white" : "text-gray-900"}`}
                    >
                      ₹{videoPrice}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] md:text-[11px] font-black tracking-widest text-[#a0a5b5] uppercase mt-5">
                  Your Details
                </span>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Full Name*
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input-common w-full mt-1 border-2 border-gray-100 rounded-[20px] px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-black bg-[#fafafc] focus:bg-white transition-colors"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-common w-full mt-1 border-2 border-gray-100 rounded-[20px] px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-black bg-[#fafafc] focus:bg-white transition-colors"
                      placeholder="Enter your email (optional)"
                    />
                  </div>

                  {/* <label>Number*</label>
                  <div
                    className="mt-2 border-2 border-gray-100 rounded-[20px] flex items-center
             px-4 py-3.5 input-common"
                  >
                    <div className="flex items-center gap-1.5 pr-3 mr-3 border-r-2 border-gray-200 text-gray-900 font-extrabold text-sm select-none cursor-pointer">
                      <span>{countryCode}</span>
                      <ChevronDown
                        size={14}
                        className="text-gray-400 stroke-[3]"
                      />
                    </div>
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 font-extrabold text-sm placeholder-gray-400"
                      maxLength={10}
                      required
                    />
                  </div> */}
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Phone Number*
                    </label>
                    {/* <div
                      className="mt-1 border-2 border-gray-100 rounded-[20px] flex items-center
                 px-4 py-3.5 focus-within:border-black transition-colors duration-200 bg-[#fafafc]
                  focus-within:bg-white"
                    > */}
                    {/* <div className="flex items-center gap-1.5 pr-3 mr-3 border-r-2 border-gray-200 text-gray-900 font-extrabold text-sm select-none cursor-pointer">
                        <span>{countryCode}</span>
                        <ChevronDown
                          size={14}
                          className="text-gray-400 stroke-[3]"
                        />
                      </div> */}
                    <input
                      type="tel"
                      placeholder="Phone Number *"
                      value={phoneNumber}
                      onChange={(e) =>
                        setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
                      }
                      className="input-common w-full mt-1 border-2 border-gray-100 rounded-[20px] px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-black bg-[#fafafc] focus:bg-white transition-colors"
                      // className="flex-1 bg-transparent border-none outline-none text-gray-900 font-extrabold text-sm placeholder-gray-400"
                      maxLength={10}
                      required
                    />
                    {/* </div> */}
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                      Message / Reason
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      className="input-common w-full mt-1 border-2 border-gray-100 rounded-[20px] px-4 py-3 text-sm font-bold text-gray-900 outline-none focus:border-black bg-[#fafafc] focus:bg-white transition-colors resize-none"
                      placeholder="Briefly describe your concern (optional)"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-black hover:bg-neutral-900 text-white font-extrabold tracking-widest py-4 rounded-[20px] uppercase text-xs md:text-sm mt-6 shadow-lg shadow-black/10 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      PROCESSING...
                    </>
                  ) : (
                    `PAY ₹${selectedPrice} & CONFIRM`
                  )}
                </button>

                <span className="text-[9px] md:text-[10px] text-gray-400 font-black tracking-widest text-center mt-3.5 uppercase">
                  100% Secure Checkout • Instant Confirmation
                </span>
              </form>
            </div>
          </div>
        </div>
      )}

      <BookSlotPopup
        isOpen={isSlotPopupOpen}
        onClose={() => setIsSlotPopupOpen(false)}
        onSubmit={handleSlotSubmit}
        consultationType={consultationType}
        isSubmitting={isSavingSlot}
      />
    </>
  );
}
