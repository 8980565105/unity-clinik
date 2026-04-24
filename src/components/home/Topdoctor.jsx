import React, { useEffect, useState } from "react";
import Row from "../ui/Row";
import Section from "../ui/Section";

const doctors = [
  {
    name: "Dr. Sugandha Sharma",
    cases: "16,000+",
    img: "https://fidorehealth.com/front/assets/Images/doctors/Sugandha.png",
  },
  {
    name: "Dr. Prithish Bhardwaj",
    cases: "50,000+",
    img: "https://fidorehealth.com/front/assets/Images/doctors/prithish.png",
  },
  {
    name: "Dr. Paridhi Jain",
    cases: "15,000+",
    img: "https://fidorehealth.com/front/assets/Images/doctors/paridhi.png",
  },
  {
    name: "Dr. Khushbu Suthar",
    cases: "42,000+",
    img: "https://fidorehealth.com/front/assets/Images/doctors/khushbu.png",
  },
  {
    name: "Dr. Shivani Yadav",
    cases: "10,000+",
    img: "https://fidorehealth.com/front/assets/Images/doctors/Shivani.png",
  },
];
export default function TopDoctorCarousel() {
  const [current, setCurrent] = useState(0);
  const total = doctors.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const getPos = (i) => (i - current + total) % total;

  return (
    <Section>
      <Row>
        <div className="mb-5">
          <h2 className="font-bold text-black text-[clamp(18px,4vw,36px)]">
            India's Top Trichologists - Hair Growth Specialists
          </h2>
          <h3 className="font-medium text-[clamp(14px,4vw,18px)] text-gray-400">
            Get Treated by Qualified Hair Fall Treatment Doctors in India
          </h3>
        </div>
        <div className="w-full h-[420px] relative">
          {doctors.map((doc, i) => {
            const pos = getPos(i);

            let style = {};

            if (pos === 0) {
              style = {
                left: "50%",
                transform: "translateX(-50%) scale(1)",
                zIndex: 5,
              };
            } else if (pos === 1) {
              style = {
                left: "68%",
                top: "10%",
                transform: "translateX(-50%) scale(0.85)",
                zIndex: 4,
              };
            } else if (pos === 2) {
              style = {
                left: "82%",
                top: "20%",
                transform: "translateX(-50%) scale(0.7)",
                zIndex: 3,
              };
            } else if (pos === total - 1) {
              style = {
                left: "32%",
                top: "10%",

                transform: "translateX(-50%) scale(0.85)",
                zIndex: 4,
              };
            } else if (pos === total - 2) {
              style = {
                left: "18%",
                top: "20%",
                transform: "translateX(-50%) scale(0.7)",
                zIndex: 3,
              };
            } else {
              style = {
                pointerEvents: "none",
                display: "none",
              };
            }
            return (
              <div
                key={i}
                className="absolute top-0 w-[220px] h-[300px] cursor-pointer transition-all duration-[600ms] ease-in-out"
                style={style}
              >
                <div className="w-full h-[220px] bg-[#f2f2f2] rounded-3xl absolute bottom-0" />
                <img
                  src={doc.img}
                  alt=""
                  className="absolute bottom-0 w-full"
                />
                {pos === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-50px",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    <h4 style={{ margin: 0, color: "#000000" }}>{doc.name}</h4>
                    <p
                      style={{ margin: 0, fontSize: "12px", color: "#000000" }}
                    >
                      {doc.cases} cases treated
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <div
            style={{
              position: "absolute",
              bottom: "-90px",
              width: "100%",
              textAlign: "center",
              color: "white",
            }}
          >
          </div>
        </div>
      </Row>
    </Section>
  );
}
