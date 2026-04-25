import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Hero from "../components/home/Hero";
import CategoriesSection from "../components/home/CategoriesSection";
import NewArrivals from "../components/home/NewArrivals";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrendingClothes from "../components/home/TrendingClothes";
import Bestsellers from "../components/home/Bestsellers";
import RecommendedSection from "../components/home/RecommendedSection";
import FeatureSection from "../components/home/FeatureSection.jsx";
import { fetchPages } from "../features/pages/pagesThunk";
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

const Home = () => {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const homePage = pages?.find((page) => page.slug === "home");
  useEffect(() => {
    dispatch(fetchPages());
    dispatch(fetchProducts());
  }, [dispatch]);

  return (
    <>
      <SEO
        title={homePage?.meta_title}
        description={homePage?.seo?.meta_description}
      />
      <div className="text-center">
        <Toaster position="top center" />

        <Hero1 />

        {/* <Hero /> */}
        <Topdoctor />
        <Bestsellers setShowLoginPopup={setShowLoginPopup} />
        <CategoriesSection />
        <NewArrivals setShowLoginPopup={setShowLoginPopup} />
        <TrendingClothes setShowLoginPopup={setShowLoginPopup} />
        {/* <ShortBanner /> */}
        <FeaturedProducts setShowLoginPopup={setShowLoginPopup} />
        <Countsection />
        <RecommendedSection setShowLoginPopup={setShowLoginPopup} />
        <ContactHome />
        <Customerreviews />
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
