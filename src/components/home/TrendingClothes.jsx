import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import NavBtn from "../ui/Navbtn";
import Row from "../ui/Row";
import Section from "../ui/Section";
import ProductCard from "../productcard/ProductCard";
import Heading from "../ui/Heading";
// import lightBg from "../../../public/light.svg";

export default function NewArrivals({ setShowLoginPopup }) {
  const { products = [], loading } = useSelector((state) => state.products);
  const [offset, setOffset] = useState(0);
  const containerRef = useRef(null);
  const CARD_W = 290;
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
    <Section
      style={{
        background: `url(/light.svg) no-repeat top center, linear-gradient(rgb(255, 248, 227) 0%, rgba(255, 255, 255, 0) 100%)`,
        backgroundsize: "contain",
        paddingLeft: "var(--space-5)",
        paddingRight: "var(--space-5)",
        paddingTop: "var(--space-4)",
        marginTop: "var(--space-7)",
      }}
    >
      <Row>
        <Heading title={"Trending Product"} className="justify-start !mb-[20px] pt-[20px] !justify-start !md:mb-[45px]" />
        <div className="relative px-2" ref={containerRef}>
          {offset > 0 && (
            <NavBtn direction="left" onClick={prev} variant="primary" />
          )}

          <div className="overflow-hidden">
            <div
              className="flex gap-3 transition-transform duration-300 ease-in-out"
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
        {/* </div> */}
      </Row>
    </Section>
  );
}
