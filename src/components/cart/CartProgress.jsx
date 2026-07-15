import React from "react";
import { Check } from "lucide-react";
import Row from "../ui/Row";
import Section from "../ui/Section";
import { useSelector } from "react-redux";


export default function CartProgress({ currentStep = 1 }) {
  const { items = [] } = useSelector((state) => state.cart);

  const steps = [
    { step: 1, label: "Your Cart" },
    { step: 2, label: "Checkout" },
    { step: 3, label: "Payment" },
  ];
  return (
    <>
      <Section className="!pt-8">

        <Row className="flex justify-between items-center w-full !max-w-[677px] px-4 md:px-0 relative mt-5">
          {steps.map((s, i) => {
            const completed = s.step < currentStep;
            const active = s.step === currentStep;

            return (
              <div
                key={s.step}
                className="flex-1 flex flex-col items-center relative"
              >
                <span className="text-[14px] md:text-[20px] text-gray-500 mb-[10px] text-center">
                  {s.label}
                </span>
                <div
                  aria-current={active ? "step" : undefined}
                  className={`flex items-center justify-center w-[30px] h-[30px] md:w-[50px] md:h-[50px] rounded-full text-[14px] md:text-[22px] font-semibold transition-all
                    ${
                      completed || active
                        ? "bg-[#1a5fb4] text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                >
                  {completed ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    <span>{s.step}</span>
                  )}
                </div>

                {i < steps.length - 1 && (
                  <div className="absolute top-[70%] left-[27%] md:left-[23%] w-[90%] h-[3px] rounded-[20px] translate-y-[80%] translate-x-[50%] z-[-1]">
                    <div className="w-[65%] h-[3px] rounded-full bg-gray-200 relative">
                      <div
                        className={`absolute left-0 top-0 bottom-0 rounded-full bg-[#1a5fb4] transition-all duration-300
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
    </>
  );
}
