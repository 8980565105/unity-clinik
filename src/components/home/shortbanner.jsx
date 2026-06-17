import React from "react";
import Section from "../ui/Section";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";

export default function ShortBanner() {
  const { slides, loading } = useSelector((state) => state.slides);
  // const banner3 = slides.find((s) => s.section === "banner3");
  // const desktopImg = getImageUrl(banner3?.banner3?.image);
  // const mobileImg = getImageUrl(banner3?.banner3?.mobileimg);

  // const desktopImg = bannerImage ? getImageUrl(bannerImage) : null;

  // const mobileImg = bannerMobileImage ? getImageUrl(bannerMobileImage) : null;

  const banner3 = slides.find((s) => s.section === "banner3");

  const bannerImage = banner3?.banner3?.image;
  const bannerMobileImage = banner3?.banner3?.mobileimg;

  const desktopImg = bannerImage ? getImageUrl(bannerImage) : null;

  const mobileImg = bannerMobileImage ? getImageUrl(bannerMobileImage) : null;

  if (loading) return null;

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
              alt="banner3"
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
