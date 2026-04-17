// import { Link } from "react-router-dom";
import faqBg from "../../assets/size-bg.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../../features/pages/pagesThunk";
import { useEffect } from "react";
import { getImageUrl } from "../utils/helper";

const aboutBannerItem = {
  title: "About Us",
  description:
    "We are passionate about bringing you the finest collection of outfits for every occasion. Our journey started with a simple goal — to make fashion accessible to everyone.",
  button_name: "Shop Now",
  button_link: "/shop",
  image_url: faqBg,
  isStatic: true,
};

export default function AboutBanner() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPageBySlug("about"));
  }, [dispatch]);

  const aboutPage = pages?.find((page) => page.slug === "about");

  const heroSection = aboutPage?.sections?.find(
    (section) => section.type === "hero_slider",
  );
  const heroSlide = heroSection?.slides?.[0];

  const bannerData = heroSlide
    ? {
        title: heroSlide.title || heroSection.title,
        description: heroSlide.description || heroSection.description,
        background_image_url:
          heroSlide.background_image_url || heroSection.background_image_url,
      }
    : aboutBannerItem;

  const bgImage = heroSlide
    ? getImageUrl(bannerData.background_image_url)
    : aboutBannerItem.image_url;

  return (
    <div
      className="bg-cover bg-center bg-no-repeat min-h-[250px] min-[500px]:min-h-[500px] flex items-center justify-center"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      <div className="text-center max-w-[688px] px-4">
        <h1 className="text-[24px] sm:text-[40px] font-semibold mb-[15px] sm:mb-[22px]">
          {bannerData.title || aboutBannerItem.title}
        </h1>
        <p className="text-dark text-[14px] sm:text-[24px]">
          {bannerData.description || aboutBannerItem.description}
        </p>
      </div>
    </div>
  );
}
