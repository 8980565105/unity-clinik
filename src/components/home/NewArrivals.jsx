import React, { useRef, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import NavBtn from "../ui/Navbtn";
import Row from "../ui/Row";
import ProductCard from "../productcard/ProductCard";
import shoesimg from "../../assets/shoes.png";
import winterimg from "../../assets/winter-clothes.png";
import watchimg from "../../assets/watch.png";
import earringsimg from "../../assets/earrings.png";
import Section from "../ui/Section";
import Heading from "../ui/Heading";

const staticProducts = [
  {
    _id: "s1",
    name: "Earings",
    images: [earringsimg],
    variants: [],
    discount: null,
  },
  {
    _id: "s2",
    name: "Shoes",
    images: [shoesimg],
    variants: [],
    discount: null,
  },
  {
    _id: "s3",
    name: "Watch",
    images: [watchimg],
    variants: [],
    discount: null,
  },
  {
    _id: "s4",
    name: "Winter Cloths",
    images: [winterimg],
    variants: [],
    discount: null,
  },
];

const CARD_W = 320;
const GAP = 40;
const STEP = CARD_W + GAP;

export default function NewArrivals({ setShowLoginPopup }) {
  const { products, loading } = useSelector((state) => state.products);
  const items = products && products.length > 0 ? products : staticProducts;
  const total = items.length;

  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(total);
  const [isCenter, setIsCenter] = useState(false);
  const tripled = total > 0 ? [...items, ...items, ...items] : [];

  const slideTo = (newIndex, withAnimation = true) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = withAnimation
      ? `transform 300ms cubic-bezier(0.4,0,0.2,1)`
      : "none";
    trackRef.current.style.transform = `translateX(-${newIndex * STEP}px)`;
  };

  // ✅ Next = scroll LEFT (show next items) = increase index
  const handleNext = () => {
    if (isAnimating.current || total === 0 || isCenter) return;
    isAnimating.current = true;
    const next = currentIndex + 1;
    setCurrentIndex(next);
    slideTo(next, true);
    setTimeout(() => {
      if (next >= total * 2) {
        const resetTo = next - total;
        setCurrentIndex(resetTo);
        slideTo(resetTo, false);
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
        const resetTo = prev + total;
        setCurrentIndex(resetTo);
        slideTo(resetTo, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  useEffect(() => {
    if (trackRef.current && total > 0) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${total * STEP}px)`;
    }
  }, [total]);

  useEffect(() => {
    if (total > 0) setCurrentIndex(total);
  }, [total]);

  useEffect(() => {
    const checkCenter = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const visible = Math.floor(width / STEP);
      setIsCenter(total <= visible);
    };
    const timeout = setTimeout(checkCenter, 0);
    window.addEventListener("resize", checkCenter);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", checkCenter);
    };
  }, [total]);

  return (
    <Section>
      <Row>
        <Heading title={"New Arrivals"} />

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
