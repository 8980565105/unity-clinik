import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  X,
  Calendar,
  ArrowRight,
  Instagram,
  Facebook,
  Youtube,
  CircleCheck,
} from "lucide-react";
import SEO from "../components/seo/seo";
import { BookConsultationPopup } from "../components/popup/bookconsaltpopup";
import { useNavigate } from "react-router-dom";
import Section from "../components/ui/Section.jsx";
import Row from "../components/ui/Row.jsx";
import { useDispatch, useSelector } from "react-redux";
import HeaderLogo from "../assets/logo.webp";
import { fetchConsultationPage } from "../features/consaltantion/consaltantionThunk.js";
import { fetchPublicPopup } from "../features/popup/popupThunk.js"; // ← Redux thunk
import { getImageUrl } from "../components/utils/helper.js";
import Heading from "../components/ui/Heading.jsx";
import Description from "../components/ui/Description.jsx";
import Loding from "../components/loding/loding.jsx";
import LoginForm from "./Login.jsx";

const WhatsappImageCard = ({ src }) => (
  <div className="w-[280px] rounded-[20px] shadow-lg overflow-hidden flex justify-center items-center flex-shrink-0 select-none bg-gray-100 hover:scale-105">
    <img
      src={getImageUrl(src)}
      className="w-[100%] h-[auto] object-contain"
      alt="Patient chat"
    />
  </div>
);

export default function ConsultationPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: pageData, loading } = useSelector(
    (state) => state.consultationPage || {},
  );
  const { info: storeInfo } = useSelector((state) => state.store || {});

  const { data: popupData, loading: popupLoading } = useSelector(
    (state) => state.popup || {},
  );

  const { user, token } = useSelector((state) => state.auth || {});
  const isAuthenticated = !!token;

  const [isLoginPopupOpen, setIsLoginPopupOpen] = useState(false);

  const handleBookConsultationClick = () => {
    if (!isAuthenticated) {
      setIsLoginPopupOpen(true); // Login popup open karo
    } else {
      setIsBookPopupOpen(true); // Consultation popup open karo
    }
  };

  useEffect(() => {
    dispatch(fetchConsultationPage());
    dispatch(fetchPublicPopup());
  }, [dispatch]);

  const socialLinks = storeInfo?.social_links || [];
  const getSocialLink = (platformName, fallback) => {
    const found = socialLinks.find((l) =>
      l.platform?.toLowerCase().includes(platformName.toLowerCase()),
    );
    return found ? found.url : fallback;
  };

  const instagramUrl = getSocialLink(
    "instagram",
    pageData?.social?.instagram?.buttonLink,
  );
  const facebookUrl = getSocialLink(
    "facebook",
    pageData?.social?.facebook?.buttonLink,
  );
  const youtubeUrl = getSocialLink(
    "youtube",
    pageData?.social?.youtube?.buttonLink,
  );

  const chatContainerRef = useRef(null);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const getOneSetWidth = () => container.scrollWidth / 3;
    const initScroll = () => {
      container.style.scrollBehavior = "auto";
      container.scrollLeft = getOneSetWidth();
    };
    initScroll();
    const timer = setTimeout(initScroll, 100);

    let isDragging = false;
    let startX = 0;
    let scrollLeftAtStart = 0;

    let rafId;
    const checkLoop = () => {
      if (!isDragging) {
        const W = getOneSetWidth();
        if (W > 0) {
          const sl = container.scrollLeft;
          if (sl >= W * 2) {
            container.style.scrollBehavior = "auto";
            container.scrollLeft = sl - W;
          } else if (sl < W) {
            container.style.scrollBehavior = "auto";
            container.scrollLeft = sl + W;
          }
        }
      }
      rafId = requestAnimationFrame(checkLoop);
    };
    rafId = requestAnimationFrame(checkLoop);
    window.addEventListener("resize", initScroll);

    const onMouseDown = (e) => {
      isDragging = true;
      container.style.cursor = "grabbing";
      container.style.scrollBehavior = "auto";
      startX = e.clientX;
      scrollLeftAtStart = container.scrollLeft;
      e.preventDefault();
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const diff = e.clientX - startX;
      container.scrollLeft = scrollLeftAtStart - diff;
    };

    const stopDrag = () => {
      if (!isDragging) return;
      isDragging = false;
      container.style.cursor = "grab";
    };

    container.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", stopDrag);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", initScroll);
      container.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", stopDrag);
    };
  }, [pageData]);

  const [isBookPopupOpen, setIsBookPopupOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    if (popupLoading || !popupData) return;
    if (!token) return;

    const bookConsultationStatus = popupData?.bookConsultation?.status;
    if (bookConsultationStatus !== "active") return;

    const hasSeen = sessionStorage.getItem("consultation-popup-shown");
    if (!hasSeen) {
      const t = setTimeout(() => {
        setIsBookPopupOpen(true);
        sessionStorage.setItem("consultation-popup-shown", "true");
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [popupData, popupLoading, token]);

  const hero = pageData?.hero || {};
  const social = pageData?.social || {};
  const whatsapp = pageData?.whatsapp || {};
  const faq = pageData?.faq || {};

  const bullets = hero.bullets?.length
    ? hero.bullets.map((b) => b.text)
    : [
        "Advanced Hair Regrowth Treatments",
        "Scalp Therapy & Rejuvenation",
        "Hair Transplant Options",
        "Preventive Care Strategies",
        "Hormonal & Nutritional Analysis",
        "Long-term Monitoring Plan",
      ];

  const stats = hero.stats?.length
    ? hero.stats
    : [
        { label: "15+", sub: "Years Experience" },
        { label: "50,000+", sub: "Patients Treated" },
        { label: "99%", sub: "Satisfaction Rate" },
        { label: "30 Min", sub: "Expert Consultation" },
      ];

  const withoutList = hero.withoutList?.length
    ? hero.withoutList.map((item) => item.text)
    : [
        "Temporary Results",
        "Trial & Error",
        "Wasted Time & Money",
        "No Root Cause Solution",
      ];

  const withList = hero.withList?.length
    ? hero.withList.map((item) => item.text)
    : [
        "Root Cause Identified",
        "Personalized Treatment Plan",
        "Clinically Proven Solutions",
        "Visible, Lasting Results",
      ];

  const faqItems = faq.items?.length
    ? faq.items
    : [
        {
          q: "1. What happens during a hair regrowth consultation?",
          a: "During a hair regrowth consultation, our experts evaluate your hair fall concerns, scalp condition, lifestyle factors, and hair growth goals.",
        },
      ];

  const chatImages = whatsapp.images || [];

  const handleBookingConfirm = (bookingData) => {
    setIsBookPopupOpen(false);
  };

  if (loading && !pageData) {
    return <Loding />;
  }

  return (
    <>
      <SEO
        title="Book Hair Regrowth Consultation | Unity Hair Clinic"
        description="Book your hair regrowth consultation in India for hair fall and hair regrowth treatment with our expert restoration specialists."
      />

      {hero.status !== false && (
        <div className="min-h-screen bg-[#FAF8F5] py-12 px-4 md:px-8 lg:px-16 text-left">
          <div className="w-[90%] md:w-[90%] lg:max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start">
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-[24px] border border-[#E9E1D8] overflow-hidden shadow-sm relative flex flex-col md:flex-row">
                <div className="absolute top-[35%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-[#E9E1D8] shadow-md rounded-full flex items-center justify-center font-bold text-xs z-10 text-gray-500">
                  VS
                </div>

                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#E9E1D8] bg-gray-50/50">
                  <div>
                    <span className="inline-block bg-[#111] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-6">
                      Without Doctor's Guidance
                    </span>
                    <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video md:aspect-square bg-gray-200">
                      <img
                        src={getImageUrl(hero.withoutImage)}
                        alt="Without doctor"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                    <ul className="space-y-3.5">
                      {withoutList.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 border border-red-200 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0 text-red-500">
                            <X size={12} className="stroke-[3]" />
                          </div>
                          <span className="text-gray-600 font-semibold text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white">
                  <div>
                    <span className="inline-block bg-[#e07b7b] text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full mb-6">
                      With Doctor's Consultation
                    </span>
                    <div className="relative rounded-2xl overflow-hidden mb-6 aspect-video md:aspect-square bg-gray-200">
                      <img
                        src={getImageUrl(hero.withImage)}
                        alt="With doctor"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                    </div>
                    <ul className="space-y-3.5">
                      {withList.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-[#155e37] text-white rounded-full flex items-center justify-center flex-shrink-0">
                            <Check size={11} className="stroke-[3]" />
                          </div>
                          <span className="text-[#222] font-bold text-sm">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 lg:pl-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[#155e37]" />
                <span className="text-[#155e37] text-xs font-bold uppercase tracking-widest">
                  {hero.badge || "EXPERT CONSULTATION IN INDIA"}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-[#1a2b3c] leading-[1.1] tracking-tight">
                {hero.heading ? (
                  <>
                    {hero.heading.split(hero.headingHighlight || "Regrowth")[0]}
                    <span className="text-[#9c7c38] italic font-serif font-extrabold tracking-normal">
                      {hero.headingHighlight || "Regrowth"}
                    </span>
                    {hero.heading.split(hero.headingHighlight || "Regrowth")[1]}
                  </>
                ) : (
                  <>
                    Book Your Hair{" "}
                    <span className="text-[#9c7c38] italic font-serif font-extrabold tracking-normal">
                      Regrowth
                    </span>{" "}
                    Consultation in India for Hair Fall & Hair Regrowth
                    Treatment
                  </>
                )}
              </h1>

              <div className="space-y-4 text-gray-600 text-sm md:text-base leading-relaxed font-medium">
                {hero.para1 && <p>{hero.para1}</p>}
                {hero.para2 && <p>{hero.para2}</p>}
                {hero.para3 && <p>{hero.para3}</p>}
              </div>

              {bullets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 py-4 border-y border-[#E9E1D8]">
                  {bullets.map((bullet, index) => (
                    <div key={index} className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 bg-[#9c7c38] rounded-full flex-shrink-0" />
                      <span className="text-gray-700 font-bold text-xs md:text-sm">
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-2 flex justify-start">
                <button
                  onClick={() => navigate("/allproducts")}
                  className="bg-[#155e37] text-white hover:bg-[#0d3c22] transition-colors font-black text-sm tracking-widest px-8 py-3.5 rounded-lg uppercase shadow-sm active:scale-95"
                >
                  TAKE HAIR TEST
                </button>
              </div>

              {stats.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 mt-4 border-t border-gray-100">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="flex flex-col text-left">
                      <span className="text-2xl md:text-3xl font-black text-[#155e37] leading-none mb-1.5">
                        {stat.label}
                      </span>
                      <span className="text-gray-400 text-[10px] md:text-xs font-semibold leading-tight">
                        {stat.sub}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {social.status !== false && (
        <Section className="bg-white !py-12">
          <Row>
            <Heading title={social.sectionTitle} />
            <Description
              Description={social.sectionSubtitle}
              className="mb-10"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {social.instagram && (
                <div className="relative bg-white rounded-[24px] border border-[#E9E1D8] shadow-sm p-8 flex flex-col items-center text-center overflow-hidden hover:shadow-md transition-all duration-300 group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]" />
                  <div className="relative mb-6 mt-2">
                    <div className="w-[110px] h-[110px] rounded-full flex items-center justify-center p-[3px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                      <div className="w-full h-full rounded-full bg-white p-[3px]">
                        <img
                          src={getImageUrl(social.instagram.image)}
                          alt="Instagram specialist"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]">
                      <Instagram size={13} className="stroke-[2.5]" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="font-extrabold text-gray-800 text-base md:text-lg">
                      {social.instagram.handle || "@drprithish"}
                    </span>
                    <CircleCheck className="bg-blue-500 overflow-hidden rounded-full text-white w-5 h-5" />
                  </div>
                  <div className="mb-5">
                    <div className="text-2xl font-black text-gray-900 leading-none">
                      {social.instagram.followers || "113k+"}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Followers
                    </div>
                  </div>
                  {social.instagram.tags?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-8">
                      {social.instagram.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#FAF8F5] text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full border border-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-auto py-3 px-6 rounded-full text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm bg-gradient-to-r from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    <Instagram size={14} className="stroke-[2.5]" />
                    <span>
                      {social.instagram.buttonText || "Follow on Instagram"}
                    </span>
                  </a>
                </div>
              )}

              {social.facebook && (
                <div className="relative bg-white rounded-[24px] border border-[#E9E1D8] shadow-sm p-8 flex flex-col items-center text-center overflow-hidden hover:shadow-md transition-all duration-300 group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1877F2] to-[#00c6ff]" />
                  <div className="relative mb-6 mt-2">
                    <div className="w-[110px] h-[110px] rounded-full flex items-center justify-center p-[3px] bg-gradient-to-tr from-[#1877F2] to-[#00c6ff]">
                      <div className="w-full h-full rounded-full bg-white p-[3px]">
                        <img
                          src={
                            getImageUrl(social.facebook.image) ||
                            "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=80"
                          }
                          alt="Facebook specialist"
                          className="w-full h-full rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md bg-[#1877F2]">
                      <Facebook size={13} className="fill-white stroke-none" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="font-extrabold text-gray-800 text-base md:text-lg">
                      {social.facebook.handle || "@your_haircoach"}
                    </span>
                    <CircleCheck className="bg-blue-500 overflow-hidden rounded-full text-white w-5 h-5" />
                  </div>
                  <div className="mb-5">
                    <div className="text-2xl font-black text-gray-900 leading-none">
                      {social.facebook.followers || "111k+"}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Followers
                    </div>
                  </div>
                  {social.facebook.tags?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-8">
                      {social.facebook.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#FAF8F5] text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full border border-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-auto py-3 px-6 rounded-full text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm bg-gradient-to-r from-[#1877F2] to-[#1166d6] hover:shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    <Facebook
                      size={20}
                      className="border border-white rounded-full"
                    />
                    <span>
                      {social.facebook.buttonText || "Follow on Facebook"}
                    </span>
                  </a>
                </div>
              )}

              {social.youtube && (
                <div className="relative bg-white rounded-[24px] border border-[#E9E1D8] shadow-sm p-8 flex flex-col items-center text-center overflow-hidden hover:shadow-md transition-all duration-300 group">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF0000] to-[#b30000]" />
                  <div className="relative mb-6 mt-2">
                    <div className="w-[110px] h-[110px] rounded-full flex items-center justify-center p-[3px] bg-gradient-to-tr from-[#FF0000] to-[#b30000]">
                      <div className="w-full h-full rounded-full bg-white p-[3px] flex items-center justify-center overflow-hidden">
                        <img
                          src={getImageUrl(social.youtube.image) || HeaderLogo}
                          alt="YouTube brand logo"
                          className="w-[80%] h-[80%] object-contain"
                        />
                      </div>
                    </div>
                    <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md bg-[#FF0000]">
                      <Youtube size={13} className="fill-white stroke-none" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="font-extrabold text-gray-800 text-base md:text-lg">
                      {social.youtube.handle || "@fidorehealth"}
                    </span>
                    <CircleCheck className="bg-blue-500 overflow-hidden rounded-full text-white w-5 h-5" />
                  </div>
                  <div className="mb-5">
                    <div className="text-2xl font-black text-gray-900 leading-none">
                      {social.youtube.subscribers || "26.3k+"}
                    </div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                      Subscribers
                    </div>
                  </div>
                  {social.youtube.tags?.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-1.5 mb-8">
                      {social.youtube.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-[#FAF8F5] text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full border border-gray-100"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-auto py-3 px-6 rounded-full text-white font-black text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm bg-gradient-to-r from-[#FF0000] to-[#cc0000] hover:shadow-md transition-all duration-300 active:scale-[0.98] cursor-pointer"
                  >
                    <Youtube size={14} className="fill-white stroke-none" />
                    <span>
                      {social.youtube.buttonText || "Subscribe on YouTube"}
                    </span>
                  </a>
                </div>
              )}
            </div>
          </Row>
        </Section>
      )}

      {whatsapp.status !== false && chatImages.length > 0 && (
        <Section className="bg-[var(--ef3a96-9)] !py-16 overflow-hidden">
          <Row>
            <Heading title={whatsapp.sectionTitle} />
            <Description Description={whatsapp.sectionSubtitle} />

            <div className="relative w-full overflow-hidden py-6 mt-4">
              <style
                dangerouslySetInnerHTML={{
                  __html: `.scrollbar-none::-webkit-scrollbar{display:none}.scrollbar-none{-ms-overflow-style:none;scrollbar-width:none}`,
                }}
              />
              <div
                ref={chatContainerRef}
                className="flex overflow-x-auto gap-8 cursor-grab active:cursor-grabbing select-none scrollbar-none py-4 px-10"
              >
                {[...chatImages, ...chatImages, ...chatImages].map(
                  (src, idx) => (
                    <WhatsappImageCard key={idx} src={src} />
                  ),
                )}
              </div>
            </div>
          </Row>
        </Section>
      )}

      {faq.status !== false && faqItems.length > 0 && (
        <Section className="bg-white !py-20 border-t border-[#E9E1D8]">
          <Row className="max-w-4xl mx-auto">
            <Heading
              title={faq.sectionTitle}
              className="border-b border-[#E9E1D8] py-4 md:py-5"
            />
            <div className="space-y-1">
              {faqItems.map((item, index) => {
                const isOpen = openFaqIndex === index;
                const question = item.q?.replace(/^\d+\.\s*/, "") || "";
                return (
                  <div
                    key={index}
                    className="border-b border-[#E9E1D8] py-4 md:py-5"
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="w-full flex items-center justify-between text-left focus:outline-none group cursor-pointer"
                    >
                      <span
                        className={`font-extrabold text-base md:text-[17px] leading-snug transition-colors duration-300 ${isOpen ? "text-[#155e37]" : "text-[#1a2b3c] group-hover:text-[#155e37]"}`}
                      >
                        {index + 1}. {question}
                      </span>
                      <div
                        className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ml-4 ${isOpen ? "bg-[#155e37] border-[#155e37] text-white" : "bg-white border-[#E9E1D8] text-gray-400 group-hover:border-[#155e37] group-hover:text-[#155e37]"}`}
                      >
                        <svg
                          className={`w-3.5 h-3.5 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      </div>
                    </button>

                    <div
                      className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-[500px] opacity-100 mt-4 pl-4 md:pl-5 border-l-2 border-[#155e37]" : "max-h-0 opacity-0 border-l-0"}`}
                    >
                      <p className="text-gray-500 font-semibold text-[14px] md:text-[15px] leading-relaxed text-left py-1">
                        {item.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Row>
        </Section>
      )}

      <button
        // onClick={() => setIsBookPopupOpen(true)}
        onClick={handleBookConsultationClick}
        className="fixed bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-[999] flex items-center
         justify-center gap-2.5 rounded-full bg-[#155e37] px-8 py-3.5 text-sm 
         font-black uppercase tracking-wider text-white border border-[#1a6e42] shadow-xl
          hover:bg-[#0d3c22] active:scale-95 transition-all duration-300 animate-pulse hover:scale-105 cursor-pointer"
      >
        <Calendar size={18} className="stroke-[2.5]" />
        <span className="text-nowrap">BOOK CONSULTATION</span>
        <ArrowRight size={16} className="stroke-[2.5]" />
      </button>

      <BookConsultationPopup
        isOpen={isBookPopupOpen}
        onClose={() => setIsBookPopupOpen(false)}
        onConfirm={handleBookingConfirm}
        apiData={popupData}
      />

      {isLoginPopupOpen && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <LoginForm
              isOpen={isLoginPopupOpen}
              onClose={() => setIsLoginPopupOpen(false)}
              onLoginSuccess={() => {
                setIsLoginPopupOpen(false);
                setIsBookPopupOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
