import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import AboutBanner from "../components/aboutbanner/aboutbanner";
import AboutContent from "../components/aboutbanner/aboutcontent";
import { getImageUrl } from "../components/utils/helper";
import feature1 from "../assets/feature1.png";
import feature2 from "../assets/feature2.png";
import feature3 from "../assets/feature3.png";
import SEO from "../components/seo/seo.js";
import Loding from "../components/loding/loding.jsx";
export default function AboutPage() {
  const dispatch = useDispatch();
  // const { pages, loading } = useSelector((state) => state.pages);
  const { pages, slugLoading } = useSelector((state) => state.pages);
  useEffect(() => {
    dispatch(fetchPageBySlug("about"));
  }, [dispatch]);

  const aboutPage = pages?.find((page) => page.slug === "about");

  const apiFeatures = aboutPage?.sections?.filter(
    (section) => section.type === "feature" && section.status === "active",
  );

  const features = apiFeatures || [];
  const sortedFeatures = [...features].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <>
      {slugLoading && <Loding />}
      <SEO
        title={aboutPage?.meta_title}
        description={aboutPage?.meta_description}
      />
      <AboutBanner />
      <AboutContent />

      {sortedFeatures.length > 0 && (
        <Section>
          <Row className="grid grid-cols-1 md:grid-cols-4 gap-[40px] pt-[25px] md:pt-[50px]">
            {sortedFeatures.map((item, i) => (
              <div key={item._id || i} className="flex items-start gap-[22px]">
                <div className="w-[62px] h-[50px] rounded-bl-[20px] bg-[linear-gradient(90deg,var(--primary-color)_0%,#ffffff_80%)] relative overflow-hidden flex-shrink-0">
                  <img
                    src={
                      item.image_url ? getImageUrl(item.image_url) : item.icon
                    }
                    className="h-[42px] w-[42px] object-contain absolute bottom-0 right-0"
                    alt="feature icon"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-20px mb-[10px] leading">
                    {item.title}
                  </h3>
                  <p className="text-14 sec-text-color">
                    {item.description || item.desc}
                  </p>
                </div>
              </div>
            ))}
          </Row>
        </Section>
      )}
    </>
  );
}
