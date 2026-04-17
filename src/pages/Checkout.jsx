import React, { useState } from "react";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import CartProgress from "../components/cart/CartProgress";
import { Link } from "react-router-dom";


export default function Checkout() {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [formData, setFormData] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    state: "",
    city: "",
    pincode: "",
    phone: "",
  });

  return (
    <div>
        <CartProgress currentStep={2}/>
        <Section >
            <Row>
                <h2 className="text-[28px] font-normal mb-[50px] hidden md:block leading">
                  <Link to="/home">Home </Link>/ <span className="font-light ">Checkout</span>
                </h2>
            </Row>
            <Row className="grid grid-cols-1 custom-lg:grid-cols-[2fr_1fr] gap-[30px] items-start">
                <CheckoutForm  formData={formData} setFormData={setFormData} />
                <OrderSummary  formData={formData} appliedCoupon={appliedCoupon}/>
            </Row>
        </Section>
    </div>
  );
}
