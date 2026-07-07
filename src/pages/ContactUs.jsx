import React, { lazy, Suspense, useEffect } from "react";
import ContactCard from "../components/contactus/ContactCard";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import { MapPinIcon, PhoneIcon } from "lucide-react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import MapForm from "../components/contactus/MapForm";
import SecondarySection from "../components/ui/SecondarySection";
import { useDispatch, useSelector } from "react-redux";
import { fetchPageBySlug, fetchPages } from "../features/pages/pagesThunk";
import { getImageUrl } from "../components/utils/helper";
import contactBg from "../assets/contact.webp";
import SEO from "../components/seo/seo";

const SuccessStorySection = lazy(
  () => import("../components/home/SuccessStory.jsx"),
);

const ReportCard = lazy(() => import("../components/pages/Reportcard.jsx"));

const staticBg = {
  sections: [
    {
      _id: "static-1",
      title: "Contact Us",
      description: "We are here to help you. Reach out anytime.",
      image_url: contactBg,
      isStatic: true,
    },
  ],
};

export default function ContactUs() {
  const dispatch = useDispatch();
  const { pages } = useSelector((state) => state.pages);

  useEffect(() => {
    dispatch(fetchPageBySlug("contact"));
    dispatch(fetchPages());
  }, [dispatch]);

  const contactPageFromApi = pages?.find((page) => page.slug === "contact");
  const contactPage = contactPageFromApi || staticBg;

  const getBgImage = (section) => {
    if (section.isStatic) return section.image_url;
    return getImageUrl(section.background_image_url || section.image_url);
  };

  return (
    <>
      <SEO
        title={contactPageFromApi?.meta_title}
        description={contactPageFromApi?.meta_description}
      />
      {contactPage?.sections?.map((section) => (
        <SecondarySection
          key={section._id}
          title={section.title || "Contact Us"}
          description={
            section.description || "We are here to help you. Reach out anytime."
          }
          backgroundImage={getBgImage(section)}
        />
      ))}

      <Section>
        <Row className="xl:max-w-[1122px] grid grid-cols-1 md:grid-cols-3 gap-[30px] py-[25px] md:py-[50px]">
          <ContactCard
            icon={<MapPinIcon />}
            title="Visit Us"
            description="10,11 dhara arcade settelite road mahadev chowk mota varacha Surat."
            linkText="View on Google Maps"
            linkHref="https://maps.app.goo.gl/8EGGwPHV9Ye8wxeW9"
          />
          <ContactCard
            icon={<EnvelopeIcon />}
            title="Email Us"
            description="Visit our clinic"
            linkText="Support@zyfolixo.com"
            linkHref="mailto:Support@zyfolixo.com"
          />
          <ContactCard
            icon={<PhoneIcon />}
            title="Call Us"
            description="Mon-Satur 10am to 6pm"
            linkText="+91 9327148908"
            linkHref="tel:+91 9327148908"
          />
        </Row>
      </Section>

      <MapForm />

      <Suspense>
        <SuccessStorySection />
      </Suspense>

      <Suspense>
        <ReportCard />
      </Suspense>
    </>
  );
}
