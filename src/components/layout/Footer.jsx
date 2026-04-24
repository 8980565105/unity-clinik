import { useState, useRef, useEffect } from "react";
import { FiFacebook } from "react-icons/fi";
import { TfiTwitter, TfiEmail } from "react-icons/tfi";
import {
  FaInstagram,
  FaLinkedin,
  FaPaperPlane,
  FaPinterest,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";
import { BsTelephone } from "react-icons/bs";
import { ChevronDown, MapPin } from "lucide-react";
import visaImg from "../../assets/visa.png";
import mastercardImg from "../../assets/mastercard.png";
import discoverImg from "../../assets/discover.png";
import paypalImg from "../../assets/paypal.png";
import googlePlay from "../../assets/googlePlay.png";
import appleStore from "../../assets/appleStore.png";
import Row from "../ui/Row";
import Section from "../ui/Section";
import { Link } from "react-router-dom";
import mylogo from "../../assets/my_logo.png";
import { fetchFooter } from "../../features/footer/footerThunk";
import { createEmails } from "../../features/emails/emailsThunk";
import { toast } from "react-hot-toast";

import { useDispatch, useSelector } from "react-redux";
const getSocialIcon = (platform) => {
  const p = platform?.toLowerCase();
  if (p?.includes("facebook")) return { icon: FiFacebook, color: "#1877F2" };
  if (p?.includes("instagram")) return { icon: FaInstagram, color: "#E1306C" };
  if (p?.includes("youtube")) return { icon: FaYoutube, color: "#FF0000" };
  if (p?.includes("twitter") || p?.includes("x"))
    return { icon: TfiTwitter, color: "#1DA1F2" };
  if (p?.includes("linkedin")) return { icon: FaLinkedin, color: "#0A66C2" };
  if (p?.includes("tiktok")) return { icon: FaTiktok, color: "#000000" };
  if (p?.includes("pinterest")) return { icon: FaPinterest, color: "#E60023" };
  return { icon: FiFacebook, color: "#555" };
};

export default function Footer() {
  const dispatch = useDispatch();
  const { footers = [], loading } = useSelector((state) => state.footer);
  const { info: storeInfo } = useSelector((state) => state.store);
  const socialLinks = storeInfo?.social_links || [];
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const {
    loading: emailLoading,
    success,
    error,
  } = useSelector((state) => state.emails);
  const contentRef = useRef(null);
  const contactEmail = storeInfo?.email || "info@gmail.com";
  const contactPhone = storeInfo?.phone || "+1 [155] 000-01000";
  const footertext =
    storeInfo?.theme?.footerText ||
    "Become a MYcra member and get 10% off your next purchase!";
  const copyright =
    storeInfo?.theme?.copyrightText ||
    "2026 MYcra Fashion Ltd. All Rights Reserved";
  const contactAddress =
    [
      storeInfo?.address?.street,
      storeInfo?.address?.city,
      storeInfo?.address?.state,
      storeInfo?.address?.country,
      storeInfo?.address?.zip_code,
    ]
      .filter(Boolean)
      .join(", ") || "215, Dhara Arcade near Lajamani Chowk, Surat";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    if (isMobile) setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    dispatch(fetchFooter({ isPublic: true }));
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("Email subscribed successfully!");
      setEmailInput("");
    }
    if (error) {
      toast.error(error);
    }
  }, [success, error, dispatch]);

  const handleEmailSubmit = async () => {
    if (!emailInput || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    const result = await dispatch(createEmails({ email: emailInput }));
    if (createEmails.fulfilled.match(result)) {
      toast.success("Email subscribed successfully!");
      setEmailInput("");
    } else {
      toast.error(result.payload || "Something went wrong");
    }
  };

  const reversedFooters = [...footers].reverse();

  const navigationLinks = reversedFooters
    .filter((item) => item.status === "active")
    .slice(0, 4);

  const supportLinks = reversedFooters
    .filter((item) => item.status === "active")
    .slice(4, 9);

  const BASE = process.env.REACT_APP_API_URL_IMAGE;
  const dynamicLogoUrl = (() => {
    const logoPath = storeInfo?.theme?.logoUrl || storeInfo?.logo;
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    return `${BASE}${logoPath}`;
  })();

  return (
    <footer className="mt-[25px] md:mt-[50px]">
      <Row
        className="flex items-center justify-between px-[10px] py-[16px] cursor-pointer md:hidden border-t border-[#BCBCBC]"
        onClick={handleToggle}
      >
        <p className="text-[14px] text-black font-medium">
          About MYcra Fashion
        </p>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </Row>
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isMobile ? "" : "max-h-none opacity-100"
        }`}
        style={{
          maxHeight: isMobile
            ? isOpen
              ? `${contentRef.current?.scrollHeight}px`
              : "0px"
            : "none",
          opacity: isMobile ? (isOpen ? 1 : 0) : 1,
        }}
      >
        <Section className="bg-[var(--theme-bg-rgba)]">
          <Row className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-[22px] max-w-[280px] w-full">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <img
                  src={dynamicLogoUrl || mylogo}
                  alt="Logo"
                  className="h-auto w-[200px]"
                />
              </Link>
              <div className="flex items-center gap-[10px] text-sm text-primary hover:ms-4">
                <div className="w-[20px]">
                  <MapPin className="mt-1" size={22} />
                </div>

                <p>{contactAddress}</p>
              </div>
              <div className="flex items-center gap-[10px] text-sm text-primary hover:ms-4">
                <div className="w-[20px]">
                  <TfiEmail className="mt-1" size={20} />
                </div>
                <Link
                  to="mailto:info@gmail.com"
                  className="underline break-words"
                >
                  {contactEmail}
                </Link>
              </div>
              <div className="flex items-center gap-[10px] text-sm text-primary hover:ms-4">
                <div className="w-[20px]">
                  <BsTelephone className="mt-1" size={20} />
                </div>
                <p>{contactPhone}</p>
              </div>
            </div>
            <div>
              <h2 className="font-regular text-20px text-primary  mb-[35px] tracking-[3%]">
                NAVIGATION LINKS
                <span className="theme-border-block w-[45px]"></span>
              </h2>
              <ul className="pl-[20px] text-[15px] list-disc marker:text-light space-y-[15px]">
                {!loading &&
                  navigationLinks?.map((item) => (
                    <li
                      key={item._id}
                      className="text-primary  hover:text-black hover:underline hover:ms-4"
                    >
                      <Link to={item.url}>{item.label}</Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h2 className="font-regular text-20px text-primary  mb-[35px] tracking-[3%]">
                CUSTOMER SUPPORT
                <span className="theme-border-block w-[45px]"></span>
              </h2>
              <ul className="pl-[20px] text-[15px] text-light list-disc marker:text-light space-y-[15px]">
                {!loading &&
                  supportLinks?.map((item) => (
                    <li
                      key={item._id}
                      className="text-primary  hover:text-black hover:underline hover:ms-4"
                    >
                      <Link to={item.url}>{item.label}</Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h2 className="font-regular text-20px text-primary  mb-[35px] tracking-[3%]">
                JOIN NOW !<span className="theme-border-block w-[45px]"></span>
              </h2>
              <p className="text-sm mb-3 text-primary">{footertext}</p>

              <div className="flex flex-col sm:flex-row mb-4 gap-2">
                <div className="relative w-full">
                  <input
                    type="email"
                    placeholder="Enter Your E-mail Address"
                    className="input-common !py-[7px] !rounded-[3px] turncate"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    disabled={emailLoading}
                  />
                  <FaPaperPlane
                    onClick={() => {
                      handleEmailSubmit();
                    }}
                    className="text-theme text-xl -rotate-12  absolute right-4 top-1/2 h-[18px] w-[18px] transform -translate-y-1/2 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-[15px]">
                <img
                  src={visaImg}
                  alt="Visa"
                  className="w-[62px] h-[36px] object-contain"
                />
                <img
                  src={mastercardImg}
                  alt="Mastercard"
                  className="w-[62px] h-[36px] object-contain"
                />
                <img
                  src={discoverImg}
                  alt="Discover"
                  className="w-[62px] h-[36px] object-contain"
                />
                <img
                  src={paypalImg}
                  alt="Paypal"
                  className="w-[62px] h-[36px] object-contain"
                />
              </div>
            </div>
          </Row>
        </Section>
        <Section className="bg-primary !py-[0px] !md:py-[0px]">
          <Row className="flex justify-between items-center py-4">
            <div className="text-white">
              <span>©</span> <span>{copyright}</span>
            </div>
            <div className="flex gap-3 justify-end items-center">
              {socialLinks.map((link, index) => {
                const { icon: IconComponent } = getSocialIcon(link.platform);
                return (
                  <Link
                    key={index}
                    to={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <IconComponent
                      size={30}
                      className="text-white hover:text-black"
                    />
                  </Link>
                );
              })}
            </div>
          </Row>
        </Section>
      </div>
    </footer>
  );
}
