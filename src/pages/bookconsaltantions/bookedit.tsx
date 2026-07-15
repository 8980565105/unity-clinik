import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
    fetchBookingById,
    updateBooking,
} from "@/features/bookconsoltantion/bookconsoltThunk";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function BookEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();

    const { singleBooking: booking, singleLoading } = useSelector(
        (state: RootState) => state.bookconsaltans
    );

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        type: "voice call",
        amount: "",
        product_title: "",
        slot_date: "",
        slot_time: "",
        slot_duration: "",
        slot_status: "pending",
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (id) dispatch(fetchBookingById(id));
    }, [id, dispatch]);

    useEffect(() => {
        if (booking) {
            setForm({
                name: booking.name || "",
                email: booking.email || "",
                phone: booking.phone || "",
                message: booking.message || "",
                type: booking.type || "voice call",
                amount: booking.amount != null ? String(booking.amount) : "",
                product_title: booking.product_title || "",
                slot_date: booking.slot_date || "",
                slot_time: booking.slot_time || "",
                slot_duration:
                    booking.slot_duration != null ? String(booking.slot_duration) : "",
                slot_status: booking.slot_status || "pending",
            });
        }
    }, [booking]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (!form.phone.trim()) {
            toast.error("Phone is required");
            return;
        }

        try {
            setSaving(true);
            const payload: Record<string, any> = {
                name: form.name || null,
                email: form.email || null,
                phone: form.phone,
                message: form.message || null,
                type: form.type,
                amount: form.amount ? Number(form.amount) : undefined,
                product_title: form.product_title || null,
                slot_date: form.slot_date || null,
                slot_time: form.slot_time || null,
                slot_duration: form.slot_duration ? Number(form.slot_duration) : null,
                slot_status: form.slot_status,
            };

            await dispatch(updateBooking({ id, data: payload })).unwrap();
            toast.success("Booking updated successfully");
            navigate(-1);
        } catch (err: any) {
            toast.error(err || "Failed to update booking");
        } finally {
            setSaving(false);
        }
    };

    if (singleLoading && !booking) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">Edit Booking</h1>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white rounded-xl shadow p-6 space-y-5"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                        </label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="voice call">Voice Call</option>
                            <option value="video call">Video Call</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Amount (₹)
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={form.amount}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Product Title
                        </label>
                        <input
                            type="text"
                            name="product_title"
                            value={form.product_title}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slot Date
                        </label>
                        <input
                            type="date"
                            name="slot_date"
                            value={form.slot_date}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slot Time
                        </label>
                        <input
                            type="time"
                            name="slot_time"
                            value={form.slot_time}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slot Duration (mins)
                        </label>
                        <input
                            type="number"
                            name="slot_duration"
                            value={form.slot_duration}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Slot Status
                        </label>
                        <select
                            name="slot_status"
                            value={form.slot_status}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Message
                    </label>
                    <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={3}
                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2"
                    >
                        {saving && <Loader2 size={16} className="animate-spin" />}
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}