import React, { useRef, useState, useEffect, useCallback } from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import NavBtn from "../ui/Navbtn";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";

const GAP = 16;

function getResponsiveSizes(cardW) {
  if (cardW < 280)
    return {
      px: "12px",
      py: "12px",
      titleSize: "13px",
      titleLines: 2,
      descSize: "11px",
      badgeSize: "9px",
      btnPadding: "6px 12px",
      btnFontSize: "10px",
    };
  if (cardW < 420)
    return {
      px: "14px",
      py: "14px",
      titleSize: "14px",
      titleLines: 2,
      descSize: "12px",
      badgeSize: "10px",
      btnPadding: "7px 14px",
      btnFontSize: "11px",
    };
  if (cardW < 580)
    return {
      px: "18px",
      py: "18px",
      titleSize: "16px",
      titleLines: 2,
      descSize: "12px",
      badgeSize: "10px",
      btnPadding: "8px 16px",
      btnFontSize: "11px",
    };
  return {
    px: "28px",
    py: "28px",
    titleSize: "20px",
    titleLines: 2,
    descSize: "14px",
    badgeSize: "11px",
    btnPadding: "10px 20px",
    btnFontSize: "12px",
  };
}

function BannerCard({ banner, cardH, cardW }) {
  const navigate = useNavigate();
  const s = getResponsiveSizes(cardW);

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden flex"
      style={{
        height: cardH,
        backgroundImage: `url(${getImageUrl(banner.bgImage)})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        className="flex flex-col items-start justify-center z-10"
        style={{ width: "50%", padding: `${s.py} ${s.px}`, gap: "4px" }}
      >
        {banner.badge && (
          <span
            className="inline-block text-white bg-red-500 font-bold rounded uppercase"
            style={{
              fontSize: s.badgeSize,
              padding: "2px 8px",
              marginBottom: "4px",
            }}
          >
            {banner.badge}
          </span>
        )}
        <h3
          className="font-normal leading-snug mb-[4px] overflow-hidden"
          style={{
            fontSize: s.titleSize,
            display: "-webkit-box",
            WebkitLineClamp: s.titleLines,
            WebkitBoxOrient: "vertical",
          }}
        >
          {banner.title}
        </h3>
        <p
          className="truncate w-full mb-[8px] text-left"
          style={{ fontSize: s.descSize, opacity: 0.8 }}
        >
          {banner.description}
        </p>
        <button
          onClick={() => navigate(banner.button_link || "/allproducts")}
          className="bg-primary text-white font-bold rounded-full transition-colors duration-200 whitespace-nowrap"
          style={{ fontSize: s.btnFontSize, padding: s.btnPadding }}
        >
          {banner.button_name || "SHOP NOW"}
        </button>
      </div>

      {banner.productimg && (
        <div
          className="absolute right-0 top-0 h-full"
          style={{ width: "52%", padding: cardW < 400 ? "8px" : "16px" }}
        >
          <img
            src={getImageUrl(banner.productimg)}
            alt="product"
            className="w-full h-full object-contain object-right"
            draggable={false}
          />
        </div>
      )}
    </div>
  );
}

export default function BannerSlider() {
  const { slides } = useSelector((state) => state.slides);
  const bannerData = (slides || [])
    .filter((s) => s.section === "banner1")
    .flatMap((s) => s.banner1Slides || [])
    .filter((slide) => slide.status === "active");
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const stepRef = useRef(0);
  const total = bannerData.length;
  const [cardW, setCardW] = useState(0);
  const [cardH, setCardH] = useState(230);
  const [visibleCount, setVisibleCount] = useState(2);
  const [currentIndex, setCurrentIndex] = useState(total);

  const isStatic = total <= visibleCount;

  const tripled = isStatic
    ? bannerData
    : [...bannerData, ...bannerData, ...bannerData];

  const calcDimensions = useCallback(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    const count = w < 768 ? 1 : 2;
    const newW = Math.floor((w - GAP * (count - 1)) / count);
    const ratio = w < 768 ? 0.55 : 0.4;
    const newH = Math.max(140, Math.round(newW * ratio));

    setVisibleCount(count);
    setCardW(newW);
    setCardH(newH);
    stepRef.current = newW + GAP;
  }, []);

  useEffect(() => {
    calcDimensions();
    window.addEventListener("resize", calcDimensions);
    return () => window.removeEventListener("resize", calcDimensions);
  }, [calcDimensions]);

  useEffect(() => {
    if (total > 0) setTimeout(() => calcDimensions(), 0);
  }, [total, calcDimensions]);

  useEffect(() => {
    if (!trackRef.current || cardW === 0 || total === 0 || isStatic) return;
    stepRef.current = cardW + GAP;
    trackRef.current.style.transition = "none";
    trackRef.current.style.transform = `translateX(-${total * stepRef.current}px)`;
    setCurrentIndex(total);
  }, [cardW, total, isStatic]);

  const handleNext = useCallback(() => {
    if (isAnimating.current || total === 0 || isStatic || cardW === 0) return;
    isAnimating.current = true;
    const next = currentIndex + 1;
    setCurrentIndex(next);
    if (trackRef.current) {
      trackRef.current.style.transition =
        "transform 300ms cubic-bezier(0.4,0,0.2,1)";
      trackRef.current.style.transform = `translateX(-${next * stepRef.current}px)`;
    }
    setTimeout(() => {
      if (next >= total * 2) {
        const r = next - total;
        setCurrentIndex(r);
        if (trackRef.current) {
          trackRef.current.style.transition = "none";
          trackRef.current.style.transform = `translateX(-${r * stepRef.current}px)`;
        }
      }
      isAnimating.current = false;
    }, 310);
  }, [currentIndex, isStatic, cardW, total]);

  const handlePrev = useCallback(() => {
    if (isAnimating.current || total === 0 || isStatic || cardW === 0) return;
    isAnimating.current = true;
    const prev = currentIndex - 1;
    setCurrentIndex(prev);
    if (trackRef.current) {
      trackRef.current.style.transition =
        "transform 300ms cubic-bezier(0.4,0,0.2,1)";
      trackRef.current.style.transform = `translateX(-${prev * stepRef.current}px)`;
    }
    setTimeout(() => {
      if (prev < total) {
        const r = prev + total;
        setCurrentIndex(r);
        if (trackRef.current) {
          trackRef.current.style.transition = "none";
          trackRef.current.style.transform = `translateX(-${r * stepRef.current}px)`;
        }
      }
      isAnimating.current = false;
    }, 310);
  }, [currentIndex, isStatic, cardW, total]);

  useEffect(() => {
    if (isStatic || cardW === 0 || total === 0) return;
    const timer = setInterval(() => handleNext(), 3000);
    return () => clearInterval(timer);
  }, [handleNext, isStatic, cardW, total]);

  if (!bannerData.length) return null;

  if (total === 1) {
    return (
      <Section>
        <Row>
          <div ref={containerRef} className="w-full">
            {cardW > 0 && (
              <div className="flex justify-center">
                <div style={{ width: `${cardW}px` }}>
                  <BannerCard
                    banner={bannerData[0]}
                    cardH={cardH}
                    cardW={cardW}
                  />
                </div>
              </div>
            )}
          </div>
        </Row>
      </Section>
    );
  }

  if (total === 2 && visibleCount >= 2) {
    return (
      <Section>
        <Row>
          <div ref={containerRef} className="w-full">
            {cardW > 0 && (
              <div className="flex" style={{ gap: `${GAP}px` }}>
                {bannerData.map((banner, i) => (
                  <div
                    key={`${banner._id}-${i}`}
                    className="flex-shrink-0"
                    style={{ width: `${cardW}px` }}
                  >
                    <BannerCard banner={banner} cardH={cardH} cardW={cardW} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Row>
      </Section>
    );
  }

  return (
    <Section>
      <Row>
        <div className="flex items-center justify-end gap-3 mb-4">
          <NavBtn direction="left" onClick={handlePrev} variant="primary" />
          <NavBtn direction="right" onClick={handleNext} variant="primary" />
        </div>

        <div className="overflow-hidden w-full" ref={containerRef}>
          {cardW > 0 && (
            <div
              ref={trackRef}
              className="flex"
              style={{ gap: `${GAP}px`, willChange: "transform" }}
            >
              {tripled.map((banner, i) => (
                <div
                  key={`${banner._id}-${i}`}
                  className="flex-shrink-0"
                  style={{ width: `${cardW}px` }}
                >
                  <BannerCard banner={banner} cardH={cardH} cardW={cardW} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Row>
    </Section>
  );
}
