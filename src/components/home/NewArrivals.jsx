import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getImageUrl } from "../utils/helper";
import NavBtn from "../ui/Navbtn";
import Row from "../ui/Row";
import ProductCard from "../productcard/ProductCard";

import shoesimg from "../../assets/shoes.png";
import winterimg from "../../assets/winter-clothes.png";
import watchimg from "../../assets/watch.png";
import earringsimg from "../../assets/earrings.png";
import Section from "../ui/Section";
import Heading from "../ui/Heading";


const staticProducts = [
  {
    _id: "s1",
    name: "Earings",
    images: [earringsimg],
    variants: [],
    discount: null,
  },
  {
    _id: "s2",
    name: "Shoes",
    images: [shoesimg],
    variants: [],
    discount: null,
  },
  {
    _id: "s3",
    name: "Watch",
    images: [watchimg],
    variants: [],
    discount: null,
  },
  {
    _id: "s4",
    name: "Winter Cloths",
    images: [winterimg],
    variants: [],
    discount: null,
  },
];

export default function NewArrivals({ setShowLoginPopup }) {
  const { products, loading } = useSelector((state) => state.products);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);
  const CARD_W = 290;
  const items = products && products.length > 0 ? products : staticProducts;
  const getVisibleCount = () => {
    if (!containerRef.current) return 4;
    return Math.floor(containerRef.current.offsetWidth / CARD_W);
  };
  const maxOffset = Math.max(0, items.length - getVisibleCount());
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));
  return (
    <Section>
      <Row>
        <Heading title={"New Arrivals"} />

        <div className="relative px-2" ref={containerRef}>
          {offset > 0 && (
            <NavBtn direction="left" onClick={prev} variant="primary" />
          )}
          <div className="overflow-hidden">
            <div
              className="flex gap-3 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
              style={{ transform: `translateX(-${offset * CARD_W}px)` }}
            >
              {items.map((product) => (
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
}
