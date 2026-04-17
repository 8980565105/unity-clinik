import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import AboutBanner from "../components/aboutbanner/aboutbanner";
import AboutContent from "../components/aboutbanner/aboutcontent";
import { getImageUrl } from "../components/utils/helper";

const STATIC_FEATURES = [
  { _id: "static-f1", icon: "🚚", title: "Free Shipping", desc: "On all orders above ₹999", order: 1 },
  { _id: "static-f2", icon: "🔄", title: "Easy Returns", desc: "7-day hassle-free returns", order: 2 },
  { _id: "static-f3", icon: "🔒", title: "Secure Payment", desc: "100% safe transactions", order: 3 },
  { _id: "static-f4", icon: "🎧", title: "24/7 Support", desc: "We are here to help anytime", order: 4 },
];

export default function AboutPage() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPageBySlug("about"));
  }, [dispatch]);

  const aboutPage = pages?.find((page) => page.slug === "about");

  const apiFeatures = aboutPage?.sections?.filter(
    (section) => section.type === "feature" && section.status === "active",
  );

  const features =
    apiFeatures?.length > 0 ? apiFeatures : STATIC_FEATURES;

  const sortedFeatures = [...features].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <>
      <AboutBanner />
      <AboutContent />

      {sortedFeatures.length > 0 && (
        <Section>
          <Row className="py-[25px] md:py-[50px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {sortedFeatures.map((item, i) => (
                <div key={item._id || i} className="flex items-center gap-3">
                  <div className="text-2xl shrink-0">
                    {item.image_url ? (
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.title}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <span>{item.icon}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{item.title}</h4>
                    <p className="text-xs text-gray-500">
                      {item.description || item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Row>
        </Section>
      )}
    </>
  );
}