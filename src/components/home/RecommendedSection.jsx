// import React, { useEffect, useState } from "react";
// import Slider from "react-slick";
// import Row from "../ui/Row.jsx";
// import Section from "../ui/Section.jsx";
// import "slick-carousel/slick/slick.css";
// import "slick-carousel/slick/slick-theme.css";
// import { useSelector } from "react-redux";
// import { getImageUrl } from "../utils/helper.js";
// import { ChevronLeft, ChevronRight } from "lucide-react";
// import FlowerIcon from "../icons/FlowerIcon.jsx";

// const RecommendedSection = () => {
//   const { products } = useSelector((state) => state.products);
//   const [windowWidth, setWindowWidth] = useState(window.innerWidth);

//   useEffect(() => {
//     const handleResize = () => setWindowWidth(window.innerWidth);
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   if (!products.length) return null;

//   const NextArrow = ({ onClick }) => (
//     <button
//       onClick={onClick}
//       className="w-[30px] md:w-[40px] h-[30px] md:h-[40px] flex items-center justify-center bg-white box-shadow rounded-full  absolute right-0 top-1/2 z-10
//       translate-x-[120%] md:translate-x-[110%] -translate-y-[50%]"
//     >
//       <ChevronRight />
//     </button>
//   );

//   const PrevArrow = ({ onClick }) => (
//     <button
//       onClick={onClick}
//       className="w-[30px] md:w-[40px] h-[30px] md:h-[40px] flex items-center justify-center bg-white box-shadow rounded-full  absolute left-0 top-1/2 z-10
//       -translate-x-[120%] md:-translate-x-[110%] -translate-y-[50%]"
//     >
//       <ChevronLeft />
//     </button>
//   );

//   const settings = {
//     dots: false,
//     arrows: true,
//     prevArrow: <PrevArrow />,
//     nextArrow: <NextArrow />,
//     infinite: true,
//     speed: 600,
//     slidesToShow: windowWidth <= 767 ? 1 : windowWidth <= 980 ? 2 : 3,
//     slidesToScroll: 1,
//   };

//   return (
//     <Section className="w-full ">
//       <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
//         <div className="w-[18px] md:w-[50px] border-t border-black"></div>

//         <div className="relative mx-2 md:mx-4 flex flex-col items-center justify-center">
//           <h2 className="font-h2 text-black whitespace-nowrap relative z-10">
//             Recommended For You
//           </h2>
//           <FlowerIcon className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[25px] md:w-[110px] md:h-[80px] pointer-events-none z-0" />
//         </div>

//         <div className="w-[18px] md:w-[50px] border-t border-black"></div>
//       </div>
//       <Row className="!max-w-[1179px] mx-auto mb-[50px] md:mb-[90px] overflow-visible relative px-11 ">
//         <Slider {...settings}>
//           {products.map((item) => (
//             <div key={item._id} className="px-[5px] sm:px-[12.5px]">
//               <ProductCard item={item} />
//             </div>
//           ))}
//         </Slider>
//       </Row>
//     </Section>
//   );
// };

// const ProductCard = ({ item }) => {
//   const imageUrl =
//     item?.images?.length > 0 ? getImageUrl(item.images[0]) : "/placeholder.png";

//   const title = item?.category?.name || "Recommanded Item";
//   const description = item?.name || "No description available";

//   return (
//     <div className="relative shadow-lg overflow-hidden transition-transform duration-300">
//       <div className="relative w-full min-h-[300px]  lg:w-[342px] h-[315px] sm:h-[398px]">
//         <img
//           src={imageUrl}
//           alt={title}
//           className="w-full h-full object-cover filter grayscale brightness-35 contrast-125"
//         />
//         <div
//           className="absolute inset-0 bg-black opacity-30"
//           style={{ mixBlendMode: "luminosity" }}
//         ></div>
//       </div>
//       <div className="absolute inset-0 flex justify-center items-center">
//         <img
//           src={imageUrl}
//           alt={title}
//           className="w-[90%] h-[92%] object-fit"
//         />
//       </div>
//       <div className="absolute bottom-8 left-6 text-white z-20">
//         <h2 className="font-h5 max-w-[200px] leading">{title}</h2>
//         <p className="font-sans font-medium text-[16px] line-clamp-3">
//           {description}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default RecommendedSection;

import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import Section from "../ui/Section.jsx";
import Row from "../ui/Row.jsx";
import ProductCard from "../productcard/ProductCard.jsx";
import NavBtn from "../ui/Navbtn";
import FlowerIcon from "../icons/FlowerIcon.jsx";
import Heading from "../ui/Heading.jsx";

const RecommendedSection = ({ setShowLoginPopup }) => {
  const { products = [], loading } = useSelector((state) => state.products);

  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);

  const CARD_W = 290;

  const items = products;

  const getVisibleCount = () => {
    if (!containerRef.current) return 4;
    return Math.floor(containerRef.current.offsetWidth / CARD_W);
  };

  const maxOffset = Math.max(0, items.length - getVisibleCount());

  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));

  if (loading) return <p>Loading...</p>;

  return (
    <Section>
      <Row>
        <Heading title={"Recommended For You"} />
        <div className="relative px-2" ref={containerRef}>
          {offset > 0 && (
            <NavBtn direction="left" onClick={prev} variant="primary" />
          )}
          <div className="overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-300"
              style={{ transform: `translateX(-${offset * CARD_W}px)` }}
            >
              {items.map((product) => {
                const price = product?.variants?.[0]?.price || 0;

                return (
                  <div key={product._id} className="flex-shrink-0 w-[270px]">
                    <ProductCard
                      product={product}
                      setShowLoginPopup={setShowLoginPopup}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          {offset < maxOffset && (
            <NavBtn direction="right" onClick={next} variant="primary" />
          )}
        </div>
      </Row>
    </Section>
  );
};

export default RecommendedSection;
