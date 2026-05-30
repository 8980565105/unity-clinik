import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyPhonePePayment } from "../../features/payments/paymentThunk";
import { clearCart } from "../../features/cart/cartSlice";
import toast, { Toaster } from "react-hot-toast";

export default function PhonePeCallback() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const order_id = params.get("order_id");

    if (!order_id) {
      toast("Invalid callback — order ID missing ❌");
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
          toast("PhonePe Payment Successful ✅");
          navigate("/ordercompleted");
        } else {
          toast("Payment verification failed ❌");
          navigate("/checkout");
        }
      } catch {
        toast("Something went wrong ❌");
        navigate("/checkout");
      }
    })();
  }, []); 

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Toaster position="top-center" />
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
