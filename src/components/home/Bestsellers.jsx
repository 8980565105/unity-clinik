import React, { useRef, useState, useCallback, useEffect } from "react";
import Row from "../ui/Row.jsx";
import { useSelector } from "react-redux";
import Section from "../ui/Section.jsx";
import ProductCard from "../productcard/ProductCard.jsx";
import NavBtn from "../ui/Navbtn";
import Heading from "../ui/Heading.jsx";

const CARD_W = 270;
const GAP = 20;
const STEP = CARD_W + GAP;

const Bestsellers = ({ setShowLoginPopup }) => {
  const { products = [] } = useSelector((state) => state.products);

  const sellersProducts = products.filter(
    (product) =>
      product.status === "active" &&
      product.variants?.some((variant) => variant.is_best_seller),
  );

  const total = sellersProducts.length;
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(total);

  const [isCenter, setIsCenter] = useState(false);

  const tripled =
    total > 0
      ? [...sellersProducts, ...sellersProducts, ...sellersProducts]
      : [];

  const getVisibleCount = useCallback(() => {
    if (!containerRef.current) return 4;
    return Math.floor(containerRef.current.offsetWidth / STEP);
  }, []);

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

useEffect(() => {
  if (total > 0) {
    setCurrentIndex(total);
  }
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

  if (total === 0) return null;

  return (
    <Section>
      <Row>
        <Heading title={"Our Best Seller's"} />

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
            {(isCenter ? sellersProducts : tripled).map((product, i) => (
              <div
                key={`${product._id}-${i}`}
                className="flex-shrink-0 w-[270px]"
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
};

export default Bestsellers;
