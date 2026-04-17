import React from "react";
import { useSelector } from "react-redux";
import FlowerIcon from "../icons/FlowerIcon";

export default function SectionHeading({ page, order, index = 0 }) {
  const pages = useSelector((state) => state.pages?.pages || []);
  const loading = useSelector((state) => state.pages?.loading);

  if (loading || !pages.length) return null;

  const currentPage = pages.find(
    (p) => p.slug?.toLowerCase().trim() === page?.toLowerCase().trim(),
  );

  if (!currentPage) {
    console.warn("PAGE NOT FOUND:", page);
    return null;
  }

  const matchedSections = currentPage.sections.filter(
    (section) => Number(section.order) === Number(order),
  );

  if (!matchedSections.length) {
    console.warn("NO SECTIONS FOUND FOR ORDER:", order);
    return null;
  }

  const currentSection = matchedSections[index];

  if (!currentSection) {
    console.warn(`NO SECTION FOUND AT INDEX ${index} FOR ORDER ${order}`);
    return null;
  }

  return (
    <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
      <div className="w-[18px] md:w-[50px] border-t border-black"></div>

      <div className="relative mx-2 md:mx-4 flex flex-col items-center justify-center">
        <h2 className="font-h2 text-black whitespace-nowrap relative z-10">
          {currentSection.title}
        </h2>
        <FlowerIcon className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40px] h-[25px] md:w-[110px] md:h-[80px] pointer-events-none z-0" />
      </div>

      <div className="w-[18px] md:w-[50px] border-t border-black"></div>
    </div>
  );
}
