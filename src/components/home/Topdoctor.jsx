import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";
import Section from "../ui/Section";
import Row from "../ui/Row";
import Heading from "../ui/Heading";
const STEP = 249.75;
function getCardTransform(slot) {
  return {
    translateX: slot * STEP,
    translateY: Math.abs(slot) * 60,
    scale: slot === 0 ? 1 : 0.9,
    zIndex: slot === 0 ? 2 : Math.abs(slot) === 1 ? 1 : 0,
    opacity: Math.abs(slot) <= 2 ? 1 : 0,
    pointerEvents: Math.abs(slot) <= 2 ? "auto" : "none",
  };
}

function getBgConfig(slot) {
  if (slot === 0) {
    return {
      width: 200,
      transform: "rotateY(0deg)",
      transformOrigin: "center center",
      left: 0,
      right: "auto",
    };
  }
  if (slot < 0) {
    return {
      width: 230,
      transform: "rotateY(40deg)",
      transformOrigin: "left center",
      left: "11%",
      right: "auto",
    };
  }
  return {
    width: 230,
    transform: "rotateY(-40deg)",
    transformOrigin: "right center",
    left: "auto",
    right: "13%",
  };
}

export default function TopDoctorCarousel() {
  const { slides, loading } = useSelector((state) => state.slides);
  const topDoctorSection = slides.find((s) => s.section === "topDoctor");
  const doctors = topDoctorSection?.topDoctors || [];
  const [current, setCurrent] = useState(0);
  const total = doctors.length;

  useEffect(() => {
    if (total === 0) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % total), 2500);
    return () => clearInterval(t);
  }, [total]);

  if (loading || total === 0) return null;

  const getSlot = (i) => {
    let slot = (i - current + total) % total;
    if (slot > total / 2) slot -= total;
    return slot;
  };

  return (
    <>
      <Section>
        <div className="flex flex-col justify-center items-center gap-5 pt-1 pb-1 mt-5 mb-5 overflow-hidden">
          <Row>
            <Heading
              title={"India's Top Trichologists - Hair Growth Specialists"}
            />

            <h3 className="font-medium text-[clamp(13px,4vw,18px)] text-[#989898] text-center m-0">
              Get Treated by Qualified Hair Fall Treatment Doctors in India
            </h3>
          </Row>
          <div className="relative w-[220px] h-[250px] mt-[150px] flex-Shrink-1">
            <div className="absolute left-1/2 h-full">
              {doctors.map((doc, i) => {
                const slot = getSlot(i);
                const t = getCardTransform(slot);
                const bg = getBgConfig(slot);

                return (
                  <div
                    key={doc._id || i}
                    className="
    absolute left-1/2
    w-[220px] h-[310px]
    [perspective:1000px]
    transition-all duration-300
    cursor-pointer
  "
                    style={{
                      opacity: t.opacity,
                      pointerEvents: t.pointerEvents,
                      zIndex: t.zIndex,
                      transform: `translate(-50%, -50%) translateX(${t.translateX}px) translateY(${t.translateY}px) scale(${t.scale})`,
                    }}
                  >
                    <div
                      className="
    absolute bottom-0 h-[200px]
    bg-[#F1F1F1] rounded-[13px]
    transition-transform duration-300
  "
                      style={{
                        left: bg.left,
                        right: bg.right,
                        width: bg.width,
                        transform: bg.transform,
                        transformOrigin: bg.transformOrigin,
                      }}
                    />
                    <img
                      src={getImageUrl(doc.image)}
                      alt={doc.name}
                      className={`
    absolute left-0 w-full block
    origin-bottom
    transition-transform duration-300
    ${slot === 0 ? "bottom-0 scale-100" : "bottom-[15px] scale-90"}
  `}
                    />

                    <div
                      className={`absolute -bottom-[40px] left-0 right-[12px] text-center transition-opacity duration-300 ${slot === 0 ? "opacity-100" : "opacity-0"}`}
                    >
                      <h4 className="m-0 text-black font-bold text-[15px]">
                        {doc.name}
                      </h4>
                      <h5 className="m-0 text-[#7E7E7E] text-[12px] font-medium">
                        {doc.cases} cases treated
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
