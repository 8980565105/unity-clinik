import {
  ArrowLeft,
  MapPin,
  Plus,
  X,
  Phone,
  ShoppingBag,
  Tag,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";
import axios from "axios";
import toast from "react-hot-toast";
import Button from "../ui/Button";

function ProductPopup({ item, onClose }) {
  const navigate = useNavigate();
  if (!item) return null;

  const originalPrice = Number(
    item?.original_price || item?.variant_id?.price || 0,
  );
  const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);
  const discountedPrice =
    offerPrice > 0 && offerPrice < originalPrice ? offerPrice : originalPrice;
  const discount =
    originalPrice > discountedPrice
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : item?.product_id?.discount_id?.value || 0;

  const imgSrc =
    item.variant_id?.images?.length > 0
      ? getImageUrl(item.variant_id.images[0])
      : getImageUrl(item.product_id?.images?.[0]);

  const productId = item.product_id?._id;
  const categories = item.product_id?.categories || [];

  const handleViewFull = () => {
    onClose();
    navigate(`/products/${productId}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative bg-gray-50 flex items-center justify-center px-8 pt-8 pb-6"
          style={{ position: "relative" }}
        >
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={16} />
          </button>
          <img
            src={imgSrc}
            alt={item.product_id?.name}
            className="w-[200px] h-[200px] object-contain hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="px-6 pb-6 pt-4">
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map((cat, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wide"
                >
                  {cat?.name || cat}
                </span>
              ))}
            </div>
          )}

          <h3 className="text-[18px] font-bold text-gray-900 leading-snug mb-3">
            {item.product_id?.name}
          </h3>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-[22px] font-bold text-gray-900">
              ₹{Math.round(discountedPrice).toLocaleString("en-IN")}
            </span>
            {originalPrice > discountedPrice && (
              <span className="text-[14px] text-gray-400 line-through">
                ₹{Math.round(originalPrice).toLocaleString("en-IN")}
              </span>
            )}
            {discount > 0 && (
              <span className="flex items-center gap-1 text-[12px] font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                <Star size={10} fill="currentColor" />
                SAVE {discount}%
              </span>
            )}
          </div>

          <button
            onClick={handleViewFull}
            className="w-full bg-primary text-white font-semibold text-[14px] py-3.5 rounded-xl transition-colors"
          >
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
}

function AddAddressPopup({ onClose, onSaved, existingAddresses }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
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

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const required = [
      "fullName",
      "phone",
      "email",
      "house",
      "street",
      "city",
      "state",
      "zip_code",
    ];
    for (const key of required) {
      if (!form[key]?.trim()) {
        toast.error(`Please fill: ${key}`);
        return;
      }
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const updated = [...existingAddresses, form];
      await axios.put(
        "http://localhost:5000/api/users/me",
        { addresses: updated },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      toast.success("Address saved!");
      onSaved(updated, updated.length - 1);
      onClose();
    } catch {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold text-gray-900">
            Add New Address
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                name: "fullName",
                placeholder: "Full Name *",
                required: "required",
              },
              { name: "phone", placeholder: "Phone *", required: "required" },
              { name: "email", placeholder: "email" },
              { name: "house", placeholder: "House No & Flat " },
              { name: "street", placeholder: "Street & Area " },
              { name: "city", placeholder: "City" },
              { name: "state", placeholder: "State", required: "required" },
              {
                name: "zip_code",
                placeholder: "Zip Code",
                required: "required",
              },
              { name: "country", placeholder: "Country" },
            ].map(({ name, placeholder, required }) => (
              <input
                key={name}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
                className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                required={required}
              />
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {loading ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SelectedAddressCard({ address }) {
  if (!address) return null;
  return (
    <div className="border-2 border-primary rounded-2xl p-4 mt-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
            {address.city || address.fullName}
          </span>
          <span className="font-semibold text-sm text-gray-800 line-clamp-1">
            {address.street}
          </span>
        </div>
        <span className="text-[11px] font-bold text-primary bg-blue-50 border border-primary px-2.5 py-1 rounded-lg tracking-wide flex-shrink-0">
          SELECTED
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">
            Delivery Address
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {address.house}, {address.street}
          </p>
          <p className="text-sm text-gray-700">
            {address.city}, {address.state} - {address.zip_code}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-semibold">
            Contact Details
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Phone size={13} className="text-blue-600" />
            </div>
            {address.phone}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewOrder({ items }) {
  const [popupItem, setPopupItem] = useState(null);

  if (!items || items.length === 0) return null;

  const getDiscountedPrice = (item) => {
    const originalPrice = Number(
      item?.original_price || item?.variant_id?.price || 0,
    );
    const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);
    if (offerPrice > 0 && offerPrice < originalPrice)
      return { originalPrice, discountedPrice: offerPrice };
    const discount = item?.product_id?.discount_id?.value || 0;
    const discountedPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;
    return { originalPrice, discountedPrice };
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={16} className="text-gray-500" />
            <span className="text-[15px] font-semibold text-gray-900">
              Review your order
            </span>
          </div>
          <Link
            to="/shop"
            className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {items.map((item, index) => {
            const { originalPrice, discountedPrice } = getDiscountedPrice(item);
            const qty = item.quantity || 1;
            const imgSrc =
              item.variant_id?.images?.length > 0
                ? getImageUrl(item.variant_id.images[0])
                : getImageUrl(item.product_id?.images?.[0]);

            return (
              <div
                key={item._id || index}
                className="flex gap-4 px-5 py-4 items-start"
              >
                <button
                  onClick={() => setPopupItem(item)}
                  className="flex-shrink-0 focus:outline-none"
                >
                  <div className="w-[80px] h-[80px] overflow-hidden bg-gray-50 hover:scale-110 transition-transform duration-500">
                    <img
                      src={imgSrc}
                      alt={item.product_id?.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                </button>

                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setPopupItem(item)}
                    className="text-left focus:outline-none"
                  >
                    <p className="text-[18px] font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                      {item.product_id?.name}
                    </p>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-gray-900">
                      ₹{Math.round(discountedPrice).toLocaleString("en-IN")}
                    </span>
                    {originalPrice > discountedPrice && (
                      <span className="text-[12px] text-gray-400 line-through">
                        ₹{Math.round(originalPrice).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right">
                  <span className="inline-block bg-gray-100 text-gray-700 text-[12px] font-semibold px-3 py-1 rounded-lg">
                    QTY: {qty}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {popupItem && (
        <ProductPopup item={popupItem} onClose={() => setPopupItem(null)} />
      )}
    </>
  );
}

export default function CheckoutForm({ formData, setFormData }) {
  const { items = [] } = useSelector((state) => state.cart);

  const [addresses, setAddresses] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const savedAddresses = res.data?.data?.user?.addresses || [];
        setAddresses(savedAddresses);
        if (savedAddresses.length > 0) {
          syncFormData(savedAddresses, 0);
        }
      } catch (err) {
        console.error("Failed to load addresses:", err);
      } finally {
        setFetchingAddresses(false);
      }
    };
    fetchProfile();
  }, []);

  const syncFormData = (addrs, index) => {
    const a = addrs[index];
    if (!a) return;
    setFormData((prev) => ({
      ...prev,
      firstName: a.fullName?.split(" ")?.[0] || a.fullName || "",
      lastName: a.fullName?.split(" ")?.slice(1)?.join(" ") || "",
      address: `${a.house}, ${a.street}`,
      country: a.country || "India",
      state: a.state || "",
      city: a.city || "",
      pincode: a.zip_code || "",
      phone: a.phone || "",
    }));
  };

  const handleSelectChange = (e) => {
    const idx = Number(e.target.value);
    setSelectedIndex(idx);
    syncFormData(addresses, idx);
  };

  const handleAddressSaved = (updatedAddresses, newIndex) => {
    setAddresses(updatedAddresses);
    setSelectedIndex(newIndex);
    syncFormData(updatedAddresses, newIndex);
  };

  const selectedAddress = addresses[selectedIndex] || null;

  return (
    <div className="flex-1">
      <ReviewOrder items={items} />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <MapPin size={15} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-gray-900">
                  Delivery Address
                </h2>
                <p className="text-[12px] text-gray-400">
                  Select where to send your order
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowPopup(true)}
              className="flex items-center gap-1.5  font-semibold text-[13px] hover:underline"
            >
              <Plus size={15} />
              Add New
            </Button>
          </div>
        </div>

        <div className="px-5 py-4">
          {fetchingAddresses ? (
            <div className="flex items-center gap-3 py-4">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
              <MapPin size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm font-medium mb-1">
                No saved addresses
              </p>
              <p className="text-gray-400 text-xs mb-4">
                Add your delivery address to continue
              </p>
              <button
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus size={15} />
                Add New Address
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <select
                  value={selectedIndex}
                  onChange={handleSelectChange}
                  className="w-full border-[1.5px] border-gray-200 bg-white text-gray-800 rounded-xl px-4 py-3 text-sm font-medium appearance-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary cursor-pointer transition-all"
                >
                  {addresses.map((addr, idx) => (
                    <option key={idx} value={idx}>
                      {addr.city?.toUpperCase() || addr.fullName?.toUpperCase()}{" "}
                      – Saved Address
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  ▾
                </span>
              </div>
              <SelectedAddressCard address={selectedAddress} />
            </>
          )}
        </div>
      </div>
      <Link
        to="/cart"
        className="flex gap-2 items-center text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2 mb-8"
      >
        <ArrowLeft size={15} />
        Back to cart
      </Link>

      {showPopup && (
        <AddAddressPopup
          onClose={() => setShowPopup(false)}
          onSaved={handleAddressSaved}
          existingAddresses={addresses}
        />
      )}
    </div>
  );
}
