import React from "react";
import herobannerImage from "../../assets/herobanner.png";
import sale from "../../assets/sale.png";
import Row from "../ui/Row";
import Section from "../ui/Section";
import Button from "../ui/Button";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";

const heroBannerItem = {
  title: "Flesh Deals",
  description: "Best outfits for every occasion",
  button_name: "Shop Now",
  button_link: "/shop",
  image_url: herobannerImage,
  isStatic: true,
};

const DiscountBadge = () => {
  return (
    <>
      <div className="absolute top-3 left-3 w-[70px] h-[70px] sm:w-[90px] sm:h-[90px] md:w-[130px] md:h-[130px] z-30 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-[var(--primary-color)] shadow-md"
          style={{
            clipPath:
              "polygon(22% 10%, 46% 12%, 61% 2%, 71% 19%, 89% 24%, 86% 43%, 99% 64%, 82% 74%, 77% 96%, 77% 96%, 55% 94%, 35% 99%, 25% 84%, 8% 81%, 11% 59%, 1% 44%, 17% 31%)",
          }}
        ></div>
        <div
          className="absolute text-white font-bold leading-tight text-center 
                      text-[12px] sm:text-[16px] md:text-[24px] 
                      transform rotate-[-40deg] select-none tracking-tight"
        >
          50% <br /> off
        </div>
      </div>
    </>
  );
};
export default function HeroBanner() {
  const { pages } = useSelector((state) => state.pages);
  const homepage = pages?.find((page) => page.slug === "home");
  const bannerSectionFromApi = homepage?.sections?.find(
    (section) => section.type === "content",
  );
  const flashbanner = bannerSectionFromApi || heroBannerItem;
  return (
    <>
      <Section className="py-0">
        <Row>
          <div className="w-full bg-[var(--ef3a96-9)] rounded-xl overflow-hidden flex flex-col md:flex-row items-center">
            <div className="w-full md:w-[60%] h-[200px] md:h-[350px] lg:h-[420px] flex items-center justify-center">
              <img
                src={getImageUrl(flashbanner.image_url)}
                alt="banner"
                className=" h-[300px] object-contain"
              />
            </div>
            <div className="w-full md:w-[40%] text-white px-6 py-6 md:px-10 flex flex-col justify-center items-center md:items-start text-center md:text-left">
              <h2
                className="text-[20px] md:text-[50px] font-sans text-black mb-[10px] md:mb-[30px] relative leading"
                style={{ filter: "drop-shadow(5px 2px 4px rgba(0,0,0,0.25))" }}
              >
                {flashbanner.title}
                <span className="absolute theme-border-block w-[25px] md:w-[100px] !h-[3px]"></span>
              </h2>
              <p className="text-[10px] md:text-[24px] text-[#989696] mb-[5px] md:mb-[10px] font-regular">
                {flashbanner.description}
              </p>
              <Button
                variant="common"
                className=" px-[10px] lg:max-w-[150px] sm:max-w-[200px] mb-[10px]"
                onClick={() => (window.location.href = flashbanner.button_link)}
              >
                {flashbanner.button_name}
              </Button>
            </div>
          </div>
        </Row>
      </Section>
      <Section className="!py-0 bg-[#f3f3f3]">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 items-center gap-10">
          <div className="w-full h-[300px] md:h-[450px] lg:h-[500px]">
            <img
              src={getImageUrl(flashbanner.image_url)}
              alt="product"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="px-4 md:px-6 lg:px-10">
            <h2 className="text-[26px] md:text-[40px] lg:text-[48px] font-semibold text-gray-800 leading-tight mb-5">
              {flashbanner.title}
            </h2>
            <p className="text-gray-600 text-[14px] md:text-[16px] leading-relaxed mb-8 max-w-[550px]">
              {flashbanner.description}
            </p>
            <Button
              variant="common"
              className=" px-[10px] lg:max-w-[150px] sm:max-w-[200px] mb-[10px]"
              onClick={() => (window.location.href = flashbanner.button_link)}
            >
              {flashbanner.button_name}
            </Button>
          </div>
        </div>
      </Section>
    </>
  );
}
