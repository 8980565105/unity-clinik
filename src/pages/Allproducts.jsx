import React, { useEffect, useState, useRef } from "react";
import ShopBannerSlider from "../components/shop/ShopBannerSlider";
import { fetchProducts } from "../features/products/productsThunk";
import { useDispatch, useSelector } from "react-redux";
import ProductCard from "../components/product/ProductCard";
import { fetchSlides } from "../features/slides/slideThunk";
import Loding from "../components/loding/loding";
import { fetchCategories } from "../features/categories/categoriesThunk";
import { fetchsubCategories } from "../features/subcategories/subcategoriesThunk";
import { getImageUrl } from "../components/utils/helper";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { ChevronRight, ShoppingCart } from "lucide-react";

const NAVBAR_HEIGHT = 100;

function Allproducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { products = [], loading } = useSelector(
    (state) => state.products || {},
  );
  const { items: categories = [] } = useSelector((state) => state.categories);
  const { items: subcategories = [] } = useSelector(
    (state) => state.subcategories,
  );

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubCategory, setActiveSubCategory] = useState("all");

  useEffect(() => {
    if (subcategories.length > 0) {
    }
  }, [subcategories]);

  useEffect(() => {
    if (activeCategory !== "all") {
    }
  }, [activeCategory, subcategories]);
  const normalizeId = (val) => {
    if (!val) return "";
    if (typeof val === "object") return String(val._id ?? "");
    return String(val);
  };
  const filteredSubCategories =
    activeCategory === "all"
      ? []
      : subcategories.filter((sub) => {
          const parentId =
            typeof sub.parent_id === "object"
              ? String(sub.parent_id?._id)
              : String(sub.parent_id);

          return parentId === String(activeCategory);
        });
  const categorySubIds = filteredSubCategories.map((sub) => String(sub._id));

  const filteredProducts = products.filter((product) => {
    if (activeCategory === "all") return true;

    const productSubIds =
      product.category_id?.map((id) => normalizeId(id)) || [];

    if (activeSubCategory !== "all") {
      return productSubIds.includes(String(activeSubCategory));
    }

    return productSubIds.some((id) => categorySubIds.includes(id));
  });

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchSlides());
    dispatch(fetchCategories());
    dispatch(fetchsubCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubCategory("all");
  };

  const { items = [] } = useSelector((state) => state.cart);
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = (items || []).reduce((sum, item) => {
    if (!item) return sum;

    const price =
      Number(item?.variant_id?.offerprice ?? 0) > 0
        ? Number(item?.variant_id?.offerprice ?? 0)
        : Number(item?.variant_id?.price ?? 0);

    return sum + price * Number(item?.quantity ?? 1);
  }, 0);

  if (loading) return <Loding />;

  const hasSubcategories =
    activeCategory !== "all" && filteredSubCategories.length > 0;

  return (
    <>
      <div className="flex bg-gray-50">
        <aside
          className="w-[85px] top-[50px] md:top-[74px] border-r border-gray-200 shrink-0 bg-white overflow-y-auto z-20 scrollbar-hide"
          style={{
            position: "sticky",
          }}
        >
          <div className="py-2">
            <button
              onClick={() => handleCategoryClick("all")}
              className={`w-full flex flex-col items-center py-3 gap-1 transition-all duration-200
              ${
                activeCategory === "all"
                  ? "bg-blue-50 border-l-[3px] border-blue-600"
                  : "border-l-[3px] border-transparent hover:bg-gray-50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl border flex items-center justify-center text-lg
                ${
                  activeCategory === "all"
                    ? "border-blue-300 bg-blue-100 text-blue-600"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </div>
              <span
                className={`text-[11px] font-medium leading-tight text-center ${
                  activeCategory === "all" ? "text-blue-600" : "text-gray-600"
                }`}
              >
                All Products
              </span>
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className={`w-full flex flex-col items-center py-3 gap-1 transition-all duration-200
                ${
                  activeCategory === cat._id
                    ? "bg-blue-50 border-l-[3px] border-blue-600"
                    : "border-l-[3px] border-transparent hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center overflow-hidden
                  ${
                    activeCategory === cat._id
                      ? "border-blue-300 bg-blue-100"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  {cat.image_url ? (
                    <img
                      src={getImageUrl(cat.image_url)}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <span
                      className={`text-base font-semibold ${
                        activeCategory === cat._id
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    >
                      {cat.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] font-medium leading-tight text-center px-1 ${
                    activeCategory === cat._id
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <div
            className="sticky z-10 top-[50px] md:top-[74px] bg-white border-b border-gray-200 transition-all duration-300 overflow-hidden"
            style={{
              maxHeight: hasSubcategories ? "56px" : "0px",
              opacity: hasSubcategories ? 1 : 0,
              pointerEvents: hasSubcategories ? "auto" : "none",
            }}
          >
            <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
              {filteredSubCategories.map((sub) => (
                <button
                  key={sub._id}
                  onClick={() => setActiveSubCategory(sub._id)}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border whitespace-nowrap transition-all duration-200
                  ${
                    activeSubCategory === sub._id
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  {sub.image_url && (
                    <img
                      src={getImageUrl(sub.image_url)}
                      alt={sub.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  )}
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            <ShopBannerSlider />
          </div>

          <div className="lg:px-4 pb-8">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-16 h-16 mb-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-lg font-medium">No products found</p>
                <p className="text-sm mt-1">
                  Try selecting a different category or subcategory
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    setShowLoginPopup={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            variants="common"
            onClick={() => navigate("/cart")}
            className="flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap
            bg-primary text-white text-[18px] min-w-[100px] py-[8px] md:py-[15px] hover:bg-[var(--theme-hover-color)] hover:text-white"
          >
            <div className="relative">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {totalItems}
              </span>
            </div>

            <div className="flex flex-col items-center leading-tight">
              <span className="text-[18px] font-semibold">View cart</span>

              <span className="text-xs md:text-sm">
                {totalItems} {totalItems === 1 ? "item" : "items"} | ₹
                {totalPrice ? totalPrice.toLocaleString("en-IN") : "0"}
              </span>
            </div>
            <div className="bg-[#0C387E] rounded-full">
              <ChevronRight size={24} />
            </div>
          </Button>
        </div>
      )}
    </>
  );
}

export default Allproducts;
