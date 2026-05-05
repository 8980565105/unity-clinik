import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback,
} from "react";
import ProductCard from "./ProductCard";
import Row from "../ui/Row";
import Section from "../ui/Section";
import NavBtn from "../ui/Navbtn";
import Heading from "../ui/Heading";

const CARD_W = 320;
const GAP = 40;
const STEP = CARD_W + GAP;

export default function SimilarProducts({
  product,
  products = [],
  setShowLoginPopup,
}) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);

  const [isCenter, setIsCenter] = useState(false);

  const similarProducts = useMemo(() => {
    if (!product || !product.category_id) return [];

    const categoryId =
      typeof product.category_id === "object"
        ? product.category_id._id
        : product.category_id;

    return products.filter((p) => {
      const pCategoryId =
        typeof p.category_id === "object" ? p.category_id._id : p.category_id;
      return pCategoryId === categoryId && p._id !== product._id;
    });
  }, [product, products]);

  const total = similarProducts.length;
  const [currentIndex, setCurrentIndex] = useState(total);

  const tripled =
    total > 0
      ? [...similarProducts, ...similarProducts, ...similarProducts]
      : [];

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
      setCurrentIndex(total);
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

  if (!similarProducts.length) {
    return <p className="text-center py-10">No similar products found.</p>;
  }

  return (
    <Section>
      <Row>
        <Heading title={"Similar Products"} />
      
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
            {(isCenter ? similarProducts : tripled).map((p, i) => (
              <div key={`${p._id}-${i}`} className="flex-shrink-0 w-[320px]">
                <ProductCard
                  product={p}
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
