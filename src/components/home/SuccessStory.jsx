import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSlides } from "../../features/slides/slideThunk";
import Section from "../ui/Section";
import Row from "../ui/Row";
import Heading from "../ui/Heading";

const BASE_URL = process.env.REACT_APP_API_URL_IMAGE;

const imgSrc = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

function StoryCard({ slide, isPlaying, onToggle, onVideoEnd }) {
  return (
    <div
      className="relative min-w-[220px] w-[220px] h-[370px] rounded-2xl overflow-hidden cursor-pointer py-2 bg-black flex-shrink-0"
      onClick={onToggle}
    >
      <div className="absolute inset-0">
        {isPlaying && slide.videoUrl ? (
          <video
            src={imgSrc(slide.videoUrl)}
            autoPlay
            controls
            playsInline
            controlsList="nodownload"
            className="w-full h-full object-fill"
            onEnded={onVideoEnd}
            loading="lazy"
          />
        ) : (
          <img
            src={imgSrc(slide.mainImage)}
            alt={slide.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {!isPlaying && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      )}

      {!isPlaying && (
        <div className="absolute right-3 top-24 flex flex-col gap-3 z-20">
          {slide.beforeImage && (
            <div className="relative">
              <img
                src={imgSrc(slide.beforeImage)}
                alt="before"
                loading="lazy"
                decoding="async"
                className="w-16 h-16 rounded-xl object-cover border border-white"
              />
              <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-black/60 text-white rounded-b-xl">
                Before
              </span>
            </div>
          )}

          {slide.afterImage && (
            <div className="relative">
              <img
                src={imgSrc(slide.afterImage)}
                alt="after"
                loading="lazy"
                decoding="async"
                className="w-16 h-16 rounded-xl object-cover border border-white"
              />
              <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-black/60 text-white rounded-b-xl">
                After
              </span>
            </div>
          )}
        </div>
      )}

      {!isPlaying && slide.videoUrl && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-7 h-7 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {!isPlaying && (
        <div className="absolute bottom-2 left-2 right-2 z-20 ">
          <div className="bg-gray-100 p-2 overflow-hidden rounded-b-[10px]">
            <p className="text-sm font-semibold text-gray-900 text-left line-clamp-2">
              {slide.title}
            </p>
            <div className="flex justify-start gap-2">
              <span className="text-xs text-gray-600 mt-1">- {slide.name}</span>
              <span className="text-xs text-gray-600 mt-1">{slide.age}</span>
            </div>

            {slide.review && (
              <p className="text-xs text-gray-500 mt-1">{slide.review}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SuccessStorySection() {
  const dispatch = useDispatch();
  const location = useLocation();
  const containerRef = useRef(null);

  const [playingId, setPlayingId] = useState(null);

  const { slides } = useSelector((state) => state.slides);
  const sectionData = slides?.find((item) => item.section === "successStory");
  useEffect(() => {
    dispatch(fetchSlides());
  }, [dispatch]);

  const currentPage = useMemo(() => {
    const path = location.pathname.toLowerCase();

    if (path === "/") return "home";

    return path.replace("/", "");
  }, [location.pathname]);
  const shouldShow = sectionData?.showOnPages?.includes(currentPage);

  const slidesList = sectionData?.successStorySlides || [];

  const tripleSlidesList = useMemo(() => {
    if (!slidesList.length) return [];
    return [...slidesList, ...slidesList, ...slidesList];
  }, [slidesList]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !slidesList.length) return;

    const initScroll = () => {
      const W = container.scrollWidth / 3;
      container.scrollLeft = W;
    };

    initScroll();
    const timer = setTimeout(initScroll, 50);

    const handleScroll = () => {
      const W = container.scrollWidth / 3;
      if (W <= 0) return;

      if (container.scrollLeft >= 2 * W) {
        const prevBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = "auto";
        container.scrollLeft -= W;
        container.style.scrollBehavior = prevBehavior;
      } else if (container.scrollLeft < W) {
        const prevBehavior = container.style.scrollBehavior;
        container.style.scrollBehavior = "auto";
        container.scrollLeft += W;
        container.style.scrollBehavior = prevBehavior;
      }
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", initScroll);

    let isDown = false;
    let startX;
    let scrollLeftVal;

    const handleMouseDown = (e) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeftVal = container.scrollLeft;
      container.style.scrollBehavior = "auto";
    };

    const handleMouseLeave = () => {
      isDown = false;
    };

    const handleMouseUp = () => {
      isDown = false;
    };

    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeftVal - walk;
    };

    container.addEventListener("mousedown", handleMouseDown);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("mouseup", handleMouseUp);
    container.addEventListener("mousemove", handleMouseMove);

    return () => {
      clearTimeout(timer);
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", initScroll);

      container.removeEventListener("mousedown", handleMouseDown);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("mouseup", handleMouseUp);
      container.removeEventListener("mousemove", handleMouseMove);
    };
  }, [slidesList.length]);

  if (!sectionData) return null;

  if (!shouldShow) return null;

  if (!slidesList.length) return null;

  return (
    <Section className="w-full py-6">
      <Heading title={"Our Success Stories"} />

      <Row>
        <div
          ref={containerRef}
          className="flex gap-5 overflow-x-auto px-2 py-2 cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tripleSlidesList.map((slide, idx) => {
            const cardId = `${slide._id}-${idx}`;
            return (
              <StoryCard
                key={cardId}
                slide={slide}
                isPlaying={playingId === cardId}
                onToggle={() =>
                  setPlayingId(playingId === cardId ? null : cardId)
                }
                onVideoEnd={() => setPlayingId(null)}
              />
            );
          })}
        </div>
      </Row>
    </Section>
  );
}
