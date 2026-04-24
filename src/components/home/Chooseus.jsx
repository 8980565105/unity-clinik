import React from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
const features = [
  {
    title: "Dedication to Client Success",
    desc: "Our ultimate goal is to create and deliver expectations that will make our clients happy and satisfied.",
    color: "group-hover:text-orange-500",
    glowColor: "rgba(255,115,0,0.5)",
    borderColor: "border-orange-500/40",
    iconBg: "bg-orange-500/10",
  },
  {
    title: "Continuous Growth",
    desc: "We stay on the pulse of new technologies to ensure our services expand and evolve with industry trends.",
    color: "group-hover:text-yellow-400",
    glowColor: "rgba(250,204,21,0.5)",
    borderColor: "border-yellow-400/40",
    iconBg: "bg-yellow-400/10",
  },
  {
    title: "Fast-moving Mindset",
    desc: "We're always improving to keep pace with the latest technology in a competitive landscape.",
    color: "group-hover:text-cyan-400",
    glowColor: "rgba(34,211,238,0.5)",
    borderColor: "border-cyan-400/40",
    iconBg: "bg-cyan-400/10",
  },
];

function Chooseus() {
  return (
    <Section className="bg-[#050816] text-white py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,115,0,0.08),transparent_40%)]"></div>

      <Row>
        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
          <p className="text-orange-500 text-xs tracking-[3px] mb-3 uppercase">
            Our Strengths
          </p>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why <span className="bg-blue-600 px-2 rounded">Choose Us</span>
          </h2>

          <div className="w-16 h-[3px] bg-orange-500 mx-auto mb-6 rounded"></div>

          <p className="text-gray-400 text-sm leading-relaxed">
            We design, create, and execute quick and agile strategies that
            reflect your business operations seamlessly to offer robust business
            growth.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative z-10">
          {features.map((item, index) => (
            <div
              key={index}
              className="group relative rounded-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div
                className="absolute  rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition duration-500"
                style={{
                  background: item.glowColor,
                }}
              ></div>

              <div
                className={`relative p-8 rounded-2xl border border-white/10 
                bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl
                transition-all duration-500 group-hover:${item.borderColor}
                group-hover:bg-white/[0.03]`}
              >
                <div
                  className={`absolute inset-0 rounded-2xl border opacity-0 group-hover:opacity-100 transition duration-500 ${item.borderColor}`}
                ></div>

                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-lg mb-6 ${item.iconBg}`}
                >
                  <span className="text-xl">⚙️</span>
                </div>

                <h3
                  className={`text-lg font-semibold mb-3 transition-colors duration-300 ${item.color}`}
                >
                  {item.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Row>
    </Section>
  );
}

export default Chooseus;
