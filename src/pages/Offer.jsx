import { useEffect, useState } from "react";
import OfferBanner from "../components/offers/offerBanner";
import OfferSlider from "../components/offers/offersslide";
import LoginForm from "../pages/Login";
import SEO from "../components/seo/seo.js";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk.js";

export default function Offer() {
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const dispatch = useDispatch();

  const { pages } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPageBySlug("offer"));
  }, [dispatch]);

  const offerPage = pages?.find((page) => page.slug === "offer");

  return (
    <>
      <SEO
        title={offerPage?.meta_title}
        description={offerPage?.meta_description}
      />

      <div>
        <OfferBanner />
        <OfferSlider setShowLoginPopup={setShowLoginPopup} />
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
}
