import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getImageUrl } from "../components/utils/helper";
import shoppingImg from "../assets/shopping.png";
import kurtiImg from "../assets/Kurti.png";
import JeansImg from "../assets/Jeans.png";
import jewelleryImg from "../assets/jewellery.png";
import cropImg from "../assets/Crop Tops.png";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import NavBtn from "../components/ui/Navbtn";
import Heading from "../components/ui/Heading";
import SEO from "../components/seo/seo";
import { fetchPageBySlug } from "../features/pages/pagesThunk";

const STATIC_CATEGORIES = [
  { _id: "1", name: "Saree", image_url: shoppingImg, parent_id: null },
  { _id: "2", name: "Kurti", image_url: kurtiImg, parent_id: null },
  { _id: "3", name: "Jeans", image_url: JeansImg, parent_id: null },
  { _id: "4", name: "Jewellery", image_url: jewelleryImg, parent_id: null },
  { _id: "5", name: "Crop Tops", image_url: cropImg, parent_id: null },
];
const CARD_W = 170;
const GAP = 16;
const STEP = CARD_W + GAP;
export default function Collections({ products = [] }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const { items: categories = [] } = useSelector((state) => state.categories);
  const { items: subcategories = [] } = useSelector(
    (state) => state.subcategories,
  );
  const { pages } = useSelector((state) => state.pages);
  const collectionPage = pages?.find((page) => page.slug === "collection");
  const params = new URLSearchParams(location.search);
  const categoryIdFromUrl = params.get("categoryId");
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    dispatch(fetchPageBySlug("collection"));
  }, [dispatch]);

  useEffect(() => {
    if (!categories.length) return;
    if (categoryIdFromUrl) {
      const found = categories.find(
        (c) => String(c._id) === String(categoryIdFromUrl),
      );
      setSelectedCategory(found || null);
    } else {
      setSelectedCategory(null);
    }
  }, [categoryIdFromUrl, categories]);

  const isParentCategory = (cat) => {
    if (!cat.parent_id) return true;
    if (cat.parent_id === "null") return true;
    if (typeof cat.parent_id === "object") return false;
    return false;
  };

  const parentCategories =
    categories.length > 0
      ? categories.filter(isParentCategory)
      : STATIC_CATEGORIES;

  const getParentId = (sub) => {
    if (!sub.parent_id) return null;
    if (typeof sub.parent_id === "object") return String(sub.parent_id._id);
    return String(sub.parent_id);
  };

  const displaySubcategories = selectedCategory
    ? subcategories.filter(
        (sub) => getParentId(sub) === String(selectedCategory._id),
      )
    : subcategories;

  const [visibleSubCount, setVisibleSubCount] = useState(20);
  const visibleSubcategories = displaySubcategories.slice(0, visibleSubCount);
  const getLoadMoreCount = () => (window.innerWidth >= 768 ? 5 : 6);

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    setVisibleSubCount(20);
    navigate(`/collections?categoryId=${cat._id}`);
  };

  const total = parentCategories.length;
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const isAnimating = useRef(false);
  const initializedRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(total);
  const [visibleCount, setVisibleCount] = useState(null);
  useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      setVisibleCount(Math.floor(containerRef.current.offsetWidth / STEP));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);
  const isCenter = visibleCount !== null && total <= visibleCount;
  const isReady = visibleCount !== null;
  useEffect(() => {
    if (!trackRef.current || total === 0 || initializedRef.current || !isReady)
      return;
    initializedRef.current = true;
    if (!isCenter) {
      trackRef.current.style.transition = "none";
      trackRef.current.style.transform = `translateX(-${total * STEP}px)`;
      setCurrentIndex(total);
    }
  }, [total, isReady, isCenter]);

  const tripled =
    total > 0
      ? [...parentCategories, ...parentCategories, ...parentCategories]
      : [];

  const slideTo = (newIndex, withAnimation = true) => {
    if (!trackRef.current) return;
    trackRef.current.style.transition = withAnimation
      ? `transform 300ms cubic-bezier(0.4,0,0.2,1)`
      : "none";
    trackRef.current.style.transform = `translateX(-${newIndex * STEP}px)`;
  };

  const handleNext = () => {
    if (isAnimating.current || total === 0 || isCenter) return;
    isAnimating.current = true;
    const next = currentIndex + 1;
    setCurrentIndex(next);
    slideTo(next, true);
    setTimeout(() => {
      if (next >= total * 2) {
        const resetTo = next - total;
        setCurrentIndex(resetTo);
        slideTo(resetTo, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  const handlePrev = () => {
    if (isAnimating.current || total === 0 || isCenter) return;
    isAnimating.current = true;
    const prev = currentIndex - 1;
    setCurrentIndex(prev);
    slideTo(prev, true);
    setTimeout(() => {
      if (prev < total) {
        const resetTo = prev + total;
        setCurrentIndex(resetTo);
        slideTo(resetTo, false);
      }
      isAnimating.current = false;
    }, 310);
  };

  return (
    <>
      <SEO
        title={collectionPage?.meta_title || "collection"}
        description={
          collectionPage?.meta_description || "collection page description"
        }
      />

      <Section>
        <Row>
          <Heading title={"All Categories"} />

          {isReady && !isCenter && (
            <div className="flex items-center justify-end gap-3 mb-4">
              <NavBtn direction="left" onClick={handlePrev} variant="primary" />
              <NavBtn
                direction="right"
                onClick={handleNext}
                variant="primary"
              />
            </div>
          )}

          <div className="overflow-hidden" ref={containerRef}>
            {isReady && (
              <div
                ref={trackRef}
                className={`flex ${isCenter ? "justify-center" : "justify-start"}`}
                style={{
                  gap: `${GAP}px`,
                  willChange: "transform",
                }}
              >
                {(isCenter ? parentCategories : tripled).map((cat, i) => {
                  const isActive = selectedCategory
                    ? String(cat._id) === String(selectedCategory._id)
                    : false;
                  return (
                    <div
                      key={`${cat._id}-${i}`}
                      onClick={() => handleCategoryClick(cat)}
                      className="flex-shrink-0 text-center cursor-pointer"
                    >
                      <div
                        className={`rounded-xl p-4 flex items-center justify-center h-[150px] w-[150px] border transition-all duration-200
                          ${
                            isActive
                              ? "border-primary border-2 bg-[var(primary-color)] shadow-md"
                              : "border-gray-200 hover:shadow-lg hover:border-gray-300"
                          }`}
                      >
                        <img
                          src={getImageUrl(cat.image_url)}
                          alt={cat.name}
                          className="h-[80px] object-contain"
                        />
                      </div>
                      <p
                        className={`mt-3 text-sm font-medium transition-colors duration-200 ${isActive ? "text-primary" : "text-gray-800"}`}
                      >
                        {cat.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Row>
      </Section>

      <Section>
        <Row>
          <Heading title={"All Subcategories"} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {visibleSubcategories.map((sub) => (
              <div
                key={sub._id}
                className="text-center cursor-pointer"
                onClick={() => navigate(`/shop?category=${sub.name}`)}
              >
                <div className="w-[140px] h-[140px] mx-auto rounded-full overflow-hidden border-4 border-gray-300">
                  <img
                    src={getImageUrl(sub.image_url)}
                    alt={sub.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="mt-3 font-medium">{sub.name}</p>
              </div>
            ))}
          </div>

          {visibleSubCount < displaySubcategories.length && (
            <div className="text-center mt-10">
              <button
                onClick={() =>
                  setVisibleSubCount((p) => p + getLoadMoreCount())
                }
                className="px-6 py-2 border rounded-lg"
              >
                Load More
              </button>
            </div>
          )}
        </Row>
      </Section>
    </>
  );
}
