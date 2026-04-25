import React from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import b2 from "../../assets/b2.png";
import { ArrowRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export default function ShortBanner() {
  const Navigate = useNavigate();
  return (
    <Section>
      <Row>
        <div
          className="w-full overflow-hidden bg-gradient-to-r from-[#7B5CF5] to-[#9B6EF3] px-6 md:px-10 pt-6"
          style={{
            borderRadius: "100px 40px 110px 40px",
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex flex-col justify-center items-start text-white max-w-[320px]">
              <h2 className="text-[18px] md:text-[22px] font-semibold">
                Become a{" "}
                <span className="text-yellow-400 font-bold">+ Plus</span> member
              </h2>

              <p className="text-sm mt-2 text-white/80">
                And enjoy extra bachat on every order
              </p>

              <div className="w-12 h-[2px] bg-yellow-400 mt-4"></div>
            </div>

            <div className="flex flex-col justify-between items-start md:items-center text-white mt-4 md:mt-0">
              <p className="text-sm md:text-base font-medium text-white/90 max-w-[420px]">
                Save 6% on medicines, 20% on lab tests & enjoy FREE delivery.
              </p>
              {/* <button
                onClick={() => Navigate("/shop")}
                className="group flex items-center gap-2 bg-[#1e293b] hover:bg-[#334155] text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg transform hover:-translate-y-1"
              >
                Explore Now
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button> */}

              <Button
                variant="common"
                className="group flex gap-2 items-center rounded-full transition-all duration-300 transform"
              >
                Explore Now
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Button>
            </div>
            <div className="flex justify-end items-end mt-4 md:mt-0">
              <img
                src={b2}
                alt="family"
                className="w-[150px] sm:w-[180px] md:w-[220px] lg:w-[260px] object-contain"
              />
            </div>
          </div>
        </div>
      </Row>
    </Section>
  );
}
