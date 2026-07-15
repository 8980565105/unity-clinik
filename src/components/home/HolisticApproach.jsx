import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Section from "../ui/Section";
import Row from "../ui/Row";
import Heading from "../ui/Heading";
import Description from "../ui/Description";
import useDragScroll from "../../hooks/useDragScroll";
import { fetchSlides } from "../../features/slides/slideThunk";

const BASE_URL = process.env.REACT_APP_API_URL_IMAGE;
const imgSrc = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export default function HolisticApproach() {
  const dispatch = useDispatch();
  const HolisticApproachScroll = useDragScroll();

  const { slides } = useSelector((state) => state.slides);
  const sectionData = slides?.find(
    (item) => item.section === "holisticApproach",
  );

  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const cards = sectionData?.holisticCards || [];

  if (!sectionData || !cards.length) return null;

  return (
    <Section className="py-16">
      <Row>
        <Heading
          title="HOLISTIC APPROACH"
          className="uppercase text-[#7A8537] tracking-wide font-semibold"
        />

        <div
          ref={HolisticApproachScroll.ref}
          {...HolisticApproachScroll.handlers}
          className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex w-max gap-6 pb-2">
            {cards.map((item, idx) => (
              <div
                key={item._id || idx}
                className="relative flex-shrink-0 overflow-hidden rounded-[20px] bg-[#F6F0DE] w-[300px] md:w-[450px] lg:w-[440px] h-[180px] lg:h-[250px] shadow-sm"
              >
                <div className="w-[55%] p-6 lg:p-6 z-10">
                  <h3 className="text-[18px] lg:text-[28px] text-left font-semibold text-[#222] leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 md:mt-5 text-[14px] lg:text-[20px] text-[#444] text-left">
                    {item.description}
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-[45%] flex items-end justify-end">
                  <img
                    src={imgSrc(item.image)}
                    alt={item.title}
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                    className="h-full object-cover pointer-events-none object-right-bottom"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Row>
    </Section>
  );
}
