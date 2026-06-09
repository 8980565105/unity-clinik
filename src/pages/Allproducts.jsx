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
import { fetchBrands } from "../features/brands/brandsThunk";
import { fetchtypes } from "../features/types/typeThunk";
import { fetchProductLabels } from "../features/productLabels/productlabelsThunk";

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

  const { brands = [], loading: brandLoading } = useSelector(
    (state) => state.brands,
  );
  const { types = [], loading: typesLoading } = useSelector(
    (state) => state.types,
  );

  const { productLabels = [], loading: labelsLoading } = useSelector(
    (state) => state.productLabels,
  );

  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubCategory, setActiveSubCategory] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [activeFilter, setActiveFilter] = useState(null);
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
    // Category Filter
    if (activeCategory !== "all") {
      const productSubIds =
        product.category_id?.map((id) => normalizeId(id)) || [];

      if (activeSubCategory !== "all") {
        if (!productSubIds.includes(String(activeSubCategory))) {
          return false;
        }
      } else {
        if (!productSubIds.some((id) => categorySubIds.includes(id))) {
          return false;
        }
      }
    }

    // Brand Filter
    if (selectedBrand !== "all") {
      const brandId = product?.variants?.[0]?.brand?.[0]?._id;

      if (brandId !== selectedBrand) {
        return false;
      }
    }

    // Type Filter
    if (selectedType !== "all") {
      const typeId = product?.variants?.[0]?.type?.[0]?._id;

      if (typeId !== selectedType) {
        return false;
      }
    }

    // Label Filter
    if (selectedLabel !== "all") {
      const labels = product?.variants?.[0]?.labels || [];

      if (!labels.includes(selectedLabel)) {
        return false;
      }
    }

    // Price Filter
    const price =
      Number(product?.variants?.[0]?.offerprice) ||
      Number(product?.variants?.[0]?.price) ||
      0;

    if (selectedPrice !== "all") {
      switch (selectedPrice) {
        case "0-500":
          if (price < 0 || price > 500) return false;
          break;

        case "500-1000":
          if (price < 500 || price > 1000) return false;
          break;

        case "1000-2000":
          if (price < 1000 || price > 2000) return false;
          break;

        case "2000+":
          if (price < 2000) return false;
          break;

        default:
          break;
      }
    }

    return true;
  });

  const filterOptions = {
    brand: [
      { _id: "all", name: "All" },
      ...brands.map((b) => ({
        _id: b._id,
        name: b.name,
      })),
    ],

    type: [
      { _id: "all", name: "All" },
      ...types.map((t) => ({
        _id: t._id,
        name: t.name,
      })),
    ],

    label: [
      { _id: "all", name: "All" },
      ...productLabels.map((l) => ({
        _id: l._id,
        name: l.name,
      })),
    ],
  };

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchSlides());
    dispatch(fetchCategories());
    dispatch(fetchsubCategories());
    dispatch(fetchBrands({ status: "active" }));
    dispatch(fetchtypes({ status: "active" }));
    dispatch(fetchProductLabels({ status: "active" }));
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubCategory("all");
    setActiveFilter(null);
    setSelectedBrand("all");
    setSelectedType("all");
    setSelectedLabel("all");
  };
  const handleFilterClick = (filterName) => {
    setActiveCategory("all");
    setActiveSubCategory("all");
    setSelectedBrand("all");
    setSelectedType("all");
    setSelectedLabel("all");
    setActiveFilter(filterName);
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
  const showFilterBar = hasSubcategories || activeFilter;

  const currentFilterOptions = activeFilter
    ? filterOptions[activeFilter]
    : filteredSubCategories;

  const resetFilterValues = () => {
    setSelectedBrand("all");
    setSelectedType("all");
    setSelectedLabel("all");
  };

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
          <div className="border-t mt-3 pt-3">
            <button
              onClick={() => handleFilterClick("brand")}
              className={`w-full py-3 text-sm font-medium ${
                activeFilter === "brand" ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              Brand
            </button>

            <button
              onClick={() => handleFilterClick("type")}
              className={`w-full py-3 text-sm font-medium ${
                activeFilter === "type" ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              Type
            </button>

            <button
              onClick={() => handleFilterClick("label")}
              className={`w-full py-3 text-sm font-medium ${
                activeFilter === "label" ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              Product Label
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col">
          <div
            className="sticky top-[50px] md:top-[74px]
  bg-white border-b border-gray-200 z-10"
          >
            <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
              {activeFilter
                ? currentFilterOptions.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => {
                        if (activeFilter === "brand")
                          setSelectedBrand(item._id);

                        if (activeFilter === "type") setSelectedType(item._id);

                        if (activeFilter === "label")
                          setSelectedLabel(item._id);
                      }}
                      className="px-4 py-2 rounded-full border"
                    >
                      {item.name}
                    </button>
                  ))
                : filteredSubCategories.map((sub) => (
                    <button
                      key={sub._id}
                      onClick={() => setActiveSubCategory(sub._id)}
                      className="px-4 py-2 rounded-full border"
                    >
                      {sub.name}
                    </button>
                  ))}
            </div>
          </div>
          <div className="p-4">
            <ShopBannerSlider />
          </div>

          <div className="lg:px-4 pb-8 container mx-auto">
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
                    productLabels={productLabels}
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
