// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
//   useCallback,
// } from "react";
// import { useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchSlides } from "../../features/slides/slideThunk";
// import Section from "../ui/Section";
// import Row from "../ui/Row";
// import Heading from "../ui/Heading";
// import Description from "../ui/Description";
// import NavBtn from "../ui/Navbtn";

// const BASE_URL = process.env.REACT_APP_API_URL_IMAGE;

// const imgSrc = (path) => {
//   if (!path) return "";
//   if (path.startsWith("http")) return path;
//   return `${BASE_URL}${path}`;
// };

// const getGap = () => {
//   if (typeof window === "undefined") return 16;
//   if (window.innerWidth <= 768) return 12;
//   return 16;
// };

// function RootCauseCard({ item, cardWidth }) {
//   return (
//     <div
//       className="flex-shrink-0 flex flex-col items-center text-center bg-[var(--ef3a96-9)] rounded-2xl shadow-sm p-4"
//       style={{ width: cardWidth ? `${cardWidth}px` : undefined }}
//     >
//       {item.image && (
//         <img
//           src={imgSrc(item.image)}
//           alt={item.title}
//           loading="lazy"
//           decoding="async"
//           className="w-16 h-16 object-contain mb-3"
//         />
//       )}
//       <p className="text-[14px] lg:text-[16px] font-semibold text-gray-900">
//         {item.title}
//       </p>
//       {item.description && (
//         <p className="text-[12px] lg:text-[14px] text-gray-500 mt-1">
//           {item.description}
//         </p>
//       )}
//     </div>
//   );
// }

// export default function RootCauseSection() {
//   const dispatch = useDispatch();
//   const location = useLocation();

//   const { slides } = useSelector((state) => state.slides);
//   const sectionData = slides?.find((item) => item.section === "rootCause");

//   useEffect(() => {
//     dispatch(fetchSlides());
//   }, [dispatch]);

//   const currentPage = useMemo(() => {
//     const path = location.pathname.toLowerCase();
//     if (path === "/") return "home";
//     return path.replace("/", "");
//   }, [location.pathname]);

//   const shouldShow = sectionData?.showOnPages?.length
//     ? sectionData.showOnPages.includes(currentPage)
//     : true;

//   const itemsList = sectionData?.rootCauseItems || [];
//   const total = itemsList.length;

//   const containerRef = useRef(null);
//   const trackRef = useRef(null);
//   const isAnimating = useRef(false);
//   const currentIndexRef = useRef(total);

//   const [cardWidth, setCardWidth] = useState(0);
//   const [isCenter, setIsCenter] = useState(false);
//   const [ready, setReady] = useState(false);
//   const [gap, setGap] = useState(16);

//   const getStep = (cw) => cw + gap;
//   const getVisible = () =>
//     typeof window !== "undefined" && window.innerWidth <= 768 ? 2 : 4;

//   const recalculate = useCallback(() => {
//     if (!containerRef.current) return;
//     const currentGap = getGap();
//     setGap(currentGap);

//     const visible = getVisible();
//     const containerWidth = containerRef.current.offsetWidth;
//     const cw = Math.floor(
//       (containerWidth - currentGap * (visible - 1)) / visible,
//     );
//     const step = cw + currentGap;
//     const canFit = total <= visible;

//     setCardWidth(cw);
//     setIsCenter(canFit);

//     if (trackRef.current && !canFit && total > 0) {
//       trackRef.current.style.transition = "none";
//       trackRef.current.style.transform = `translateX(-${currentIndexRef.current * step}px)`;
//     }

//     setReady(true);
//   }, [total]);

//   useEffect(() => {
//     const timeout = setTimeout(recalculate, 0);
//     window.addEventListener("resize", recalculate);
//     return () => {
//       clearTimeout(timeout);
//       window.removeEventListener("resize", recalculate);
//     };
//   }, [recalculate]);

//   useEffect(() => {
//     if (total > 0) {
//       currentIndexRef.current = total;
//     }
//   }, [total]);

//   const slideTo = (newIndex, withAnimation = true) => {
//     if (!trackRef.current || cardWidth === 0) return;
//     const step = getStep(cardWidth);
//     trackRef.current.style.transition = withAnimation
//       ? "transform 300ms cubic-bezier(0.4,0,0.2,1)"
//       : "none";
//     trackRef.current.style.transform = `translateX(-${newIndex * step}px)`;
//   };

//   const handleNext = () => {
//     if (isAnimating.current || total === 0 || isCenter || cardWidth === 0)
//       return;
//     isAnimating.current = true;
//     const next = currentIndexRef.current + 1;
//     currentIndexRef.current = next;
//     slideTo(next, true);
//     setTimeout(() => {
//       if (next >= total * 2) {
//         const reset = next - total;
//         currentIndexRef.current = reset;
//         slideTo(reset, false);
//       }
//       isAnimating.current = false;
//     }, 310);
//   };

//   const handlePrev = () => {
//     if (isAnimating.current || total === 0 || isCenter || cardWidth === 0)
//       return;
//     isAnimating.current = true;
//     const prev = currentIndexRef.current - 1;
//     currentIndexRef.current = prev;
//     slideTo(prev, true);
//     setTimeout(() => {
//       if (prev < total) {
//         const reset = prev + total;
//         currentIndexRef.current = reset;
//         slideTo(reset, false);
//       }
//       isAnimating.current = false;
//     }, 310);
//   };

//   if (!sectionData) return null;
//   if (!shouldShow) return null;
//   if (!total) return null;

//   const tripled = [...itemsList, ...itemsList, ...itemsList];

//   return (
//     <Section className="w-full py-6">
//       <Row className="lg:max-w-[1062px]">
//         <Heading title={sectionData?.rootCause?.title} />
//         <Description
//           Description={sectionData?.rootCause?.subtitle}
//           className="lg:!text-[24px] font-bold text-[#1e1e1e] mt-2"
//         />

//         {!isCenter && ready && (
//           <div className="flex items-center justify-end gap-3 mb-4">
//             <NavBtn direction="left" onClick={handlePrev} variant="primary" />
//             <NavBtn direction="right" onClick={handleNext} variant="primary" />
//           </div>
//         )}

//         <div className="overflow-hidden w-full" ref={containerRef}>
//           {ready && cardWidth > 0 && (
//             <div
//               ref={trackRef}
//               className="flex"
//               style={{
//                 gap: `${gap}px`,
//                 transform: isCenter
//                   ? "none"
//                   : `translateX(-${currentIndexRef.current * getStep(cardWidth)}px)`,
//                 willChange: "transform",
//                 justifyContent: isCenter ? "center" : "flex-start",
//               }}
//             >
//               {(isCenter ? itemsList : tripled).map((item, i) => (
//                 <RootCauseCard
//                   key={`${item._id}-${i}`}
//                   item={item}
//                   cardWidth={cardWidth}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       </Row>
//     </Section>
//   );
// }

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSlides } from "../../features/slides/slideThunk";
import Section from "../ui/Section";
import Row from "../ui/Row";
import Heading from "../ui/Heading";
import Description from "../ui/Description";
import NavBtn from "../ui/Navbtn";

const BASE_URL = process.env.REACT_APP_API_URL_IMAGE;

const imgSrc = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

const getGap = () => {
  if (typeof window === "undefined") return 16;
  if (window.innerWidth <= 768) return 12;
  return 16;
};

function RootCauseCard({ item, cardWidth }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center text-center justify-center bg-[var(--ef3a96-9)] rounded-2xl shadow-sm p-4"
      style={{ width: cardWidth ? `${cardWidth}px` : undefined }}
    >
      {item.image && (
        <img
          src={imgSrc(item.image)}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className="w-20 h-20 object-contain mb-3"
        />
      )}
      <p className="text-[14px] lg:text-[20px] font-semibold text-gray-900">
        {item.title}
      </p>
      {item.description && (
        <p className="text-[12px] lg:text-[16px] text-gray-500 mt-1 line-clamp-4">
          {item.description}
        </p>
      )}
    </div>
  );
}

export default function RootCauseSection() {
  const dispatch = useDispatch();
  const location = useLocation();

  const { slides } = useSelector((state) => state.slides);
  const sectionData = slides?.find((item) => item.section === "rootCause");

  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const currentPage = useMemo(() => {
    const path = location.pathname.toLowerCase();
    if (path === "/") return "home";
    return path.replace("/", "");
  }, [location.pathname]);

  const shouldShow = sectionData?.showOnPages?.length
    ? sectionData.showOnPages.includes(currentPage)
    : true;

  const itemsList = sectionData?.rootCauseItems || [];
  const total = itemsList.length;

  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const currentIndexRef = useRef(total);

  const [cardWidth, setCardWidth] = useState(0);
  const [isCenter, setIsCenter] = useState(false);
  const [ready, setReady] = useState(false);
  const [gap, setGap] = useState(16);

  const getStep = (cw) => cw + gap;
  const getVisible = () =>
    typeof window !== "undefined" && window.innerWidth <= 768 ? 2 : 5;

  const recalculate = useCallback(() => {
    if (!containerRef.current) return;
    const currentGap = getGap();
    setGap(currentGap);

    const visible = getVisible();
    const containerWidth = containerRef.current.offsetWidth;
    const cw = Math.floor(
      (containerWidth - currentGap * (visible - 1)) / visible,
    );
    const step = cw + currentGap;
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

  if (!sectionData) return null;
  if (!shouldShow) return null;
  if (!total) return null;

  const tripled = [...itemsList, ...itemsList, ...itemsList];

  return (
    <Section className="w-full py-6">
      <Row className="lg:max-w-[1062px]">
        <Heading title={sectionData?.rootCause?.title} />
        <Description
          Description={sectionData?.rootCause?.subtitle}
          className="lg:!text-[24px] font-bold text-[#1e1e1e] mt-2"
        />

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
                gap: `${gap}px`,
                transform: isCenter
                  ? "none"
                  : `translateX(-${currentIndexRef.current * getStep(cardWidth)}px)`,
                willChange: "transform",
                justifyContent: isCenter ? "center" : "flex-start",
              }}
            >
              {(isCenter ? itemsList : tripled).map((item, i) => (
                <RootCauseCard
                  key={`${item._id}-${i}`}
                  item={item}
                  cardWidth={cardWidth}
                />
              ))}
            </div>
          )}
        </div>
      </Row>
    </Section>
  );
}
