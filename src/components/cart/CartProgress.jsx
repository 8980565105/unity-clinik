// src/components/cart/CartProgress.jsx
import React from "react";
import { Check } from "lucide-react";
import Row from "../ui/Row";
import Section from "../ui/Section";

export default function CartProgress({ currentStep = 1 }) {
  const steps = [
    { step: 1, label: "Your Cart" },
    { step: 2, label: "Checkout" },
    { step: 3, label: "Payment" },
  ];

  return (
    <Section>
      <Row className="flex justify-between items-center w-full !max-w-[677px] px-4 md:px-0 relative pt-[50px]">
        {steps.map((s, i) => {
          const completed = s.step < currentStep;
          const active = s.step === currentStep;

          return (
            <div key={s.step} className="flex-1 flex flex-col items-center relative">
              <span className="text-[16px] md:text-[24px] text-light mb-[10px] break items-center">{s.label}</span>

              <div
                aria-current={active ? "step" : undefined}
                className={`flex items-center justify-center w-[30px] h-[30px] md:w-[50px] md:h-[50px] rounded-full text-[16px] md:text-[26px]
                  ${completed || active ? "bg-color text-white" : "bg-gray-200 sec-theme text-light"}`}
              >
                {completed ? <Check size={20} strokeWidth={3} /> : <span>{s.step}</span>}
              </div>

              {i < steps.length - 1 && (
                <div className="absolute top-[70%] left-[27%] md:left-[23%] w-[90%] md:w-[90%] h-[3px] rounded-[20px] translate-y-[80%] translate-x-[50%] z-[-1]">
                  <div className="w-[60%] md:w-[70%] h-[3px] rounded-full sec-theme  relative">
                    <div
                      className={`absolute left-0 top-0 bottom-0 rounded-full bg-color transition-all duration-300
                        ${completed ? "w-full" : active ? "w-1/2" : "w-0"}`}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Row>
    </Section>
  );
}
