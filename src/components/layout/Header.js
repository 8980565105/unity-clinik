import { useEffect, useState, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { faHeart as farHeart } from "@fortawesome/free-regular-svg-icons";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Menu,
  Package,
  Search,
  User,
  XCircleIcon,
} from "lucide-react";
import ShopIcon from "../icons/shop";
import HeaderLogo from "../../assets/logo.webp";
import WhiteLogin from "../../assets/white login.webp";
import SvgComponent from "../icons/login";
import { useDispatch, useSelector } from "react-redux";
import { fetchNavbar } from "../../features/navbar/navbarThunk";
import { logout } from "../../features/auth/authSlice";
import Button from "../ui/Button";
import Row from "../ui/Row";
import LoginForm from "../../pages/Login";
import RegistrationForm from "../../pages/RegistrationForm";
import { clearCart } from "../../features/cart/cartSlice";
import useProtectedLink from "../../hooks/useProtectedLink";
import { clearOrders } from "../../features/orders/orderSlice";
import { getImageUrl } from "../utils/helper";
import { fetchCategories } from "../../features/categories/categoriesThunk";
import { fetchsubCategories } from "../../features/subcategories/subcategoriesThunk";
import ForgetForm from "../../pages/ForgetForm";
import toast from "react-hot-toast";
import { fetchProducts } from "../../features/products/productsThunk";

const STATIC_CATEGORIES = [];

const FIXED_NAV_ITEMS = [
  {
    name: "Home",
    path: "/home",
    icon: <ShopIcon className="w-5 h-6 hidden custom-lg:block" />,
  },
  {
    name: "All Products",
    path: "/allproducts",
    icon: (
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
    ),
    hasDropdown: true,
    isMegaMenu: true,
    dropdownIcon: <ChevronDown className="w-4 h-4 ml-1 inline-block" />,
  },
];

const FALLBACK_EXTRA_ITEMS = [];

const SKIP_LABELS = ["home", "allproducts"];

function SearchBar({ products, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filtered =
    query.trim().length > 0
      ? (products || [])
          .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 8)
      : [];

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleOpen = () => setIsOpen(true);

  const handleSelect = ({ _id }) => {
    setIsOpen(false);
    setQuery("");

    onNavigate(`/products/${_id}`);
  };
  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${process.env.REACT_APP_API_URL_IMAGE}${url}`;
  };

  const getPrice = (product) => {
    const variant = product.variants?.[0];
    return variant?.offerprice || variant?.price || null;
  };

  const getOriginalPrice = (product) => {
    const variant = product.variants?.[0];
    if (
      variant?.offerprice &&
      variant?.price &&
      variant.offerprice < variant.price
    ) {
      return variant.price;
    }
    return null;
  };

  const getProductImage = (product) => {
    if (product.images) return getImageUrl(product.images);
    const variantImg = product.variants?.[0]?.images?.[0];
    if (variantImg) return getImageUrl(variantImg);
    return null;
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleOpen}
        aria-label="search"
        className="flex items-center justify-center"
      >
        <Search size={22} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
            onClick={() => {
              setIsOpen(false);
              setQuery("");
            }}
          />

          <div
            className="
              fixed md:absolute
              top-0 md:top-auto
              left-0 md:left-auto
              right-0
              md:right-0
              md:top-12
              w-full md:w-[420px]
              bg-white
              md:rounded-xl
              z-50
              shadow-2xl
              border-0 md:border border-gray-200
              overflow-hidden
            "
            style={{ top: window.innerWidth < 768 ? 0 : undefined }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
              <Search size={18} className="text-gray-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="flex-1 outline-none text-[15px] text-gray-800 placeholder-gray-400 bg-transparent"
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setIsOpen(false);
                    setQuery("");
                  }
                }}
              />
              <button
                onClick={() => {
                  setIsOpen(false);
                  setQuery("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <XCircleIcon size={20} />
              </button>
            </div>

            <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto">
              {query.trim().length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  Start typing to search products...
                </div>
              )}

              {query.trim().length > 0 && filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  No products found for "
                  <span className="font-medium text-gray-600">{query}</span>"
                </div>
              )}

              {filtered.map((product) => {
                const img = getProductImage(product);
                const price = getPrice(product);
                const originalPrice = getOriginalPrice(product);

                return (
                  <button
                    key={product._id}
                    onClick={() => handleSelect(product)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 text-left"
                  >
                    <div className="w-[48px] h-[48px] rounded-lg overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50">
                      {img ? (
                        <img
                          src={img}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Search size={16} />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-gray-800 line-clamp-1 leading-snug">
                        {product.name}
                      </p>
                      {price && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[13px] font-semibold text-primary">
                            ₹{price}
                          </span>
                          {originalPrice && (
                            <span className="text-[12px] text-gray-400 line-through">
                              ₹{originalPrice}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <ChevronRight
                      size={16}
                      className="text-gray-300 flex-shrink-0"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const Header = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items: categories, loading } = useSelector(
    (state) => state.categories,
  );
  const { items: subCategoriesItems } = useSelector(
    (state) => state.subcategories,
  );
  const { products } = useSelector((state) => state.products);

  const displayCategories =
    !loading && categories?.length > 0 ? categories : STATIC_CATEGORIES;

  const parentCategories = displayCategories.filter((cat) => !cat.parent_id);

  const getSubCategories = (parentId) => {
    return subCategoriesItems.filter(
      (cat) => cat.parent_id?._id === parentId || cat.parent_id === parentId,
    );
  };

  const [activeParent, setActiveParent] = useState(null);
  const { navbars = [] } = useSelector((state) => state.navbar);
  const { token, user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isForgetOpen, setIsForgetOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const isWishlistActive = location.pathname === "/wishlist";
  const isCartActive = location.pathname === "/cart";
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isAllProductsOpen, setIsAllProductsOpen] = useState(false);
  const [isMobileMegaMenuOpen, setIsMobileMegaMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const { items = [] } = useSelector((state) => state.cart);
  const wishlist = useSelector((state) => state.wishlist.items);
  const { info: storeInfo } = useSelector((state) => state.store);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist?.length || 0;
  const [megaMenuPage, setMegaMenuPage] = useState(1);
  const [mobileMenuPage, setMobileMenuPage] = useState(1);
  const isShopActive = location.pathname === "/allproducts";
  const [activeCategory, setActiveCategory] = useState(null);
  const [activeSubCategory, setActiveSubCategory] = useState(null);

  useEffect(() => {
    if (isMegaMenuOpen && parentCategories.length > 0 && !activeParent) {
      setActiveParent(parentCategories[0]._id);
    }
  }, [isMegaMenuOpen, parentCategories]);
  useEffect(() => {
    if (parentCategories.length > 0 && !activeParent) {
      setActiveParent(parentCategories[0]._id);
    }
  }, [parentCategories]);
  const handleParentChange = (parentId) => {
    setActiveParent(parentId);
    setMegaMenuPage(1);
    setMobileMenuPage(1);
  };
  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchNavbar({ status: "active" }));
    dispatch(fetchCategories());
    dispatch(fetchsubCategories());
  }, [dispatch]);

  const handleShopMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsMegaMenuOpen(true);
  };

  const handleShopMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  const handleMegaMenuMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleMegaMenuMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
    }, 200);
  };

  const handleAllProductsEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsAllProductsOpen(true);
  };

  const handleAllProductsLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsAllProductsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const dynamicItems = navbars
    .filter(
      (item) =>
        item.status === "active" &&
        !SKIP_LABELS.includes(item.label?.toLowerCase().trim()),
    )
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      name: item.label,
      path: item.url,
      icon: item.icon ? (
        <img
          src={`${process.env.REACT_APP_API_URL_IMAGE}${item.icon}`}
          alt={item.label | "label"}
          className="w-5 h-5 object-contain"
        />
      ) : null,
    }));

  const navItems = [
    ...FIXED_NAV_ITEMS,
    ...(dynamicItems.length > 0 ? dynamicItems : FALLBACK_EXTRA_ITEMS),
  ];

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    dispatch(clearOrders());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("recently_viewed_products");
    navigate("/");
    toast.success("Logged out successfully!");
  };

  const openProtectedLink = useProtectedLink(setIsLoginOpen, token);

  const BASE = process.env.REACT_APP_API_URL_IMAGE;

  const dynamicLogoUrl = (() => {
    const logoPath = storeInfo?.theme?.logoUrl;
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    return `${BASE}${logoPath}`;
  })();

  const openWhatsApp = () => {
    const phone = "919327148908";

    const message = encodeURIComponent("Hi, I want consultation");

    window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
  };

  const filteredSubCategories = activeCategory
    ? subCategoriesItems.filter(
        (sub) =>
          sub.parent_id?._id === activeCategory ||
          sub.parent_id === activeCategory,
      )
    : subCategoriesItems;

  const filteredProducts = (() => {
    if (activeSubCategory) {
      return products.filter((product) =>
        (product.category_id || []).some(
          (cat) =>
            String(typeof cat === "object" ? cat._id : cat) ===
            String(activeSubCategory),
        ),
      );
    }

    if (activeCategory) {
      const subCategoryIds = subCategoriesItems
        .filter(
          (sub) =>
            sub.parent_id?._id === activeCategory ||
            sub.parent_id === activeCategory,
        )
        .map((sub) => String(sub._id));

      return products.filter((product) =>
        (product.category_id || []).some((cat) =>
          subCategoryIds.includes(
            String(typeof cat === "object" ? cat._id : cat),
          ),
        ),
      );
    }

    return products;
  })();

  return (
    <header className="w-full bg-secondary sticky top-0 z-50 shadow-[0_3px_15px_primary border-b border-gray-100 p-2">
      <Row className="flex items-center justify-between gap-[10px]">
        <button
          className="custom-lg:hidden text-black transition-colors duration-300 border rounded-[3px] p-[5px]"
          onClick={() => setIsMenuOpen(true)}
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center">
          <Link to="/">
            <img
              src={dynamicLogoUrl || HeaderLogo}
              alt="Logo"
              className="h-auto w-[120px] md:w-[150px] lg:w-[200px]"
            />
          </Link>
        </div>

        <div className="hidden custom-lg:flex items-center gap-6">
          <nav>
            <ul className="flex gap-[24px] xl:gap-[32px] text-base font-normal">
              {navItems.map((item, i) => (
                <li
                  // key={i}
                  key={`nav-${item.path}-${i}`}
                  className="relative"
                  onMouseEnter={
                    item.isMegaMenu
                      ? handleShopMouseEnter
                      : item.isAllproducts
                        ? handleAllProductsEnter
                        : undefined
                  }
                  onMouseLeave={
                    item.isMegaMenu
                      ? handleShopMouseLeave
                      : item.isAllproducts
                        ? handleAllProductsLeave
                        : undefined
                  }
                >
                  {item.isMegaMenu ? (
                    <>
                      <Link
                        to={item.path}
                        className={`relative cursor-pointer transition-all duration-300 pb-[10px] flex items-center text-[18px]
                          ${
                            isShopActive
                              ? "text-primary font-medium after:opacity-100"
                              : "text-black hover:text-primary after:opacity-0 hover:after:opacity-100"
                          }
                          after:content-['•••'] after:absolute after:left-[52%] after:-bottom-[4px]
                        after:-translate-x-1/2 after:text-[20px] after:tracking-[3px]
                        after:font-bold after:text-primary
                        after:h-[14px] after:leading-[14px]
                        after:transition-opacity after:duration-300
                          `}
                      >
                        {item.name}
                        <ChevronDown
                          className={`w-4 h-4 ml-1 transition-transform duration-300 ${
                            isMegaMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </Link>

                      {isMegaMenuOpen && (
                        <div
                          className="fixed left-0 right-0 top-[74px] bg-white z-50 form-shadow min-h-[300px] max-w-[1400px] mx-auto w-full"
                          onMouseEnter={handleMegaMenuMouseEnter}
                          onMouseLeave={handleMegaMenuMouseLeave}
                        >
                          <div className="max-w-[1400px] mx-auto w-full flex h-[500px] pb-2 p-x-4">
                            <div className="w-[25%] border-r border-gray-200 overflow-y-auto hide-scrollbar">
                              <div className="p-2 sticky top-0 bg-white z-20">
                                <div className="flex justify-between border-b">
                                  <span>Categories</span>

                                  <button
                                    onClick={() => {
                                      navigate("/collections");
                                      setIsMegaMenuOpen(false);
                                    }}
                                    className="underline text-primary hover:text-gray-900"
                                  >
                                    View All
                                  </button>
                                </div>
                                <div className="flex w-full justify-end">
                                  <button
                                    onClick={() => {
                                      setActiveCategory(null);
                                      setActiveSubCategory(null);
                                    }}
                                    className="cursor-pointer text-red-500 hover:text-red-600 "
                                  >
                                    Reset
                                  </button>
                                </div>
                              </div>
                              <div className="flex flex-col p-3">
                                {categories.map((cat) => (
                                  <div
                                    key={cat._id}
                                    onClick={() => {
                                      setActiveCategory(cat._id);
                                      setActiveSubCategory(null);
                                    }}
                                    className={`
    relative
    flex
    items-center
    gap-3
    px-4
    py-3
    cursor-pointer
    transition-all
    duration-200
    mb-1

    ${
      activeCategory === cat._id
        ? "bg-gray-200 text-primary font-semibold rounded-l-md w-[260px]"
        : "text-gray-900 hover:bg-gray-200 hover:text-primary w-[260px] rounded-l-md"
    }
  `}
                                  >
                                    <img
                                      src={getImageUrl(cat.image_url)}
                                      alt={cat.name}
                                      className="w-10 h-10 rounded-md object-cover"
                                    />

                                    <span className="text-sm">{cat.name}</span>

                                    {activeCategory === cat._id && (
                                      <div
                                        className="
    absolute
    top-0
    right-[-20px]
    w-[20px]
    h-full
    bg-gray-200
  "
                                        style={{
                                          clipPath:
                                            "polygon(0 0,100% 50%,0 100%)",
                                        }}
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="w-[25%] border-r border-gray-200 overflow-y-auto hide-scrollbar">
                              <div className="p-2 sticky top-0 bg-white">
                                <div className="flex justify-between border-b">
                                  <span>Sub Categories</span>

                                  <button
                                    onClick={() => {
                                      navigate("/collections");
                                      setIsMegaMenuOpen(false);
                                    }}
                                    className="underline text-primary hover:text-gray-900"
                                  >
                                    View All
                                  </button>
                                </div>
                                <div className="flex w-full justify-end">
                                  <button
                                    onClick={() => {
                                      setActiveSubCategory(null);
                                    }}
                                    className="cursor-pointer text-red-500 hover:text-red-600 "
                                  >
                                    Reset
                                  </button>
                                </div>
                              </div>

                              {filteredSubCategories.map((sub) => (
                                <div
                                  key={sub._id}
                                  onClick={() => setActiveSubCategory(sub._id)}
                                  className={`
      relative
      flex
      items-center
      gap-3
      px-4
      py-3
      cursor-pointer
      transition-all
      duration-200
      mb-1
      mx-2
      ${
        activeSubCategory === sub._id
          ? "bg-gray-200 text-primary font-semibold rounded-l-md w-[300px] "
          : "text-gray-900 hover:bg-gray-200 hover:text-primary rounded-l-md w-[300px]"
      }
    `}
                                >
                                  <img
                                    src={getImageUrl(sub.image_url)}
                                    alt={sub.name}
                                    className="w-10 h-10 rounded-md object-cover"
                                  />

                                  <span className="text-sm">{sub.name}</span>

                                  {activeSubCategory === sub._id && (
                                    <div
                                      className="
          absolute
          top-0
          right-[-20px]
          w-[20px]
          h-full
          bg-gray-200
        "
                                      style={{
                                        clipPath:
                                          "polygon(0 0,100% 50%,0 100%)",
                                      }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="w-[50%] overflow-y-auto hide-scrollbar">
                              <div className="p-2 sticky top-0 bg-white">
                                <div className="flex justify-between border-b">
                                  <span>Products</span>

                                  <button
                                    onClick={() => {
                                      navigate("/allproducts");
                                    }}
                                    className="underline text-primary hover:text-gray-900"
                                  >
                                    View All
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-col">
                                {filteredProducts.map((product) => (
                                  <Link
                                    key={product._id}
                                    to={`/products/${product._id}`}
                                    className="flex items-center gap-3 px-4 py-2 group border-b"
                                  >
                                    <img
                                      src={getImageUrl(product.images)}
                                      alt={product.name}
                                      className="w-12 h-12 rounded object-cover flex-shrink-0"
                                    />

                                    <span
                                      className="
      text-sm
      text-gray-900
      transition-colors
      duration-200
      group-hover:text-primary
      line-clamp-2
    "
                                    >
                                      {product.name}
                                    </span>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `relative cursor-pointer transition-all duration-300 pb-[10px] text-[18px]
                        ${
                          isActive
                            ? "text-primary font-medium after:opacity-100"
                            : "text-black hover:text-primary after:opacity-0 hover:after:opacity-100"
                        }
                        after:content-['•••'] after:absolute after:left-[52%] after:-bottom-[4px]
                        after:-translate-x-1/2 after:text-[20px] after:tracking-[3px]
                        after:font-bold after:text-primary
                        after:h-[14px] after:leading-[14px]
                        after:transition-opacity after:duration-300`
                      }
                    >
                      {item.name}
                      {item.hasDropdown &&
                        !item.isMegaMenu &&
                        item.dropdownIcon}
                    </NavLink>
                  )}

                  {item.isAllproducts && isAllProductsOpen && (
                    <div
                      className="fixed left-0 right-0 top-[74px] bg-white z-50 form-shadow flex min-h-[300px] max-w-[1400px] mx-auto w-full"
                      onMouseEnter={handleAllProductsEnter}
                      onMouseLeave={handleAllProductsLeave}
                    >
                      <Row className="h-[400px] overflow-y-auto hide-scrollbar">
                        <div className="flex flex-wrap gap-5 mt-5 overflow-y-auto pb-4">
                          {products.map((product) => (
                            <Link
                              key={product._id}
                              to={`/products/${product._id}`}
                              onClick={() => setIsAllProductsOpen(false)}
                              className="flex-shrink-0 w-[180px] group"
                            >
                              <div className="border rounded-xl p-3 hover:shadow-lg transition">
                                <img
                                  src={getImageUrl(product.images)}
                                  alt={product.name}
                                  className="w-full h-[140px] object-cover rounded-lg"
                                />

                                <h4 className="mt-3 text-sm font-medium line-clamp-2 text-center h-[50px]">
                                  {product.name}
                                </h4>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </Row>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden custom-lg:block group">
            <Button
              variant="common"
              className="!min-w-[113px] !py-[10px] !px-[20px] flex items-center rounded-full"
              onClick={() => {
                if (!token) setIsLoginOpen(true);
              }}
            >
              <img src={WhiteLogin} alt="Login" className="w-5 h-5 mr-2" />
              {!token ? (
                <>
                  Login
                  <ChevronDown
                    size={16}
                    className="ml-1 transition-transform duration-300 group-hover:rotate-180"
                  />
                </>
              ) : (
                <>
                  <span className="inline-block  " title={user?.name || "User"}>
                    {user?.name || "User"}
                  </span>
                  <ChevronDown
                    size={16}
                    className="ml-1 transition-transform duration-300 group-hover:rotate-180"
                  />
                </>
              )}
            </Button>

            <div className="absolute right-0 mt-2 w-[280px] bg-white rounded-[10px] form-shadow z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="p-[17px] text-black flex justify-between border-b border-[#989696]">
                {!token ? (
                  <>
                    <span>Welcome User!</span>
                    <span
                      className="text-primary hover:text-[var(--theme-hover-color)] cursor-pointer font-18 font-medium"
                      onClick={() => setIsRegisterOpen(true)}
                    >
                      Sign Up
                    </span>
                  </>
                ) : (
                  <>
                    <span>Welcome {user?.name || "User"} !</span>
                    <span
                      className="text-primary hover:text-[var(--theme-hover-color)] cursor-pointer font-18 font-medium whitespace-nowrap"
                      onClick={handleLogout}
                    >
                      Sign Out
                    </span>
                  </>
                )}
              </div>
              <ul className=" pb-[10px]">
                <li className="text-black p-[17px]">
                  <button
                    onClick={() => openProtectedLink("/account-details")}
                    className="flex items-center gap-[15px] w-full"
                  >
                    <SvgComponent />
                    <span>My Profile</span>
                  </button>
                </li>
                <div className="border border-[#989696]"> </div>
                <li className="p-[17px]">
                  <button
                    onClick={() => openProtectedLink("/orders")}
                    className="flex items-center gap-[15px] w-full"
                  >
                    <Package size={18} />
                    <span>Orders</span>
                  </button>
                </li>
                <div className="border border-[#989696]"> </div>

                <li className="p-[17px]">
                  <button
                    onClick={() => navigate("/wishlist")}
                    className="flex items-center gap-[15px] w-full"
                  >
                    <FontAwesomeIcon icon={farHeart} />
                    <span>Wishlist</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-center items-center gap-2">
            <button className="" onClick={openWhatsApp} className="lg:hidden">
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 448 512"
                height="25"
                width="25"
                className="text-black"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
              </svg>
            </button>

            <SearchBar products={products} onNavigate={navigate} />

            {/* <button
              onClick={() => navigate("/wishlist")}
              aria-label="wishlist"
              className="relative text-black hidden md:block"
            >
             
              {isWishlistActive ? (
                <Heart size={22} className="text-primary fill-primary " />
              ) : (
                <Heart size={22} />
              )}
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-secondary text-[12px] rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button> */}
            <button
              onClick={() => openProtectedLink("/account-details")}
              aria-label="account"
              className="relative text-black md:hidden"
            >
              <User />
            </button>

            <button
              className={`relative ${
                isCartActive ? "text-primary" : "text-black"
              }`}
              aria-label="add to cart"
              onClick={() => navigate("/cart")}
            >
              <FontAwesomeIcon icon={faCartShopping} className="" size={22} />

              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-secondary text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </Row>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 w-3/4 max-w-[430px] h-screen bg-white box-shadow z-50 transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-white w-full absolute top-0 z-20 py-2 flex justify-between px-3">
          <div>
            <img src={HeaderLogo} alt="logo" className="h-[35px] w-[100px]" />
          </div>
          <button
            className=" bg-white  transition-colors text-light border rounded-[3px] p-[5px] border-[#D2AF9F]"
            onClick={() => setIsMenuOpen(false)}
          >
            <XCircleIcon size={22} />
          </button>
        </div>
        <div className="flex h-full flex-col overflow-y-auto no-scrollbar">
          <nav className="mt-12 pb-3">
            {navItems.map((item, i) => {
              const isOdd = i % 2 !== 0;

              if (item.isMegaMenu) {
                return (
                  <div key={i}>
                    <div
                      className={`flex items-center text-light w-full ${isOdd ? "light-color" : "bg-white"}`}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 py-4 px-4 flex-1"
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                      <button
                        onClick={() => setIsMobileMegaMenuOpen((prev) => !prev)}
                        className="py-4 px-4 border-l border-black"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-300 ${
                            isMobileMegaMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {item.isAllproducts && (
                        <button
                          onClick={() => setIsAllProductsOpen((prev) => !prev)}
                          className="py-4 px-4 border-l border-gray-100"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${
                              isAllProductsOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {isMobileMegaMenuOpen && (
                      <div className="bg-white">
                        <div className="flex flex-col w-full">
                          <div className="bg-gray-50 border-b border-gray-100">
                            <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Select Category
                            </p>
                            <div className="flex overflow-x-auto hide-scrollbar px-2 pb-2 gap-2">
                              {parentCategories.map((parent) => (
                                <button
                                  key={parent._id}
                                  onClick={() => {
                                    setActiveCategory(parent._id);
                                    setActiveSubCategory(null);
                                  }}
                                  className={`px-4 py-2 whitespace-nowrap rounded-full text-sm transition-all border ${
                                    activeCategory === parent._id
                                      ? "bg-[var(--theme-color)] text-white border-[var(--theme-color)] shadow-sm"
                                      : "bg-white text-gray-700 border-gray-200"
                                  }`}
                                >
                                  {parent.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="p-2 bg-white">
                            {activeCategory ? (
                              <div>
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-sm text-gray-400">
                                    Sub Categories
                                  </h3>
                                  <button
                                    onClick={() => {
                                      setIsMenuOpen(false);
                                      navigate("/collections");
                                    }}
                                    className="text-[var(--theme-color)] text-xs font-medium"
                                  >
                                    View All
                                  </button>
                                </div>

                                <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar snap-x">
                                  {filteredSubCategories.length > 0 ? (
                                    filteredSubCategories.map((sub) => (
                                      <div
                                        key={sub._id}
                                        className="flex-shrink-0 w-[100px] flex flex-col items-center cursor-pointer group snap-start"
                                        onClick={() => {
                                          setActiveSubCategory(sub._id);
                                        }}
                                      >
                                        <div className="w-[70px] h-[70px] rounded-full overflow-hidden border border-gray-100 group-hover:border-[var(--theme-color)] transition-all p-1">
                                          <img
                                            src={
                                              sub.isStatic
                                                ? sub.image_url
                                                : getImageUrl(sub.image_url)
                                            }
                                            alt={sub.name}
                                            className="w-full h-full object-cover rounded-full"
                                          />
                                        </div>
                                        <p className="mt-2 text-[12px] font-medium text-gray-700 text-center line-clamp-1">
                                          {sub.name}
                                        </p>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-400 py-4">
                                      No sub-categories found.
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6 text-gray-400 text-xs">
                                Select a category above to see items
                              </div>
                            )}
                          </div>

                          <div className="overflow-y-auto hide-scrollbar p-2 pt-0 h-[300px]">
                            <div className="flex justify-between items-center sticky bg-white top-0">
                              <h3 className="text-sm text-gray-400">
                                Products
                              </h3>

                              <button
                                onClick={() => {
                                  setIsMenuOpen(false);
                                  navigate("/allproducts");
                                }}
                                className="text-[var(--theme-color)] text-xs font-medium"
                              >
                                View All
                              </button>
                            </div>

                            <div className="flex flex-col">
                              {filteredProducts.map((product) => (
                                <Link
                                  key={product._id}
                                  to={`/products/${product._id}`}
                                  onClick={() => {
                                    setIsMenuOpen(false);
                                    setIsMobileMegaMenuOpen(false);
                                  }}
                                  className="
          flex
          items-center
          gap-3
          py-3
          border-b
          border-gray-200
        "
                                >
                                  <img
                                    src={getImageUrl(product.images)}
                                    alt={product.name}
                                    className="
            w-[45px]
            h-[45px]
            object-cover
            border
            border-gray-200
            flex-shrink-0
          "
                                  />

                                  <span
                                    className="
            text-sm
            text-gray-900
            line-clamp-2
          "
                                  >
                                    {product.name}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (item.isAllproducts) {
                return (
                  <div key={i}>
                    <div
                      className={`flex items-center text-light w-full ${
                        isOdd ? "light-color" : "bg-white"
                      }`}
                    >
                      <Link
                        to={item.path}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 py-4 px-4 flex-1"
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>

                      {item.isAllproducts && (
                        <button
                          onClick={() => setIsAllProductsOpen((prev) => !prev)}
                          className="py-4 px-4 border-l border-gray-100"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${
                              isAllProductsOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {item.isAllproducts && isAllProductsOpen && (
                      <div className="bg-white p-3">
                        <div className="flex flex-col overflow-y-auto pb-2">
                          {products.map((product) => (
                            <Link
                              key={product._id}
                              to={`/products/${product._id}`}
                              onClick={() => {
                                setIsAllProductsOpen(false);
                                setIsMenuOpen(false);
                              }}
                              className="flex-shrink-0 w-full border-b border-black py-2"
                            >
                              <div className="flex gap-2 items-center">
                                <div className="w-[50px] h-[50px]  overflow-hidden border border-gray-200">
                                  <img
                                    src={getImageUrl(product.images)}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                <p className="mt-2 w-full text-[12px] text-start line-clamp-2 font-medium">
                                  {product.name}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <NavLink
                  key={i}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 py-4 px-4 text-light ${isOdd ? "light-color" : "bg-white"}`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                  {/* <span className="ml-auto">
                    <ChevronRight className="w-4 h-4" />
                  </span> */}
                </NavLink>
              );
            })}
            <div className="text-light">
              <div className="py-4 px-4 cursor-pointer light-color">
                <button
                  onClick={() => openProtectedLink("/account-details")}
                  className="flex items-center gap-[15px]"
                >
                  <User /> My Profile
                </button>
              </div>
              <div className="py-4 px-4 cursor-pointer">
                <button
                  onClick={() => openProtectedLink("/orders")}
                  className="flex items-center gap-[15px]"
                >
                  <Package size={20} /> Orders
                </button>
              </div>
              <div className="py-4 px-4 cursor-pointer light-color">
                <button
                  onClick={() => navigate("/wishlist")}
                  className="flex items-center gap-[15px]"
                >
                  <FontAwesomeIcon icon={farHeart} /> Wishlist
                </button>
              </div>
            </div>
          </nav>

          <div className="flex justify-center gap-3 px-4 pb-5">
            {!token ? (
              <>
                <Button
                  variant="common"
                  onClick={() => {
                    setIsRegisterOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Up
                </Button>

                <Button
                  variant="common"
                  onClick={() => {
                    setIsLoginOpen(true);
                    setIsMenuOpen(false);
                  }}
                >
                  Login
                </Button>
              </>
            ) : (
              <Button
                variant="common"
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </div>
      {isLoginOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
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
    </header>
  );
};

export default Header;
