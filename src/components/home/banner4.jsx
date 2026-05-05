import React from "react";
import Section from "../ui/Section";

import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";

export default function Banner4() {
  const { slides, loading } = useSelector((state) => state.slides);
  const banner4 = slides.find((s) => s.section === "banner4");
  const desktopImg = getImageUrl(banner4?.banner4?.image);
  const mobileImg = getImageUrl(banner4?.banner4?.mobileimg);
  if (loading) return null;

  return (
    <>
      <Section className="w-full">
        <img
          src={desktopImg}
          alt="banner4"
          className="hidden md:block w-full h-auto object-cover"
        />
        <img
          src={mobileImg}
          alt="banner4"
          className="block md:hidden w-full h-auto object-cover"
        />
      </Section>
    </>
  );
}
