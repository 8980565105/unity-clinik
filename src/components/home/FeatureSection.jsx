import React from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import feature1 from "../../assets/feature1.png";
import feature2 from "../../assets/feature2.png";
import feature3 from "../../assets/feature3.png";
const features = [
  {
    icon: feature1,
    title: "Shipping Worldwide",
    description: "We deliver to all the locations across the world.",
  },
  {
    icon: feature2,
    title: "14 Days Return",
    description: "We believe in satisfying and delighting our customers",
  },
  {
    icon: feature3,
    title: "Security Payment",
    description:
      "Security is a priority at MYcra.in and we make every effort to...",
  },
];
export default function FeatureSection() {
  return (
    <Section>
      <Row className="grid grid-cols-1 md:grid-cols-3 gap-[40px] pt-[25px] md:pt-[50px] !max-w-[935px] mx-auto">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-[22px]">
            {/* Gradient Box */}
            <div className="w-[62px] h-[50px] rounded-bl-[20px] bg-[linear-gradient(90deg,var(--primary-color)_0%,#ffffff_80%)] relative overflow-hidden flex-shrink-0">
              <img
                src={feature.icon}
                className="h-[42px] w-[42px] object-contain absolute bottom-0 right-0"
                alt="feature icon"
              />
            </div>
            {/* Text */}
            <div className="flex-1">
              <h3 className="font-medium text-20px mb-[10px] leading">
                {feature.title}
              </h3>
              <p className="text-14 sec-text-color">{feature.description}</p>
            </div>
          </div>
        ))}
      </Row>
    </Section>
  );
}
