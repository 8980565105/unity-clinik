import React from "react";
import Section from "../ui/Section";

import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";

export default function Banner4() {
  const { slides, loading } = useSelector((state) => state.slides);
  const banner4 = slides.find((s) => s.section === "banner4");

  const bannerImage = banner4?.banner4?.image;
  const bannerMobileImage = banner4?.banner4?.mobileimg;

  const desktopImg = bannerImage ? getImageUrl(bannerImage) : null;

  const mobileImg = bannerMobileImage ? getImageUrl(bannerMobileImage) : null;

  return (
    <>
      {desktopImg && (
        <Section className="w-full">
          <picture>
            {mobileImg && (
              <source media="(max-width: 767px)" srcSet={mobileImg} />
            )}

            <img
              src={desktopImg}
              alt="banner4"
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover"
            />
          </picture>
        </Section>
      )}
    </>
  );
}
