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

const STATIC_CATEGORIES = [
  { _id: "1", name: "Saree", image_url: shoppingImg, parent_id: null },
  { _id: "2", name: "Kurti", image_url: kurtiImg, parent_id: null },
  { _id: "3", name: "Jeans", image_url: JeansImg, parent_id: null },
  { _id: "4", name: "Jewellery", image_url: jewelleryImg, parent_id: null },
  { _id: "5", name: "Crop Tops", image_url: cropImg, parent_id: null },
];
export default function Collections({ products = [] }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const { items: categories = [] } = useSelector((state) => state.categories);
  const { items: subcategories = [] } = useSelector(
    (state) => state.subcategories,
  );
  const [selectedCategory, setSelectedCategory] = useState(null);
  const params = new URLSearchParams(location.search);
  const categoryIdFromUrl = params.get("categoryId");
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
  const CARD_W = 170;
  const items = parentCategories;
  const getVisibleCount = () => {
    if (!containerRef.current) return 5;
    return Math.floor(containerRef.current.offsetWidth / CARD_W);
  };
  const maxOffset = Math.max(0, items.length - getVisibleCount());
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));
  return (
    <>
      <Section>
        <Row>
          <Heading title={"All Categories"} />

          <div className="relative" ref={containerRef}>
            {offset > 0 && (
              <NavBtn direction="left" onClick={prev} variant="primary" />
            )}

            <div className="overflow-hidden">
              <div
                className="flex gap-4 justify-center transition-transform duration-300"
                style={{ transform: `translateX(-${offset * CARD_W}px)` }}
              >
                {items.map((cat) => (
                  <div
                    key={cat._id}
                    onClick={() => handleCategoryClick(cat)}
                    className="flex-shrink-0 text-center cursor-pointer"
                  >
                    <div className="rounded-xl p-4 flex items-center justify-center h-[150px] w-[150px] border hover:shadow-lg transition-all">
                      <img
                        src={getImageUrl(cat.image_url)}
                        alt={cat.name}
                        className="h-[80px] object-contain"
                      />
                    </div>

                    <p className="mt-3 text-sm font-medium">{cat.name}</p>
                  </div>
                ))}
              </div>
            </div>

            {offset < maxOffset && (
              <NavBtn direction="right" onClick={next} variant="primary" />
            )}
          </div>
        </Row>
      </Section>
      <Section>
        <Row>
          {/* <div className="relative flex justify-start items-center w-full mb-[50px] md:mb-[90px]">
            <h2 className="font-h2 text-black whitespace-nowrap mx-5">
              All Subcategories
            </h2>

            <div className="w-[18px] md:w-[50px] border-t border-black"></div>
          </div> */}
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
