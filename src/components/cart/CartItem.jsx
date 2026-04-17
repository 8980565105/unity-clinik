import remove from "../../assets/remove.png";
import { Minus, Plus } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteCartItem,
  fetchCart,
  updateCartItem,
} from "../../features/cart/cartThunk";
import { updateLocalQuantity } from "../../features/cart/cartSlice";
import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/helper";
import { Toaster } from "react-hot-toast";

export default function CartItem() {
  const { items = [], loading } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const cart_id = localStorage.getItem("cart_id");
    if (cart_id) {
      dispatch(fetchCart(cart_id));
    }
  }, [dispatch, user]);

  if (loading) return <p className="text-center py-10">Loading cart...</p>;
  if (!items.length)
    return <p className="text-center mb-[100px] py-10">Your cart is empty.</p>;

  const handleIncrease = (item) => {
    const cart_id = localStorage.getItem("cart_id");
    if (!cart_id) return;
    const newQuantity = item.quantity + 1;

    // Optimistic update — UI instantly updates, no reload
    dispatch(updateLocalQuantity({ item_id: item._id, quantity: newQuantity }));

    // Sync to backend silently — NO fetchCart after this
    dispatch(
      updateCartItem({ cart_id, item_id: item._id, quantity: newQuantity }),
    )
      .unwrap()
      .catch(() => {
        // Revert on failure
        dispatch(
          updateLocalQuantity({ item_id: item._id, quantity: item.quantity }),
        );
      });
  };

  const handleDecrease = (item) => {
    const cart_id = localStorage.getItem("cart_id");
    if (!cart_id || item.quantity <= 1) return;
    const newQuantity = item.quantity - 1;

    // Optimistic update — UI instantly updates, no reload
    dispatch(updateLocalQuantity({ item_id: item._id, quantity: newQuantity }));

    // Sync to backend silently — NO fetchCart after this
    dispatch(
      updateCartItem({ cart_id, item_id: item._id, quantity: newQuantity }),
    )
      .unwrap()
      .catch(() => {
        dispatch(
          updateLocalQuantity({ item_id: item._id, quantity: item.quantity }),
        );
      });
  };

  const handleDelete = (item_id) => {
    const cart_id = localStorage.getItem("cart_id");
    if (!cart_id) return Toaster("No cart found!");

    // fetchCart is fine here — delete kare to refresh jaruri se
    dispatch(deleteCartItem({ cart_id, item_id }))
      .unwrap()
      .then(() => dispatch(fetchCart(cart_id)));
  };

  const getDiscountedPrice = (item) => {
    const discount = item?.product_id?.discount_id?.value || 0;
    const originalPrice = item?.variant_id?.price || 0;
    const discountedPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;
    return { discount, originalPrice, discountedPrice };
  };

  return (
    <div className="w-full">
      {/* Desktop View */}
      <table className="w-full hidden custom-lg:table">
        <thead className="table-header-group">
          <tr className="border-b border-black font-18">
            <th></th>
            <th className="text-left pt-0 p-4 font-normal">Product Image</th>
            <th className="text-center pt-0 p-4 font-normal">Product Name</th>
            <th className="text-left pt-0 p-4 font-normal">Quantity</th>
            <th className="text-left pt-0 p-4 font-normal">Unit Price</th>
            <th className="text-center pt-0 p-4 font-normal">Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={index}
              className="border-b light-border font-18 sec-text-color"
            >
              <td className="text-center pt-[40px] pb-[20px]">
                <button
                  className="w-[20px] h-[20px]"
                  onClick={() => handleDelete(item._id)}
                >
                  <img src={remove} alt="remove" />
                </button>
              </td>
              <td className="px-3 xl:px-6 w-[182px] pt-[40px] pb-[20px]">
                <Link to={`/products/${item.product_id?._id}`}>
                  <img
                    src={
                      item.variant_id?.images?.length > 0
                        ? getImageUrl(item.variant_id.images[0])
                        : getImageUrl(item.product_id?.images?.[0])
                    }
                    alt={item.product_id?.name}
                    className="box-shadow object-cover p-[5px] w-[130px] max-h-[176px]"
                  />
                </Link>
              </td>
              <td className="px-3 xl:px-6 break pt-[40px] pb-[20px] max-w-[230px] truncate overflow-hidden text-ellipsis">
                {item.product_id?.name}
              </td>
              <td className="px-3 xl:px-6 pt-[40px] pb-[20px]">
                <div className="inline-flex items-center gap-[10px] px-[8px] py-[5px] light-border border text-black rounded-[20px] leading">
                  <button onClick={() => handleDecrease(item)}>
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity ?? 1}</span>
                  <button onClick={() => handleIncrease(item)}>
                    <Plus size={14} />
                  </button>
                </div>
              </td>
              <td className="px-3 xl:px-6 pt-[40px] pb-[20px] text-left">
                ₹
                {Math.round(
                  getDiscountedPrice(item).discountedPrice,
                ).toLocaleString("en-IN")}{" "}
                × {item.quantity}
              </td>
              <td className="px-3 xl:px-6 pt-[40px] pb-[20px] text-center">
                ₹
                {Math.round(
                  getDiscountedPrice(item).discountedPrice * item.quantity,
                ).toLocaleString("en-IN")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile View */}
      <div className="custom-lg:hidden space-y-[20px]">
        {items.map((item, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-[5px] box-shadow relative flex sm:flex-nowrap gap-[20px] items-start"
          >
            <div className="flex items-center gap-[10px] flex-shrink-0">
              <button
                className="w-[10px] h-[10px] flex items-center justify-center"
                onClick={() => handleDelete(item._id)}
              >
                <img
                  src={remove}
                  alt="remove"
                  className="w-full h-full object-contain"
                />
              </button>
              <Link to={`/products/${item.product_id?._id}`}>
                <img
                  src={
                    item.variant_id?.images?.length > 0
                      ? getImageUrl(item.variant_id.images[0])
                      : getImageUrl(item.product_id?.images?.[0])
                  }
                  alt={item.product_id?.name}
                  className="box-shadow object-cover p-[5px] h-[110px] sm:h-[109px] w-[75px] sm:w-[87px]"
                />
              </Link>
            </div>
            <div className="flex flex-col flex-wrap">
              <div className="mb-[8px] text-14 break">
                {item.product_id?.name}
              </div>
              <div className="text-p mb-[12px] text-color">
                ₹
                {(
                  getDiscountedPrice(item).discountedPrice * item.quantity
                ).toFixed(0)}
              </div>
              <div className="flex items-center gap-[10px] text-14">
                <button className="light-color rounded-[2px] flex items-center justify-center p-[2px]">
                  <Minus size={12} onClick={() => handleDecrease(item)} />
                </button>
                <span>{item.quantity}</span>
                <button className="bg-color-100 rounded-[2px] flex items-center justify-center p-[2px] text-white">
                  <Plus size={12} onClick={() => handleIncrease(item)} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
