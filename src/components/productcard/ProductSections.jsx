import Section from "../ui/Section";
import Row from "../ui/Row";
import { getImageUrl } from "../utils/helper";
import Heading from "../ui/Heading";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Plus, Minus, ChevronUp, ChevronDown } from "lucide-react";

function FaqItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[#e7e7e7]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left py-8 group"
      >
        <h3 className="text-[18px] md:text-[22px] font-bold text-[#081b4b] pr-4 transition">
          {faq.question}
        </h3>

        <div className="flex-shrink-0 text-[#707070]">
          {open ? <Minus size={24} /> : <Plus size={24} />}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-[500px] pb-8" : "max-h-0"
        }`}
      >
        <div className="flex gap-6 items-start">
          <p className="text-[#5f6c86] text-[18px] leading-8">{faq.answer}</p>
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
        <div className="px-5 md:px-8 pb-6 md:pb-8 text-[#5f6c86] text-[15px] md:text-[18px] leading-[1.9] border-t border-[#edf0f4]">
          <div className="pt-5">{item.answer || item.description}</div>
        </div>
      </div>
    </div>
  );
};

function HowCard({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className="how-card relative flex-shrink-0 rounded-[2rem] p-5 flex flex-col justify-between overflow-hidden snap-start"
        style={{
          background: "var(--primary-color, #1a5fb4)",
          width: "clamp(260px, 75vw, 460px)",
          minHeight: "180px",
        }}
      >
        <div className="absolute -top-[30px] -left-[30px] w-[160px] h-[160px] rounded-full bg-white/10" />
        <div className="absolute top-[10px] left-[10px] w-[100px] h-[100px] rounded-full bg-white/5" />

        {item.image && (
          <img
            src={
              item.image.startsWith("http")
                ? item.image
                : getImageUrl(item.image)
            }
            alt={item.name}
            className="absolute -top-4 -right-1 w-20 h-20 object-contain"
          />
        )}

        <div className="relative z-10 flex flex-col flex-1 pr-16">
          <h3 className="text-base font-extrabold text-white mb-2">
            {item.name}
          </h3>

          <p className="text-xs text-blue-100 mb-4 font-medium">
            {item.description}
          </p>

          <div className="mt-auto">
            <button
              onClick={() => setOpen(true)}
              className="bg-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition shadow-sm"
              style={{ color: "var(--primary-color, #1a5fb4)" }}
            >
              Learn More
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl w-[90%] max-w-md p-6 text-center relative shadow-xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-0 right-0 text-white hover:text-black hover:bg-primary text-lg bg-primary p-2 rounded-tr-2xl rounded"
            >
              ✕
            </button>

            {item.image && (
              <img
                src={
                  item.image.startsWith("http")
                    ? item.image
                    : getImageUrl(item.image)
                }
                alt={item.name}
                className="w-12 h-12 mx-auto mb-3 object-contain"
              />
            )}

            <h2 className="text-xl font-bold mb-2">{item.name}</h2>

            <p className="text-gray-500 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default function ProductSections({ sections }) {
  const activeSections = (sections || []).filter(
    (sec) => sec?.data?.status === true || sec?.data?.status === undefined,
  );
  return (
    <>
      {activeSections.map((section, idx) => (
        <SectionRenderer key={idx} section={section} />
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
        <Section className="py-16 bg-[#f8f9fa]">
          <Row>
            <Heading title={data.title} />
            {data.description && (
              <p className="flex justify-center items-center text-gray-400 text-sm mb-10">
                {data.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, i) => {
                const stepColors = [
                  "#6366f1",
                  "#0ea5e9",
                  "#10b981",
                  "#f59e0b",
                  "#ec4899",
                  "#f97316",
                ];
                const color = stepColors[i % stepColors.length];
                return (
                  <div
                    key={i}
                    className="group relative bg-white rounded-[20px] overflow-hidden
                           border border-gray-100
                           opacity-0 translate-y-6 animate-fadeInUp
                           hover:-translate-y-2 hover:shadow-2xl transition-all duration-300"
                    style={{
                      animationDelay: `${i * 120}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <div
                      className="relative w-full overflow-hidden"
                      style={{ aspectRatio: "4/3.5", background: "#f1f5f9" }}
                    >
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            width="52"
                            height="52"
                            viewBox="0 0 52 52"
                            fill="none"
                          >
                            <circle
                              cx="26"
                              cy="26"
                              r="24"
                              stroke={color}
                              strokeWidth="1.5"
                              strokeDasharray="4 3"
                            />
                            <circle
                              cx="26"
                              cy="26"
                              r="14"
                              fill={color}
                              fillOpacity="0.12"
                            />
                            <path
                              d="M20 26l4 4 8-8"
                              stroke={color}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}

                      {item.step && (
                        <div
                          className="absolute bottom-3 left-3 text-white text-xs font-medium px-4 py-1.5 rounded-lg"
                          style={{ background: color }}
                        >
                          Step {item.step}
                        </div>
                      )}
                    </div>

                    <div className="relative px-5 pt-6 pb-5">
                      <div
                        className="absolute -top-[18px] right-4 w-9 h-9 rounded-full flex items-center justify-center
                               text-white text-[13px] font-semibold shadow-md
                               transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12"
                        style={{ background: color }}
                      >
                        {i + 1}
                      </div>

                      {item.name && (
                        <p className="font-semibold text-sm text-gray-900 mb-2 pr-6 leading-snug">
                          {item.name}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {item.description}
                        </p>
                      )}

                      <div
                        className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full
                               transition-all duration-500 ease-out"
                        style={{ background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Row>
        </Section>
      );

    case "How Does It Do It Section":
      return (
        <Section className="py-12 bg-white">
          <Row>
            <Heading title={data.title} />

            {data.description && (
              <p className="flex justify-center items-center text-gray-400 text-sm mb-10">
                {data.description}
              </p>
            )}

            <div className="relative overflow-hidden">
              <div
                ref={scrollRef}
                onScroll={handleScroll}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
              >
                {items.map((item, i) => (
                  <HowCard key={i} item={item} />
                ))}
              </div>
            </div>

            {items.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => scrollToIndex(i)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeIndex === i
                        ? "w-8 bg-[var(--primary-color,#1a5fb4)]"
                        : "w-2.5 bg-gray-300"
                    }`}
                  />
                ))}
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

            {data.description && (
              <p className="flex justify-center items-center text-gray-400 text-sm mb-10">
                {data.description}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {data.description && (
              <p className="flex justify-center items-center text-gray-400 text-sm mb-10">
                {data.description}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-8">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[70px] p-6 w-[280px] text-center shadow-sm hover:shadow-lg transition duration-300 bg-[#f0f8ff]"
                >
                  {item.image && (
                    <div className="flex items-center justify-center">
                      <img
                        src={
                          item.image.startsWith("http")
                            ? item.image
                            : `${getImageUrl(item.image)}`
                        }
                        alt={item.name}
                        className="object-contain"
                      />
                    </div>
                  )}
                  {item.name && (
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">
                      {item.name}
                    </h3>
                  )}

                  {item.description && (
                    <p className="text-xs text-gray-500 leading-relaxed">
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
        <Section className="py-16 bg-[#f8f9fa]">
          <Row>
            <Heading title={data.title} />
            {data.description && (
              <p className="text-center text-gray-400 text-sm mb-10">
                {data.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch mt-6">
              {items.map((item, i) => {
                const colors = [
                  { color: "#6366f1", bg: "#eef2ff", text: "#4338ca" },
                  { color: "#0ea5e9", bg: "#f0f9ff", text: "#0369a1" },
                  { color: "#10b981", bg: "#f0fdf4", text: "#065f46" },
                  { color: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
                  { color: "#ec4899", bg: "#fdf2f8", text: "#9d174d" },
                ];
                const c = colors[i % colors.length];

                return (
                  <>
                    <div
                      key={i}
                      className="group relative col-span-1 lg:col-span-1 flex flex-col items-center text-center
                             bg-white rounded-[20px] border border-gray-100 p-5 overflow-hidden
                             cursor-pointer transition-all duration-300
                             hover:-translate-y-1.5 hover:scale-[1.04] hover:shadow-xl"
                      style={{ "--card-color": c.color }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[20px]
                               scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-400"
                        style={{ background: c.color }}
                      />

                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center
                               text-[13px] font-semibold mb-3 transition-transform duration-300
                               group-hover:scale-110 group-hover:-rotate-6"
                        style={{ background: c.bg, color: c.text }}
                      >
                        {i + 1}
                      </div>

                      <div
                        className="w-14 h-14 rounded-[14px] flex items-center justify-center mb-3
                               transition-transform duration-300 group-hover:scale-110"
                        style={{ background: c.bg }}
                      >
                        {item.image ? (
                          <img
                            src={
                              item.image.startsWith("http")
                                ? item.image
                                : getImageUrl(item.image)
                            }
                            alt={item.name}
                            className="w-8 h-8 object-contain"
                          />
                        ) : (
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke={c.color}
                              strokeWidth="1.5"
                            />
                            <path
                              d="M9 12l2 2 4-4"
                              stroke={c.color}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>

                      {item.name && (
                        <p className="text-sm font-semibold text-gray-900 mb-1">
                          {item.name}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-4">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </>
                );
              })}
            </div>
          </Row>
        </Section>
      );

    case "Ingredients Section":
      return (
        <Section className="py-16 bg-white">
          <Row>
            <Heading title={data.title} />
            {data.description && (
              <p className="flex justify-center items-center text-gray-400 text-sm mb-10">
                {data.description}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {items.map((item, i) => {
                const bgColors = [
                  "#fff0ee",
                  "#eef2ff",
                  "#f0fdf4",
                  "#fefce8",
                  "#fdf4ff",
                  "#f0f9ff",
                ];
                const borderColors = [
                  "#f97316",
                  "#6366f1",
                  "#22c55e",
                  "#eab308",
                  "#a855f7",
                  "#0ea5e9",
                ];

                return (
                  <div
                    key={i}
                    className="ingredient-card group relative flex flex-col gap-3 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:-translate-y-1"
                  >
                    {item.image && (
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-1 transition-colors duration-300"
                        style={{ background: bgColors[i % 6] }}
                      >
                        <img
                          src={
                            item.image.startsWith("http")
                              ? item.image
                              : getImageUrl(item.image)
                          }
                          alt={item.name}
                          className="w-9 h-9 object-contain"
                        />
                      </div>
                    )}

                    {item.name && (
                      <p className="font-bold text-sm text-gray-800 leading-snug">
                        {item.name}
                      </p>
                    )}
                    {item.description && (
                      <p className="text-xs text-gray-400 leading-relaxed line-clamp-4">
                        {item.description}
                      </p>
                    )}

                    <div
                      className="absolute bottom-0 left-0 h-[3px] w-0 group-hover:w-full transition-all duration-500 ease-out rounded-full"
                      style={{ background: borderColors[i % 6] }}
                    />
                  </div>
                );
              })}
            </div>
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
                        src={
                          item.image.startsWith("http")
                            ? item.image
                            : getImageUrl(item.image)
                        }
                        alt={item.title || "Banner"}
                        className="w-full h-auto object-cover"
                      />
                    )}
                  </div>
                  {/* </div> */}
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

              {data.description && (
                <p className="flex justify-center items-center text-gray-400 text-sm mb-10">
                  {data.description}
                </p>
              )}

              <div className="max-w-3xl mx-auto border border-gray-200 rounded-2xl overflow-hidden">
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
                      <span className="text-red-400 font-bold">⊗</span>
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
              {data?.title && (
                <h2 className="text-center text-[34px] font-extrabold uppercase text-[#0c1c4c] tracking-tight">
                  {data.title}
                </h2>
              )}

              {data?.description && (
                <p className="text-center text-[#5f6c86] mt-5 text-[20px] leading-8 max-w-3xl mx-auto">
                  {data.description}
                </p>
              )}

              <div className="mt-12 border-t border-[#e7e7e7]">
                {(data?.questions || []).map((faq, i) => (
                  <FaqItem key={i} faq={faq} />
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
              {data?.title && (
                <div className="text-center mb-8 md:mb-10">
                  <h2 className="text-[28px] md:text-[42px] font-extrabold text-[#0b1c48]">
                    {data.title}
                  </h2>

                  <div className="w-[80px] md:w-[95px] h-[5px] bg-[#005b9f] rounded-full mx-auto mt-3" />
                </div>
              )}

              {data?.description && (
                <p className="text-center text-[#5f6c86] text-[15px] md:text-[18px] mb-8 md:mb-10 max-w-3xl mx-auto">
                  {data.description}
                </p>
              )}

              <div className="space-y-5">
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
            {/* heading */}
            <div className="text-center mb-10">
              <h2 className="text-[28px] md:text-[42px] font-extrabold text-[#0b1c48]">
                {data?.title}
              </h2>

              <div className="w-[90px] h-[5px] bg-[#005b9f] rounded-full mx-auto mt-3" />

              {data?.description && (
                <p className="text-[#5f6c86] mt-4 text-[15px] md:text-[18px]">
                  {data.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap justify-center gap-10">
              {(data?.items || []).map((item, i) => {
                const position = sliderPosition[i] ?? 50;

                return (
                  <div
                    key={i}
                    className="relative w-full max-w-[650px] aspect-[4/4.1] rounded-[28px] overflow-hidden bg-gray-100 shadow-md select-none touch-none"
                    onMouseDown={(e) => handleSliderMove(e, i)}
                    onMouseMove={(e) => {
                      if (e.buttons === 1) {
                        handleSliderMove(e, i);
                      }
                    }}
                    onTouchStart={(e) => handleSliderMove(e, i)}
                    onTouchMove={(e) => handleSliderMove(e, i)}
                  >
                    {/* AFTER IMAGE FIXED */}
                    <img
                      src={getImageUrl(item.afterImage)}
                      alt="after"
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      draggable={false}
                    />

                    {/* BEFORE IMAGE FIXED + HIDE */}
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

                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <div className="w-[30px] h-[30px] rounded-full bg-white border border-gray-200 shadow-xl flex items-center justify-center cursor-ew-resize">
                          <div className="flex gap-[3px]"></div>
                        </div>
                      </div>
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
            </div>
          </Row>
        </Section>
      );

    case "Why Choose Unity Hair":
      return (
        <Section className="py-16 bg-[#eef5f8]">
          <Row>
            <div className="text-center mb-10">
              <h2 className="text-[28px] md:text-[42px] font-extrabold text-[#0f172a] capitalize">
                {data?.title}
              </h2>

              {data?.description && (
                <p className="text-[#64748b] text-sm md:text-base mt-2">
                  {data.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
              {(data?.items || []).map((item, i) => (
                <div
                  key={i}
                  className="
              bg-white rounded-[34px]
              p-7 md:p-8
              min-h-[360px]
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

    default:
      return null;
  }
}
