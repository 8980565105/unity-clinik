import React, { useState, useEffect } from "react";
import { useDispatch, useSelector, } from "react-redux";
import { AppDispatch, } from "@/store";
import { GenericTable } from "@/components/ui/adminTable";
import {
    fetchpaking,
    deletepaking,
    bulkDeletepaking,
    updatepakingStatus,
    updatepaking,
    createpaking,
} from "@/features/Packing/PackingThunk"


export default function PackingPage() {
    const dispatch = useDispatch<AppDispatch>();

    const [params, setParams] = useState({
        page: 1,
        limit: 10,
        search: "",
        status: "",
    });

    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<any>(null);
    const [form, setForm] = useState({ name: "", description: "" });

    useEffect(() => {
        dispatch(fetchpaking(params));
    }, [params]);

    const handleSubmit = () => {
        if (editItem) {
            dispatch(updatepaking({ id: editItem._id, data: form }));
        } else {
            dispatch(createpaking(form));
        }
        setShowModal(false);
        setEditItem(null);
        setForm({ name: "", description: "" });
    };



    const columns = [
        { key: "name", label: "Name", width: "w-48" },
        { key: "description", label: "Description", width: "w-64" },
        {
            key: "createdAt",
            label: "Created",
            width: "w-32",
            render: (row: any) =>
                new Date(row.createdAt).toLocaleDateString("en-IN"),
        },

    ];

    return (
        <>
            <GenericTable
                title="Packing"
                columns={columns}
                rowKey="_id"
                searchEnabled
                statusToggleEnabled
                filters={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                ]}

                fetchData={async ({ page, limit, search, status }) => {
                    const res = await dispatch(
                        fetchpaking({ page, limit, search, status })
                    ).unwrap();
                    return { data: res.packings, total: res.total };
                }}

                deleteItem={async (id) => {
                    await dispatch(deletepaking(id)).unwrap();
                }}
                bulkDeleteItems={async (ids) => {
                    await dispatch(bulkDeletepaking(ids)).unwrap();
                }}
                onStatusToggle={async (id, newStatus) => {
                    await dispatch(
                        updatepakingStatus({ id, status: newStatus ? "active" : "inactive" })
                    ).unwrap();
                }}

            />

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-base font-semibold text-gray-800">
                                {editItem ? "Edit Packing" : "Add Packing"}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 text-xl"
                            >
                                ×
                            </button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Packing name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({ ...form, description: e.target.value })
                                    }
                                    placeholder="Optional description"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={handleSubmit}
                                disabled={!form.name.trim()}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 transition"
                            >
                                {editItem ? "Update" : "Create"}
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}