import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Hero from "../components/home/Hero";
import CategoriesSection from "../components/home/CategoriesSection";
import NewArrivals from "../components/home/NewArrivals";
import FeaturedProducts from "../components/home/FeaturedProducts";
import TrendingClothes from "../components/home/TrendingClothes";
import HeroBanner from "../components/home/HeroBanner";
import Bestsellers from "../components/home/Bestsellers";
import RecommendedSection from "../components/home/RecommendedSection";
import BannerClothes from "../components/home/bannerclothes.jsx";
import FeatureSection from "../components/home/FeatureSection.jsx";
import { fetchPages } from "../features/pages/pagesThunk";
import { fetchProducts } from "../features/products/productsThunk";
import { fetchCategories } from "../features/categories/categoriesThunk";
import LoginForm from "./Login.jsx";
import { Toaster } from "react-hot-toast";
import Customerreviews from "../components/home/Customerreviews.jsx";
import ShortBanner from "../components/home/shortbanner.jsx";
// import light from ""

const Home = () => {
  const dispatch = useDispatch();
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  useEffect(() => {
    dispatch(fetchPages());
    dispatch(fetchProducts());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      <div className="text-center">
        <Toaster position="top center" />

        {/* hero baner home page */}
        <Hero />

        {/* bastseller product admin mathi je bestseller true hase e show thase  */}
        <Bestsellers />

        {/* all subcategory show thay se  */}
        <CategoriesSection />

        {/* all new add kare e produc show thase  */}
        <NewArrivals />

        {/* tranding product admin je tranding true kare e product show thase  */}
        <TrendingClothes />

        {/* short banner 1*/}
        <ShortBanner />

        {/* featured products admin je featured true kare e product show thase  */}
        <FeaturedProducts setShowLoginPopup={setShowLoginPopup} />

        {/* home page 2  */}
        <HeroBanner />
        {/* all product show thase  */}
        <RecommendedSection />
        {/* banner 3 */}
        <BannerClothes />
        {/* all reviews show thase  */}
        <Customerreviews />
        {/*  static section se  */}
        <FeatureSection />
      </div>

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-[1062px] rounded-md overflow-hidden">
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
