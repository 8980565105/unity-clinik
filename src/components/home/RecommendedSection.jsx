// import React, { useRef, useState, useCallback, useEffect } from "react";
// import { useSelector } from "react-redux";
// import Section from "../ui/Section.jsx";
// import Row from "../ui/Row.jsx";
// import ProductCard from "../productcard/ProductCard.jsx";
// import NavBtn from "../ui/Navbtn";
// import Heading from "../ui/Heading.jsx";

// const CARD_W = 320;
// const GAP = 40;
// const STEP = CARD_W + GAP;

// const RecommendedSection = ({ setShowLoginPopup }) => {
//   const { products = [], loading } = useSelector((state) => state.products);

//   const items = products;
//   const total = items.length;

//   const containerRef = useRef(null);
//   const trackRef = useRef(null);
//   const isAnimating = useRef(false);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isCenter, setIsCenter] = useState(false);

//   const tripled = total > 0 ? [...items, ...items, ...items] : [];

//   const getVisibleCount = useCallback(() => {
//     if (!containerRef.current) return 4;
//     return Math.floor(containerRef.current.offsetWidth / STEP);
//   }, []);

//   useEffect(() => {
//     const checkCenter = () => {
//       if (!containerRef.current) return;

//       const width = containerRef.current.offsetWidth;
//       const visible = Math.floor(width / STEP);

//       setIsCenter(total <= visible);
//     };

//     const timeout = setTimeout(checkCenter, 0);

//     window.addEventListener("resize", checkCenter);

//     return () => {
//       clearTimeout(timeout);
//       window.removeEventListener("resize", checkCenter);
//     };
//   }, [total]);

//   useEffect(() => {
//     if (trackRef.current && total > 0) {
//       trackRef.current.style.transition = "none";
//       trackRef.current.style.transform = `translateX(0px)`;
//     }
//   }, [total]);

//   const slideTo = (newIndex, withAnimation = true) => {
//     if (!trackRef.current) return;
//     trackRef.current.style.transition = withAnimation
//       ? "transform 300ms cubic-bezier(0.4,0,0.2,1)"
//       : "none";
//     trackRef.current.style.transform = `translateX(-${newIndex * STEP}px)`;
//   };

//   const handleNext = () => {
//     if (isAnimating.current || total === 0 || isCenter) return;
//     isAnimating.current = true;

//     const next = currentIndex + 1;
//     setCurrentIndex(next);
//     slideTo(next, true);

//     setTimeout(() => {
//       if (next >= total * 2) {
//         const reset = next - total;
//         setCurrentIndex(reset);
//         slideTo(reset, false);
//       }
//       isAnimating.current = false;
//     }, 310);
//   };

//   const handlePrev = () => {
//     if (isAnimating.current || total === 0 || isCenter) return;
//     isAnimating.current = true;

//     const prev = currentIndex - 1;
//     setCurrentIndex(prev);
//     slideTo(prev, true);

//     setTimeout(() => {
//       if (prev < total) {
//         const reset = prev + total;
//         setCurrentIndex(reset);
//         slideTo(reset, false);
//       }
//       isAnimating.current = false;
//     }, 310);
//   };

//   if (loading) return <p>Loading...</p>;
//   if (total === 0) return null;

//   return (
//     <Section>
//       <Row>
//         <Heading title={"Recommended For You"} />

//         {!isCenter && (
//           <div className="flex items-center justify-end gap-3 mb-4">
//             <NavBtn direction="left" onClick={handlePrev} variant="primary" />
//             <NavBtn direction="right" onClick={handleNext} variant="primary" />
//           </div>
//         )}

//         <div className="overflow-hidden" ref={containerRef}>
//           <div
//             ref={trackRef}
//             className={`flex ${isCenter ? "justify-center" : "justify-start"}`}
//             style={{
//               gap: `${GAP}px`,
//               transform: isCenter ? "none" : `translateX(-${total * STEP}px)`,
//               willChange: "transform",
//             }}
//           >
//             {(isCenter ? items : tripled).map((product, i) => (
//               <div
//                 key={`${product._id}-${i}`}
//                 className="flex-shrink-0 w-[320px]"
//               >
//                 <ProductCard
//                   product={product}
//                   setShowLoginPopup={setShowLoginPopup}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </Row>
//     </Section>
//   );
// };

// export default RecommendedSection;

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import Section from "../ui/Section.jsx";
import Row from "../ui/Row.jsx";
import ProductCard from "../product/ProductCard";

import NavBtn from "../ui/Navbtn";
import Heading from "../ui/Heading.jsx";

const getGap = () => {
  if (window.innerWidth <= 768) return 0;
  
  return 16;
};
const GAP = getGap();

const RecommendedSection = ({ setShowLoginPopup }) => {
  const { products = [], loading } = useSelector((state) => state.products);

  const items = products;
  const total = items.length;

  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const currentIndexRef = useRef(total);

  const [cardWidth, setCardWidth] = useState(0);
  const [isCenter, setIsCenter] = useState(false);
  const [ready, setReady] = useState(false);

  const getStep = (cw) => cw + GAP;
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

  if (loading) return <p>Loading...</p>;
  if (total === 0) return null;

  const tripled = [...items, ...items, ...items];

  return (
    <Section>
      <Row>
        <Heading title={"Recommended For You"} />

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
              className="flex"
              style={{
                gap: `${getGap()}px`,
                transform: isCenter
                  ? "none"
                  : `translateX(-${currentIndexRef.current * getStep(cardWidth)}px)`,
                willChange: "transform",
                justifyContent: isCenter ? "center" : "flex-start",
              }}
            >
              {(isCenter ? items : tripled).map((product, i) => (
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

export default RecommendedSection;
