import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useState } from "react";
import useProtectedLink from "../../hooks/useProtectedLink";
import LoginForm from "../../pages/Login";
import ForgetForm from "../../pages/ForgetForm";
import RegistrationForm from "../../pages/RegistrationForm";

export default function BuyNowButton({
  product,
  activeVariantState,
  selectedPackState,

  className = "",
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const [loading, setLoading] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const openProtectedLink = useProtectedLink(setIsLoginOpen, token);
  const [isForgetOpen, setIsForgetOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleBuyNow = () => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }

    if (activeVariantState?.stock_quantity === 0) {
      toast.error("This product is out of stock!");
      return;
    }

    navigate("/checkout", {
      state: {
        buyNow: true,
        item: {
          product_id: product,
          variant_id: activeVariantState,
          quantity: 1,
          pack_of: Number(selectedPackState?.badge || 1),
          price: Number(selectedPackState?.offerprice || 0),
          original_price: Number(selectedPackState?.price || 0),
        },
      },
    });
  }


  return (
    <>
      <Button
        onClick={handleBuyNow}
        variant="common"
        disabled={loading}
        className={`!w-full !text-[22px] flex items-center justify-center gap-[10px] !py-[10px] ${className}`}
      >
        {loading ? "Processing..." : "Buy Now"}
      </Button>

      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setIsLoginOpen(false)}
              onSwitchRegister={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
              onSwitchForget={() => {
                setIsLoginOpen(false);
                setIsForgetOpen(true);
              }}
            />
          </div>
        </div>
      )}
      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <RegistrationForm
              onClose={() => setIsRegisterOpen(false)}
              onSwitch={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}
      {isForgetOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <ForgetForm
              onClose={() => setIsForgetOpen(false)}
              onSwitch={() => {
                setIsForgetOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
