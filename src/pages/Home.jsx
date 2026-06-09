import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import CategoriesSection from "../components/home/CategoriesSection";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrendingClothes from "../components/home/TrendingClothes";
import Bestsellers from "../components/home/Bestsellers";
import RecommendedSection from "../components/home/RecommendedSection";
import FeatureSection from "../components/home/FeatureSection.jsx";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import { fetchProducts } from "../features/products/productsThunk";
import LoginForm from "./Login.jsx";
import { Toaster } from "react-hot-toast";
import Customerreviews from "../components/home/Customerreviews.jsx";
import ShortBanner from "../components/home/shortbanner.jsx";
import ContactHome from "../components/home/ContactHome.jsx";
import Countsection from "../components/home/Countsection.jsx";
import Topdoctor from "../components/home/Topdoctor.jsx";
import SEO from "../components/seo/seo.js";
import Hero1 from "../components/home/hero1.jsx";
import BannerSlider from "../components/home/SliderBanner.jsx";
import Section from "../components/ui/Section.jsx";
import Loding from "../components/loding/loding.jsx";
import { getImageUrl } from "../components/utils/helper.js";
import Banner4 from "../components/home/banner4.jsx";
import { fetchAllReviews } from "../features/reivews/reviewsThunk.js";
import SuccessStorySection from "../components/home/SuccessStory.jsx";

const Home = () => {
  const dispatch = useDispatch();
  const { pages, slugLoading } = useSelector((state) => state.pages);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const homePage = pages?.find((page) => page.slug === "home");
  const { slides } = useSelector((state) => state.slides);
  const banner2 = slides.find((s) => s.section === "banner2");
  const desktopImg = getImageUrl(banner2?.banner2?.image);
  const mobileImg = getImageUrl(banner2?.banner2?.mobileimg);
  const { products = [] } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchPageBySlug("Home"));
    dispatch(fetchProducts());
    console.log("Home Mounted");
  }, [dispatch]);

  useEffect(() => {
    if (products.length > 0) {
      dispatch(fetchAllReviews({ page: 1, limit: 500 }));
    }
  }, [products.length, dispatch]);
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

        <SuccessStorySection />

        <Bestsellers setShowLoginPopup={setShowLoginPopup} />
        <BannerSlider />
        <Section className="w-full">
          <img
            src={desktopImg}
            alt="banner2"
            className="hidden md:block w-full h-auto object-cover"
          />

          <img
            src={mobileImg}
            alt="banner2"
            className="block md:hidden w-full h-auto object-cover"
          />
        </Section>
        <CategoriesSection />
        <ShortBanner />
        <Topdoctor />
        <TrendingClothes setShowLoginPopup={setShowLoginPopup} />
        <Banner4 />
        <FeaturedProducts setShowLoginPopup={setShowLoginPopup} />
        <Countsection />
        <RecommendedSection setShowLoginPopup={setShowLoginPopup} />
        <ContactHome />
        {/* <Customerreviews /> */}
        <FeatureSection />
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
