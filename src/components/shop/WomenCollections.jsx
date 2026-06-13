import { Link, useLocation, useNavigate } from "react-router-dom";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ChevronDown, X, Plus, Minus } from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import CheckedIcon from "../icons/checked";
import MobileFilterBar from "./MobileFilterBar";
import ProductGrid from "./ProductGrid";
import TrandingCard from "./TrandingCard";
import SortByPage from "./SortByPage";
import MobileFilterModal from "./MobileFilterModal";
import DesktopFilters from "./DesktopFilters";
import OriginalSortByIcon from "../icons/SortByIcon";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "../../features/products/productsThunk";
import Row from "../ui/Row";
import Section from "../ui/Section";
import LoginForm from "../../pages/Login";

const SortByIcon = (props) => (
  <OriginalSortByIcon {...props} className="h-4 w-4 md:text-gray-500" />
);
const CustomChevronDown = (props) => <ChevronDown {...props} />;

const DesktopSortBar = ({ sortBy, setSortBy }) => (
  <div className="flex items-center gap-2 cursor-pointer rounded px-3 py-2">
    <SortByIcon />
    <span className="text-[16px] font-medium text-[#989696] font-sans">
      Sort By
    </span>
    <div className="relative">
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="appearance-none bg-white text-black py-2 pl-3 pr-10 rounded-[3px] box-shadow focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] text-[16px] transition duration-150 ease-in-out"
      >
        <option value="popularity">Popularity</option>
        <option value="latest">Latest</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating">Average Rating</option>
        <option value="discounts">Discounts</option>
      </select>
      <CustomChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black pointer-events-none" />
    </div>
  </div>
);

const FilterItemCheckbox = ({ name, count, isChecked, onChange }) => (
  <label className="flex items-center justify-between cursor-pointer p-1 rounded">
    <div className="flex items-center relative">
      <div
        className={`w-[15px] h-[15px] rounded border flex items-center justify-center
          ${isChecked ? "bg-color border-color" : "bg-white border-gray-400"}`}
      >
        {isChecked && <CheckedIcon className="w-3 h-3 text-white" />}
      </div>
      <input
        type="checkbox"
        name={name}
        checked={isChecked}
        onChange={() => onChange(name)}
        aria-checked={isChecked}
        className="absolute top-0 left-0 w-[15px] h-[15px] opacity-0 cursor-pointer z-10"
      />
      <span className="ml-3 text-[14px] font-inter text-[rgba(0,0,0,0.7)]">
        {name}
      </span>
    </div>
    {count !== undefined && (
      <span className="text-[14px] font-regular font-inter text-[#989696]">
        {count}
      </span>
    )}
  </label>
);

const SizeFilterItem = ({ name, isChecked, onChange }) => (
  <label className="flex items-center cursor-pointer p-1 rounded w-1/2 relative">
    <div
      className={`w-[15px] h-[15px] rounded border flex items-center justify-center
        ${isChecked ? "bg-color border-color" : "bg-white border-gray-400"}`}
    >
      {isChecked && <CheckedIcon className="w-3 h-3 pointer-events-none" />}
    </div>
    <input
      type="checkbox"
      name={name}
      checked={isChecked}
      onChange={onChange}
      className="absolute w-[15px] h-[15px] opacity-0 cursor-pointer"
    />
    <span className="ml-3 text-[14px] text-[rgba(0,0,0,0.7)] font-regular">
      {name}
    </span>
  </label>
);

const CollapsibleFilter = ({
  title,
  onReset,
  isOpen = false,
  onToggle = () => {},
  children,
  onCancelClick,
  onApplyClick,
  showButtons = true,
}) => {
  return (
    <div className="px-[10px] py-[0px] lg:px-[15px] lg:py-[10px] border-gray-200">
      <div
        className={`flex items-center justify-between cursor-pointer rounded-[10px] px-4 py-3 transition-all duration-300
          ${isOpen ? "bg-[var(--primary-color)] border-transparent" : "bg-transparent border-white shadow-[0_0_4px_rgba(0,0,0,0.3)]"}`}
        onClick={onToggle}
      >
        <h3
          className={`font-medium font-inter text-[14px] ${isOpen ? "text-white" : "text-theme"}`}
        >
          {title}
        </h3>
        <div className="flex items-center space-x-2">
          {isOpen ? (
            <Minus className="w-4 h-4 text-white bg-color" />
          ) : (
            <Plus className="w-4 h-4 text-white bg-color" />
          )}
        </div>
      </div>
      {isOpen && (
        <div className="space-y-1 py-2">
          {children}
          {showButtons && (
            <div className="flex gap-4 py-[20px] border-b border-[#BCBCBC]">
              <button
                onClick={onCancelClick || onToggle}
                className="w-[100px] h-[40px] text-[18px] font-regular font-inter text-black/70 border border-[#989696] rounded-[3px] transition"
              >
                Cancel
              </button>
              <button
                onClick={onApplyClick || onReset}
                className="w-[100px] h-[40px] text-[18px] font-regular font-inter text-white bg-color rounded-[3px] transition shadow-md hidden lg:flex items-center justify-center"
              >
                Reset
              </button>
              <button
                onClick={onApplyClick || onReset}
                className="w-[100px] h-[40px] text-[18px] font-regular font-inter text-white bg-color rounded-[3px] transition shadow-md flex lg:hidden items-center justify-center"
              >
                Filter
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const PriceRangeFilter = ({
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  isMobile = false,
  isOpen,
  onToggle,
}) => {
  const MAX_PRICE = 5000;
  const MIN_PRICE = 0;
  const DEFAULT_MIN = 500;
  const DEFAULT_MAX = 5000;

  const handleMinChange = (e) =>
    setMinPrice(Math.min(Number(e.target.value), maxPrice - 100));
  const handleMaxChange = (e) =>
    setMaxPrice(Math.max(Number(e.target.value), minPrice + 100));
  const handleReset = () => {
    setMinPrice(DEFAULT_MIN);
    setMaxPrice(DEFAULT_MAX);
  };

  const minPercent = (minPrice / MAX_PRICE) * 100;
  const maxPercent = (maxPrice / MAX_PRICE) * 100;
  const midPercent = (minPercent + maxPercent) / 2;

  const commonInputStyle = {
    position: "absolute",
    width: "100%",
    height: "100%",
    top: 0,
    left: 0,
    margin: 0,
    padding: 0,
    opacity: 0,
    cursor: "pointer",
    WebkitAppearance: "none",
    appearance: "none",
    zIndex: 10,
  };

  return (
    <CollapsibleFilter
      title="Price"
      isOpen={isOpen}
      onToggle={onToggle}
      isSelected={minPrice !== DEFAULT_MIN || maxPrice !== DEFAULT_MAX}
      onReset={handleReset}
      showButtons={false}
    >
      <div className="space-y-6 px-3 py-6">
        <div className="relative select-none" style={{ height: "30px" }}>
          <div
            style={{
              position: "absolute",
              height: "4px",
              top: "50%",
              left: 0,
              right: 0,
              transform: "translateY(-50%)",
              backgroundColor: "rgba(210, 175, 159, 0.4)",
              borderRadius: "9999px",
            }}
          />
          <div
            style={{
              position: "absolute",
              height: "4px",
              top: "50%",
              transform: "translateY(-50%)",
              left: `${minPercent}%`,
              right: `${100 - maxPercent}%`,
              pointerEvents: "none",
              borderRadius: "9999px",
            }}
            className="bg-color"
          />
          <div
            style={{
              position: "absolute",
              width: "18px",
              height: "18px",
              top: "50%",
              left: `calc(${minPercent}% - 9px)`,
              transform: "translateY(-50%)",
              pointerEvents: "none",
              zIndex: 8,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}
            className="bg-color"
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "white",
              }}
            />
          </div>
          <div
            style={{
              position: "absolute",
              width: "18px",
              height: "18px",
              top: "50%",
              left: `calc(${maxPercent}% - 9px)`,
              transform: "translateY(-50%)",
              pointerEvents: "none",
              zIndex: 8,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}
            className="bg-color"
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                backgroundColor: "white",
              }}
            />
          </div>
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={100}
            value={minPrice}
            onChange={handleMinChange}
            style={{
              ...commonInputStyle,
              width: `${midPercent + 5}%`,
              left: 0,
              zIndex: 11,
            }}
          />
          <input
            type="range"
            min={MIN_PRICE}
            max={MAX_PRICE}
            step={100}
            value={maxPrice}
            onChange={handleMaxChange}
            style={{
              ...commonInputStyle,
              width: `${100 - midPercent + 5}%`,
              left: `${midPercent - 5}%`,
              zIndex: 11,
            }}
          />
        </div>
        <div className="flex gap-[15px]">
          <div className="flex flex-col flex-1">
            <span className="sec-text-color text-14">Min</span>
            <div className="mt-2 h-[40px] flex items-center justify-center border border-gray-300 rounded-full text-[14px]">
              Rs {minPrice}
            </div>
          </div>
          <div className="flex flex-col flex-1">
            <span className="sec-text-color text-14">Max</span>
            <div className="mt-2 h-[40px] flex items-center justify-center border border-gray-300 rounded-full text-[14px]">
              Rs {maxPrice}
            </div>
          </div>
        </div>
        {isMobile && (
          <div className="flex gap-4 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleReset}
              className="w-[100px] h-[40px] text-[18px] font-regular text-black/70 border border-[#989696] rounded-[3px] transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {}}
              className="w-[100px] h-[40px] text-[18px] font-regular text-white bg-color rounded-[3px] transition shadow-md"
            >
              Filter
            </button>
          </div>
        )}
      </div>
    </CollapsibleFilter>
  );
};

export default function WomenCollections() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoginPopup, setShowLoginPopup] = useState(false);

  const { products = [], loading } = useSelector(
    (state) => state.products || {},
  );
  const { items: subcategories = [] } = useSelector(
    (state) => state.subcategories,
  );

  const { discounts: allDiscounts = [] } = useSelector(
    (state) => state.discounts || {},
  );
  const { productLabels: allLabels = [] } = useSelector(
    (state) => state.productLabels || {},
  );

  const [page] = useState(1);
  const limit = 100;

  useEffect(() => {
    dispatch(fetchProducts({ page, limit }));
  }, [dispatch, page, limit]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedDiscounts, setSelectedDiscounts] = useState([]);
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [minPrice, setMinPrice] = useState(500);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [currentSortValue, setCurrentSortValue] = useState("popularity");
  const [currentSortLabel, setCurrentSortLabel] = useState("popularity");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortByOpen, setIsSortByOpen] = useState(false);

  const isUpdatingFromURL = useRef(false);
  const isUpdatingFromState = useRef(false);

  const createToggleHandler = useCallback(
    (setState) => (name) => {
      setState((prev) =>
        prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name],
      );
    },
    [],
  );

  const handleCategoryChange = (name) => {
    setSelectedCategories((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name],
    );
  };
  const handleBrandChange = createToggleHandler(setSelectedBrands);
  const handleTypeChange = createToggleHandler(setSelectedTypes);

  const handleDiscountChange = (id, name) => {
    setSelectedDiscounts((prev) =>
      prev.some((d) => d.id === id)
        ? prev.filter((d) => d.id !== id)
        : [...prev, { id, name }],
    );
  };

  const handleLabelChange = (id, name) => {
    setSelectedLabels((prev) =>
      prev.some((l) => l.id === id)
        ? prev.filter((l) => l.id !== id)
        : [...prev, { id, name }],
    );
  };

  const handleClearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedTypes([]);
    setSelectedDiscounts([]);
    setSelectedLabels([]);
    setIsBestSeller(false);
    setMinPrice(500);
    setMaxPrice(5000);
    navigate("/shop", { replace: true });
  };

  useEffect(() => {
    if (isUpdatingFromState.current) return;
    isUpdatingFromURL.current = true;
    const params = new URLSearchParams(location.search);
    const getArray = (key) =>
      params.get(key) ? params.get(key).split(",") : [];
    const categoryFromURL = params.get("category");
    const filterFromURL = params.get("filter");
    if (categoryFromURL) {
      const newCats = categoryFromURL.split(",");
      setSelectedCategories(newCats);
    } else {
      setSelectedCategories([]);
    }

    setSelectedBrands(getArray("brand"));
    setSelectedTypes(getArray("type"));

    const discountIds = getArray("discount");
    if (discountIds.length > 0) {
      const discountObjects = discountIds.map((name) => {
        const found = allDiscounts.find((d) => d.name === name);
        return { id: found?._id || name, name };
      });
      setSelectedDiscounts(discountObjects);
    } else {
      setSelectedDiscounts([]);
    }

    const labelIds = getArray("label");
    if (labelIds.length > 0) {
      const labelObjects = labelIds.map((name) => {
        const found = allLabels.find((l) => l.name === name);
        return { id: found?._id || name, name };
      });
      setSelectedLabels(labelObjects);
    } else {
      setSelectedLabels([]);
    }
    if (params.get("min")) setMinPrice(Number(params.get("min")));
    if (params.get("max")) setMaxPrice(Number(params.get("max")));

    if (filterFromURL === "bestseller") {
      setIsBestSeller(true);
    } else {
      setIsBestSeller(false);
    }

    setTimeout(() => {
      isUpdatingFromURL.current = false;
    }, 0);
  }, [location.search, allDiscounts, allLabels]);

  useEffect(() => {
    if (isUpdatingFromURL.current) return;
    isUpdatingFromState.current = true;
    const params = new URLSearchParams();
    if (selectedCategories.length)
      params.set("category", selectedCategories.join(","));
    if (selectedBrands.length) params.set("brand", selectedBrands.join(","));
    if (selectedTypes.length) params.set("type", selectedTypes.join(","));
    if (selectedDiscounts.length)
      params.set("discount", selectedDiscounts.map((d) => d.name).join(","));
    if (selectedLabels.length)
      params.set("label", selectedLabels.map((l) => l.name).join(","));
    if (minPrice !== 500) params.set("min", minPrice);
    if (maxPrice !== 5000) params.set("max", maxPrice);
    const newUrl = `/shop${params.toString() ? `?${params.toString()}` : ""}`;
    const currentUrl = location.pathname + location.search;
    if (newUrl !== currentUrl) {
      navigate(newUrl, { replace: true });
    }
    setTimeout(() => {
      isUpdatingFromState.current = false;
    }, 0);
  }, [
    selectedCategories,
    selectedBrands,
    selectedTypes,
    selectedDiscounts,
    selectedLabels,
    minPrice,
    maxPrice,
  ]);
  const currentFilters = useMemo(() => {
    const arr = [
      ...selectedCategories.map((v) => ({
        type: "category",
        value: v,
        label: subcategories.find((c) => c._id === v)?.name || v,
      })),

      ...selectedBrands.map((v) => ({ type: "brand", value: v, label: v })),
      ...selectedTypes.map((v) => ({ type: "type", value: v, label: v })),
      ...selectedDiscounts.map((d) => ({
        type: "discount",
        value: d.id,
        label: d.name,
      })),
      ...selectedLabels.map((l) => ({
        type: "label",
        value: l.id,
        label: l.name,
      })),
    ];
    if (minPrice !== 500 || maxPrice !== 5000) {
      arr.push({
        type: "price",
        value: "price",
        label: `Rs ${minPrice} - Rs ${maxPrice}`,
      });
    }
    return arr;
  }, [
    selectedCategories,
    selectedBrands,
    selectedTypes,
    selectedDiscounts,
    selectedLabels,
    minPrice,
    maxPrice,
  ]);
  const productBrandNames = (p) =>
    (p?.variants || []).flatMap((v) => {
      const brand = v?.brand || v?.brands || v?.brand_id;
      if (!brand) return [];
      if (Array.isArray(brand)) return brand.map((b) => b?.name || b);
      if (typeof brand === "object") return [brand?.name].filter(Boolean);
      return [String(brand)];
    });

  const productTypeNames = (p) =>
    (p?.variants || []).flatMap((v) => {
      const t = v?.type || v?.types;
      if (!t) return [];
      if (Array.isArray(t)) return t.map((x) => x?.name || x);
      if (typeof t === "object") return [t?.name].filter(Boolean);
      return [String(t)];
    });

  const matchesFilters = (p) => {
    if (isBestSeller) {
      const hasBestSeller = (p?.variants || []).some(
        (v) => v.is_best_seller === true,
      );
      if (!hasBestSeller) return false;
    }

    if (selectedCategories.length > 0) {
      const productCategoryIds = Array.isArray(p.category_id)
        ? p.category_id.map(String)
        : [String(p.category_id)];

      const hasMatch = selectedCategories.some((catId) =>
        productCategoryIds.includes(String(catId)),
      );

      if (!hasMatch) return false;
    }

    if (selectedBrands.length > 0) {
      const brands = productBrandNames(p);
      if (!selectedBrands.some((b) => brands.includes(b))) return false;
    }

    if (selectedTypes.length > 0) {
      const types = productTypeNames(p);
      if (!selectedTypes.some((t) => types.includes(t))) return false;
    }

    if (selectedDiscounts.length > 0) {
      const productDiscId = String(
        p?.discount_id?._id || p?.discount_id || p?.discount || "",
      );
      if (!selectedDiscounts.some((d) => d.id === productDiscId)) return false;
    }
    if (selectedLabels.length > 0) {
      const productLabelIds = (p?.variants || [])
        .flatMap((v) => v?.labels || [])
        .map((l) => String(typeof l === "object" ? l?._id || l : l));
      if (!selectedLabels.some((l) => productLabelIds.includes(l.id)))
        return false;
    }
    const priceCandidates = [
      p?.price,
      p?.selling_price,
      p?.variants?.[0]?.price,
      p?.variants?.[0]?.selling_price,
      p?.variants?.[0]?.mrp,
    ].filter(Boolean);
    const price = priceCandidates.length ? Number(priceCandidates[0]) : null;
    if (price != null && (price < minPrice || price > maxPrice)) return false;
    return true;
  };
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p) => {
      const productName = p?.name || p?.title || p?.variants?.[0]?.name || "";
      const matchesSearch =
        !searchQuery ||
        productName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilters(p) && matchesSearch;
    });
  }, [
    products,
    selectedCategories,
    selectedBrands,
    selectedTypes,
    selectedDiscounts,
    selectedLabels,
    isBestSeller,
    minPrice,
    maxPrice,
    searchQuery,
  ]);
  const sortComparators = {
    popularity: (a, b) => {
      const pa = (a?.variants || []).reduce(
        (s, v) => s + (v.popularity || v.rank || 0),
        0,
      );
      const pb = (b?.variants || []).reduce(
        (s, v) => s + (v.popularity || v.rank || 0),
        0,
      );
      return pb - pa;
    },
    latest: (a, b) => {
      const ta = new Date(a?.createdAt || a?.updatedAt || 0).getTime() || 0;
      const tb = new Date(b?.createdAt || b?.updatedAt || 0).getTime() || 0;
      return tb - ta;
    },
    price_asc: (a, b) => {
      const getPrice = (p) => {
        const c = [
          p?.selling_price,
          p?.price,
          p?.variants?.[0]?.selling_price,
          p?.variants?.[0]?.price,
          p?.variants?.[0]?.mrp,
        ].filter(Boolean);
        return c.length ? Number(c[0]) : Infinity;
      };
      return getPrice(a) - getPrice(b);
    },
    price_desc: (a, b) => {
      const getPrice = (p) => {
        const c = [
          p?.selling_price,
          p?.price,
          p?.variants?.[0]?.selling_price,
          p?.variants?.[0]?.price,
          p?.variants?.[0]?.mrp,
        ].filter(Boolean);
        return c.length ? Number(c[0]) : -Infinity;
      };
      return getPrice(b) - getPrice(a);
    },
    rating: (a, b) =>
      Number(b?.rating || b?.average_rating || 0) -
      Number(a?.rating || a?.average_rating || 0),
    discounts: (a, b) =>
      (b?.discount_percent || 0) - (a?.discount_percent || 0),
  };

  const sortedProducts = useMemo(() => {
    if (!Array.isArray(filteredProducts)) return [];
    const arr = [...filteredProducts];
    const comparator =
      sortComparators[currentSortValue] || sortComparators.popularity;
    try {
      arr.sort(comparator);
    } catch (err) {
      console.warn("Sort failed:", err);
    }
    return arr;
  }, [filteredProducts, currentSortValue]);
  const filterCount = currentFilters.length;
  const trendingProducts = sortedProducts.filter((p) =>
    (p.variants || []).some((v) => v.is_trending),
  );
  const showingResults = filteredProducts.length;
  return (
    <>
      <Section>
        <Row>
          <MobileFilterModal
            isOpen={isMobileFilterOpen}
            onClose={() => setIsMobileFilterOpen(false)}
            selectedCategories={selectedCategories}
            handleCategoryChange={handleCategoryChange}
            handleResetCategories={() => setSelectedCategories([])}
            selectedBrands={selectedBrands}
            handleBrandChange={handleBrandChange}
            handleResetBrands={() => setSelectedBrands([])}
            selectedTypes={selectedTypes}
            handleTypeChange={handleTypeChange}
            handleResetTypes={() => setSelectedTypes([])}
            selectedLabels={selectedLabels}
            handleLabelChange={handleLabelChange}
            handleResetLabels={() => setSelectedLabels([])}
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            applyAllFilters={() => setIsMobileFilterOpen(false)}
            onClearAll={handleClearAllFilters}
          />
          <div className="flex justify-between items-center py-2 mb-4 lg:hidden">
            <div className="w-full">
              <div className="flex items-center py-2 space-x-2">
                <div className="flex-1 mx-3 relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search here.."
                    className="w-full h-11 bg-white border border-white rounded-[3px] pl-10 pr-4 text-sm font-regular focus:outline-none shadow-[0_0_4px_rgba(0,0,0,0.25)]"
                  />
                  <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
          <div className="mb-3 lg:hidden">
            <MobileFilterBar
              sortBy={currentSortLabel}
              filterCount={filterCount}
              onSortClick={() => setIsSortByOpen(true)}
              onFilterClick={() => setIsMobileFilterOpen(true)}
            />
            <SortByPage
              isOpen={isSortByOpen}
              onClose={() => setIsSortByOpen(false)}
              selectedSort={currentSortValue}
              onSelectSort={(value, label) => {
                setCurrentSortValue(value);
                setCurrentSortLabel(label);
                setIsSortByOpen(false);
              }}
            />
          </div>
          <div className="flex flex-col lg:flex-row gap-[30px]">
            <DesktopFilters
              products={products}
              selectedCategories={selectedCategories}
              handleCategoryChange={handleCategoryChange}
              handleResetCategories={() => setSelectedCategories([])}
              selectedBrands={selectedBrands}
              handleBrandChange={handleBrandChange}
              handleResetBrands={() => setSelectedBrands([])}
              selectedTypes={selectedTypes}
              handleTypeChange={handleTypeChange}
              handleResetTypes={() => setSelectedTypes([])}
              selectedLabels={selectedLabels}
              handleLabelChange={handleLabelChange}
              handleResetLabels={() => setSelectedLabels([])}
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              isCategorySelected={selectedCategories.length > 0}
            />
            <main className="w-full lg:w-3/4">
              <div className="hidden lg:block w-full">
                <div className="flex items-center py-2 space-x-2">
                  <div className="flex-1 mx-3 relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search here.."
                      className="w-full h-11 bg-white border border-white rounded-[3px] pl-10 pr-4 text-sm font-regular focus:outline-none shadow-[0_0_4px_rgba(0,0,0,0.25)]"
                    />
                    <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-6">
                <div className="hidden lg:block text-[16px] sec-text-color">
                  Showing{" "}
                  <span className="font-medium text-black">
                    {showingResults}
                  </span>{" "}
                  results for "
                  <span className="font-medium text-black">
                    {selectedCategories.length > 0
                      ? selectedCategories
                          .map(
                            (id) =>
                              subcategories.find((c) => c._id === id)?.name,
                          )
                          .filter(Boolean)
                          .join(", ")
                      : "Products"}
                  </span>
                  "
                </div>
                <div className="hidden lg:flex justify-end">
                  <DesktopSortBar
                    sortBy={currentSortValue}
                    setSortBy={setCurrentSortValue}
                  />
                </div>
              </div>
              <div className="hidden sm:flex flex-wrap items-center gap-2 mb-6">
                {currentFilters.length > 0 || isBestSeller ? (
                  <>
                    <span
                      onClick={handleClearAllFilters}
                      className="text-[16px] font-medium text-[#989696] mr-2 border-b border-[#989696] cursor-pointer"
                    >
                      Clear Filters:
                    </span>
                    {isBestSeller && (
                      <span
                        className="theme-border min-w-[110px] text-theme border px-[10px] py-[5px] rounded-[10px] cursor-pointer flex items-center justify-between"
                        onClick={() => setIsBestSeller(false)}
                      >
                        Best Sellers
                        <X className="w-4 h-4 ml-2 text-theme" />
                      </span>
                    )}
                    {currentFilters.map((filter, idx) => (
                      <span
                        key={idx}
                        className="theme-border min-w-[110px] text-theme border px-[10px] py-[5px] rounded-[10px] cursor-pointer flex items-center justify-between"
                        onClick={() => {
                          const { type, value } = filter;
                          if (type === "category")
                            setSelectedCategories((p) =>
                              p.filter((x) => x !== value),
                            );
                          if (type === "brand")
                            setSelectedBrands((p) =>
                              p.filter((x) => x !== value),
                            );
                          if (type === "type")
                            setSelectedTypes((p) =>
                              p.filter((x) => x !== value),
                            );
                          if (type === "label")
                            setSelectedLabels((p) =>
                              p.filter((l) => l.id !== value),
                            );
                          if (type === "price") {
                            setMinPrice(500);
                            setMaxPrice(5000);
                          }
                        }}
                      >
                        {filter.label}
                        <X className="w-4 h-4 ml-2 text-theme" />
                      </span>
                    ))}
                  </>
                ) : null}
              </div>

              <ProductGrid
                products={sortedProducts}
                loading={loading}
                setShowLoginPopup={setShowLoginPopup}
              />
            </main>
          </div>
        </Row>
      </Section>
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-md rounded-md overflow-hidden">
            <LoginForm
              onClose={() => setShowLoginPopup(false)}
              onSwitch={() => setShowLoginPopup(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}

export {
  CollapsibleFilter,
  FilterItemCheckbox,
  SizeFilterItem,
  PriceRangeFilter,
};
