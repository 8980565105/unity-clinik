import React, { useState } from "react";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import CartProgress from "../components/cart/CartProgress";
import { Link } from "react-router-dom";
import SEO from "../components/seo/seo";

import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import emptycart from "../assets/emptycart.webp";
import { Truck } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const { items = [] } = useSelector((state) => state.cart);
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

  return (
    <div>
      <SEO title={"Checkout"} description={"Checkout Description"} />

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
