import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./index.css";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Offer from "./pages/Offer";
import ContactUs from "./pages/ContactUs";
import MyAccount from "./pages/Account";
import Orders from "./components/userAccount/Orders";
import Dashboard from "./components/userAccount/Dashbord";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Product from "./pages/ProductPage";
import Wishlist from "./pages/Wishlist";
import Updatecart from "./pages/Updatecart";
import Collections from "./pages/Collections";
import Address from "./components/Address/Address";
import AccountDetails from "./components/AccountDetails/AccountDetails";
import Faqs from "./pages/Faqs";
import AboutPage from "./pages/About";
import ScrollToTop from "./components/ScrollToTop";
import { fetchStoreInfo } from "./features/store/storeThunk";
import { useDispatch, useSelector } from "react-redux";
import Result from "./pages/Result";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "./pages/notfound";
import OrderComplete from "./pages/ordercomplet";
import PrivacyPolicy from "./pages/privecy-policy";
import RefundPolicy from "./pages/Return-Refund-Policy";
import TermService from "./pages/Terms-of-service";
import ShippingPolicy from "./pages/shippingPolicy";
import PhonePeCallback from "./components/payment/PhonePeCallback";
import ServerDown from "./pages/Serverdownpage";
import Loding from "./components/loding/loding";
import { FaWhatsapp } from "react-icons/fa";
import Allproducts from "./pages/Allproducts";
import Allreviews from "./pages/allreviews";

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
  const isShopPage = location.pathname === "/shop";
  const dispatch = useDispatch();
  const {
    info: storeData,
    loadingInfo,
    errorInfo,
  } = useSelector((state) => state.store);

  useEffect(() => {
    console.log("fetchStoreInfo called");
    dispatch(fetchStoreInfo());
  }, [dispatch]);

  useEffect(() => {
    console.log("RouterWrapper Mounted");

    return () => {
      console.log("RouterWrapper Unmounted");
    };
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

  if (loadingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loding />
      </div>
    );
  }

  if (errorInfo) {
    return <ServerDown />;
  }

  const openWhatsApp = () => {
    const phone = "919327148908";

    const message = encodeURIComponent("Hi, I want consultation");

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  return (
    <>
      <ScrollToTop />
      <Header hideOnMobileShopPage={isShopPage} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/allproducts" element={<Allproducts />} />
        <Route path="/allreviews/:productId" element={<Allreviews />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/offer" element={<Offer />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/account-details" element={<MyAccount />}>
          {/* <Route path="dashboard" element={<Dashboard />} /> */}
          {/* <Route path="account-details" element={<AccountDetails />} /> */}
        </Route>
        <Route path="/cart" element={<Cart />}></Route>
        {/* <Route path="/updatecart" element={<Updatecart />}></Route> */}
        <Route path="/checkout" element={<Checkout />}></Route>
        <Route path="/products/:id" element={<Product />}></Route>
        <Route path="/wishlist" element={<Wishlist />}></Route>
        <Route path="/faqs" element={<Faqs />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/results" element={<Result />} />
        <Route path="/ordercompleted" element={<OrderComplete />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refundpolicy" element={<RefundPolicy />} />
        <Route path="/termService" element={<TermService />} />
        <Route path="/shippingpolicy" element={<ShippingPolicy />} />
        <Route path="/payment/phonepe/callback" element={<PhonePeCallback />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <div className="fixed bottom-[70px] md:bottom-[100px] right-[15px] z-50">
        <button
          className="bg-green-500 rounded-full p-3 whatsapp-pulse shadow-lg"
          onClick={openWhatsApp}
        >
          <FaWhatsapp size={30} className="text-white" />
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
