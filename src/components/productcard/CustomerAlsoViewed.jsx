import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import { getRecentlyViewed } from "../utils/recentlyViewed";
import { useSelector } from "react-redux";
import Section from "../ui/Section";
import Row from "../ui/Row";
import ProductCard from "../productcard/ProductCard";
import NavBtn from "../ui/Navbtn";
import Heading from "../ui/Heading";

const CARD_W = 320;
const GAP = 40;
const STEP = CARD_W + GAP;

export default function CustomerAlsoViewed({
  currentProductId = null,
  setShowLoginPopup,
}) {
  const { products = [] } = useSelector((state) => state.products);
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);

  const [isCenter, setIsCenter] = useState(false);

  const recentIds = getRecentlyViewed();

  const items = useMemo(() => {
    const byId = products.reduce((acc, p) => {
      if (p?._id) acc[p._id] = p;
      return acc;
    }, {});
    const recent = recentIds.map((id) => byId[id]).filter(Boolean);
    return (recent.length ? recent : products).filter(
      (p) => p._id !== currentProductId,
    );
  }, [products, recentIds, currentProductId]);

  const total = items.length;
  const [currentIndex, setCurrentIndex] = useState(total);

  const tripled = total > 0 ? [...items, ...items, ...items] : [];

  const getVisibleCount = useCallback(() => {
    if (!containerRef.current) return 4;
    return Math.floor(containerRef.current.offsetWidth / STEP);
  }, []);

  useEffect(() => {
    const checkCenter = () => {
      if (!containerRef.current) return;
      const visible = Math.floor(containerRef.current.offsetWidth / STEP);
      setIsCenter(total <= visible);
    };

    checkCenter();
    window.addEventListener("resize", checkCenter);

    return () => window.removeEventListener("resize", checkCenter);
  }, [total]);

  useEffect(() => {
    if (trackRef.current && total > 0) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${total * STEP}px)`;
    }
  }, [total]);

  const slideTo = (newIndex, withAnimation = true) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = withAnimation
      ? "transform 300ms cubic-bezier(0.4,0,0.2,1)"
      : "none";
    trackRef.current.style.transform = `translateX(-${newIndex * STEP}px)`;
  };

  const handleNext = () => {
    if (isAnimating.current || total === 0 || isCenter) return;
    isAnimating.current = true;

    const next = currentIndex + 1;
    setCurrentIndex(next);
    slideTo(next, true);

    setTimeout(() => {
      if (next >= total * 2) {
        const reset = next - total;
        setCurrentIndex(reset);
        slideTo(reset, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  const handlePrev = () => {
    if (isAnimating.current || total === 0 || isCenter) return;
    isAnimating.current = true;

    const prev = currentIndex - 1;
    setCurrentIndex(prev);
    slideTo(prev, true);

    setTimeout(() => {
      if (prev < total) {
        const reset = prev + total;
        setCurrentIndex(reset);
        slideTo(reset, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  if (!items.length) return null;

  return (
    <Section>
      <Row>
        <Heading title={"Customer Also Viewed"} />

        {!isCenter && (
          <div className="flex items-center justify-end gap-3 mb-4">
            <NavBtn direction="left" onClick={handlePrev} variant="primary" />
            <NavBtn direction="right" onClick={handleNext} variant="primary" />
          </div>
        )}

        <div className="overflow-hidden" ref={containerRef}>
          <div
            ref={trackRef}
            className={`flex ${isCenter ? "justify-center" : "justify-start"}`}
            style={{
              gap: `${GAP}px`,
              transform: isCenter ? "none" : `translateX(-${total * STEP}px)`,
              willChange: "transform",
            }}
          >
            {(isCenter ? items : tripled).map((product, i) => (
              <div
                key={`${product._id}-${i}`}
                className="flex-shrink-0 w-[320px]"
              >
                <ProductCard
                  product={product}
                  setShowLoginPopup={setShowLoginPopup}
                />
              </div>
            ))}
          </div>
        </div>
      </Row>
    </Section>
  );
}
