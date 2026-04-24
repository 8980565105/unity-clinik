import { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/helper";
import NavBtn from "../ui/Navbtn";
import shoppingImg from "../../assets/shopping.png";
import kurtiImg from "../../assets/Kurti.png";
import JeansImg from "../../assets/Jeans.png";
import jewelleryImg from "../../assets/jewellery.png";
import cropImg from "../../assets/Crop Tops.png";
import Section from "../ui/Section";
import Row from "../ui/Row";
import Heading from "../ui/Heading";

const STATIC_CATEGORIES = [
  { _id: "s1", name: "Saree", image_url: shoppingImg, isStatic: true },
  { _id: "s2", name: "Kurti", image_url: kurtiImg, isStatic: true },
  { _id: "s3", name: "Jeans", image_url: JeansImg, isStatic: true },
  { _id: "s4", name: "Jewellery", image_url: jewelleryImg, isStatic: true },
  { _id: "s5", name: "Crop Tops", image_url: cropImg, isStatic: true },
  { _id: "s6", name: "Jewellery", image_url: jewelleryImg, isStatic: true },
  { _id: "s7", name: "Saree", image_url: shoppingImg, isStatic: true },
  { _id: "s8", name: "Kurti", image_url: kurtiImg, isStatic: true },
];

const CARD_W = 174;
const GAP = 20;
const STEP = CARD_W + GAP;

const CategoriesSection = () => {
  const navigate = useNavigate();
  const { items: categories, loading } = useSelector((s) => s.subcategories);

  const displayCategories =
    !loading && categories?.length > 0 ? categories : STATIC_CATEGORIES;
  const filtered = displayCategories.filter((c) => c.parent_id !== null);

  const total = filtered.length;
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const initializedRef = useRef(false); 

  const [currentIndex, setCurrentIndex] = useState(total);
  const [visibleCount, setVisibleCount] = useState(5);

  const isCenter = total <= visibleCount;
  const tripled = total > 0 ? [...filtered, ...filtered, ...filtered] : [];

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      if (containerRef.current) {
        setVisibleCount(Math.floor(containerRef.current.offsetWidth / STEP));
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!trackRef.current || total === 0 || initializedRef.current) return;
    initializedRef.current = true;
    setCurrentIndex(total);
  }, [total]);

  const slideTo = (newIndex, withAnimation = true) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = withAnimation
      ? `transform 300ms cubic-bezier(0.4,0,0.2,1)`
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

  if (total === 0) return null;

  return (
    <Section>
      <Row>
        <Heading title={"Shop by SubCategories"} />

        {!isCenter && (
          <div className="flex items-center justify-end gap-3 mb-4">
            <NavBtn direction="left" onClick={handlePrev} variant="primary" />
            <NavBtn direction="right" onClick={handleNext} variant="primary" />
          </div>
        )}

        <div className="overflow-hidden w-full" ref={containerRef}>
          <div
            ref={trackRef}
            className={`flex ${isCenter ? "justify-center" : "justify-start"}`}
            style={{
              gap: `${GAP}px`,
              willChange: "transform",
            }}
          >
            {(isCenter ? filtered : tripled).map((cat, i) => (
              <div
                key={`${cat._id}-${i}`}
                className="flex-shrink-0 w-[150px] px-2 cursor-pointer"
                onClick={() => navigate(`/shop?category=${cat.name}`)}
              >
                <div className="group border border-gray-100 rounded-xl overflow-hidden hover:border-gray-300 transition-all duration-200">
                  <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                    <img
                      src={cat.isStatic ? cat.image_url : getImageUrl(cat.image_url)}
                      alt={cat.name}
                      className="w-[90%] h-[90%] object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  <div className="px-2 py-3 text-center text-[13px] text-gray-800 min-h-[44px] flex items-center justify-center">
                    {cat.name}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Row>
    </Section>
  );
};

export default CategoriesSection;