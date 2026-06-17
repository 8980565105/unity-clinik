import React, { useEffect, useState } from "react";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import CartProgress from "../components/cart/CartProgress";
import SEO from "../components/seo/seo";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Truck } from "lucide-react";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import Button from "../components/ui/Button";
import cart from "../assets/emptycart.webp";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items = [] } = useSelector((state) => state.cart);
  const { pages } = useSelector((state) => state.pages);
  const checkoutPage = pages?.find((page) => page.slug === "checkout");

  const [appliedCoupon] = useState(null);
  const [formData, setFormData] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    country: "India",
    state: "",
    city: "",
    pincode: "",
    phone: "",
  });
  useEffect(() => {
    dispatch(fetchPageBySlug("checkout"));
  }, [dispatch]);

  if (items.length === 0) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
            <img
              alt="Empty Cart"
              className="w-48 h-48 mx-auto mb-6 opacity-80"
              src={cart}
            />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Button variant="common" onClick={() => navigate("/allproducts")}>
              Start Shopping
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div>
      <SEO
        title={checkoutPage?.meta_title}
        description={checkoutPage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${checkoutPage?.seo_image}`}
      />

      <CartProgress currentStep={2} />

      <Section>
        <Row className="grid grid-cols-1 custom-lg:grid-cols-[1.4fr_1fr] gap-[30px] items-start">
          <div className="space-y-4">
            {items.length > 0 && (
              <div className="p-4 flex items-center gap-3 bg-green-100 rounded-lg">
                <Truck size={20} className="text-green-600" />
                <span className="text-[14px] font-bold text-green-800">
                  Get by{" "}
                  {new Date(Date.now() + 3 * 86400000).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                    },
                  )}
                </span>
              </div>
            )}

            <CheckoutForm formData={formData} setFormData={setFormData} />
          </div>

          <div className="custom-lg:sticky custom-lg:top-[100px]">
            <OrderSummary formData={formData} appliedCoupon={appliedCoupon} />
          </div>
        </Row>
      </Section>
    </div>
  );
}
