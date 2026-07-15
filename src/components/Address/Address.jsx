import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

function Address() {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    house: "",
    street: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  });

  const fetchLocationFromPincode = async (pincode) => {
    if (pincode.length !== 6) return;

    setPincodeLoading(true);
    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      const data = await res.json();

      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData((prev) => ({
          ...prev,
          city: postOffice.District || prev.city,
          state: postOffice.State || prev.state,
          country: postOffice.Country || "India",
        }));
      } else {
        toast.error("Invalid pincode, please check again");
      }
    } catch (err) {
      console.error("Pincode fetch error:", err);
      toast.error("Failed to fetch location. Enter manually.");
    } finally {
      setPincodeLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/me");

      setAddresses(res.data.data.user.addresses || []);
    } catch (err) {}
  };

  const saveAddressesToDB = async (updatedAddresses) => {
    try {
      setLoading(true);

      await api.put("/users/me", {
        addresses: updatedAddresses,
      });

      toast.success("Address saved successfully");

      fetchProfile();
    } catch (err) {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
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
      email: "",
      phone: "",
      house: "",
      street: "",
      city: "",
      state: "",
      country: "",
      zip_code: "",
    });

    setEditIndex(null);
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
    <>
      <div className="flex items-center justify-between mb-3">
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-3xl overflow-y-auto  h-[600px]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-semibold">
                {editIndex !== null ? "Edit Address" : "Add Address"}
              </h2>

              <button onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    name="fullName"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="border p-3 rounded-lg"
                    required
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) {
                        setFormData({
                          ...formData,
                          phone: value,
                        });
                      }
                    }}
                    className="border p-3 rounded-lg"
                    maxLength={10}
                    minLength={10}
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label>Email </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="border p-3 rounded-lg"
                  />
                </div>

                <div className="flex flex-col">
                  <label>Address line 1 </label>
                  <input
                    name="house"
                    placeholder="House No"
                    value={formData.house}
                    onChange={handleChange}
                    className="border p-3 rounded-lg"
                  />
                </div>

                <div className="flex flex-col">
                  <label>Address line 2</label>
                  <input
                    name="street"
                    placeholder="Street"
                    value={formData.street}
                    onChange={handleChange}
                    className="border p-3 rounded-lg"
                  />
                </div>

                <div className="flex flex-col">
                  <label>City </label>
                  <input
                    name="city"
                    placeholder="City (auto-filled from pincode)"
                    value={formData.city}
                    onChange={handleChange}
                    className="border p-3 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>

                <div className="flex flex-col">
                  <label>State *</label>
                  <input
                    name="state"
                    placeholder="State (auto-filled from pincode)"
                    value={formData.state}
                    onChange={handleChange}
                    className="border p-3 rounded-lg bg-gray-50"
                    readOnly
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label>cuntry</label>
                  <input
                    name="country"
                    placeholder="cuntry"
                    value={formData.country}
                    onChange={handleChange}
                    className="border p-3 rounded-lg"
                  />
                </div>

                <div className="flex flex-col">
                  <label>Pin Code *</label>
                  <input
                    name="zip_code"
                    placeholder="Zip Code"
                    value={formData.zip_code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 6) {
                        setFormData((prev) => ({ ...prev, zip_code: value }));
                        if (value.length === 6) {
                          fetchLocationFromPincode(value);
                        }
                      }
                    }}
                    className="border p-3 rounded-lg"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>

                <Button type="submit" variant="common" disabled={loading}>
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
    </>
  );
}

export default Address;
