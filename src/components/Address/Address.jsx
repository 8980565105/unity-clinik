import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyAddress,
  updateMyAddress,
  updateUserAddressById,
} from "../../features/address/addressThunk";
import { clearAddressStatus } from "../../features/address/addressSlice";
import Button from "../ui/Button";
import toast, { Toaster } from "react-hot-toast";

function Address({ userId = null }) {
  const dispatch = useDispatch();
  const { address, loading, error, successMessage } = useSelector(
    (state) => state.address,
  );

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  });

  useEffect(() => {
    dispatch(fetchMyAddress());
  }, [dispatch, userId]);

  useEffect(() => {
    if (address) {
      setFormData({
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        country: address.country || "",
        zip_code: address.zip_code || "",
      });
    }
  }, [address]);
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearAddressStatus());
    }
    if (error) {
      toast.error(error);
      dispatch(clearAddressStatus());
    }
  }, [successMessage, error, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (userId) {
      dispatch(updateUserAddressById({ id: userId, addressData: formData }));
    } else {
      dispatch(updateMyAddress(formData));
    }
  };

  return (
    <div>
      <Toaster />

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Street Address
              </label>
              <input
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:var(--primary-color) outline-none transition"
                placeholder="123 Street Name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                City
              </label>
              <input
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:var(--primary-color) outline-none"
                placeholder="Surat"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                State
              </label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:var(--primary-color) outline-none"
                placeholder="Gujarat"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Country
              </label>
              <input
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:var(--primary-color) outline-none"
                placeholder="India"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Zip Code
              </label>
              <input
                type="text"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:var(--primary-color) outline-none"
                placeholder="395001"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" variant="common" disabled={loading}>
              {loading ? "Processing..." : "Save Address"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Address;
