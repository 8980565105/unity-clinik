import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../../features/cart/cartThunk";
import { getImageUrl } from "../utils/helper";
import { createPayment } from "../../features/payments/paymentThunk";
import { createOrder } from "../../features/orders/orderThunk";
import toast, { Toaster } from "react-hot-toast";

import { clearCart } from "../../features/cart/cartSlice";
export default function OrderSummary({ formData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items = [], loading } = useSelector((state) => state.cart);
  const { loading: paymentLoading } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [paymentError, setPaymentError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  useEffect(() => {
    const cart_id = localStorage.getItem("cart_id");
    if (user && cart_id) {
      dispatch(fetchCart(cart_id));
    }
  }, [dispatch, user]);

  if (loading) return <p>Loading cart...</p>;
  if (!items.length)
    return <p className="text-center mb-[100px]">Your cart is empty.</p>;

  const getDiscountedPrice = (item) => {
    const discount = item?.product_id?.discount_id?.value || 0;
    const originalPrice = item?.variant_id?.price || 0;
    const discountedPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;
    return { discount, originalPrice, discountedPrice };
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item).discountedPrice * (item.quantity || 1),
    0,
  );
  const taxes = Number((subtotal * 0.1).toFixed(2));
  const shipping = 0;
  const total = Number((subtotal + taxes + shipping).toFixed(2));

  const getBackendPaymentMethod = (method) => {
    if (method === "cod") return "COD";
    return "Online";
  };

  const getStoreOwnerId = () => {
    if (!items || items.length === 0) return null;

    const storeOwnerId =
      items[0]?.product_id?.createdBy?._id ||
      items[0]?.product_id?.createdBy ||
      null;

    return storeOwnerId;
  };

  const handlePlaceOrder = async () => {
    const userLS = JSON.parse(localStorage.getItem("user"));
    if (!userLS || !userLS._id) {
      toast("Please login before placing order");
      return navigate("/login");
    }

    const requiredFields = {
      email: "Email Address",
      firstName: "First Name",
      lastName: "Last Name",
      address: "Address",
      country: "Country",
      state: "State",
      city: "City",
      pincode: "Pin Code",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key] || formData[key].trim() === "") {
        toast(`Please enter ${label}`);
        return;
      }
    }

    if (!selectedPayment) {
      return toast("Select a payment method");
    }

    if (selectedPayment === "credit_card") {
      if (!cardNumber || !expiryDate || !cvv) {
        setPaymentError("Please fill all credit card details");
        return;
      }
    }

    const orderData = {
      user_id: userLS._id,
      items,
      total_price: total,
      coupon_id: null,
      payment_method: getBackendPaymentMethod(selectedPayment),
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        phone: formData.phone,
      },
    };

    const orderAction = await dispatch(createOrder(orderData));
    console.log("ORDER ACTION:", orderAction); // આ add કરો

    if (!createOrder.fulfilled.match(orderAction)) {
      toast(
        "Order failed: " + (orderAction.payload?.message || "Unknown error"),
      );
      return;
    }
    const orderId =
      orderAction.payload?.data?._id || orderAction.payload?._id || null;

    if (!orderId) {
      toast("Order created but ID missing!");
      return;
    }

    const storeOwnerId = getStoreOwnerId();

    const paymentPayload = {
      user_id: userLS._id,
      order_id: orderId,
      store_owner_id: storeOwnerId,
      items,
      subtotal,
      taxes,
      shipping,
      total,
      amount_paid: selectedPayment === "cod" ? 0 : total,
      payment_method: selectedPayment,
      status: selectedPayment === "cod" ? "pending" : "completed",
    };

    await dispatch(createPayment(paymentPayload));

    dispatch(clearCart());

    toast("Order placed successfully!");
    navigate("/my-account/orders");
  };

  return (
    <>
      <Toaster position="top center" />
      <div className="w-full rounded-[3px] py-[45px] px-[22px] light-color">
        <h2 className="text-[22px] text-black mb-[50px] text-center">
          Order Summary
          <div className="flex justify-center">
            <span className="theme-border-block w-[34px] h-[2px] rounded-[10px] block"></span>
          </div>
        </h2>

        <div className="pb-[10px] text-p">
          {items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items
        </div>

        {items.map((item, index) => (
          <div
            key={item._id || index}
            className="flex border-b border-[#BCBCBC] pb-[10px] mb-[30px]"
          >
            <div className="relative w-[80px] md:w-[105px] h-auto flex-shrink-0">
              <Link to={`/products/${item.product_id?._id}`}>
                <img
                  src={
                    item.variant_id?.images?.length > 0
                      ? getImageUrl(item.variant_id.images[0])
                      : getImageUrl(item.product_id?.images?.[0])
                  }
                  alt={item.product_id?.name}
                  className="w-full h-[122px] md:h-[150px] object-cover"
                />
              </Link>
              <span className="absolute top-[-10px] right-[-10px] w-[22px] h-[22px] bg-white text-black text-p rounded-full flex items-center justify-center">
                {item.quantity || 1}
              </span>
            </div>
            <div className="flex justify-between gap-[10px] flex-1 ml-4">
              <p className="text-14 text-gray-700">{item.product_id?.name}</p>
              <p className="text-p text-right">
                ₹
                {Math.round(
                  getDiscountedPrice(item).discountedPrice * item.quantity,
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}

        <div className="border-t pb-[30px] space-y-[14px] text-p text-light">
          <div className="flex justify-between text-black">
            <span>Subtotal</span>
            <span>₹ {Math.round(subtotal).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div className="flex justify-between">
            <span>Taxes (10%)</span>
            <span>₹ {Math.round(taxes).toLocaleString("en-IN")}</span>
          </div>
          <div className="text-theme text-[12px] border-b border-[#BCBCBC] pb-[30px]">
            Promo Gift Certificate
          </div>
          <div className="flex justify-between text-p text-black">
            <span>Total (₹)</span>
            <span className="text-20px font-medium">
              ₹{Math.round(total).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="text-light text-14 space-y-[10px]">
          {["cod", "paypal", "credit_card"].map((method) => (
            <label
              key={method}
              className="flex items-center gap-2 cursor-pointer text-p"
            >
              <input
                type="radio"
                name="payment"
                value={method}
                checked={selectedPayment === method}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="peer appearance-none w-4 h-4 border-[1px] checked:border-[3px] border-black rounded-full
                        border-[#000000] checked:border-[#F43297]
                        transition-all duration-200"
              />
              <span className="capitalize">
                {method === "cod"
                  ? "Cash on Delivery"
                  : method === "credit_card"
                    ? "Credit Card"
                    : "PayPal"}
              </span>
            </label>
          ))}

          {selectedPayment === "credit_card" && (
            <div className="space-y-[19px] text-light text-14">
              <p className="text-light text-[12px] mb-[5px]">
                Pay with your credit card via authorize net.
              </p>
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, ""))
                }
                className="input-common w-full"
              />
              <div className="flex gap-[13px]">
                <input
                  type="text"
                  placeholder="Expiry (MM/YY)"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="input-common flex-1"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(e.target.value.replace(/\D/g, ""));
                    if (paymentError) setPaymentError("");
                  }}
                  className="input-common flex-1"
                />
              </div>
            </div>
          )}

          {paymentError && (
            <p className="text-red-500 text-sm mt-2">{paymentError}</p>
          )}
        </div>

        <div className="text-center mt-[50px]">
          <Button
            variant="common"
            className="min-w-auto sm:min-w-[300px] uppercase"
            onClick={handlePlaceOrder}
            disabled={paymentLoading}
          >
            {paymentLoading ? "PROCESSING..." : "PLACE ORDER"}
          </Button>
        </div>
      </div>
    </>
  );
}
