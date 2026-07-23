import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSlides } from "../../features/slides/slideThunk";
import Section from "../ui/Section";
import Row from "../ui/Row";

const BASE_URL = process.env.REACT_APP_API_URL_IMAGE;

const imgSrc = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

export default function FeatureSection() {
  const dispatch = useDispatch();

  const { slides } = useSelector((state) => state.slides);
  const sectionData = slides?.find(
    (item) => item.section === "featuressection",
  );

  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const featuresList = sectionData?.featuresCards || [];

  if (!sectionData) return null;
  if (!featuresList.length) return null;
  return (
    <Section>
      <Row className="grid grid-cols-1 md:grid-cols-3 gap-[40px] pt-[25px] md:pt-[50px] !max-w-[935px] mx-auto">
        {featuresList.map((feature, index) => (
          <div
            key={feature._id || index}
            className="flex items-start gap-[22px]"
          >
            <div className="w-[62px] h-[50px] rounded-bl-[20px] bg-[linear-gradient(90deg,var(--primary-color)_0%,#ffffff_80%)] relative overflow-hidden flex-shrink-0">
              <img
                src={imgSrc(feature.image)}
                className="h-[42px] w-[42px] object-contain absolute bottom-0 right-0"
                alt={feature.title}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-20px mb-[10px] leading">
                {feature.title}
              </h3>
              <p className="text-14 sec-text-color">{feature.description}</p>
            </div>
          </div>
        ))}
      </Row>
    </Section>
  );
}
