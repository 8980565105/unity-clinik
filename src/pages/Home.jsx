import React, { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import LoginForm from "./Login.jsx";
import SEO from "../components/seo/seo.js";
import Hero1 from "../components/home/hero1.jsx";
import Section from "../components/ui/Section.jsx";
import Loding from "../components/loding/loding.jsx";
import { getImageUrl } from "../components/utils/helper.js";
import { ConstaltationPopup } from "../components/popup/constaltantionpopup.jsx";

const CategoriesSection = lazy(
  () => import("../components/home/CategoriesSection"),
);
const FeaturedProducts = lazy(
  () => import("../components/home/FeaturedProducts"),
);

const TrendingClothes = lazy(
  () => import("../components/home/TrendingClothes"),
);

const Bestsellers = lazy(() => import("../components/home/Bestsellers"));

const RecommendedSection = lazy(
  () => import("../components/home/RecommendedSection"),
);

const FeatureSection = lazy(
  () => import("../components/home/FeatureSection.jsx"),
);

const Customerreviews = lazy(
  () => import("../components/home/Customerreviews.jsx"),
);

const ShortBanner = lazy(() => import("../components/home/shortbanner.jsx"));

const ContactHome = lazy(() => import("../components/home/ContactHome.jsx"));

const Countsection = lazy(() => import("../components/home/Countsection.jsx"));

const Topdoctor = lazy(() => import("../components/home/Topdoctor.jsx"));

const BannerSlider = lazy(() => import("../components/home/SliderBanner.jsx"));

const Banner4 = lazy(() => import("../components/home/banner4.jsx"));

const SuccessStorySection = lazy(
  () => import("../components/home/SuccessStory.jsx"),
);
const Home = () => {
  const dispatch = useDispatch();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  // const [isConsultationPopupOpen, setIsConsultationPopupOpen] = useState(false);

  const [isConsultationPopupOpen, setIsConsultationPopupOpen] = useState(false);
  const [isHomeLoaded, setIsHomeLoaded] = useState(false);

  const { pages, slugLoading } = useSelector((state) => state.pages);
  const { data: popupData } = useSelector((state) => state.popup);

  const homePage = pages?.find((page) => page.slug === "home");
  const { slides } = useSelector((state) => state.slides);
  const banner2 = slides.find((s) => s.section === "banner2");
  const { productLabels = [] } = useSelector((state) => state.productLabels);

  const bannerImage = banner2?.banner2?.image;
  const bannerMobileImage = banner2?.banner2?.mobileimg;

  const desktopImg = bannerImage ? getImageUrl(bannerImage) : null;

  const mobileImg = bannerMobileImage ? getImageUrl(bannerMobileImage) : null;

  useEffect(() => {
    if (!slugLoading) {
      setIsHomeLoaded(true);
    }
  }, [slugLoading]);

  useEffect(() => {
    dispatch(fetchPageBySlug("home"));
  }, [dispatch]);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenConsultationPopup");

    //   if (
    //     isHomeLoaded &&
    //     !hasSeen &&
    //     popupData &&
    //     popupData.status === "active" &&
    //     popupData.type === "consultation"
    //   ) {
    //     const timer = setTimeout(() => {
    //       setIsConsultationPopupOpen(true);
    //     }, 3000);

    //     return () => clearTimeout(timer);
    //   }
    const consultation = popupData?.consultation;

    if (
      isHomeLoaded &&
      !hasSeen &&
      consultation &&
      consultation.status === "active"
    ) {
      const timer = setTimeout(() => {
        setIsConsultationPopupOpen(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [popupData, isHomeLoaded]);

  useEffect(() => {
    if (isConsultationPopupOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isConsultationPopupOpen]);

  const handleCloseConsultationPopup = () => {
    localStorage.setItem("hasSeenConsultationPopup", "true");
    setIsConsultationPopupOpen(false);
  };

  return (
    <>
      {slugLoading && (
        <div className="fixed inset-0 bg-white z-[9999] flex items-center justify-center">
          <Loding />
        </div>
      )}
      <SEO
        title={homePage?.meta_title}
        description={homePage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${homePage?.seo_image}`}
      />
      <div className="text-center">
        <Hero1 />

        <Suspense>
          <SuccessStorySection />
        </Suspense>
        <Suspense>
          <Bestsellers />
        </Suspense>

        <Suspense>
          <BannerSlider />
        </Suspense>

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

        <Suspense>
          <CategoriesSection />
        </Suspense>
        <Suspense>
          <ShortBanner />
        </Suspense>
        <Suspense>
          <Topdoctor />
        </Suspense>
        <Suspense>
          <TrendingClothes />
        </Suspense>

        <Suspense>
          <Banner4 />
        </Suspense>
        <Suspense>
          <FeaturedProducts />
        </Suspense>
        <Suspense>
          <Countsection />
        </Suspense>
        <Suspense>
          <RecommendedSection />
        </Suspense>
        <Suspense>
          <ContactHome />
        </Suspense>
        <Suspense>
          <Customerreviews />
        </Suspense>
        <Suspense>
          <FeatureSection />
        </Suspense>
      </div>

      {isConsultationPopupOpen && (
        // <ConstaltationPopup
        //   isOpen={isConsultationPopupOpen}
        //   onClose={handleCloseConsultationPopup}
        //   data={popupData?.consultation}
        // />
        <ConstaltationPopup
          isOpen={isConsultationPopupOpen}
          onClose={handleCloseConsultationPopup}
          data={popupData?.consultation?.consultation}
        />
      )}

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setShowLoginPopup(false)}
              onSwitch={() => setShowLoginPopup(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
