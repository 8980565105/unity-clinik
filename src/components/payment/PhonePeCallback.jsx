import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  markPaymentFailed,
  verifyPhonePePayment,
} from "../../features/payments/paymentThunk";
import { clearCart } from "../../features/cart/cartSlice";
import toast from "react-hot-toast";
import api from "../../services/api"; 

export default function PhonePeCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const order_id = params.get("order_id");

    if (!order_id) {
      toast.error("Invalid callback — order ID missing ❌");
      navigate("/");
      return;
    }

    (async () => {
      try {
        const verifyRes = await dispatch(
          verifyPhonePePayment({
            merchantTransactionId: "",
            order_id,
          }),
        );

        if (verifyPhonePePayment.fulfilled.match(verifyRes)) {
          dispatch(clearCart());
          toast.success("PhonePe Payment Successful ✅");
          navigate("/ordercompleted");
          return;
        }

        const userLS = JSON.parse(localStorage.getItem("user") || "null");
        let amount = 0;
        let userId = userLS?._id;
        let isPartialCod = false;

        try {
          const orderRes = await api.get(`/orders/${order_id}`);
          const orderData = orderRes.data?.data;
          amount = orderData?.total_price || 0;
          userId = orderData?.user_id?._id || orderData?.user_id || userId;
          isPartialCod = orderData?.payment_method === "partial_cod";
        } catch (fetchErr) {
          console.error(
            "Order fetch failed for failed-payment record:",
            fetchErr,
          );
        }

        if (userId && amount > 0) {
          await dispatch(
            markPaymentFailed({
              order_id,
              user_id: userId,
              payment_method: "PhonePe",
              amount,
              type: "order",
            }),
          );
        }

        toast.error(
          typeof verifyRes.payload === "string"
            ? verifyRes.payload
            : "Payment verification failed ❌",
        );

        if (isPartialCod) {
          dispatch(clearCart());
          toast("Order placed with Payment Pending status.");
          navigate("/ordercompleted");
        } else {
          navigate("/checkout");
        }
      } catch (err) {
        const userLS = JSON.parse(localStorage.getItem("user") || "null");
        let amount = 0;
        let userId = userLS?._id;
        let isPartialCod = false;

        try {
          const orderRes = await api.get(`/orders/${order_id}`);
          const orderData = orderRes.data?.data;
          amount = orderData?.total_price || 0;
          userId = orderData?.user_id?._id || orderData?.user_id || userId;
          isPartialCod = orderData?.payment_method === "partial_cod";
        } catch {}

        if (userId && amount > 0) {
          await dispatch(
            markPaymentFailed({
              order_id,
              user_id: userId,
              payment_method: "PhonePe",
              amount,
              type: "order",
            }),
          ).catch(() => {});
        }

        toast.error("Something went wrong ❌");
        if (isPartialCod) {
          dispatch(clearCart());
          toast("Order placed with Payment Pending status.");
          navigate("/ordercompleted");
        } else {
          navigate("/checkout");
        }
      }
    })();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
        <p className="text-lg font-medium">Verifying PhonePe payment...</p>
        <p className="text-sm text-gray-500 mt-2">
          Please wait, do not close this page
        </p>
      </div>
    </div>
  );
}
