import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { Calendar, Clock, Phone, Video, RefreshCw } from "lucide-react";
import {
  fetchMyBookings,
  updateBookingSlot,
} from "../features/payments/paymentThunk";
import { BookSlotPopup } from "../components/popup/BookSlotPopup";

function isUpcoming(booking) {
  if (!booking.slot_date || booking.slot_status !== "confirmed") return true;

  const [y, m, d] = booking.slot_date.split("-").map(Number);
  const [h, min] = (booking.slot_time || "00:00").split(":").map(Number);
  const slotDateTime = new Date(y, m - 1, d, h, min);
  return slotDateTime > new Date();
}

export default function MyBookConsalt() {
  const dispatch = useDispatch();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const loadBookings = useCallback(async () => {
    setIsLoading(true);
    const res = await dispatch(
      fetchMyBookings({
        user_id: user?._id,
        phone: !user?._id ? localStorage.getItem("guest_phone") : undefined,
      }),
    );
    if (fetchMyBookings.fulfilled.match(res)) {
      setBookings(res.payload || []);
    } else {
      toast.error(res.payload || "Failed to load bookings");
    }
    setIsLoading(false);
  }, [dispatch, user?._id]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleRescheduleSubmit = async ({ date, time, durationMinutes }) => {
    if (!rescheduleBooking) return;
    setIsSubmitting(true);
    try {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      const slot_date = `${y}-${m}-${d}`;

      const res = await dispatch(
        updateBookingSlot({
          booking_id: rescheduleBooking._id,
          slot_date,
          slot_time: time,
          slot_duration: durationMinutes,
        }),
      );

      if (updateBookingSlot.fulfilled.match(res)) {
        toast.success("Slot rescheduled successfully");
        setRescheduleBooking(null);
        loadBookings();
      } else {
        toast.error(res.payload || "Reschedule failed");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 font-bold text-sm">
        Loading your bookings...
      </div>
    );
  }

  if (!bookings.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Calendar size={32} className="mb-3" />
        <p className="font-bold text-sm">No consultations booked yet</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
      <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-gray-900">
        My Consultations
      </h1>

      {bookings.map((booking) => {
        const upcoming = isUpcoming(booking);
        return (
          <div
            key={booking._id}
            className="bg-white border border-gray-100 rounded-[20px] p-4 md:p-5 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                {booking.type === "video call" ? (
                  <Video size={16} className="text-primary" />
                ) : (
                  <Phone size={16} className="text-primary" />
                )}
                <span className="font-black text-sm text-gray-900 uppercase tracking-wide">
                  {booking.type === "video call" ? "Video" : "Voice"}{" "}
                  Consultation
                </span>
              </div>

              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${
                  booking.slot_status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {booking.slot_status}
              </span>
            </div>

            {booking.product_title && (
              <p className="text-xs text-gray-500 font-bold">
                {booking.product_title}
              </p>
            )}

            <div className="flex items-center gap-2 text-gray-700 text-sm font-bold">
              <Calendar size={14} className="text-gray-400" />
              {booking.slot_date || "Not scheduled"}

              {booking.slot_time && (
                <>
                  <Clock size={14} className="text-gray-400 ml-2" />
                  {new Date(
                    `1970-01-01T${booking.slot_time}`,
                  ).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </>
              )}
            </div>

            {upcoming && (
              <button
                onClick={() => setRescheduleBooking(booking)}
                className="mt-1 self-start flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-primary border-2 border-primary rounded-full px-4 py-2 hover:bg-primary hover:text-white transition-all"
              >
                <RefreshCw size={13} />
                Reschedule
              </button>
            )}

            {!upcoming && booking.slot_status === "confirmed" && (
              <span className="text-[10px] text-gray-400 font-bold uppercase">
                This call has already taken place
              </span>
            )}
          </div>
        );
      })}

      {/* <BookSlotPopup
        isOpen={!!rescheduleBooking}
        onClose={() => !isSubmitting && setRescheduleBooking(null)}
        onSubmit={handleRescheduleSubmit}
        consultationType={
          rescheduleBooking?.type === "video call" ? "video" : "voice"
        }
        isSubmitting={isSubmitting}
        price={null}
      /> */}
      <BookSlotPopup
        isOpen={!!rescheduleBooking}
        onClose={() => !isSubmitting && setRescheduleBooking(null)}
        onSubmit={handleRescheduleSubmit}
        consultationType={
          rescheduleBooking?.type === "video call" ? "video" : "voice"
        }
        isSubmitting={isSubmitting}
        price={null}
        initialDate={
          rescheduleBooking?.slot_date
            ? new Date(rescheduleBooking.slot_date + "T00:00:00")
            : null
        }
      />
    </div>
  );
}
