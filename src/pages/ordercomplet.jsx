import React from "react";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import { ArrowRight, Check } from "lucide-react";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function OrderComplete() {
  const navigate = useNavigate();

  return (
    <Section className="flex items-center justify-center bg-[#f5f7fa] !py-[180px]">
      <Row className="flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-6">
          <Check className="text-white w-8 h-8" />
        </div>

        <h1 className="text-[35px] md:text-4xl font-semibold text-primary mb-4">
          Thank You For Your Ordering!
        </h1>
        <p className="text-gray-500 max-w-2xl text-sm md:text-base mb-8 leading-relaxed">
          An order is considered "completed" when it has been fully fulfilled
          and delivered to the customer. This typically means the order has been
          prepared, packed, shipped, and the delivery has been confirmed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="px-6 py-2 flex items-center gap-2"
          >
            Go To Home Page
            <ArrowRight />
          </Button>

          <Button
            variant="common"
            onClick={() => navigate("/shop")}
            className="px-6 py-2"
          >
            Continue Shopping
          </Button>
        </div>
      </Row>
    </Section>
  );
}
