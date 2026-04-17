import React, { useState } from "react";
import ProductCard from "../productcard/ProductCard";

const ProductGrid = ({ products = [], loading, setShowLoginPopup }) => {
  const [visibleCount, setVisibleCount] = useState(6);

  const handleLoadMore = () => {
    setVisibleCount((v) => v + 3);
  };

  if (loading) return <p>Loading...</p>;

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className="mt-[50px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-[10px] md:gap-[30px]">
        {visibleProducts.length > 0 ? (
          visibleProducts.map((product, index) => (
            <ProductCard
              key={product._id || product.id || index}
              product={product}
              setShowLoginPopup={setShowLoginPopup}
            />
          ))
        ) : (
          <p>No products found.</p>
        )}
      </div>

      {visibleCount < products.length && (
        <div className="flex justify-center mt-[50px]">
          <button
            onClick={handleLoadMore}
            className="text-[18px] theme-border text-theme w-[187px] h-[70px] sm:w-[220px] sm:h-[89px] font-medium rounded-[10px] shadow-lg transition duration-300 uppercase"
            style={{
              //  boxShadow: "inset 0px 0px 30px rgba(244, 50, 151, 0.25)"
              boxShadow: "inset 0px 0px 30px ",
               }}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
