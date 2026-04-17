import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import NavBtn from "../ui/Navbtn";
import Row from "../ui/Row";
import Section from "../ui/Section";
import ProductCard from "../productcard/ProductCard";
import Heading from "../ui/Heading";

export default function NewArrivals({ setShowLoginPopup }) {
  const { products = [], loading } = useSelector((state) => state.products);

  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);

  const CARD_W = 300;

  const items = products.filter((product) =>
    product?.variants?.some((v) => v?.is_trending === true),
  );

  const getVisibleCount = () => {
    if (!containerRef.current) return 4;
    return Math.floor(containerRef.current.offsetWidth / CARD_W);
  };

  const maxOffset = Math.max(0, items.length - getVisibleCount());

  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));

  if (loading) return <p>Loading...</p>;

  return (
    <Section>
      <Row>
        <Heading title={" Featured Product"} />
        <div className="relative px-2" ref={containerRef}>
          {offset > 0 && (
            <NavBtn direction="left" onClick={prev} variant="primary" />
          )}
          <div className="overflow-hidden">
            <div
              className="flex gap-5 transition-transform duration-300"
              style={{ transform: `translateX(-${offset * CARD_W}px)` }}
            >
              {items.map((product) => {
                const price = product?.variants?.[0]?.price || 0;
                return (
                  <div key={product._id} className="flex-shrink-0 w-[270px]">
                    <ProductCard
                      product={product}
                      setShowLoginPopup={setShowLoginPopup}
                    />
                  </div>
                );
              })}
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
