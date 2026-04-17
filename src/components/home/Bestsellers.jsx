import React, { useRef, useState } from "react";
import Row from "../ui/Row.jsx";
import { useSelector } from "react-redux";
import Section from "../ui/Section.jsx";
import ProductCard from "../productcard/ProductCard.jsx";
import NavBtn from "../ui/Navbtn";
import Heading from "../ui/Heading.jsx";

const Bestsellers = ({ setShowLoginPopup }) => {
  const { products = [] } = useSelector((state) => state.products);

  const sellersProducts = products.filter(
    (product) =>
      product.status === "active" &&
      product.variants?.some((variant) => variant.is_best_seller),
  );

  const bestSellersLimited = sellersProducts;

  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);
  const CARD_W = 290;

  const getVisibleCount = () => {
    if (!containerRef.current) return 4;
    return Math.floor(containerRef.current.offsetWidth / CARD_W);
  };

  const maxOffset = Math.max(0, bestSellersLimited.length - getVisibleCount());

  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));
  const visibleCount = getVisibleCount();
  const isCenter = bestSellersLimited.length <= visibleCount;

  return (
    <Section>
      <Row>
        <Heading title={"Our Best Seller’s"} />
        <div className="relative px-2" ref={containerRef}>
          {offset > 0 && (
            <NavBtn direction="left" onClick={prev} variant="primary" />
          )}
          <div className="overflow-hidden">
            <div
              className={`flex gap-3 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCenter ? "justify-center" : "justify-start"
              }`}
              style={{
                transform: isCenter
                  ? "none"
                  : `translateX(-${offset * CARD_W}px)`,
              }}
            >
              {bestSellersLimited.map((product) => (
                <div key={product._id} className="flex-shrink-0 w-[270px]">
                  <ProductCard
                    product={product}
                    setShowLoginPopup={setShowLoginPopup}
                  />
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

export default Bestsellers;
