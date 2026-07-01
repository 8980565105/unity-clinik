import React, { lazy, Suspense, useEffect, useState, useRef } from "react";
import ShopBannerSlider from "../components/shop/ShopBannerSlider";
import { useDispatch, useSelector } from "react-redux";
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
import { useSearchParams } from "react-router-dom";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import SEO from "../components/seo/seo";
import LoginForm from "./Login";
import RegistrationForm from "./RegistrationForm";
import ForgetForm from "./ForgetForm";

const ProductCard = lazy(() => import("../components/product/ProductCard"));
function Allproducts() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { token } = useSelector((state) => state.auth);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isForgetOpen, setIsForgetOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { products = [], loading } = useSelector(
    (state) => state.products || {},
  );
  const { items: categories = [] } = useSelector((state) => state.categories);
  const { items: subcategories = [] } = useSelector(
    (state) => state.subcategories,
  );
  const { brands = [] } = useSelector((state) => state.brands);
  const { types = [] } = useSelector((state) => state.types);
  const { productLabels = [] } = useSelector((state) => state.productLabels);
  const { pages } = useSelector((state) => state.pages);
  const allproductsPage = pages?.find((page) => page.slug === "allproducts");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSubCategory, setActiveSubCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLabel, setSelectedLabel] = useState("all");
  const [activeFilter, setActiveFilter] = useState(null);
  const [searchParams] = useSearchParams();
  const asideRef = useRef(null);
  const lastAsideScrollY = useRef(0);
  const lastWindowScrollY = useRef(0);
  const categoryName = searchParams.get("category");
  const [showAllProduct, setShowAllProduct] = useState(true);

  useEffect(() => {
    const asideEl = asideRef.current;

    const handleAsideScroll = () => {
      const currentY = asideEl?.scrollTop || 0;
      if (currentY < lastAsideScrollY.current) {
        setShowAllProduct(true);
      } else if (currentY > lastAsideScrollY.current && currentY > 10) {
        setShowAllProduct(false);
      }
      lastAsideScrollY.current = currentY;
    };

    const handleWindowScroll = () => {
      const currentY = window.scrollY;
      if (currentY < lastWindowScrollY.current) {
        setShowAllProduct(true);
      }
      lastWindowScrollY.current = currentY;
    };

    if (asideEl)
      asideEl.addEventListener("scroll", handleAsideScroll, { passive: true });
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    return () => {
      if (asideEl) asideEl.removeEventListener("scroll", handleAsideScroll);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, []);

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
    if (product.ishidden) {
      return false;
    }

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

    if (selectedBrand !== "all") {
      const brandId = product?.variants?.[0]?.brand?.[0]?._id;

      if (brandId !== selectedBrand) {
        return false;
      }
    }

    if (selectedType !== "all") {
      const typeId = product?.variants?.[0]?.type?.[0]?._id;

      if (typeId !== selectedType) {
        return false;
      }
    }

    if (selectedLabel !== "all") {
      const labels = product?.variants?.[0]?.labels || [];

      if (!labels.includes(selectedLabel)) {
        return false;
      }
    }
    return true;
  });

  const filterOptions = {
    brand: brands.map((b) => ({
      _id: b._id,
      name: b.name,
    })),

    type: types.map((t) => ({
      _id: t._id,
      name: t.name,
    })),

    label: productLabels.map((l) => ({
      _id: l._id,
      name: l.name,
    })),
  };

  useEffect(() => {
    dispatch(fetchPageBySlug("allproducts"));
    dispatch(fetchSlides());
    dispatch(fetchCategories());
    dispatch(fetchsubCategories());
    dispatch(fetchBrands({ status: "active" }));
    dispatch(fetchtypes({ status: "active" }));
    dispatch(fetchProductLabels({ status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    if (!categoryName || subcategories.length === 0) return;

    const selectedSubCategory = subcategories.find(
      (sub) => sub.name?.toLowerCase() === categoryName.toLowerCase(),
    );

    if (selectedSubCategory) {
      setActiveSubCategory(selectedSubCategory._id);

      const parentId =
        typeof selectedSubCategory.parent_id === "object"
          ? selectedSubCategory.parent_id._id
          : selectedSubCategory.parent_id;

      setActiveCategory(parentId);
    }
  }, [categoryName, subcategories]);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    setActiveSubCategory("all");
    setActiveFilter(null);
    setSelectedBrand("all");
    setSelectedType("all");
    setSelectedLabel("all");

    if (categoryId === "all") {
      setShowAllProduct(true);
      lastAsideScrollY.current = 0;
      lastWindowScrollY.current = 0;
    } else {
      setShowAllProduct(false);
      setTimeout(() => {
        lastAsideScrollY.current = 999;
        lastWindowScrollY.current = 0;
      }, 100);
    }
  };

  const handleCartClick = () => {
    if (!token) {
      setIsLoginOpen(true);
      return;
    }
    navigate("/cart");
  };

  const handleFilterClick = (filterName, categoryId) => {
    setActiveCategory("all");
    setActiveSubCategory("all");
    setSelectedBrand("all");
    setSelectedType("all");
    setSelectedLabel("all");
    setActiveFilter(filterName);
    if (categoryId === "all") {
      setShowAllProduct(true);
      lastAsideScrollY.current = 0;
      lastWindowScrollY.current = 0;
    } else {
      setShowAllProduct(false);
      setTimeout(() => {
        lastAsideScrollY.current = 999;
        lastWindowScrollY.current = 0;
      }, 100);
    }
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
  const currentFilterOptions = activeFilter
    ? filterOptions[activeFilter]
    : filteredSubCategories;

  return (
    <>
      <SEO
        title={allproductsPage?.meta_title}
        description={allproductsPage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${allproductsPage?.seo_image}`}
      />

      <div className="flex bg-gray-50">
        <aside
          ref={asideRef}
          className="
              w-[85px]
        sticky
        top-[50px]
        md:top-[74px]
        h-[calc(100vh-50px)]
        md:h-[calc(100vh-74px)]
        border-r
        border-gray-200
        shrink-0
        bg-white
        overflow-y-auto
        z-20 hide-scrollbar hide-scrollbar::-webkit-scrollbar"
        >
          <div className="hide-scrollbar hide-scrollbar::-webkit-scrollbar">
            <div
              className="bg-white z-10 overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                height: "120px",
                transform: showAllProduct
                  ? "translateY(0)"
                  : "translateY(-120px)",
                opacity: showAllProduct ? 1 : 0,
                marginBottom: showAllProduct ? "0px" : "-120px",
                pointerEvents: showAllProduct ? "auto" : "none",
              }}
            >
              <button
                onClick={() => handleCategoryClick("all")}
                className={`w-full flex flex-col items-center  py-3 gap-1 transition-all duration-200
                  ${activeCategory === "all" ? "border-primary" : ""}`}
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center text-lg
                    ${
                      activeCategory === "all"
                        ? "border-primary text-primary"
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
                  className={`text-[16px] font-medium leading-tight text-center ${
                    activeCategory === "all"
                      ? "text-primary !font-bold"
                      : "text-gray-600"
                  }`}
                >
                  All Products
                </span>
              </button>
            </div>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryClick(cat._id)}
                className={`w-full flex flex-col items-center py-3 gap-1 transition-all duration-200
                                  `}
              >
                <div
                  className={`w-[70px] h-[70px] rounded-xl border  flex items-center justify-center overflow-hidden
                      ${
                        activeCategory === cat._id
                          ? "border-primary border-2"
                          : "border-gray-100"
                      }`}
                >
                  {cat.image_url ? (
                    <img
                      src={getImageUrl(cat.image_url)}
                      alt={cat.name}
                      className="w-full h-full object-cover p-1"
                    />
                  ) : (
                    <span
                      className={` ${
                        activeCategory === cat._id
                          ? "text-primary font-bold"
                          : "text-gray-500"
                      }`}
                    >
                      {cat.name?.charAt(0)}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[16px] font-bold leading-tight text-center px-1 ${
                    activeCategory === cat._id ? "text-primary" : "text-black"
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            ))}
            <button
              onClick={() => handleFilterClick("brand")}
              className={`w-full py-2 text-sm mx-auto font-medium ${
                activeFilter === "brand" ? " text-primary" : ""
              }`}
            >
              Brand
            </button>
            <button
              onClick={() => handleFilterClick("type")}
              className={`w-full py-3 text-[16px] font-bold ${
                activeFilter === "type" ? "text-primary" : ""
              }`}
            >
              Type
            </button>
            <button
              onClick={() => handleFilterClick("label")}
              className={`w-full py-3 text-[16px] font-bold ${
                activeFilter === "label" ? "text-primary" : ""
              }`}
            >
              Label
            </button>
          </div>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="sticky top-[49px] lg:top-[74px] bg-white border-b border-gray-200 z-20">
            <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
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
                      className={`px-4 py-2 rounded-full my-3 border transition-all duration-200 text-nowrap
        ${
          (activeFilter === "brand" && selectedBrand === item._id) ||
          (activeFilter === "type" && selectedType === item._id) ||
          (activeFilter === "label" && selectedLabel === item._id)
            ? "bg-primary text-white border-primary"
            : "bg-white text-black hover:text-white border-primary hover:bg-primary"
        }`}
                    >
                      {item.name}
                    </button>
                  ))
                : filteredSubCategories.map((sub) => (
                    <button
                      key={sub._id}
                      onClick={() => {
                        setActiveSubCategory(sub._id);
                      }}
                      className={`px-4 py-2 my-3 text-nowrap rounded-full border transition-all duration-200
        ${
          activeSubCategory === sub._id
            ? "bg-primary text-white border-primary"
            : "bg-white text-black hover:text-white border-primary hover:bg-primary"
        }`}
                    >
                      {sub.name}
                    </button>
                  ))}
            </div>
          </div>

          <div className="pt-4">
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
                  <p className="text-[12px] md:text-[16px] mt-1 text-center">
                    Try selecting a different category or subcategory
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
                  {filteredProducts.map((product) => (
                    <Suspense
                      key={product._id}
                      fallback={
                        <div className="h-[300px] bg-gray-100 animate-pulse rounded" />
                      }
                    >
                      <ProductCard
                        product={product}
                        setShowLoginPopup={() => {}}
                      />
                    </Suspense>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Button
            variants="common"
            onClick={handleCartClick}
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

      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setIsLoginOpen(false)}
              onSwitchRegister={() => {
                setIsLoginOpen(false);
                setIsRegisterOpen(true);
              }}
              onSwitchForget={() => {
                setIsLoginOpen(false);
                setIsForgetOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {isRegisterOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <RegistrationForm
              onClose={() => setIsRegisterOpen(false)}
              onSwitch={() => {
                setIsRegisterOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}

      {isForgetOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100000] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <ForgetForm
              onClose={() => setIsForgetOpen(false)}
              onSwitch={() => {
                setIsForgetOpen(false);
                setIsLoginOpen(true);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Allproducts;
