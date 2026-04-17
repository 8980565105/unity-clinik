import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/helper";
import NavBtn from "../ui/Navbtn";
import shoppingImg from "../../assets/shopping.png";
import kurtiImg from "../../assets/Kurti.png";
import JeansImg from "../../assets/Jeans.png";
import jewelleryImg from "../../assets/jewellery.png";
import cropImg from "../../assets/Crop Tops.png";
import Section from "../ui/Section";
import Row from "../ui/Row";
import Heading from "../ui/Heading";

const STATIC_CATEGORIES = [
  { _id: "s1", name: "Saree", image_url: shoppingImg, isStatic: true },
  { _id: "s2", name: "Kurti", image_url: kurtiImg, isStatic: true },
  { _id: "s3", name: "Jeans", image_url: JeansImg, isStatic: true },
  { _id: "s4", name: "Jewellery", image_url: jewelleryImg, isStatic: true },
  { _id: "s5", name: "Crop Tops", image_url: cropImg, isStatic: true },
  { _id: "s6", name: "Jewellery", image_url: jewelleryImg, isStatic: true },
  { _id: "s7", name: "Saree", image_url: shoppingImg, isStatic: true },
  { _id: "s8", name: "Kurti", image_url: kurtiImg, isStatic: true },
];
const CategoriesSection = () => {
  const navigate = useNavigate();
  const { items: categories, loading } = useSelector((s) => s.subcategories);
  const displayCategories =
    !loading && categories?.length > 0 ? categories : STATIC_CATEGORIES;
  const filtered = displayCategories.filter((c) => c.parent_id !== null);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);
  const CARD_W = 174;
  const getVisibleCount = () => {
    if (!containerRef.current) return 6;
    return Math.floor(containerRef.current.offsetWidth / CARD_W);
  };
  const maxOffset = Math.max(0, filtered.length - getVisibleCount());
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));
  return (
    <Section>
      <Row>
        <Heading title={"Shop by Categories"} />

        <div className="relative flex items-center" ref={containerRef}>
          {offset > 0 && (
            <NavBtn direction="left" onClick={prev} variant="primary" />
          )}

          <div className="overflow-hidden w-full">
            <div
              className="flex gap-3 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] justify-center"
              style={{ transform: `translateX(-${offset * CARD_W}px)` }}
            >
              {filtered.map((cat, i) => (
                <div
                  key={cat._id || i}
                  className="flex-shrink-0 w-[150px] px-2 cursor-pointer"
                  onClick={() => navigate(`/shop?category=${cat.name}`)}
                >
                  <div className="group border border-gray-100 rounded-xl overflow-hidden hover:border-gray-300 transition-all duration-200">
                    <div className="relative w-full aspect-square bg-gray-50 flex items-center justify-center overflow-hidden">
                      <img
                        src={
                          cat.isStatic
                            ? cat.image_url
                            : getImageUrl(cat.image_url)
                        }
                        alt={cat.name}
                        className="w-[90%] h-[90%] object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                      />

                      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>

                    <div className="px-2 py-3 text-center text-[13px] text-gray-800 min-h-[44px] flex items-center justify-center">
                      {cat.name}
                    </div>
                  </div>
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
  );
};

export default CategoriesSection;
