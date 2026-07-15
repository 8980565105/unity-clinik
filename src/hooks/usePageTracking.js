import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

const getPageTitle = (pathname) => {
  if (pathname === "/" || pathname === "/Home") return "Home";
  if (pathname.startsWith("/products/")) return "Product Detail";
  if (pathname.startsWith("/cart")) return "Cart";
  if (pathname.startsWith("/checkout")) return "Checkout";
  if (pathname.startsWith("/wishlist")) return "Wishlist";
  if (pathname.startsWith("/orders")) return "My Orders";
  if (pathname.startsWith("/allproducts")) return "All Products";
  if (pathname.startsWith("/collections")) return "Collections";
  if (pathname.startsWith("/account-details")) return "Account Details";
  if (pathname.startsWith("/about")) return "About Us";
  if (pathname.startsWith("/contact-us")) return "Contact Us";
  if (pathname.startsWith("/wallet")) return "Wallet";
  if (pathname.startsWith("/consultation")) return "Consultation";
  return pathname;
};

export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    const track = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        await api.post("/track/page-visit", {
          page_url: location.pathname,
          page_title: getPageTitle(location.pathname),
          referrer: document.referrer || "",
        });
      } catch (_) {}
    };
    track();
  }, [location.pathname]);
};
