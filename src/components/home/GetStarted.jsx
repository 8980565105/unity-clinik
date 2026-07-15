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

export default function GetStarted() {
  const dispatch = useDispatch();
  const dragScroll = useDragScroll();

  const { slides } = useSelector((state) => state.slides);
  const sectionData = slides?.find((item) => item.section === "getStarted");

  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const steps = sectionData?.getStartedSteps || [];

  if (!sectionData || !steps.length) return null;

  return (
    <Section className="py-20">
      <Row>
        <Heading
          title="HOW TO GET STARTED"
          className="uppercase text-[#72822D] font-semibold tracking-wide"
        />

        <div
          ref={dragScroll.ref}
          {...dragScroll.handlers}
          className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex gap-6 w-max pb-2">
            {steps.map((item, idx) => (
              <div
                key={item._id || idx}
                className="relative flex-shrink-0 overflow-hidden rounded-[20px] bg-[#F7F7F7] w-[300px] md:w-[450px] lg:w-[440px] h-[180px] lg:h-[250px] shadow-sm"
              >
                <div className="w-[55%] p-6 lg:p-4 z-10 flex flex-col items-start">
                  <span className="inline-flex items-center justify-center rounded-xl bg-white px-2 py-1 text-[14px] font-semibold shadow-sm">
                    {item.stepLabel}
                  </span>

                  <h3 className="text-[18px] mt-2 lg:text-[22px] text-left font-semibold text-[#222] leading-tight">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-[13px] lg:text-[18px] text-[#555] text-left">
                    {item.description}
                  </p>
                </div>
                <div className="absolute bottom-0 right-0 w-[45%] h-full flex items-end justify-end">
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
