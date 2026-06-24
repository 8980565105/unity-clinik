import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  deleteCartItem,
  fetchCart,
  updateCartItem,
} from "../../features/cart/cartThunk";
import { updateLocalQuantity } from "../../features/cart/cartSlice";
import { getImageUrl } from "../utils/helper";
import Loding from "../loding/loding";
import { X, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
      : 0;

  const imgSrc =
    item.variant_id?.images?.length > 0
      ? getImageUrl(item.variant_id.images[0])
      : getImageUrl(item.product_id?.images?.[0]);

  const handleViewFull = () => {
    onClose();
    navigate(`/products/${item.product_id?._id}`);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-[420px] overflow-hidden shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          <X size={16} />
        </button>

        <div className="bg-gray-50 flex justify-center items-center py-8 px-6">
          <img
            src={imgSrc}
            alt={item.product_id?.name}
            className="w-[220px] h-[220px] object-contain hover:scale-110 transition-transform duration-500"
          />
        </div>

        <div className="p-6">
          <h3 className="text-[20px] font-bold text-gray-900 mb-4">
            {item.product_id?.name}
          </h3>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-[24px] font-bold text-gray-900">
              ₹{Math.round(discountedPrice).toLocaleString("en-IN")}
            </span>

            {originalPrice > discountedPrice && (
              <span className="text-[15px] text-gray-400 line-through">
                ₹{Math.round(originalPrice).toLocaleString("en-IN")}
              </span>
            )}

            {discount > 0 && (
              <span className="bg-green-100 text-green-700 text-[12px] font-semibold px-2 py-1 rounded-full flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                {discount}% OFF
              </span>
            )}
          </div>

          <button
            onClick={handleViewFull}
            className="w-full bg-primary hover:bg-[#154f97] text-white font-semibold py-3 rounded-xl transition"
          >
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
}
export default function CartItem() {
  const { items = [], loading } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [popupItem, setPopupItem] = useState(null);
  useEffect(() => {
    const cart_id = localStorage.getItem("cart_id");
    if (cart_id) dispatch(fetchCart(cart_id));
  }, [dispatch, user]);

  const handleIncrease = (item) => {
    const cart_id = localStorage.getItem("cart_id");
    if (!cart_id) return;
    const newQuantity = item.quantity + 1;
    if (newQuantity > 20) {
      toast.error("Maximum 20 quantity allowed per item");
      return;
    }
    toast.success("cart updated Successfully!");
    dispatch(updateLocalQuantity({ item_id: item._id, quantity: newQuantity }));
    dispatch(
      updateCartItem({ cart_id, item_id: item._id, quantity: newQuantity }),
    )
      .unwrap()
      .catch(() =>
        dispatch(
          updateLocalQuantity({ item_id: item._id, quantity: item.quantity }),
        ),
      );
  };

  const handleDecrease = (item) => {
    const cart_id = localStorage.getItem("cart_id");
    if (!cart_id || item.quantity <= 1) return;
    const newQuantity = item.quantity - 1;
    toast.success("cart updated Successfully!");
    dispatch(updateLocalQuantity({ item_id: item._id, quantity: newQuantity }));
    dispatch(
      updateCartItem({ cart_id, item_id: item._id, quantity: newQuantity }),
    )
      .unwrap()
      .catch(() =>
        dispatch(
          updateLocalQuantity({ item_id: item._id, quantity: item.quantity }),
        ),
      );
  };

  const handleDelete = (item_id) => {
    const cart_id = localStorage.getItem("cart_id");
    if (!cart_id) return;
    dispatch(deleteCartItem({ cart_id, item_id }))
      .unwrap()
      .then(() => dispatch(fetchCart(cart_id)));
  };

  const getDiscountedPrice = (item) => {
    const originalPrice = Number(
      item?.original_price || item?.variant_id?.price || 0,
    );
    const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);
    const discountPercent =
      originalPrice > offerPrice
        ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
        : 0;
    return {
      discount: discountPercent,
      originalPrice,
      discountedPrice: offerPrice,
    };
  };

  if (loading) return <Loding className="!h-[300px]" />;
  if (!items.length)
    return <p className="text-center mb-[100px] py-10">Your cart is empty.</p>;

  return (
    <>
      <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-[24px] py-[18px] border-b border-gray-100">
          <span className="text-[24px] font-bold text-gray-900 mb-6 tracking-tight">
            Carts items is ({items.length})
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {items.map((item) => {
            const { originalPrice, discountedPrice } = getDiscountedPrice(item);

            return (
              <div
                key={item._id}
                className="flex gap-[16px] px-[24px] py-[20px]"
              >
                <button
                  onClick={() => setPopupItem(item)}
                  className="flex-shrink-0"
                >
                  <div className="w-[100px] h-[100px] bg-gray-50 overflow-hidden hover:scale-110 transition-transform duration-500">
                    <img
                      src={getImageUrl(item.product_id?.images)}
                      alt={item.product_id?.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </button>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-[8px]">
                    <button
                      onClick={() => setPopupItem(item)}
                      className="text-left"
                    >
                      <p
                        className="text-[18px] font-semibold text-gray-900 hover:text-primary leading-[1.45] flex-1"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.product_id?.name}
                      </p>
                    </button>

                    <button
                      onClick={() => handleDelete(item._id)}
                      className="flex-shrink-0 w-[30px] h-[30px] flex items-center justify-center rounded-[6px] text-white bg-red-500 transition-colors mt-[-2px]"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-[14px]">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-[17px] font-bold text-gray-900">
                        ₹{Math.round(discountedPrice).toLocaleString("en-IN")}
                      </span>
                      {originalPrice > discountedPrice && (
                        <span className="text-[13px] text-gray-400 line-through">
                          ₹{Math.round(originalPrice).toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>

                    <div className="inline-flex items-center border border-gray-200 rounded-[8px] overflow-hidden bg-gray-50">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={item.quantity <= 1}
                        className="w-[34px] h-[34px] flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-[34px] h-[34px] flex items-center justify-center text-[14px] font-semibold text-gray-900 border-x border-gray-200 bg-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={item.quantity >= 20}
                        className="w-[34px] h-[34px] flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
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
