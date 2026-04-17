import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../../features/pages/pagesThunk";
import { useEffect } from "react";
import { getImageUrl } from "../utils/helper";
import Section from "../ui/Section";
import Row from "../ui/Row";
import faqBg from "../../assets/size-bg.png";

const STATIC_CONTENT = [
  {
    _id: "static-c1",
    title: "Our Story",
    description:
      "Founded with a vision to redefine everyday fashion, we curate collections that blend style, comfort, and affordability. Every piece in our store is handpicked to ensure the best quality for our customers.",
    image_url: faqBg,
    is_button: true,
    button_name: "Read More",
    button_link: "/shop",
    order: 1,
    status: "active",
    isStatic: true,
  },
  {
    _id: "static-c2",
    title: "Our Mission",
    description:
      "Our mission is to empower individuals to express themselves through fashion. We believe that great style should not come at a great cost, and we work hard to deliver value with every purchase.",
    image_url: faqBg,
    is_button: true,
    button_name: "Read More",
    button_link: "/shop",
    order: 2,
    status: "active",
    isStatic: true,
  },
  {
    _id: "static-c3",
    title: "Why Choose Us",
    description:
      "With a wide range of styles, sizes, and budgets, we have something for everyone. Our dedicated team ensures a seamless shopping experience from browsing to delivery.",
    image_url: faqBg,
    is_button: true,
    button_name: "Read More",
    button_link: "/shop",
    order: 3,
    status: "active",
    isStatic: true,
  },
];

export default function AboutContent() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPageBySlug("about"));
  }, [dispatch]);

  const aboutPage = pages?.find((page) => page.slug === "about");

  const apiContentSections = aboutPage?.sections?.filter(
    (section) => section.type === "content" && section.status === "active",
  );

  const contentList =
    apiContentSections?.length > 0 ? apiContentSections : STATIC_CONTENT;

  const sortedContent = [...contentList].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <Section className="px-0">
      <Row className="space-y-12 py-10 !px-0">
        {sortedContent.map((item, index) => {
          const isReversed = index % 2 !== 0;

          const imgSrc = item.isStatic
            ? item.image_url
            : getImageUrl(item.image_url);

          return (
            <div
              key={item._id || index}
              className={`flex flex-col md:flex-row md:items-center gap-8 ${
                isReversed ? "md:flex-row-reverse" : ""
              }`}
            >
              <div className="flex-1">
                <h3 className="text-[18px] sm:text-[22px] font-semibold text-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-[13px] sm:text-[14px] leading-relaxed text-gray-600 mb-4">
                  {item.description}
                </p>
                {item.is_button && (
                  <Link
                    to={item.button_link || "/shop"}
                    className="text-sm underline"
                  >
                    {item.button_name || "Read More"}
                  </Link>
                )}
              </div>

              <div className="flex-1">
                <div className="w-full h-[250px] sm:h-[300px] md:h-[350px] overflow-hidden rounded-lg">
                  <img
                    src={imgSrc || faqBg}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = faqBg;
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </Row>
    </Section>
  );
}
