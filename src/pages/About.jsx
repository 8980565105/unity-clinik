import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import AboutBanner from "../components/aboutbanner/aboutbanner";
import AboutContent from "../components/aboutbanner/aboutcontent";
import { getImageUrl } from "../components/utils/helper";
import SEO from "../components/seo/seo.js";
import Loding from "../components/loding/loding.jsx";
import SuccessStorySection from "../components/home/SuccessStory.jsx";
export default function AboutPage() {
  const dispatch = useDispatch();
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
      <SuccessStorySection />
    </>
  );
}
