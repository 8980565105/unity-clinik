import React, { useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import Row from "../ui/Row";
import Section from "../ui/Section";
import NavBtn from "../ui/Navbtn";

export default function SimilarProducts({
  product,
  products = [],
  setShowLoginPopup,
}) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState(0);
  const CARD_W = 300;
  const similarProducts = useMemo(() => {
    if (!product || !product.category_id) return [];
    const categoryId =
      typeof product.category_id === "object"
        ? product.category_id._id
        : product.category_id;

    return products.filter((p) => {
      const pCategoryId =
        typeof p.category_id === "object" ? p.category_id._id : p.category_id;

      return pCategoryId === categoryId && p._id !== product._id;
    });
  }, [product, products]);
  const getVisibleCount = () => {
    if (!containerRef.current) return 4;
    return Math.floor(containerRef.current.offsetWidth / CARD_W);
  };
  const maxOffset = Math.max(0, similarProducts.length - getVisibleCount());
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));

  if (!similarProducts.length) {
    return <p className="text-center py-10">No similar products found.</p>;
  }
  return (
    <Section>
      <Row>
        <div className="relative flex justify-center items-center w-full mb-[50px] md:mb-[90px]">
          <div className="w-[18px] md:w-[50px] border-t border-black"></div>
          <h2 className="font-h2 text-black whitespace-nowrap mx-5">
            Similar Products
          </h2>
          <div className="w-[18px] md:w-[50px] border-t border-black"></div>
        </div>
        <div className="relative px-2" ref={containerRef}>
          {offset > 0 && (
            <NavBtn direction="left" onClick={prev} variant="primary" />
          )}
          <div className="overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-300"
              style={{ transform: `translateX(-${offset * CARD_W}px)` }}
            >
              {similarProducts.map((p) => (
                <div key={p._id} className="flex-shrink-0 w-[270px]">
                  <ProductCard
                    product={p}
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
}
