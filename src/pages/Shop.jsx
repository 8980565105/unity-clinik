import React, { useEffect } from "react";
import SecondarySection from "../components/ui/SecondarySection";
import WomenCollections from "../components/shop/WomenCollections";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import { getImageUrl } from "../components/utils/helper";
import shopBg from "../assets/shopBannerImage.jpg";
import { Toaster } from "react-hot-toast";
import SEO from "../components/seo/seo.js";
import { ShoppingCart } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import { useNavigate } from "react-router-dom";

const staticShopPage = {
  sections: [
    {
      _id: "static-1",
      title: "Shop",
      description: "Wearing Fancy Clothes.",
      image_url: shopBg,
      isStatic: true,
    },
  ],
};

export default function Shop() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pages } = useSelector((state) => state.pages);

  const { items = [] } = useSelector((state) => state.cart);
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = items.reduce((sum, item) => {
    const price =
      Number(item?.variant_id?.offerprice) > 0
        ? Number(item?.variant_id?.offerprice)
        : Number(item?.variant_id?.price || 0);
    return sum + price * (item.quantity || 1);
  }, 0);

  useEffect(() => {
    dispatch(fetchPageBySlug("shop"));
  }, [dispatch]);

  const shopPageFromApi = pages?.find((page) => page.slug === "shop");

  const shopPage = shopPageFromApi || staticShopPage;

  const getBgImage = (section) => {
    if (section.isStatic) return section.image_url;
    return getImageUrl(section.background_image_url || section.image_url);
  };

  return (
    <>
      <SEO
        title={shopPage?.meta_title || "Shop"}
        description={shopPage?.meta_description || "Shop page description"}
      />
      <Toaster position="top-center" reverseOrder={false} />
      <div className="hidden lg:flex relative">
        {shopPage?.sections?.map((section) => (
          <SecondarySection
            key={section._id}
            title={section.title || "Shop"}
            description={section.description || "Wearing Fancy Clothes."}
            backgroundImage={getBgImage(section)}
          />
        ))}
      </div>
      <WomenCollections />

      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            variants="common"
            onClick={() => navigate("/cart")}
            className="flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap
            bg-primary text-white text-[18px] min-w-[100px] py-[8px] md:py-[15px] hover:bg-[var(--theme-hover-color)] hover:text-white"
          >
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {totalItems}
              </span>
            </div>

            <span className="text-sm font-medium">View cart</span>

            <span className="text-gray-500">|</span>

            <span className="text-sm font-semibold">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </>
  );
}
