import { useState, useRef, useEffect } from "react";
import {
  Facebook,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Youtube,
  Send,
} from "lucide-react";
import visaImg from "../../assets/visa.webp";
import mastercardImg from "../../assets/mastercard.webp";
import discoverImg from "../../assets/discover.webp";
import paypalImg from "../../assets/paypal.webp";
import Row from "../ui/Row";
import Section from "../ui/Section";
import { Link, useLocation } from "react-router-dom";
import mylogo from "../../assets/logo.webp";
import { fetchFooter } from "../../features/footer/footerThunk";
import { createEmails } from "../../features/emails/emailsThunk";
import { toast } from "react-hot-toast";

import { useDispatch, useSelector } from "react-redux";
const getSocialIcon = (platform) => {
  const p = platform?.toLowerCase();
  if (p?.includes("facebook")) return { icon: Facebook };
  if (p?.includes("instagram")) return { icon: Instagram };
  if (p?.includes("youtube")) return { icon: Youtube};
  if (p?.includes("twitter") || p?.includes("x"))
    return { icon: Twitter, color: "#1DA1F2" };
  return { icon: Facebook, color: "#555" };
};

export default function Footer() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isConsultationPage = location.pathname === "/consultation";

  const { footers = [], loading } = useSelector((state) => state.footer);
  const { info: storeInfo } = useSelector((state) => state.store);
  const socialLinks = storeInfo?.social_links || [];
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
    "Become a Unity member and get 10% off your next purchase!";
  const copyright =
    storeInfo?.theme?.copyrightText ||
    "2026 Unity Hair Clinic PVT LTD. All rights reserved.";
  const contactAddress =
    [
      storeInfo?.address?.street,
      storeInfo?.address?.city,
      storeInfo?.address?.state,
      storeInfo?.address?.country,
      storeInfo?.address?.zip_code,
    ]
      .filter(Boolean)
      .join(", ") ||
    "unity clinic shop no 10 11 ground floor dhara arcade mahadev chowk mota varcha, surat , Gujarat, Surat, 394101";

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
    .slice(0, 5);

  const supportLinks = reversedFooters
    .filter((item) => item.status === "active")
    .slice(5, 10);

  const BASE = process.env.REACT_APP_API_URL_IMAGE;
  const dynamicLogoUrl = (() => {
    const logoPath = storeInfo?.theme?.logoUrl || storeInfo?.logo;
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    return `${BASE}${logoPath}`;
  })();

  return (
    <footer>
      <div
        ref={contentRef}
        className="overflow-hidden transition-all duration-500 ease-in-out "
      >
        <Section className="bg-[var(--ef3a96-9)]">
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
              <div className="flex items-center gap-[10px] text-sm text-black hover:ms-4">
                <div className="w-[20px]">
                  <MapPin className="mt-1" size={22} />
                </div>

                <p>{contactAddress}</p>
              </div>
              <div className="flex items-center gap-[10px] text-sm text-black hover:ms-4">
                <div className="w-[20px]">
                  <Mail className="mt-1" size={20} />
                </div>
                <Link
                  to="mailto:info@gmail.com"
                  className="underline break-words"
                >
                  {contactEmail}
                </Link>
              </div>
              <div className="flex items-center gap-[10px] text-sm text-black hover:ms-4">
                <div className="w-[20px]">
                  <Phone className="mt-1" size={20} />
                </div>
                <p>{contactPhone}</p>
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-20px text-black  mb-[35px] tracking-[3%]">
                NAVIGATION LINKS
                <span className="theme-border-block w-[45px]"></span>
              </h2>
              <ul className="pl-[20px] text-[15px] list-disc marker:text-light space-y-[15px]">
                {!loading &&
                  navigationLinks?.map((item) => (
                    <li
                      key={item._id}
                      className="text-black  hover:text-black hover:underline hover:ms-4"
                    >
                      <Link to={item.url}>{item.label}</Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-20px text-black  mb-[35px] tracking-[3%]">
                CUSTOMER SUPPORT
                <span className="theme-border-block w-[45px]"></span>
              </h2>
              <ul className="pl-[20px] text-[15px] text-light list-disc marker:text-light space-y-[15px]">
                {!loading &&
                  supportLinks?.map((item) => (
                    <li
                      key={item._id}
                      className="text-black  hover:text-black hover:underline hover:ms-4"
                    >
                      <Link to={item.url}>{item.label}</Link>
                    </li>
                  ))}
              </ul>
            </div>
            <div>
              <h2 className="font-semibold text-20px text-black  mb-[35px] tracking-[3%]">
                JOIN NOW !<span className="theme-border-block w-[45px]"></span>
              </h2>
              <p className="text-sm mb-3 text-black">{footertext}</p>

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
                  <Send
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
        <Section
          className={`bg-primary !py-[0px] !md:py-[0px] ${isConsultationPage ? "!pb-[120px] md:!pb-0" : "!pb-0"}`}
        >
          <Row className="flex justify-between items-center py-4">
            <div className="text-white">
              <span>©</span> <span>{copyright}</span>
            </div>
            <div className="flex gap-3 justify-end items-center">
              {socialLinks.map((link, index) => {
                const { icon: IconComponent } = getSocialIcon(link.platform);
                return (
                  <Link key={index} to={link.url} target="_blank">
                    <IconComponent
                      size={30}
                      className="transition-transform hover:scale-110 text-white"
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
