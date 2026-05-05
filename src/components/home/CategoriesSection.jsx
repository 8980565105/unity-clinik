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

const CARD_W = 250;
const GAP = 40;
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
  const [isCenter, setIsCenter] = useState(false);

  const tripled = total > 0 ? [...filtered, ...filtered, ...filtered] : [];

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

  useEffect(() => {
    if (trackRef.current && total > 0) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${total * STEP}px)`;
    }
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
    }, 300);
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
              transform: isCenter ? "none" : `translateX(-${total * STEP}px)`,
            }}
          >
            {(isCenter ? filtered : tripled).map((cat, i) => (
              <div
                key={`${cat._id}-${i}`}
                className="flex-shrink-0 w-[250px] px-2 cursor-pointer"
                onClick={() => navigate(`/shop?category=${cat.name}`)}
              >
                <div className="group border bg-gradient-to-b from-[#f2fafc] to-[#d1eaff] border-gray-100 rounded-xl overflow-hidden hover:border-primary transition-all duration-200">
                  <div className="text-center text-[18px] capitalize text-primary min-h-[44px] flex items-center justify-center font-semibold px-1 pt-1">
                    {cat.name}
                  </div>

                  <div className="relative w-full aspect-square flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        cat.isStatic
                          ? cat.image_url
                          : getImageUrl(cat.image_url)
                      }
                      alt={cat.name}
                      className="w-[90%] h-[90%] object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                  {/* <div className="px-2 py-3 text-center text-[18px] capitalize text-primary min-h-[44px] flex items-center justify-center">
                    {cat.name}
                  </div> */}
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
