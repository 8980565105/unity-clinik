import React, { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import LoginForm from "./Login.jsx";
import { Toaster } from "react-hot-toast";
import SEO from "../components/seo/seo.js";
import Hero1 from "../components/home/hero1.jsx";
import Section from "../components/ui/Section.jsx";
import Loding from "../components/loding/loding.jsx";
import { getImageUrl } from "../components/utils/helper.js";
// import { fetchProductLabels } from "../features/productLabels/productlabelsThunk.js";

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
  const { pages, slugLoading } = useSelector((state) => state.pages);
  const homePage = pages?.find((page) => page.slug === "home");
  const { slides } = useSelector((state) => state.slides);
  const banner2 = slides.find((s) => s.section === "banner2");
  const { productLabels = [] } = useSelector((state) => state.productLabels);

  const bannerImage = banner2?.banner2?.image;
  const bannerMobileImage = banner2?.banner2?.mobileimg;

  const desktopImg = bannerImage ? getImageUrl(bannerImage) : null;

  const mobileImg = bannerMobileImage ? getImageUrl(bannerMobileImage) : null;

  useEffect(() => {
    dispatch(fetchPageBySlug("home"));
    // dispatch(fetchProductLabels({ status: "active" }));
  }, [dispatch]);

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
        <Toaster position="top center" />

        <Hero1 />

        <Suspense fallback={<Loding />}>
          <SuccessStorySection />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <Bestsellers
            setShowLoginPopup={setShowLoginPopup}
            // productLabels={productLabels}
          />
        </Suspense>

        <Suspense fallback={<Loding />}>
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

        <Suspense fallback={<Loding />}>
          <CategoriesSection />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <ShortBanner />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <Topdoctor />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <TrendingClothes
            setShowLoginPopup={setShowLoginPopup}
            // productLabels={productLabels}
          />
        </Suspense>

        <Suspense fallback={<Loding />}>
          <Banner4 />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <FeaturedProducts
            setShowLoginPopup={setShowLoginPopup}
            // productLabels={productLabels}
          />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <Countsection />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <RecommendedSection
            setShowLoginPopup={setShowLoginPopup}
            // productLabels={productLabels}
          />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <ContactHome />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <Customerreviews />
        </Suspense>
        <Suspense fallback={<Loding />}>
          <FeatureSection />
        </Suspense>
      </div>

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
