import { useState } from "react";
import OfferBanner from "../components/offers/offerBanner";
import OfferSlider from "../components/offers/offersslide";

import LoginForm from "../pages/Login";

export default function Offer() {
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  return (
    <>
      <div>
        <OfferBanner />
        <OfferSlider setShowLoginPopup={setShowLoginPopup} />
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
}
