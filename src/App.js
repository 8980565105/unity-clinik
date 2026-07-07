import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { fetchStoreInfo } from "./features/store/storeThunk";
import { useDispatch, useSelector } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import Loding from "./components/loding/loding";
import { fetchCart } from "./features/cart/cartThunk";
import { Toaster } from "react-hot-toast";
import HonestReportPage from "./pages/Honest-ReportPage";
import CouponSidebar from "./components/Coupon/CouponSidebar";
import ConsultationPage from "./pages/Consultation";
import Button from "./components/ui/Button";
import { resolveGuestId } from "./utils/guestId";
import Analytics from "./services/Analytics";
import AnnouncementBar from "./components/layout/AnnouncementBar";
import Wallet from "./pages/wallet";

const Home = lazy(() => import("./pages/Home"));
const Allproducts = lazy(() => import("./pages/Allproducts"));
const Allreviews = lazy(() => import("./pages/allreviews"));
const Collections = lazy(() => import("./pages/Collections"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const MyAccount = lazy(() => import("./pages/Account"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Product = lazy(() => import("./pages/ProductPage"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const AboutPage = lazy(() => import("./pages/About"));
const Result = lazy(() => import("./pages/Result"));
const OrderComplete = lazy(() => import("./pages/ordercomplet"));
const Orders = lazy(() => import("./components/userAccount/Orders"));
const PrivacyPolicy = lazy(() => import("./pages/privecy-policy"));
const RefundPolicy = lazy(() => import("./pages/Return-Refund-Policy"));
const TermService = lazy(() => import("./pages/Terms-of-service"));
const ShippingPolicy = lazy(() => import("./pages/shippingPolicy"));
const PhonePeCallback = lazy(
  () => import("./components/payment/PhonePeCallback"),
);
const ServerDown = lazy(() => import("./pages/Serverdownpage"));
const NotFound = lazy(() => import("./pages/notfound"));
const Consultation = lazy(() => import("./pages/Consultation"));

const hexToRgba = (hex, opacity) => {
  if (!hex) return null;
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substr(0, 2), 16);
  const g = parseInt(clean.substr(2, 2), 16);
  const b = parseInt(clean.substr(4, 2), 16);
  return `rgba(${r},${g},${b},${opacity})`;
};

const injectThemeColors = (theme) => {
  if (!theme) return;
  const root = document.documentElement;

  const primary = theme.primaryColor;
  const secondary = theme.secondaryColor;
  const button = theme.buttonColor;
  const font = theme.fontFamily;

  if (primary) {
    root.style.setProperty("--primary-color", primary);
    root.style.setProperty("--theme-color", primary);
    root.style.setProperty("--theme-hover-color", hexToRgba(primary, 0.5));
    root.style.setProperty("--theme-bg-100", primary);
    root.style.setProperty("--ef3a96-9", hexToRgba(primary, 0.09));
    root.style.setProperty("--theme-bg-rgba", hexToRgba(primary, 0.3));
    root.style.setProperty("--theme-bg-light", hexToRgba(primary, 0.15));
  }

  if (secondary) {
    root.style.setProperty("--secondary-color", secondary);
    root.style.setProperty("--sec-theme-color-30", hexToRgba(secondary, 0.5));
  }

  if (button) {
    root.style.setProperty("--button-color", button);
  }

  if (font) {
    root.style.setProperty("--font-family-main", `'${font}', sans-serif`);
    root.style.setProperty("--font-inter", `'${font}', sans-serif`);
  }
};

const RouterWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showConsultBtn, setShowConsultBtn] = useState(false);
  const { info: storeData, errorInfo } = useSelector((state) => state.store);

  useEffect(() => {
    dispatch(fetchStoreInfo());

    const token = localStorage.getItem("token");
    if (token) {
      dispatch(fetchCart());
    } else {
      resolveGuestId()
        .then(() => dispatch(fetchCart()))
        .catch(() => dispatch(fetchCart()));
    }
  }, [dispatch]);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;

      const heroHeight = window.innerHeight * 0.8;

      const footer = document.querySelector("footer");

      let footerVisible = false;

      if (footer) {
        const rect = footer.getBoundingClientRect();

        footerVisible = rect.top <= window.innerHeight;
      }

      if (currentScrollY < heroHeight || footerVisible) {
        setShowConsultBtn(false);
      } else {
        if (currentScrollY > lastScrollY) {
          setShowConsultBtn(true);
        }

        if (currentScrollY < lastScrollY) {
          setShowConsultBtn(false);
        }
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const faviconUrl = storeData?.theme?.faviconUrl;
    if (!faviconUrl) return;
    const baseURL = process.env.REACT_APP_API_URL_IMAGE;
    const fullUrl = faviconUrl.startsWith("http")
      ? faviconUrl
      : `${baseURL}${faviconUrl}`;
    let link = document.querySelector("link[rel='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = fullUrl;
  }, [storeData]);

  useEffect(() => {
    if (storeData?.theme) {
      injectThemeColors(storeData.theme);
    }
  }, [storeData]);

  if (
    errorInfo?.code === "ERR_NETWORK" ||
    errorInfo?.message === "Network Error"
  ) {
    return <ServerDown />;
  }

  const openWhatsApp = () => {
    const phone = "919327148908";

    const message = encodeURIComponent("Hi, I want consultation");

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Analytics />
      <ScrollToTop />
      <AnnouncementBar />
      <Header />
      <CouponSidebar />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loding />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/allproducts" element={<Allproducts />} />
          <Route path="/allreviews/:productId" element={<Allreviews />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/account-details" element={<MyAccount />} />
          <Route path="/cart" element={<Cart />}></Route>
          <Route path="/checkout" element={<Checkout />}></Route>
          <Route path="/products/:id" element={<Product />}></Route>
          <Route path="/wishlist" element={<Wishlist />}></Route>
          <Route path="/about" element={<AboutPage />} />
          <Route path="/results" element={<Result />} />
          <Route path="/ordercompleted" element={<OrderComplete />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />
          <Route path="/term-Service" element={<TermService />} />
          <Route path="/shipping-policy" element={<ShippingPolicy />} />
          <Route path="/consultation" element={<ConsultationPage />} />
          <Route path="/honest-report" element={<HonestReportPage />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route
            path="/payment/phonepe/callback"
            element={<PhonePeCallback />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {(location.pathname === "/" || location.pathname === "/home") && (
        <div
          className={`fixed bottom-0 left-0 w-full z-[9999]
      transition-all duration-300
      ${
        showConsultBtn
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0 pointer-events-none"
      }`}
        >
          <div className="bg-primary flex justify-center items-center py-1">
            <Button
              variant="common"
              className="!py-2 !bg-white !text-primary !font-bold !w-fit"
              onClick={() => navigate("/consultation")}
            >
              Book a Consultation
            </Button>
          </div>
        </div>
      )}

      <div className="fixed bottom-[70px] md:bottom-[100px] right-[15px] z-[1000]">
        <button
          className="bg-green-500 rounded-full p-3 whatsapp-pulse shadow-lg"
          onClick={openWhatsApp}
          aria-label="whatsapp"
        >
          <svg
            stroke="currentColor"
            fill="currentColor"
            strokeWidth="0"
            viewBox="0 0 448 512"
            height="30"
            width="30"
            className="text-white"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
          </svg>
        </button>
      </div>

      <Footer />
    </>
  );
};
function App() {
  return (
    <>
      <HelmetProvider>
        <Router>
          <RouterWrapper />
        </Router>
      </HelmetProvider>
    </>
  );
}
export default App;
