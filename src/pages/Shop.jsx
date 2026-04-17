import React, { useEffect } from "react";
import SecondarySection from "../components/ui/SecondarySection";
import WomenCollections from "../components/shop/WomenCollections";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import { getImageUrl } from "../components/utils/helper";
import shopBg from "../assets/shopBannerImage.jpg";
import { Toaster } from "react-hot-toast";

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
  const { pages, slugLoading } = useSelector((state) => state.pages);

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
    </>
  );
}
