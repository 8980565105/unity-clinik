import Section from "../ui/Section";
import Row from "../ui/Row";
import { getImageUrl } from "../utils/helper";
import Heading from "../ui/Heading";
import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Plus, Minus, ChevronUp, ChevronDown } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Description from "../ui/Description";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import Solutionstagecard from "./solutionstagecard";

function FaqItem({ faq, isOpen, onToggle }) {
  return (
    <div className="border-b border-[#e7e7e7]">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between text-left py-5 group"
      >
        <h3 className="text-[12px] md:text-[16px] font-bold text-gray-900 hover:text-primary pr-4">
          {faq.question}
        </h3>

        <div className="flex-shrink-0 text-[#707070]">
          {isOpen ? <Minus size={24} /> : <Plus size={24} />}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "pb-6" : "max-h-0"
        }`}
      >
        <div className="flex gap-6 items-start">
          <p className="text-gray-500 text-[12px] leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

const Faq2Item = ({ item, isOpen, onToggle }) => {
  return (
    <div
      className={`rounded-[28px] border transition-all duration-300 overflow-hidden mb-5 bg-white
      ${isOpen ? "border-[#005b9f] shadow-sm" : "border-[#d7dde5]"}`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 md:px-8 py-5 md:py-7 text-left"
      >
        <div className="flex items-center gap-3 md:gap-4">
          {item?.image && (
            <img
              src={
                item.image?.startsWith("http")
                  ? item.image
                  : getImageUrl(item.image)
              }
              alt={item.title}
              className="w-10 h-10 md:w-12 md:h-12 object-contain rounded-full"
            />
          )}

          <h3 className="text-[20px] md:text-[28px] font-bold text-[#0b1c48]">
            {item.question || item.title}
          </h3>
        </div>

        <div className="min-w-[42px] min-h-[42px] rounded-full bg-[#005b9f] flex items-center justify-center">
          {isOpen ? (
            <ChevronUp size={20} className="text-white" />
          ) : (
            <ChevronDown size={20} className="text-white" />
          )}
        </div>
      </button>

      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="px-5 md:px-8 pb-6 md:pb-8 text-[#5f6c86] text-[16px] md:text-[18px] leading-[1.9] border-t border-[#edf0f4]">
          <div className="pt-5">{item.answer || item.description}</div>
        </div>
      </div>
    </div>
  );
};

function HowCard({ item, onLearnMore }) {
  return (
    <div
      className="
      how-card
      relative
      flex-shrink-0
      w-[485px]
      min-h-[160px]
      rounded-[32px]
      bg-[#005B99]
      overflow-hidden
      p-4
      flex
      flex-col
      justify-between
    "
    >
      <div className="absolute -top-8 -right-8 w-[180px] h-[180px] rounded-full bg-[#1b6daa]" />

      <div
        className="
        absolute
        top-0
        right-0
        w-[70px]
        h-[70px]
        bg-white
        rounded-bl-[55px]
        z-10
      "
      />

      {/* Icon */}
      {item.image && (
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="
          absolute
          top-[-8px]
          right-[0px]
          w-14
          h-14
          object-contain
          z-20
        "
        />
      )}

      <div className="relative z-20 flex-1 flex flex-col">
        <h3 className="text-white text-[22px] font-extrabold mb-2 pr-12">
          {item.name}
        </h3>

        <p className="text-gray-200 text-sm leading-relaxed line-clamp-2 pr-6">
          {item.description}
        </p>

        <div className="mt-auto pt-5">
          <button
            onClick={() => onLearnMore(item)}
            className="
            bg-white
            text-[#005B99]
            px-6
            py-3
            rounded-xl
            font-bold
            text-sm
            hover:bg-gray-50
            transition
          "
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductSections({ sections, setShowLoginPopup }) {
  const activeSections = (sections || []).filter(
    (sec) => sec?.data?.status === true || sec?.data?.status === undefined,
  );

  const [faq1OpenIndex, setFaq1OpenIndex] = useState(0);
  return (
    <>
      {activeSections.map((section, idx) => (
        <SectionRenderer
          key={idx}
          section={section}
          setShowLoginPopup={setShowLoginPopup}
        />
      ))}
    </>
  );
}

function SectionRenderer({ section, setShowLoginPopup }) {
  const { type, data } = section;
  const items = data?.items || [];

  const scrollRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [faq2OpenIndex, setFaq2OpenIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState({});
  const [faq1OpenIndex, setFaq1OpenIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAllAttrs, setShowAllAttrs] = useState(false);
  const [open, setOpen] = useState(true);
  const [activeSlider, setActiveSlider] = useState(null);
  const navigate = useNavigate();

  const [visibleCount, setVisibleCount] = useState(
    typeof window !== "undefined" && window.innerWidth < 768 ? 2 : 4,
  );

  useEffect(() => {
    const move = (e) => {
      if (activeSlider === null) return;

      const container = document.getElementById(`before-after-${activeSlider}`);

      if (!container) return;

      const rect = container.getBoundingClientRect();

      const clientX = e.touches?.[0]?.clientX ?? e.clientX;

      let position = ((clientX - rect.left) / rect.width) * 100;

      position = Math.max(0, Math.min(100, position));

      setSliderPosition((prev) => ({
        ...prev,
        [activeSlider]: position,
      }));
    };

    const stop = () => {
      setActiveSlider(null);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", stop);

    window.addEventListener("touchmove", move, {
      passive: false,
    });

    window.addEventListener("touchend", stop);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);

      window.removeEventListener("touchmove", move);

      window.removeEventListener("touchend", stop);
    };
  }, [activeSlider]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(4);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const visibleItems = (data?.items || []).slice(0, visibleCount);
  const { product, products, loading, error } = useSelector(
    (state) => state.products,
  );
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;

    const card = scrollRef.current.querySelector(".how-card");
    if (card) {
      const cardFullWidth = card.offsetWidth + 24;
      const index = Math.round(scrollLeft / cardFullWidth);
      setActiveIndex(index);
    }
  };

  const scrollToIndex = (i) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector(".how-card");
    if (card) {
      const cardFullWidth = card.offsetWidth + 24;
      scrollRef.current.scrollTo({
        left: i * cardFullWidth,
        behavior: "smooth",
      });
    }
  };

  const handleSliderMove = (e, index) => {
    const container = e.currentTarget.getBoundingClientRect();

    const clientX = e.touches?.[0]?.clientX || e.clientX;

    let position = ((clientX - container.left) / container.width) * 100;

    position = Math.max(0, Math.min(100, position));

    setSliderPosition((prev) => ({
      ...prev,
      [index]: position,
    }));
  };

  switch (type) {
    case "Root Cause Section":
      return (
        <Section className="py-16 bg-[#f8f9fa] overflow-hidden">
          <Row>
            <Heading title={data.title} />

            <Description Description={data.description} />

            <Row className="mt-5 overflow-hidden">
              <Swiper
                modules={[Pagination, Autoplay]}
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: false,
                }}
                loop
                spaceBetween={30}
                slidesPerView={3}
                className="rootCauseSwiper !pb-16 "
              >
                {items.map((item, i) => (
                  <SwiperSlide key={i}>
                    <div
                      className="
          group
          rounded-[28px]
          bg-[#f5f5f5]
        p-2
          transition-all
          duration-300
          border-2
          border-transparent
          hover:border-[#163d73]
          hover:shadow-xl
        "
                    >
                      <img
                        src={getImageUrl(item.image)}
                        alt={`root-cause-${i}`}
                        className="
            w-full
            rounded-[20px]
            object-contain
          "
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </Row>
          </Row>
        </Section>
      );

    case "How Does It Do It Section":
      return (
        <Section className="py-12 bg-white">
          <Row>
            <Heading title={data.title} />

            <Description Description={data.description} />

            <div
              ref={scrollRef}
              className="
              mt-5
    flex
    gap-6
    overflow-x-auto
    no-scrollbar
    pb-4
    snap-x
    snap-mandatory
  "
            >
              {items.map((item, i) => (
                <HowCard key={i} item={item} onLearnMore={setSelectedItem} />
              ))}
            </div>

            {items.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToIndex(i)}
                    className={`h-2 rounded-full ${
                      activeIndex === i ? "w-8 bg-[#005B9F]" : "w-2 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}

            {selectedItem && (
              <div className="fixed inset-0 z-[999] bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-[30px] w-full max-w-[480px] relative p-10">
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="
                absolute
                top-4
                right-4
                w-10
                h-10
                rounded-full
                bg-gray-100
              "
                  >
                    ✕
                  </button>

                  {selectedItem.image && (
                    <img
                      src={getImageUrl(selectedItem.image)}
                      alt={selectedItem.name}
                      className="w-20 h-20 mx-auto object-contain mb-6"
                    />
                  )}

                  <h2 className="text-center text-[48px] font-bold mb-4">
                    {selectedItem.name}
                  </h2>

                  <p className="text-center text-[#6b7280] text-[22px] leading-[1.7]">
                    {selectedItem.description}
                  </p>
                </div>
              </div>
            )}
          </Row>
        </Section>
      );

    case "Benefits Section":
      return (
        <Section className="py-16 bg-[#f8f9fa]">
          <Row>
            <Heading title={data.title} />

            <Description Description={data.description} />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  {item.image && (
                    <div className="mb-4">
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                  )}

                  {item.name && (
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">
                      {item.name}
                    </h3>
                  )}

                  {item.description && (
                    <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Row>
        </Section>
      );

    case "Treatment Kit Section":
      return (
        <Section>
          <Row>
            <Heading title={data.title} />

            <Description Description={data.description} />
            <div
              className="
    grid
    grid-cols-1
    md:grid-cols-2
    lg:grid-cols-4
    gap-8
    mt-5
    auto-rows-fr
  "
            >
              {items.map((item, i) => (
                <div
                  key={i}
                  className="
    h-full
    flex
    flex-col
    p-4
    rounded-3xl
    bg-gray-50
    shadow-sm
  "
                >
                  {item.image && (
                    <div className="rounded-full p-2 w-fit overflow-hidden bg-white border border-gray-100 mb-4 hover:shadow-lg transition-all duration-500">
                      <img
                        src={
                          item.image.startsWith("http")
                            ? item.image
                            : `${getImageUrl(item.image)}`
                        }
                        alt={item.name}
                        className="w-16 h-16 object-contain "
                      />
                    </div>
                  )}
                  {item.name && (
                    <h3 className="text-[16px] font-bold text-gray-900 mb-1 tracking-tighter">
                      {item.name}
                    </h3>
                  )}

                  {item.description && (
                    <p className="text-[12px] text-gray-800">
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Row>
        </Section>
      );

    case "Treatment Journey Section":
      return (
        <Section className="py-20 bg-white">
          <Row>
            {data.image && (
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full flex items-center justify-center text-white shadow-lg">
                  <img
                    src={
                      data.image.startsWith("http")
                        ? data.image
                        : getImageUrl(data.image)
                    }
                    alt={data.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <Heading title={data.title} />
            <Description Description={data.description} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 auto-rows-fr">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="
        h-full
        bg-[#eef3f7]
        rounded-[32px]
        p-8
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
                >
                  {item.image && (
                    <div
                      className="overflow-hidden border border-gray-100 mb-4"
                      style={{
                        width: "calc(var(--spacing) * 10)",
                        height: "calc(var(--spacing) * 10)",
                      }}
                    >
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className=" object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-[24px] font-bold text-[#1b2230] mb-4 leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-[#667085] leading-8 text-[16px]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </Row>
        </Section>
      );

    case "Ingredients Section":
      return (
        <Section className="py-16 bg-white">
          <Row>
            <Heading title={data.title} />

            <Description Description={data.description} />

            <Swiper
              modules={[Pagination, Autoplay]}
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={items.length > 3}
              spaceBetween={24}
              breakpoints={{
                0: {
                  slidesPerView: 1,
                },
                640: {
                  slidesPerView: 2,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="ingredientsSwiper !pb-14 !pt-5 !mt-5"
            >
              {items.map((item, i) => {
                const borderColors = [
                  "#f97316",
                  "#6366f1",
                  "#22c55e",
                  "#eab308",
                  "#a855f7",
                  "#0ea5e9",
                ];

                return (
                  <SwiperSlide key={i} className="flex h-auto ">
                    <div
                      key={i}
                      className="
      group
      relative
      flex
      flex-col
      h-full
      min-h-[320px]
      w-full
      p-5
      bg-gray-50
      rounded-3xl
      border
      border-gray-100
      shadow-sm
      overflow-hidden
      hover:scale-105 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out
    "
                    >
                      {item.image && (
                        <div
                          className="rounded-xl mb-1 transition-colors duration-300"
                          style={{
                            width: "calc(var(--spacing) * 8)",
                            height: "calc(var(--spacing) * 8)",
                          }}
                        >
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="object-cover"
                          />
                        </div>
                      )}

                      {item.name && (
                        <p className="text-[20px] font-bold text-gray-900 mb-2">
                          {item.name}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[14px] text-gray-500 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div
                        className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out rounded-full"
                        style={{ background: borderColors[i % 6] }}
                      />
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </Row>
        </Section>
      );

    case "Image Banner Section":
      return (
        <Section className="py-10">
          <Row>
            <div className="space-y-6">
              {(data?.items || []).map((item, i) => (
                <div key={i} className="">
                  <div className="w-full mx-auto rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#382454]/10 border border-gray-100">
                    {item.image && (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.title || "Banner"}
                        className="w-full h-auto object-cover"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Row>
        </Section>
      );

    case "use and Others points":
      return (
        <>
          <Section>
            <Row>
              <Heading title={data.title} />
              <Description Description={data.description} />

              <div className="max-w-3xl mx-auto border mt-5 border-gray-200 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-2">
                  <div className="bg-teal-500 text-white text-center py-3 font-semibold text-sm">
                    Us
                  </div>
                  <div className="bg-red-400 text-white text-center py-3 font-semibold text-sm">
                    Others
                  </div>
                </div>

                {items.map((item, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 border-t border-gray-100"
                  >
                    <div className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700">
                      <span className="text-teal-500 font-bold">✓</span>
                      {item.name}
                    </div>
                    <div className="flex items-center gap-2 px-5 py-3 text-sm text-gray-700 border-l border-gray-100">
                      <span className="text-red-500 text-xs font-bold">✕</span>
                      {item.description}
                    </div>
                  </div>
                ))}
              </div>
            </Row>
          </Section>
        </>
      );

    case "FAQ 1":
      return (
        <Section className="py-14 bg-white">
          <Row>
            <div className="max-w-4xl mx-auto">
              <Heading title={data.title} />
              <Description Description={data.description} />
              <div className="mt-5 border-t border-[#e7e7e7]">
                {(data?.questions || []).map((faq, i) => (
                  <FaqItem
                    key={i}
                    faq={faq}
                    isOpen={faq1OpenIndex === i}
                    onToggle={() =>
                      setFaq1OpenIndex(faq1OpenIndex === i ? null : i)
                    }
                  />
                ))}
              </div>
            </div>
          </Row>
        </Section>
      );

    case "FAQ 2":
      return (
        <Section className="py-14 bg-[#f8f9fa]">
          <Row>
            <div className="max-w-[1600px] mx-auto w-full">
              <Heading title={data.title} />

              <Description Description={data.description} />

              <div className="space-y-5 mt-5">
                {(data?.questions || []).map((faq, i) => (
                  <Faq2Item
                    key={i}
                    item={faq}
                    isOpen={faq2OpenIndex === i}
                    onToggle={() =>
                      setFaq2OpenIndex(faq2OpenIndex === i ? null : i)
                    }
                  />
                ))}
              </div>
            </div>
          </Row>
        </Section>
      );

    case "Before & After":
      return (
        <Section className="py-16 bg-[#f8f9fa]">
          <Row>
            <Heading title={data.title} />
            <Description Description={data.description} />

            <div className="flex flex-wrap justify-center gap-10 mt-5">
              {visibleItems.map((item, i) => {
                const position = sliderPosition[i] ?? 50;

                return (
                  <div
                    id={`before-after-${i}`}
                    key={i}
                    className="relative w-full max-w-[650px] aspect-[4/4.1] rounded-[28px] overflow-hidden bg-gray-100 shadow-md select-none touch-none"
                  >
                    <img
                      src={getImageUrl(item.afterImage)}
                      alt="after"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />

                    <img
                      src={getImageUrl(item.beforeImage)}
                      alt="before"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      draggable={false}
                      style={{
                        clipPath: `inset(0 ${100 - position}% 0 0)`,
                      }}
                    />

                    <div
                      className="absolute top-0 bottom-0 z-30"
                      style={{
                        left: `${position}%`,
                        transform: "translateX(-50%)",
                      }}
                    >
                      <div className="absolute top-0 left-1/2 h-full w-[3px] bg-white -translate-x-1/2 shadow-lg" />
                      <div
                        className="w-[36px]  absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[36px] rounded-full bg-white border border-gray-200 shadow-xl flex items-center justify-center cursor-ew-resize touch-none"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          setActiveSlider(i);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          setActiveSlider(i);
                        }}
                      ></div>
                    </div>

                    <div className="absolute bottom-5 left-5 z-40 bg-black/80 text-white px-4 py-2 rounded-md text-xs font-bold tracking-wider">
                      BEFORE
                    </div>

                    <div className="absolute bottom-5 right-5 z-40 bg-white/90 text-black px-4 py-2 rounded-md text-xs font-bold tracking-wider">
                      AFTER
                    </div>
                  </div>
                );
              })}
              {(data?.items || []).length > 4 &&
                visibleCount < (data?.items || []).length && (
                  <div className="w-full flex justify-center mt-10">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 2)}
                      className="
          px-8
          py-3
          rounded-full
          bg-[#005b9f]
          text-white
          font-semibold
          hover:bg-[#004a80]
          transition-all
          duration-300
        "
                    >
                      View More
                    </button>
                  </div>
                )}
            </div>
          </Row>
        </Section>
      );

    case "Why Choose Unity Hair":
      return (
        <Section className="py-16 bg-[#eef5f8]">
          <Row>
            <Heading title={data.title} />

            <Description Description={data.description} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-5 auto-rows-fr">
              {(data?.items || []).map((item, i) => (
                <div
                  key={i}
                  className="
    h-full
    flex
    flex-col
    bg-white
    rounded-[34px]
    p-7 md:p-8
    transition-all duration-300
    hover:-translate-y-2
    hover:shadow-xl
    border border-[#edf2f7]
  "
                >
                  {item?.image && (
                    <div className="mb-5">
                      <img
                        src={
                          item.image.startsWith("http")
                            ? item.image
                            : getImageUrl(item.image)
                        }
                        alt={item.title}
                        className="w-[82px] h-[82px] rounded-full object-cover"
                      />
                    </div>
                  )}

                  <h3 className="text-[22px] md:text-[28px] font-bold text-[#0f172a] mb-4 leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-[#667085] text-[15px] md:text-[17px] leading-[2]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </Row>
        </Section>
      );

    case "Product Attribute Section": {
      const displayedAttrs = showAllAttrs ? items : [];
      return (
        <Section className="py-14 bg-white">
          <Row>
            <div className="max-w-[560px] mx-auto mt-6 bg-white border border-gray-200 rounded-[20px] overflow-hidden shadow-sm">
              <div className="px-6 pt-6 pb-4 text-center border-b border-gray-100">
                <h2 className="text-[24px] font-bold text-gray-900 tracking-tight">
                  Product Details
                </h2>

                <Description Description={data.title} />
                <Description Description={data.description} />
              </div>

              <div className="divide-y divide-gray-100">
                {displayedAttrs.map((attr, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between px-6 py-3 gap-4"
                  >
                    <span className="text-[14px] text-gray-500 capitalize min-w-[120px]">
                      {attr.key}
                    </span>
                    <span className="text-[14px] font-semibold text-gray-900 text-right">
                      {attr.value}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 flex justify-center">
                <button
                  onClick={() => setShowAllAttrs((prev) => !prev)}
                  className="flex items-center gap-1 text-[14px] font-semibold text-[#005b9f]"
                >
                  {showAllAttrs ? (
                    <>
                      Show Less <ChevronUp size={16} />
                    </>
                  ) : (
                    <>
                      Show More <ChevronDown size={16} />
                    </>
                  )}
                </button>
              </div>
              {/* )} */}
            </div>
          </Row>
        </Section>
      );
    }

    case "Product Recommendation Section": {
      const recommendedProducts = [
        ...new Map(
          items
            .map((item) =>
              (products || []).find((p) => p._id === item.product_id),
            )
            .filter(Boolean)
            .map((product) => [product._id, product]),
        ).values(),
      ];

      return (
        <Section className="py-16 bg-[#f8f9fa]">
          <Row>
            <Heading title={data.title} />
            <Description Description={data.description} />

            {recommendedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                setShowLoginPopup={setShowLoginPopup}
              />
            ))}
          </Row>
        </Section>
      );
    }

    case "Solution By Stage Section": {
      return (
        <Solutionstagecard data={data} items={items} products={products} />
      );
    }

    case "Additional Information Section": {
      const info = data?.items?.[0] || {};
      return (
        <>
          <Section className="bg-[#f5f5f5] py-12 md:py-16">
            <div className="max-w-6xl mx-auto px-5">
              <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between"
              >
                <h2 className="text-4xl md:text-6xl font-black text-black">
                  {data?.title || "Additional Information"}
                </h2>

                {open ? (
                  <ChevronUp className="w-8 h-8 text-black" />
                ) : (
                  <ChevronDown className="w-8 h-8 text-black" />
                )}
              </button>
              {open && (
                <div className="grid md:grid-cols-2 gap-x-24 gap-y-10 mt-12">
                  {info.net_quantity && (
                    <div>
                      <h4 className="font-bold text-black text-xl">
                        Net Quantity
                      </h4>
                      <p className="text-gray-600 text-lg">
                        {info.net_quantity}
                      </p>
                    </div>
                  )}

                  {info.manufactured_by && (
                    <div>
                      <h4 className="font-bold text-black text-xl">
                        Manufactured By
                      </h4>
                      <p className="text-gray-600 text-lg whitespace-pre-line">
                        {info.manufactured_by}
                      </p>
                    </div>
                  )}

                  {info.marketed_by && (
                    <div>
                      <h4 className="font-bold text-black text-xl">
                        Marketed By
                      </h4>
                      <p className="text-gray-600 text-lg whitespace-pre-line">
                        {info.marketed_by}
                      </p>
                    </div>
                  )}

                  {info.country_origin && (
                    <div>
                      <h4 className="font-bold text-black text-xl">
                        Country Origin
                      </h4>
                      <p className="text-gray-600 text-lg">
                        {info.country_origin}
                      </p>
                    </div>
                  )}

                  {info.product_dimensions && (
                    <div>
                      <h4 className="font-bold text-black text-xl">
                        Product Dimensions
                      </h4>
                      <p className="text-gray-600 text-lg">
                        {info.product_dimensions}
                      </p>
                    </div>
                  )}

                  {info.best_before && (
                    <div>
                      <h4 className="font-bold text-black text-xl">
                        Best Before
                      </h4>
                      <p className="text-gray-600 text-lg">
                        {info.best_before}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Section>
        </>
      );
    }

    case "Daily Usage Section": {
      const item = data?.items?.[0] || {};

      return (
        <Section className="py-12 bg-gradient-to-r from-[#dce3eb] via-[#8fa4c2] to-[#12386f]">
          <Row>
            <div className="bg-[#f8f8f8] rounded-[30px] shadow-md p-6 md:p-12">
              <h2 className="text-center text-[#12386f] font-bold text-[28px] md:text-[50px] leading-tight">
                {data?.title}
              </h2>

              <div className="grid md:grid-cols-2 gap-10 items-center mt-10">
                <div className="flex flex-col">
                  {item?.image && (
                    <div className="w-[70px] h-[70px] rounded-full border border-[#12386f] flex items-center justify-center">
                      <img
                        src={
                          item.image.startsWith("http")
                            ? item.image
                            : getImageUrl(item.image)
                        }
                        alt={item.title}
                        className="w-10 h-10 object-contain"
                      />
                    </div>
                  )}

                  <h3 className="mt-5 text-[18px] md:text-[24px] font-semibold text-[#555]">
                    {item?.title}
                  </h3>
                </div>

                <div>
                  <p className="text-[#555] text-[16px] md:text-[22px] leading-[1.8]">
                    {item?.description}
                  </p>
                </div>
              </div>
            </div>
          </Row>
        </Section>
      );
    }

    default:
      return null;
  }
}
