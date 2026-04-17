import React from "react";
import underlineImg from "../../assets/underline.png";
import Section from "./Section";
import Row from "./Row";

const SecondarySection = ({ title, description, backgroundImage }) => {
  return (
    <Section
      className="bg-cover bg-center relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${backgroundImage})`,
      }}
    >
      <Row className="flex flex-col items-center justify-center text-center py-[50px] sm:py-[82px]">
        <h1 className="text-[40px] sm:text-[60px] text-white font-semibold mb-[15px] leading">
          {title}
        </h1>
        <p className="text-lg text-white">{description}</p>
        <img src={underlineImg} className="mt-[20px] md:mt-[30px]" />
      </Row>
    </Section>
  );
};

export default SecondarySection;
