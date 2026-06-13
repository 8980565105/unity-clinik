import React from "react";
import Section from "../ui/Section";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";

export default function ShortBanner() {
  const { slides, loading } = useSelector((state) => state.slides);
  const banner3 = slides.find((s) => s.section === "banner3");
  const desktopImg = getImageUrl(banner3?.banner3?.image);
  const mobileImg = getImageUrl(banner3?.banner3?.mobileimg);

  if (loading) return null;

  return (
    <>
      <Section className="w-full">
        <img
          src={desktopImg}
          alt="banner3"
          loading="lazy"
          decoding="async"
          className="hidden md:block w-full h-auto object-cover"
        />
        <img
          src={mobileImg}
          alt="banner3"
          loading="lazy"
          decoding="async"
          className="block md:hidden w-full h-auto object-cover"
        />
      </Section>
    </>
  );
}
