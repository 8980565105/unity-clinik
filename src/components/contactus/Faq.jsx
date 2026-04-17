import React, { useState } from "react";
import Section from "../ui/Section";
import faqBg from "../../assets/size-bg.png";
import Row from "../ui/Row";
import Button from "../ui/Button";
import { Minus, Plus } from "lucide-react";
import { Link } from "react-router-dom";

export default function FAQ() {
  const [isOpen, setIsOpen] = useState(null);

  const toggle = (index) => {
    setIsOpen(isOpen === index ? null : index);
  };

  const faqData = [
    {
      question: "Is there a free trial available ?",
      answer:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in velit esse cillum eiusmod tempor incididuntut labore et dolore magna aliqua....",
    },
    {
      question: "Can I change my plan later ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      question: "What is your cancellation Policy ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      question: "Can other info be added to an invoice ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      question: "How does billing work ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      question: "How do I change my account email ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      question: "How does support work ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
    {
      question: "Do you provide tutorials ?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
    },
  ];

  return (
    <>
      <Section
        className="bg-cover bg-center bg-no-repeat min-h-[400px]"
        style={{ backgroundImage: `url(${faqBg})` }}
      >
        <Row className="!max-w-[688px] pt-[40px] md:pt-[20px] ">
          <div className=" text-center  ">
            <h1 className="text-[24px] sm:text-[36px] font-semibold mb-[15px] sm:mb-[22px] leading">
              Frequently Asked Questions
            </h1>
            <p className="text-dark text-14 ">
              Quick answers to questions you may have about untitled UI and
              billing. Can’t find what yo’re looking for ? Checkout our{" "}
              <Link to="" className="underline">
                full documentation .
              </Link>
            </p>
          </div>
        </Row>
      </Section>

      <Section className="relative !pt-0 -mt-[11rem] sm:-mt-[12rem]">
        <Row className="!max-w-[1122px] form-shadow rounded-[20px] p-[40px] !px-[30px] bg-white">
          <div className="space-y-[10px]">
            {faqData.map((item, index) => (
              <div
                key={index}
                className="border-b border-dashed px-[10px] py-[14px] sm:py-[20px] border-[#D2AF9F]"
              >
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggle(index)}
                >
                  <span className="text-[18px] font-medium break">
                    {item.question}
                  </span>
                  <span className="flex flex-start">
                    {isOpen === index ? (
                      <Minus
                        size={14}
                        className="md:w-[20px] md:h-[20px] text-white bg-color-100 "
                      />
                    ) : (
                      <Plus
                        size={14}
                        className="md:w-[20px] md:h-[20px] text-white bg-color-100 "
                      />
                    )}
                  </span>
                </div>

                {isOpen === index && (
                  <div className="mt-[12px] text-[#989696] text-14 break">
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-[80px] text-center justify-center flex ">
            <Button variant="common" className="!rounded-[30px]">
              Load more
            </Button>
          </div>
        </Row>
      </Section>
    </>
  );
}
