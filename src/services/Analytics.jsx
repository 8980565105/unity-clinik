import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    if (window.gtag) {
      window.gtag("config", "G-6D63EPK8QV", {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}