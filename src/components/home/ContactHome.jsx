import React from "react";
import { Phone, ArrowRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import Section from "../ui/Section";
import Button from "../ui/Button";

function ContactHome() {
  const navigate = useNavigate();

  return (
    <Section className="py-16 px-4 bg-[#fdf8f4]">
      <div className="max-w-6xl mx-auto">
        <div
          className="relative overflow-hidden bg-white shadow-xl flex flex-col md:flex-row items-center justify-between p-8 md:p-12 border-2 border-[#e9e1d8]"
          style={{
            borderRadius: "40px 100px 40px 110px",
          }}
        >
          <div className="flex-1 text-center md:text-left z-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a2b3c] leading-tight mb-2">
              Need Expert Doctor Advice?
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-3 text-[#2c3e50]">
              <div className="w-10 h-10 bg-[#8bc34a] rounded-full flex items-center justify-center text-white">
                <Phone size={20} fill="white" />
              </div>
              <span className="text-2xl font-bold tracking-wider">
                Call +00 568 99 22
              </span>
            </div>
          </div>

          <div className="flex-1 my-6 md:my-0 md:px-10 text-center md:text-left z-10 border-l-0 md:border-l-2 border-gray-100">
            <p className="text-gray-500 text-sm md:text-base leading-relaxed">
              Get a free 15-minute consultation with our hair restoration
              specialists. Find the right treatment for your hair type today.
            </p>
          </div>

          <div className="z-10">
            {/* <button
              onClick={() => navigate("/contact-us")}
              className="group flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg transform hover:-translate-y-1"
            >
              Contact Us
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button> */}

            <Button
              variant="common"
              onClick={() => navigate("/contact-us")}
              className="rounded-full group flex items-center gap-2"
            >
              Contact Us
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Button>
          </div>

          <div className="absolute -top-10 -left-10 w-32 h-32 bg-[#8bc34a]/10 rounded-full" />
          <div className="absolute -bottom-4 -right-4 opacity-5 pointer-events-none">
            <svg
              width="120"
              height="120"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM3.01699 21L3.01699 18C3.01699 16.8954 3.91243 16 5.01699 16H8.01699C9.12156 16 10.017 16.8954 10.017 18V21C10.017 22.1046 9.12156 23 8.01699 23H5.01699C3.91243 23 3.01699 22.1046 3.01699 21Z" />
            </svg>
          </div>
        </div>
      </div>
    </Section>
  );
}

export default ContactHome;
