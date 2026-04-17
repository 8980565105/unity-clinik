import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import faqBg from "../assets/size-bg.png";
import { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFaqs, getFaqBanner } from "../features/faqs/faqsThunk";
import { Plus } from "lucide-react";

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg mb-2 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
           ${open ? "bg-theme" : "bg-white hover:bg-theme"}`}
      >
        <span className="text-sm font-medium text-gray-800">{question}</span>
        <span
          className={`text-xl text-gray-400 transition-transform duration-200 flex-shrink-0 ml-4 ${open ? "rotate-45" : ""}`}
        >
          <Plus className="w-4 h-4" />
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const dispatch = useDispatch();
  const { faqs, loading, banner } = useSelector((state) => state.faqs);

  const [activeCat, setActiveCat] = useState("all");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchFaqs());
    dispatch(getFaqBanner());
  }, [dispatch]);

  const categories = useMemo(() => {
    const catSet = new Set(faqs.map((f) => f.category).filter(Boolean));
    const dynamic = Array.from(catSet).map((cat) => ({
      key: cat.toLowerCase(),
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
    }));
    return [{ key: "all", label: "All topics" }, ...dynamic];
  }, [faqs]);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    const valid = categories.find((c) => c.key === hash);
    setActiveCat(valid ? hash : "all");
  }, [location.hash, categories]);

  const handleCategorySelect = (key) => {
    navigate(key === "all" ? "/faqs" : `/faqs#${key}`);
  };

  const filtered = useMemo(() => {
    return activeCat === "all"
      ? faqs
      : faqs.filter((f) => f.category?.toLowerCase() === activeCat);
  }, [activeCat, faqs]);

  const activeLabel =
    categories.find((c) => c.key === activeCat)?.label || "All topics";

  const heroBg = banner?.image && banner.image !== "" ? banner.image : faqBg;

  const heroTitle =
    banner?.title && banner.title.trim() !== ""
      ? banner.title
      : "Frequently asked questions";

  const heroDesc =
    banner?.description && banner.description.trim() !== ""
      ? banner.description
      : "Find answers to common questions about orders, payments, returns and more";

  useEffect(() => {
    dispatch(fetchFaqs());
    dispatch(getFaqBanner());

    console.log("BANNER:", banner);
  }, [dispatch]);

  return (
    <>
      <Section
        className="bg-cover bg-center bg-no-repeat min-h-[300px] min-[500px]:min-h-[400px] flex items-center justify-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="text-center max-w-[688px] px-4">
          <h1 className="text-[24px] sm:text-[40px] font-semibold mb-[15px] sm:mb-[22px]">
            {heroTitle}
          </h1>

          <p className="text-dark text-[14px] sm:text-[24px]">{heroDesc}</p>
        </div>
      </Section>

      <Section>
        <Row>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-52 flex-shrink-0">
              <div className="hidden md:block">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Categories
                </p>
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => handleCategorySelect(cat.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-0.5 transition-colors ${
                      activeCat === cat.key
                        ? // ? "bg-[rgba(239,58,150,0.09)] text-theme font-medium"
                          "bg-theme text-[var(--theme-color)] font-medium"
                        : "text-black hover:bg-gray-100 hover:text-[var(--theme-color)]"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              <div className="flex md:hidden flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => handleCategorySelect(cat.key)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                      activeCat === cat.key
                        ? "bg-pink-50 text-pink-700 border-pink-200 font-medium"
                        : "text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <p className="text-base font-medium text-gray-800 mb-4">
                {activeLabel}
              </p>

              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-100 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">No results found.</p>
              ) : (
                filtered.map((f) => (
                  <FAQItem
                    key={f._id}
                    question={f.question}
                    answer={f.answer}
                  />
                ))
              )}
            </div>
          </div>
        </Row>
      </Section>
    </>
  );
}
