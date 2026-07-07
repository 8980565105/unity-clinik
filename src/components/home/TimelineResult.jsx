import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Section from "../ui/Section";
import useDragScroll from "../../hooks/useDragScroll";
import Row from "../ui/Row";
import Description from "../ui/Description";
import { fetchSlides } from "../../features/slides/slideThunk";

const BASE_URL = process.env.REACT_APP_API_URL_IMAGE;
const imgSrc = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export default function TimelineResult() {
  const dispatch = useDispatch();
  const TimelineResultScroll = useDragScroll();
  const [active, setActive] = useState("male");

  const { slides } = useSelector((state) => state.slides);
  const sectionData = slides?.find((item) => item.section === "timelineResult");

  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const maleStages = sectionData?.timelineResult?.male || [];
  const femaleStages = sectionData?.timelineResult?.female || [];
  const activeStages = active === "male" ? maleStages : femaleStages;

  if (!sectionData) return null;
  if (!maleStages.length && !femaleStages.length) return null;

  return (
    <Section className="py-20">
      <Row className="rounded-[30px] bg-[#FBF7E8] px-[25px] py-[20px]">
        <div className="inline-flex rounded-xl bg-[#F2E5A4] p-1 mb-10">
          <button
            onClick={() => setActive("male")}
            className={`px-10 py-2 rounded-lg font-semibold transition ${
              active === "male" ? "bg-white shadow" : "text-gray-700"
            }`}
          >
            MALE
          </button>
          <button
            onClick={() => setActive("female")}
            className={`px-10 py-2 rounded-lg font-semibold transition ${
              active === "female" ? "bg-white shadow" : "text-gray-700"
            }`}
          >
            FEMALE
          </button>
        </div>
        <Description Description="When will you see results?"className="!text-[16px]" />
        <div className="relative">
          <div className="absolute top-[87px] left-0 right-0 h-[1px] bg-[#6D5B2E]" />
          <div
            ref={TimelineResultScroll.ref}
            {...TimelineResultScroll.handlers}
            className="mt-10 md:mt-14 overflow-x-auto cursor-grab select-none no-scrollbar"
          >
            <div className="flex gap-5 md:gap-10 pb-6">
              {activeStages.map((item, idx) => (
                <div key={item._id || idx} className="relative min-w-[130px] text-left">
                  <img
                    src={imgSrc(item.image)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-16 h-16 object-contain mb-5 rounded-[10px]"
                  />
                  <div className="w-[8px] h-[8px] rounded-full bg-[#6D5B2E] mb-5"></div>
                  <h4 className="text-3xl font-semibold">{item.month}</h4>
                  <p className="mt-2 text-gray-700">{item.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 md:mt-10 text-gray-500 text-[12px]">
          *Timeline varies for both male and females based on their unique root
          causes.
        </p>
      </Row>
    </Section>
  );
}
