import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchBookingById } from "@/features/bookconsoltantion/bookconsoltThunk";
import { CheckCircle2, Circle, Phone, Mail, MessageSquare, Calendar, Clock, IndianRupee, ArrowLeft } from "lucide-react";

export default function Bookview() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { singleBooking: booking, singleLoading: loading, error } = useSelector(
        (state: RootState) => state.bookconsaltans
    );

    useEffect(() => {
        if (id) dispatch(fetchBookingById(id));
    }, [id, dispatch]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="p-6 text-center text-red-600">
                {error || "Booking not found"}
            </div>
        );
    }

    const isSlotBooked = !!(booking.slot_date && booking.slot_time);
    const isConfirmed = booking.slot_status === "confirmed";

    const steps = [
        {
            title: "Consultation Form Submitted",
            desc: `${booking.name || "Customer"} submitted a ${booking.type} request`,
            date: booking.createdAt,
            done: true,
        },
        {
            title: "Slot Selected",
            desc: isSlotBooked
                ? `Slot chosen: ${booking.slot_date} at ${booking.slot_time}`
                : "Waiting for customer/admin to pick a slot",
            date: isSlotBooked ? booking.slot_date : null,
            done: isSlotBooked,
        },
        {
            title: "Booking Confirmed",
            desc: isConfirmed
                ? "Slot confirmed successfully"
                : "Pending confirmation",
            date: isConfirmed ? booking.updatedAt : null,
            done: isConfirmed,
        },
    ];

    return (
        <div className="p-6  space-y-6">

            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Consultation Tracking</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 bg-white rounded-xl shadow p-5 space-y-4 h-fit">
                    <h2 className="font-semibold text-lg text-gray-700 border-b pb-2">
                        Customer Details
                    </h2>

                    <div className="flex items-center gap-2 text-gray-700">
                        <Phone size={16} className="text-blue-600" />
                        <span>{booking.phone}</span>
                    </div>

                    {booking.email && (
                        <div className="flex items-center gap-2 text-gray-700">
                            <Mail size={16} className="text-blue-600" />
                            <span>{booking.email}</span>
                        </div>
                    )}

                    {booking.message && (
                        <div className="flex items-start gap-2 text-gray-700">
                            <MessageSquare size={16} className="text-blue-600 mt-1" />
                            <span>{booking.message}</span>
                        </div>
                    )}

                    <div className="pt-3 border-t space-y-2">
                        <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${booking.type === "voice call"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                                }`}
                        >
                            {booking.type === "voice call" ? "📞 Voice Call" : "🎥 Video Call"}
                        </span>

                        {booking.amount ? (
                            <div className="flex items-center gap-2 text-gray-700">
                                <IndianRupee size={16} className="text-green-600" />
                                <span>₹{booking.amount}</span>
                            </div>
                        ) : null}

                        {booking.slot_date && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Calendar size={16} className="text-orange-600" />
                                <span>{booking.slot_date}</span>
                            </div>
                        )}

                        {booking.slot_time && (
                            <div className="flex items-center gap-2 text-gray-700">
                                <Clock size={16} className="text-orange-600" />
                                <span>{new Date(
                                    `1970-01-01T${booking.slot_time}`,
                                ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })}</span>
                            </div>
                        )}
                    </div>

                    {booking.product_title && (
                        <div className="pt-3 border-t">
                            <p className="text-sm text-gray-500">Linked Product</p>
                            <p className="font-medium text-gray-800">{booking.product_id.name}</p>
                        </div>
                    )}
                </div>


                <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                    <h2 className="font-semibold text-lg text-gray-700 mb-6">
                        Booking History
                    </h2>
                    <div className="relative pl-6">
                        {steps.map((step, idx) => (
                            <div key={idx} className="relative pb-8 last:pb-0">
                                {idx !== steps.length - 1 && (
                                    <span
                                        className={`absolute left-[7px] top-6 w-0.5 h-full ${step.done ? "bg-green-400" : "bg-gray-200"
                                            }`}
                                    />
                                )}
                                <div className="flex gap-4">
                                    <div className="mt-0.5">
                                        {step.done ? (
                                            <CheckCircle2 size={16} className="text-green-500" />
                                        ) : (
                                            <Circle size={16} className="text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <p
                                            className={`font-medium ${step.done ? "text-gray-800" : "text-gray-400"
                                                }`}
                                        >
                                            {step.title}
                                        </p>
                                        <p className="text-sm text-gray-500">{step.desc}</p>
                                        {step.date && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(step.date).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}