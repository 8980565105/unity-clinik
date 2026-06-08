import React, { useRef, useState, useCallback, useEffect } from "react";
import Row from "../ui/Row.jsx";
import { useSelector } from "react-redux";
import Section from "../ui/Section.jsx";
import NavBtn from "../ui/Navbtn";
import Heading from "../ui/Heading.jsx";
import ProductCard from "../product/ProductCard";

const getGap = () => {
  if (window.innerWidth <= 768) return 0;
  
  return 16;
};
const GAP = getGap();
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
  const currentIndexRef = useRef(total);

  const [cardWidth, setCardWidth] = useState(0);
  const [isCenter, setIsCenter] = useState(false);
  const [ready, setReady] = useState(false);

  const getStep = useCallback(
    (cw) => cw + (window.innerWidth <= 768 ? 0 : GAP),
    [],
  );
  const getVisible = () =>
    typeof window !== "undefined" && window.innerWidth <= 768 ? 2 : 4;

  const recalculate = useCallback(() => {
    if (!containerRef.current) return;
    const visible = getVisible();
    const containerWidth = containerRef.current.offsetWidth;
    const cw = Math.floor((containerWidth - GAP * (visible - 1)) / visible);
    const step = cw + GAP;
    const canFit = total <= visible;

    setCardWidth(cw);
    setIsCenter(canFit);

    if (trackRef.current && !canFit && total > 0) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${currentIndexRef.current * step}px)`;
    }

    setReady(true);
  }, [total]);

  useEffect(() => {
    const timeout = setTimeout(recalculate, 0);
    window.addEventListener("resize", recalculate);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", recalculate);
    };
  }, [recalculate]);

  useEffect(() => {
    if (total > 0) {
      currentIndexRef.current = total;
    }
  }, [total]);

  const slideTo = (newIndex, withAnimation = true) => {
    if (!trackRef.current || cardWidth === 0) return;
    const step = getStep(cardWidth);
    trackRef.current.style.transition = withAnimation
      ? "transform 300ms cubic-bezier(0.4,0,0.2,1)"
      : "none";
    trackRef.current.style.transform = `translateX(-${newIndex * step}px)`;
  };

  const handleNext = () => {
    if (isAnimating.current || total === 0 || isCenter || cardWidth === 0)
      return;
    isAnimating.current = true;
    const next = currentIndexRef.current + 1;
    currentIndexRef.current = next;
    slideTo(next, true);
    setTimeout(() => {
      if (next >= total * 2) {
        const reset = next - total;
        currentIndexRef.current = reset;
        slideTo(reset, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  const handlePrev = () => {
    if (isAnimating.current || total === 0 || isCenter || cardWidth === 0)
      return;
    isAnimating.current = true;
    const prev = currentIndexRef.current - 1;
    currentIndexRef.current = prev;
    slideTo(prev, true);
    setTimeout(() => {
      if (prev < total) {
        const reset = prev + total;
        currentIndexRef.current = reset;
        slideTo(reset, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  if (total === 0) return null;

  const tripled = [...sellersProducts, ...sellersProducts, ...sellersProducts];

  return (
    <Section>
      <Row>
        <Heading title={"Our Best Seller's"} />

        {!isCenter && ready && (
          <div className="flex items-center justify-end gap-3 mb-4">
            <NavBtn direction="left" onClick={handlePrev} variant="primary" />
            <NavBtn direction="right" onClick={handleNext} variant="primary" />
          </div>
        )}

        <div className="overflow-hidden w-full" ref={containerRef}>
          {ready && cardWidth > 0 && (
            <div
              ref={trackRef}
              className="flex "
              style={{
                gap: `${getGap()}px`,
                transform: isCenter
                  ? "none"
                  : `translateX(-${currentIndexRef.current * getStep(cardWidth)}px)`,
                willChange: "transform",
                justifyContent: isCenter ? "center" : "flex-start",
              }}
            >
              {(isCenter ? sellersProducts : tripled).map((product, i) => (
                <div
                  key={`${product._id}-${i}`}
                  className="flex-shrink-0"
                  style={{ width: `${cardWidth}px` }}
                >
                  <ProductCard
                    product={product}
                    setShowLoginPopup={setShowLoginPopup}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </Row>
    </Section>
  );
};

export default Bestsellers;
