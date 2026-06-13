import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchProductById,
  fetchProducts,
} from "../features/products/productsThunk";
import { fetchProductReviews } from "../features/reivews/reviewsThunk";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import Breadcrumb from "../components/ui/Breadcrumb";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductTabs from "../components/product/ProductTabs";
import SimilarProducts from "../components/product/SimilarProducts";
import CustomerAlsoViewed from "../components/product/CustomerAlsoViewed";
import { addRecentlyViewed } from "../components/utils/recentlyViewed";
import LoginForm from "./Login";
import Heading from "../components/ui/Heading";
import NavBtn from "../components/ui/Navbtn";
import ReviewCard from "../components/reviews/reviewscard";
import SEO from "../components/seo/seo";
import Loding from "../components/loding/loding";
import { getImageUrl } from "../components/utils/helper";
import { Handbag, HeartIcon } from "lucide-react";
import ProductSections, {
  SectionRenderer,
} from "../components/product/ProductSections";
import Productreviews from "../components/product/productreviews";
import { fetchProductLabels } from "../features/productLabels/productlabelsThunk";

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, products, loading, error } = useSelector(
    (state) => state.products,
  );
  const { productReviews } = useSelector((state) => state.reviews);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [offset, setOffset] = useState(0);
  const productReviewData = productReviews?.[product?._id];
  const allReviews = productReviewData?.reviews || [];
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [priceData, setPriceData] = useState({});

  const [selectedPack, setSelectedPack] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [handleAddToCartFn, setHandleAddToCartFn] = useState(null);
  const [handleAddToWishlistFn, setHandleAddToWishlistFn] = useState(null);

  const { productLabels = [] } = useSelector((state) => state.productLabels);

  const getVisible = () => {
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  };

  const [visible, setVisible] = useState(getVisible());

  const CARD_W = visible === 1 ? 280 : visible === 2 ? 320 : 425;
  const GAP = visible === 1 ? 20 : visible === 2 ? 30 : 55;
  const STEP = CARD_W + GAP;

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchProductLabels({ status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    if (product && product._id) {
      addRecentlyViewed(product);
      dispatch(
        fetchProductReviews({ productId: product._id, page: 1, limit: 50 }),
      );
    }
  }, [product?._id, dispatch]);

  useEffect(() => {
    const handleResize = () => {
      setVisible(getVisible());
      setOffset(0);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxOffset = Math.max(0, allReviews.length - visible);
  const prev = () => setOffset((o) => Math.max(0, o - 1));
  const next = () => setOffset((o) => Math.min(maxOffset, o + 1));
  const isCenter = allReviews.length <= visible;

  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!product) return <Loding />;

  const otherRecommendedSection = product?.sections?.find(
    (section) =>
      section.type === "Other Recommended Solutions" &&
      section?.data?.status === true,
  );

  const remainingSections = product?.sections?.filter(
    (section) => section.type !== "Other Recommended Solutions",
  );

  return (
    <>
      <SEO title={product?.name} description={product?.description} />
      <Section>
        <Row>
          <Breadcrumb />
        </Row>
        <Row className="grid grid-cols-1 lg:grid-cols-[48%_52%] gap-[40px] items-start">
          <div className="lg:sticky lg:top-[100px] self-start h-fit">
            <ProductGallery
              product={product}
              activeVariant={selectedVariant}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
            />
          </div>
          <div className="min-w-0">
            <ProductInfo
              product={product}
              setSelectedVariant={setSelectedVariant}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              setShowLoginPopup={setShowLoginPopup}
              setShowStickyBar={setShowStickyBar}
              setPriceData={setPriceData}
              setSelectedPack={setSelectedPack}
              setActiveVariant={setActiveVariant}
              setAddingToCart={setAddingToCart}
              setHandleAddToCartFn={setHandleAddToCartFn}
              setHandleAddToWishlistFn={setHandleAddToWishlistFn}
            />

            <div className="border-dashed border-b-[2px] light-border my-5"></div>

            <ProductTabs product={product} selectedVariant={selectedVariant} />
          </div>
        </Row>
      </Section>

      {otherRecommendedSection?.data?.status === true && (
        <SectionRenderer
          section={otherRecommendedSection}
          setShowLoginPopup={setShowLoginPopup}
        />
      )}

      <SimilarProducts
        product={product}
        products={products}
        setShowLoginPopup={setShowLoginPopup}
        productLabels={productLabels}
      />

      <ProductSections
        sections={remainingSections}
        setShowLoginPopup={setShowLoginPopup}
        productLabels={productLabels}
      />

      {allReviews.length > 0 && (
        <Section className="bg-[var(--ef3a96-9)] py-20">
          <Row>
            <Heading title={"What Our Customer Says!"} />

            {!isCenter && (
              <div className="flex items-center justify-end gap-3 mb-4">
                <NavBtn direction="left" onClick={prev} variant="primary" />
                <NavBtn direction="right" onClick={next} variant="primary" />
              </div>
            )}

            <div className="overflow-hidden w-full">
              <div
                className={`flex transition-transform duration-500 ease-in-out pt-10 ${
                  isCenter ? "justify-center" : "justify-start"
                }`}
                style={{
                  gap: `${GAP}px`,
                  transform: isCenter
                    ? "none"
                    : `translateX(-${offset * STEP}px)`,
                }}
              >
                {allReviews.map((review, i) => (
                  <div
                    key={review._id}
                    className="flex-shrink-0"
                    style={{ width: `${CARD_W}px` }}
                  >
                    <ReviewCard review={review} index={i} />
                  </div>
                ))}
              </div>
            </div>
          </Row>
        </Section>
      )}

      <Productreviews
        productId={product?._id}
        setShowLoginPopup={setShowLoginPopup}
      />

      <CustomerAlsoViewed
        products={products}
        currentProductId={product?._id}
        productLabels={productLabels}
      />

      {showStickyBar && (
        <div className="fixed  bottom-0 left-0 right-0 z-[10] bg-white border-t shadow-xl">
          <div className="hidden lg:flex w-[90%] md:w-[90%] lg:max-w-[1440px] mx-auto items-center justify-between px-6 py-3">
            <div className="flex items-center gap-4 min-w-0">
              <img
                src={getImageUrl(product?.images)}
                alt={product?.name}
                className="w-[60px] h-[60px] object-cover rounded"
              />

              <div className="min-w-0">
                <h4 className="font-semibold text-[16px] truncate max-w-[300px]">
                  {product?.name}
                </h4>

                <div className="flex items-center gap-2">
                  <span className="text-[28px] font-bold">
                    ₹{priceData.offerPrice}
                  </span>

                  {priceData.discountPercent > 0 && (
                    <span className="line-through text-gray-400">
                      ₹{priceData.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  handleAddToWishlistFn?.(product, selectedVariant)
                }
                className="px-8 h-[55px] border flex justify-center items-center gap-2 rounded-lg font-semibold"
              >
                <HeartIcon className="h-[22px] w-[22px]" />
                Wishlist
              </button>

              <button
                onClick={() => {
                  console.log("sticky add to cart");
                  handleAddToCartFn?.();
                }}
                disabled={addingToCart}
                className="px-10 h-[55px] flex gap-2 justify-center items-center rounded-lg bg-[var(--theme-color)] text-white font-semibold"
              >
                <Handbag size={22} />
                {addingToCart ? "Adding..." : "Add To Cart"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 h-[60px] lg:hidden">
            <button
              onClick={() => handleAddToWishlistFn?.(product, activeVariant)}
              className="flex items-center justify-center gap-2 border-r font-semibold bg-white"
            >
              <HeartIcon className="h-[22px] w-[22px]" />
              Wishlist
            </button>

            <button
              onClick={() => {
                handleAddToCartFn?.();
              }}
              disabled={addingToCart}
              className="flex items-center justify-center gap-2 bg-[var(--theme-color)] text-white font-semibold"
            >
              <Handbag size={22} />
              {addingToCart ? "Adding..." : "Add To Cart"}
            </button>
          </div>
        </div>
      )}

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
