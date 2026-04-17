import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import Section from "../ui/Section";
import Row from "../ui/Row";
import { fetchDiscounts } from "../../features/discounts/discountsThunk";
import { fetchProducts } from "../../features/products/productsThunk";
import ProductCard from "../productcard/ProductCard";
import NavBtn from "../ui/Navbtn";

export default function OfferSlider({ setShowLoginPopup }) {
  const dispatch = useDispatch();
  const scrollRef = useRef();
  const [visibleCount, setVisibleCount] = useState(20);
  const [activeOffer, setActiveOffer] = useState("all");

  const { discounts = [] } = useSelector((state) => state.discounts);
  const { products = [], loading: productLoading } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    dispatch(fetchDiscounts());
    dispatch(fetchProducts());
  }, [dispatch]);

  const scroll = (direction) => {
    scrollRef.current.scrollBy({
      left: direction === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  const filteredProducts =
    activeOffer === "all"
      ? products.filter((p) => p.discount_id)
      : products.filter((p) => p.discount_id && p.discount_id === activeOffer);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(20);
  }, [filteredProducts.length]);

  return (
    <Section>
      <Row>
        <div className="relative flex justify-start items-center w-full mb-[50px] md:mb-[90px]">
          <h2 className="font-h2 text-black whitespace-nowrap mx-5">
            offer by product
          </h2>
          <div className="w-[18px] md:w-[50px] border-t border-black"></div>
        </div>
      </Row>
      <Row>
        <div className="relative">
          <NavBtn
            direction="left"
            onClick={() => scroll("left")}
            variant="primary"
          />
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth px-10 py-3 no-scrollbar"
          >
            <button
              onClick={() => setActiveOffer("all")}
              className={`whitespace-nowrap px-4 py-2 rounded-[5px] border text-sm transition
              ${activeOffer === "all" ? "bg-[var(--theme-color)] text-white" : "bg-white text-black"}`}
            >
              All
            </button>
            {discounts
              .filter((cat) => cat.status === "active")
              .map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => setActiveOffer(cat._id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-[5px] border text-sm transition
                  ${activeOffer === cat._id ? "bg-[var(--theme-color)] text-white" : "bg-white text-black"}`}
                >
                  {cat.name}
                </button>
              ))}
          </div>
          <NavBtn
            direction="right"
            onClick={() => scroll("right")}
            variant="primary"
          />
        </div>
      </Row>
      <Row>
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-[10px] lg:gap-[30px] pt-[50px]">
          {productLoading ? (
            <p>Loading products...</p>
          ) : visibleProducts.length > 0 ? (
            visibleProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                setShowLoginPopup={setShowLoginPopup}
              />
            ))
          ) : (
            <p className="col-span-4 text-center text-gray-400 py-10">
              Coming soon products for this offer.
            </p>
          )}
          {filteredProducts.length > visibleCount && (
            <div className="col-span-4 flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount((prev) => prev + 20)}
                className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[89px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
                style={{
                  boxShadow: "inset 0px 0px 30px ",
                }}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </Row>
    </Section>
  );
}
