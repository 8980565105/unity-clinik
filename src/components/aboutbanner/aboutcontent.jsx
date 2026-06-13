import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchabout } from "../../features/about/aboutThunk";
import { getImageUrl } from "../utils/helper";
import Section from "../ui/Section";
import Row from "../ui/Row";
import faqBg from "../../assets/size-bg.webp";

export default function AboutContent() {
  const dispatch = useDispatch();

  const { data, loading } = useSelector((state) => state.about);

  useEffect(() => {
    dispatch(fetchabout());
  }, [dispatch]);

  if (loading) {
    return <div className="py-20 text-center">Loading...</div>;
  }

  return (
    <>
      <Section className="pt-10">
        <Row>
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">{data?.title}</h2>

            <p className="text-gray-600">{data?.description}</p>
          </div>
        </Row>
      </Section>

      <Section className="px-0">
        <Row className="space-y-20 py-10">
          {(data?.contentSections || []).map((item, index) => {
            const reverse = index % 2 !== 0;

            return (
              <div
                key={item._id}
                className={`flex flex-col md:flex-row gap-10 items-center ${
                  reverse ? "md:flex-row-reverse" : ""
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>

                  <p className="text-gray-600 mb-5">{item.description}</p>

                  {item.buttonText && (
                    <Link
                      to={item.buttonLink || "#"}
                      className="text-primary underline"
                    >
                      {item.buttonText}
                    </Link>
                  )}
                </div>

                <div className="flex-1">
                  <img
                    src={item.image ? getImageUrl(item.image) : faqBg}
                    alt={item.title}
                    className="w-full rounded-xl object-cover"
                  />
                </div>
              </div>
            );
          })}
        </Row>
      </Section>

      <Section className="bg-[#f8f8f8] py-16">
        <Row>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">{data?.missionSectionTitle}</h2>

            <p className="text-gray-600 mt-4 max-w-3xl mx-auto">
              {data?.missionSectionDescription}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {(data?.missionItems || []).map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-xl p-6 shadow-sm text-center"
              >
                <img
                  src={getImageUrl(item.icon)}
                  alt={item.title}
                  className="w-14 h-14 mx-auto mb-4 object-contain"
                />

                <h3 className="font-semibold text-xl mb-3">{item.title}</h3>

                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </Row>
      </Section>
    </>
  );
}
