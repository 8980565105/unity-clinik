import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import { Plus } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

function Address() {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    house: "",
    street: "",
    city: "",
    state: "",
    country: "India",
    zip_code: "",
  });

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get("http://localhost:5000/api/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses(res.data.data.user.addresses || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      house: "",
      street: "",
      city: "",
      state: "",
      country: "India",
      zip_code: "",
    });

    setEditIndex(null);
  };

  const saveAddressesToDB = async (updatedAddresses) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axios.put(
        "http://localhost:5000/api/users/me",
        {
          addresses: updatedAddresses,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      toast.success("Address saved successfully");

      fetchProfile();
    } catch (err) {
      console.log(err);
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let updatedAddresses = [];

    if (editIndex !== null) {
      updatedAddresses = [...addresses];

      updatedAddresses[editIndex] = formData;
    } else {
      updatedAddresses = [...addresses, formData];
    }

    setAddresses(updatedAddresses);

    await saveAddressesToDB(updatedAddresses);

    resetForm();
    setShowForm(false);
  };

  const handleEdit = (index) => {
    setFormData(addresses[index]);
    setEditIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    const updated = addresses.filter((_, i) => i !== index);

    setAddresses(updated);

    await saveAddressesToDB(updated);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Saved Addresses</h2>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 text-primary font-medium"
        >
          <Plus size={18} />
          Add New
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {addresses.map((item, index) => (
          <div
            key={index}
            className="border border-blue-200 rounded-xl p-5 bg-white"
          >
            <div className="space-y-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-semibold">
                {item.fullName}
              </span>

              <p>
                House No:
                {item.house}
              </p>

              <p>{item.street}</p>

              <p>
                {item.city},{item.state} -{item.zip_code}
              </p>

              <p>{item.phone}</p>
            </div>

            <div className="border-t mt-4 pt-3 flex gap-4">
              <button
                onClick={() => handleEdit(index)}
                className="text-blue-600 font-medium"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(index)}
                className="text-red-500 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">
                {editIndex !== null ? "Edit Address" : "Add Address"}
              </h2>

              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                />

                <input
                  name="house"
                  placeholder="House No"
                  value={formData.house}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                />

                <input
                  name="street"
                  placeholder="Street"
                  value={formData.street}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                />

                <input
                  name="city"
                  placeholder="City"
                  value={formData.city}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                />

                <input
                  name="state"
                  placeholder="State"
                  value={formData.state}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                />

                <input
                  name="zip_code"
                  placeholder="Zip Code"
                  value={formData.zip_code}
                  onChange={handleChange}
                  className="border p-3 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>

                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : editIndex !== null
                      ? "Update"
                      : "Save Address"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Address;
