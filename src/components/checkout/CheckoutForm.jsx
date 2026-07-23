import {
  ArrowLeft,
  MapPin,
  Plus,
  X,
  Phone,
  Minus,
  ShoppingBag,
  Star,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/helper";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import api from "../../services/api";

const getSingleImage = (product, variant) => {
  const productImages = product?.images;
  if (Array.isArray(productImages) && productImages.length > 0) {
    return productImages[0];
  }
  if (productImages) return productImages;

  const variantImages = Array.isArray(variant?.images)
    ? variant.images
    : variant?.images
      ? [variant.images]
      : [];
  return variantImages[0] || "";
};

function ProductPopup({ item, onClose }) {
  const navigate = useNavigate();
  if (!item) return null;

  const product = item.product_data || item.product_id || {};
  const variant = item.variant_data || item.variant_id || {};
  const originalPrice = Number(item?.original_price || variant?.price || 0);
  const offerPrice = Number(item?.price || variant?.offerprice || 0);
  const discountedPrice =
    offerPrice > 0 && offerPrice < originalPrice ? offerPrice : originalPrice;
  const discount =
    originalPrice > discountedPrice
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : product?.discount_id?.value || 0;

  const imgSrc = getImageUrl(getSingleImage(product, variant));

  const productId =
    product?._id ||
    (typeof item.product_id === "string" ? item.product_id : null);
  const categories = product?.categories || [];

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

function AddAddressPopup({
  onClose,
  onSaved,
  existingAddresses,
  editIndex = null,
  initialData = null,
}) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(
    initialData || {
      fullName: "",
      phone: "",
      email: "",
      house: "",
      street: "",
      city: "",
      state: "",
      country: "",
      zip_code: "",
    },
  );

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const fetchLocationFromPincode = async (pincode) => {
    if (pincode.length !== 6) return;

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      );
      const data = await res.json();

      if (data?.[0]?.Status === "Success" && data[0].PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setForm((prev) => ({
          ...prev,
          city: postOffice.Name || prev.city,
          state: postOffice.State || prev.state,
          country: postOffice.Country || "India",
        }));
      } else {
        toast.error("Invalid pincode, please check again");
      }
    } catch (err) {
      toast.error("Failed to fetch location. Enter manually.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const list = Array.isArray(existingAddresses)
        ? [...existingAddresses]
        : [];
      let newIndex;

      if (editIndex !== null && editIndex !== undefined) {
        list[editIndex] = form;
        newIndex = editIndex;
      } else {
        list.push(form);
        newIndex = list.length - 1;
      }

      await api.put("/users/me", { addresses: list });

      toast.success(editIndex !== null ? "Address updated!" : "Address saved!");

      onSaved(list, newIndex);
      onClose();
    } catch (err) {
      toast.error("Failed to save address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[60vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold text-gray-900">
            {editIndex !== null ? "Edit Address" : "Add New Address"}
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
                label: "Full name *",
                placeholder: "Full Name ",
                required: "required",
              },
              {
                name: "phone",
                label: "phone *",
                placeholder: "Phone *",
                required: "required",
              },
              { name: "email", label: "email", placeholder: "email" },
              {
                name: "house",
                label: "Address line 1 *",
                placeholder: "House No & Flat ",
                required: "required",
              },
              {
                name: "street",
                label: "Address line 2 *",
                placeholder: "Street & Area ",
                required: "required",
              },
              {
                name: "zip_code",
                label: "zip code *",
                placeholder: "Zip Code",
                required: "required",
              },
              {
                name: "city",
                label: "city *",
                placeholder: "City",
                required: "required",
              },
              {
                name: "state",
                label: "state *",
                placeholder: "State",
                required: "required",
              },

              { name: "country", label: "country", placeholder: "Country" },
            ].map(({ name, placeholder, required, label }) => (
              <>
                <div className="flex flex-col">
                  <label>{label}</label>
                  <input
                    key={name}
                    name={name}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={(e) => {
                      if (name === "phone") {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10) {
                          setForm((prev) => ({ ...prev, phone: value }));
                        }
                      } else if (name === "zip_code") {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 6) {
                          setForm((prev) => ({ ...prev, zip_code: value }));
                          if (value.length === 6) {
                            fetchLocationFromPincode(value);
                          }
                        }
                      } else {
                        handleChange(e);
                      }
                    }}
                    className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    required={required}
                  />
                </div>
              </>
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

function SelectedAddressCard({ address, onEdit }) {
  if (!address) return null;
  return (
    <div className="border-2 border-primary rounded-2xl p-4 mt-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-white text-[11px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
            {address.city || address.fullName}
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
      <button
        onClick={onEdit}
        className="text-primary font-bold mt-3 hover:underline"
      >
        Edit
      </button>
    </div>
  );
}

function ReviewOrder({ items, quantities, onIncrease, onDecrease, giftItem }) {
  const [popupItem, setPopupItem] = useState(null);
  const [giftProducts, setGiftProducts] = useState([]);
  const [buyXGetYProducts, setBuyXGetYProducts] = useState([]);
  const getProduct = (item) => item.product_data || item.product_id || {};
  const getVariant = (item) => item.variant_data || item.variant_id || {};

  useEffect(() => {
    if (!giftItem) {
      setGiftProducts([]);
      return;
    }
    let ids = [];
    if (giftItem.product_ids?.length > 0) {
      ids = giftItem.product_ids;
    } else if (giftItem.gift_product_ids?.length > 0) {
      ids = giftItem.gift_product_ids;
    } else if (giftItem.products?.length > 0) {
      ids = giftItem.products;
    } else if (giftItem.product_id) {
      ids = [giftItem.product_id];
    } else if (giftItem.gift_product_id) {
      ids = [giftItem.gift_product_id];
    }

    if (ids.length === 0) {
      setGiftProducts([]);
      return;
    }
    const fetchAllGiftProducts = async () => {
      const results = await Promise.all(
        ids.map(async (pid) => {
          if (typeof pid === "object" && pid?.name) {
            return pid;
          }

          const id = typeof pid === "object" ? pid._id : pid;

          try {
            const res = await api.get(`/products/${id}`);
            const product = res.data?.data?.product || res.data?.data || null;
            return product;
          } catch (err) {
            return null;
          }
        }),
      );

      const filtered = results.filter(Boolean);
      setGiftProducts(filtered);
    };

    fetchAllGiftProducts();
  }, [giftItem]);

  useEffect(() => {
    if (!giftItem || giftItem.type !== "buy_x_get_y") {
      setBuyXGetYProducts([]);
      return;
    }
    const fetchAll = async () => {
      const results = await Promise.all(
        (giftItem.items || []).map(async (gi) => {
          const pid =
            typeof gi.product_id === "object"
              ? gi.product_id._id
              : gi.product_id;

          const cartItem = items.find(
            (it) => String(it.product_id?._id || it.product_id) === String(pid),
          );
          if (cartItem?.product_id?.name) {
            return { ...gi, productData: cartItem.product_id };
          }
          try {
            const res = await api.get(`/products/${pid}`);
            return {
              ...gi,
              productData: res.data?.data?.product || res.data?.data || null,
            };
          } catch {
            return { ...gi, productData: null };
          }
        }),
      );
      setBuyXGetYProducts(results);
    };
    fetchAll();
  }, [giftItem, items]);

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
            to="/allproducts"
            className="flex items-center gap-1.5 text-primary text-sm font-medium hover:underline"
          >
            <ArrowLeft size={14} />
            Continue Shopping
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {items.map((item, index) => {
            const key = item._id || item.product_id?._id;
            const qty = quantities[key] || 1;
            const { originalPrice, discountedPrice } = getDiscountedPrice(item);
            const prod = getProduct(item);
            const vrnt = getVariant(item);
            const imgSrc = getImageUrl(getSingleImage(prod, vrnt));

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

                <div className="w-full">
                  <div className="flex flex-col md:flex-row justify-between">
                    <button
                      onClick={() => setPopupItem(item)}
                      className="text-left focus:outline-none"
                    >
                      <p className="text-[18px] font-semibold text-gray-800 leading-tight mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
                        {item.product_id?.name}
                      </p>
                    </button>
                    <div className="flex-shrink-0">
                      <div className="inline-flex items-center border border-gray-200 rounded-[8px] overflow-hidden bg-gray-50">
                        <button
                          onClick={() => onDecrease(item)}
                          disabled={qty <= 1}
                          className="w-[34px] h-[34px] flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-[34px] h-[34px] flex items-center justify-center text-[14px] font-semibold text-gray-900 border-x border-gray-200 bg-white">
                          {qty}
                        </span>
                        <button
                          onClick={() => onIncrease(item)}
                          disabled={qty >= 20}
                          className="w-[34px] h-[34px] flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <span>Pack of :{item.pack_of}</span>
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
              </div>
            );
          })}
        </div>
      </div>

      {giftItem && giftProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-yellow-200 shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-yellow-100 bg-yellow-50">
            <span className="text-lg">🎁</span>
            <span className="text-[15px] font-semibold text-yellow-800">
              Free Gift{giftProducts.length > 1 ? "s" : ""} Added!
              {giftProducts.length > 1 && (
                <span className="ml-2 text-[12px] font-normal text-yellow-600">
                  ({giftProducts.length} items)
                </span>
              )}
            </span>
          </div>

          {giftProducts.map((giftProduct, idx) => (
            <div
              key={giftProduct._id || idx}
              className={`flex gap-4 px-5 py-4 items-start ${
                idx < giftProducts.length - 1
                  ? "border-b border-yellow-100"
                  : ""
              }`}
            >
              <div className="w-[80px] h-[80px] overflow-hidden bg-gray-50 rounded-xl flex-shrink-0">
                <img
                  src={getImageUrl(giftProduct?.images)}
                  alt={giftProduct?.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-gray-800 leading-tight mb-1">
                  {giftProduct?.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[15px] font-bold text-green-600">
                    FREE
                  </span>
                  {giftProduct?.price > 0 && (
                    <span className="text-[13px] text-gray-400 line-through">
                      ₹{Number(giftProduct.price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <span className="inline-block mt-2 text-[11px] font-semibold text-yellow-700 bg-yellow-100 border border-yellow-200 px-2 py-0.5 rounded-full">
                  🎁 Gift with coupon
                </span>
              </div>

              <div className="flex-shrink-0">
                <span className="inline-block bg-green-100 text-green-700 text-[12px] font-semibold px-3 py-1 rounded-lg">
                  QTY: 1
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {giftItem?.type === "buy_x_get_y" && buyXGetYProducts.length > 0 && (
        <div className="bg-white rounded-2xl border border-green-200 shadow-sm mb-6 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-green-100 bg-green-50">
            <span className="text-lg">🎉</span>
            <span className="text-[15px] font-semibold text-green-800">
              You get {giftItem.getQty} item(s) FREE!
            </span>
          </div>
          {buyXGetYProducts.map((gi, idx) => (
            <div
              key={idx}
              className="flex gap-4 px-5 py-4 items-start border-b border-gray-50 last:border-0"
            >
              <div className="w-[80px] h-[80px] overflow-hidden bg-gray-50 rounded-xl flex-shrink-0">
                <img
                  src={getImageUrl(gi.productData?.images)}
                  alt={gi.productData?.name}
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-semibold text-gray-800 leading-tight mb-1">
                  {gi.productData?.name || "Free Item"}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[15px] font-bold text-green-600">
                    FREE
                  </span>
                  {gi.original_price > 0 && (
                    <span className="text-[13px] text-gray-400 line-through">
                      ₹{Number(gi.original_price).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
                <span className="inline-block mt-2 text-[11px] font-semibold text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                  🎉 Buy X Get Y Free
                </span>
              </div>
              <div className="flex-shrink-0">
                <span className="inline-block bg-green-100 text-green-700 text-[12px] font-semibold px-3 py-1 rounded-lg">
                  QTY: {gi.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {popupItem && (
        <ProductPopup item={popupItem} onClose={() => setPopupItem(null)} />
      )}
    </>
  );
}

export default function CheckoutForm({
  formData,
  setFormData,
  setShowLoginPopup,
  items,
  quantities,
  onIncrease,
  onDecrease,
  giftItem,
}) {
  const [addresses, setAddresses] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [fetchingAddresses, setFetchingAddresses] = useState(true);
  const [editingIndex, setEditingIndex] = useState(null);

  const syncFormData = useCallback(
    (addrs, index) => {
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
    },
    [setFormData],
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/users/me");
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
  }, [syncFormData]);

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
  const handleAddAddressClick = () => {
    const userLS = JSON.parse(localStorage.getItem("user"));
    if (!userLS?._id) {
      setEditingIndex(null);
      setShowLoginPopup(true);
      return;
    }
    setShowPopup(true);
  };
  const handleEditAddressClick = () => {
    setEditingIndex(selectedIndex);
    setShowPopup(true);
  };

  return (
    <div className="flex-1">
      <ReviewOrder
        items={items}
        quantities={quantities}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        giftItem={giftItem}
      />

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
              onClick={handleAddAddressClick}
              className="flex items-center gap-1.5 !min-w-[140px]  font-semibold text-[13px] hover:underline"
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
              <Button
                variant="common"
                onClick={handleAddAddressClick}
                className="inline-flex items-center gap-2  text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                <Plus size={15} />
                Add New Address
              </Button>
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
              <SelectedAddressCard
                address={selectedAddress}
                onEdit={handleEditAddressClick}
              />
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
          onClose={() => {
            setShowPopup(false);
            setEditingIndex(null);
          }}
          onSaved={handleAddressSaved}
          existingAddresses={addresses}
          editIndex={editingIndex}
          initialData={editingIndex !== null ? addresses[editingIndex] : null}
        />
      )}
    </div>
  );
}
