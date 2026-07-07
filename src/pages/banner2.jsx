import React from "react";
import { useSelector } from "react-redux";
import { getImageUrl } from "../components/utils/helper";
import Section from "../components/ui/Section";

export default function Banner2() {
  const { slides = [] } = useSelector((state) => state.slides);

  const banner2 = slides.find((item) => item.section === "banner2");

  if (!banner2) return null;

  const desktopImg = banner2?.banner2?.image
    ? getImageUrl(banner2.banner2.image)
    : null;

  const mobileImg = banner2?.banner2?.mobileimg
    ? getImageUrl(banner2.banner2.mobileimg)
    : null;

  if (!desktopImg) return null;

  return (
    <>
      <div>
        {desktopImg && (
          <Section className="w-full">
            <picture>
              {mobileImg && (
                <source media="(max-width: 767px)" srcSet={mobileImg} />
              )}
              <img
                src={desktopImg}
                alt="banner2"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-cover"
              />
            </picture>
          </Section>
        )}
      </div>
    </>
  );
}
