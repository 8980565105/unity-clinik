// import React from "react";
// import Section from "../ui/Section";
// import Row from "../ui/Row";
// import Heading from "../ui/Heading";
// import Description from "../ui/Description";
// import { Check, X } from "lucide-react";
// import useDragScroll from "../../hooks/useDragScroll";
// const menStages = [
//   {
//     id: 1,
//     title: "Stage 1",
//     image: "/images/stage1.png",
//     success: true,
//   },
//   {
//     id: 2,
//     title: "Stage 2",
//     image: "/images/stage2.png",
//     success: true,
//   },
//   {
//     id: 3,
//     title: "Stage 3",
//     image: "/images/stage3.png",
//     success: true,
//   },
//   {
//     id: 4,
//     title: "Stage 4",
//     image: "/images/stage4.png",
//     success: true,
//   },
//   {
//     id: 5,
//     title: "Stage 5",
//     image: "/images/stage5.png",
//     success: true,
//   },
//   {
//     id: 6,
//     title: "Stage 6",
//     image: "/images/stage6.png",
//     success: false,
//   },
//   {
//     id: 7,
//     title: "Stage 7",
//     image: "/images/stage7.png",
//     success: false,
//   },
//   {
//     id: 8,
//     title: "Stage 7",
//     image: "/images/stage7.png",
//     success: false,
//   },
//   {
//     id: 9,
//     title: "Stage 7",
//     image: "/images/stage7.png",
//     success: false,
//   },
//   {
//     id: 10,
//     title: "Stage 10",
//     image: "/images/stage7.png",
//     success: false,
//   },
// ];

// const womenStages = [
//   {
//     id: 1,
//     title: "No noticeable volume change",
//     image: "/images/women1.png",
//     success: true,
//   },
//   {
//     id: 2,
//     title: "Less volume, no visible thinning",
//     image: "/images/women2.png",
//     success: true,
//   },
//   {
//     id: 3,
//     title: "Overall thinning & volume loss",
//     image: "/images/women3.png",
//     success: true,
//   },
//   {
//     id: 4,
//     title: "Thinning at front or sides",
//     image: "/images/women4.png",
//     success: true,
//   },
//   {
//     id: 5,
//     title: "Wide partition; scalp slightly visible",
//     image: "/images/women5.png",
//     success: true,
//   },
//   {
//     id: 6,
//     title: "Wide partition; clear scalp visible",
//     image: "/images/women6.png",
//     success: false,
//   },
//   {
//     id: 7,
//     title: "Visible coin-sized bald patches",
//     image: "/images/women7.png",
//     success: false,
//   },
//   {
//     id: 8,
//     title: "Visible coin-sized bald patches",
//     image: "/images/women7.png",
//     success: false,
//   },
//   {
//     id: 9,
//     title: "Visible coin-sized bald patches",
//     image: "/images/women7.png",
//     success: false,
//   },
//   {
//     id: 10,
//     title: "Visible coin-sized bald patches",
//     image: "/images/women7.png",
//     success: false,
//   },
// ];

// const Card = ({ item }) => {
//   return (
//     <div className="flex flex-col items-center">
//       <div className="relative overflow-hidden rounded-3xl bg-[#f5f5f5] w-[150px] h-[180px] shadow-sm">
//         <div
//           className={`absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white ${
//             item.success ? "bg-[#78863d]" : "bg-[#c66d5f]"
//           }`}
//         >
//           {item.success ? (
//             <Check size={15} className="text-white" />
//           ) : (
//             <X size={15} className="text-white" />
//           )}
//         </div>
//         <img
//           src={item.image}
//           alt={item.title}
//           className={`h-full w-full object-cover ${
//             !item.success ? "grayscale" : ""
//           }`}
//         />
//       </div>
//       <p className="mt-4 text-center text-[15px] font-semibold text-[#1b1b1b] leading-6 max-w-[150px]">
//         {item.title}
//       </p>
//     </div>
//   );
// };
// export default function Honest() {
//   const menScroll = useDragScroll();
//   const womenScroll = useDragScroll();
//   return (
//     <Section>
//       <Row>
//         <div className="mb-12">
//           <Heading
//             title="honest expectations"
//             className="uppercase text-[#78863d] text-lg font-semibold tracking-wide"
//           />

//           <Description
//             Description="Who will really see results?"
//             className="text-5xl font-bold text-[#1e1e1e] mt-2"
//           />
//         </div>
//         <div
//           ref={menScroll.ref}
//           {...menScroll.handlers}
//           className="overflow-x-auto cursor-grab select-none no-scrollbar"
//         >
//           <div className="flex gap-5 md:gap-10 w-max">
//             {menStages.map((item) => (
//               <Card key={item.id} item={item} />
//             ))}
//           </div>
//         </div>
//         <div
//           ref={womenScroll.ref}
//           {...womenScroll.handlers}
//           className="mt-14 overflow-x-auto cursor-grab select-none no-scrollbar"
//         >
//           <div className="flex gap-5 md:gap-10 w-max">
//             {womenStages.map((item) => (
//               <Card key={item.id} item={item} />
//             ))}
//           </div>
//         </div>
//       </Row>
//     </Section>
//   );
// }

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Section from "../ui/Section";
import Row from "../ui/Row";
import Heading from "../ui/Heading";
import Description from "../ui/Description";
import { Check, X } from "lucide-react";
import useDragScroll from "../../hooks/useDragScroll";
import { fetchSlides } from "../../features/slides/slideThunk";

const BASE_URL = process.env.REACT_APP_API_URL_IMAGE;

const imgSrc = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

const Card = ({ item }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden rounded-[20px] bg-[#f5f5f5] w-[150px] h-[180px] shadow-sm">
        <div
          className={`absolute right-[2px] top-[2px] z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white ${
            item.success ? "bg-[#78863d]" : "bg-[#c66d5f]"
          }`}
        >
          {item.success ? (
            <Check size={15} className="text-white" />
          ) : (
            <X size={15} className="text-white" />
          )}
        </div>
        <img
          src={imgSrc(item.image)}
          alt={item.title}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-cover ${
            !item.success ? "grayscale" : ""
          }`}
        />
      </div>
      <p className="mt-4 text-center text-[15px] font-semibold text-[#1b1b1b] leading-6 max-w-[150px]">
        {item.title}
      </p>
    </div>
  );
};

export default function Honest() {
  const dispatch = useDispatch();
  const menScroll = useDragScroll();
  const womenScroll = useDragScroll();

  const { slides } = useSelector((state) => state.slides);
  const sectionData = slides?.find(
    (item) => item.section === "honestExpectations",
  );

  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const menStages = sectionData?.honestExpectations?.male || [];
  const womenStages = sectionData?.honestExpectations?.female || [];

  if (!sectionData) return null;
  if (!menStages.length && !womenStages.length) return null;

  return (
    <Section>
      <Row>
        <div className="mb-12">
          <Heading
            title="honest expectations"
            className="uppercase text-[#78863d] text-lg font-semibold tracking-wide"
          />

          <Description
            Description="Who will really see results?"
            className="text-5xl font-bold text-[#1e1e1e] mt-2"
          />
        </div>

        {menStages.length > 0 && (
          <div
            ref={menScroll.ref}
            {...menScroll.handlers}
            className="overflow-x-auto cursor-grab select-none no-scrollbar"
          >
            <div className="flex gap-5 md:gap-10 w-max">
              {menStages.map((item, idx) => (
                <Card key={item._id || idx} item={item} />
              ))}
            </div>
          </div>
        )}

        {womenStages.length > 0 && (
          <div
            ref={womenScroll.ref}
            {...womenScroll.handlers}
            className="mt-14 overflow-x-auto cursor-grab select-none no-scrollbar"
          >
            <div className="flex gap-5 md:gap-10 w-max">
              {womenStages.map((item, idx) => (
                <Card key={item._id || idx} item={item} />
              ))}
            </div>
          </div>
        )}
      </Row>
    </Section>
  );
}
