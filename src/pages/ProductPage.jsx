import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProductById } from "../features/products/productsThunk";
import { fetchProductReviews } from "../features/reivews/reviewsThunk";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import Breadcrumb from "../components/ui/Breadcrumb";
import ProductGallery from "../components/product/ProductGallery";
import ProductInfo from "../components/product/ProductInfo";
import ProductTabs from "../components/product/ProductTabs";
import { addRecentlyViewed } from "../components/utils/recentlyViewed";
import LoginForm from "./Login";
import SEO from "../components/seo/seo";
import Loding from "../components/loding/loding";
import { getImageUrl } from "../components/utils/helper";
import { Handbag } from "lucide-react";
import ProductSections, {
  SectionRenderer,
} from "../components/product/ProductSections";
import Productreviews from "../components/product/productreviews";
import { useNavigate } from "react-router-dom";
import BuyNowButton from "../components/product/BuyNowButton";
import Button from "../components/ui/Button";
const CustomerAlsoViewed = lazy(
  () => import("../components/product/CustomerAlsoViewed"),
);

const SimilarProducts = lazy(
  () => import("../components/product/SimilarProducts"),
);
export default function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, products, error } = useSelector((state) => state.products);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [priceData, setPriceData] = useState({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [handleAddToCartFn, setHandleAddToCartFn] = useState(null);
  const [handleAddToWishlistFn, setHandleAddToWishlistFn] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeVariantState, setActiveVariantState] = useState(null);
  const [selectedPackState, setSelectedPackState] = useState(null);

  useEffect(() => {
    if (id) dispatch(fetchProductById(id));
  }, [id, dispatch]);

  useEffect(() => {
    if (product && product._id) {
      addRecentlyViewed(product);
      dispatch(
        fetchProductReviews({ productId: product._id, page: 1, limit: 50 }),
      );
    }
  }, [product?._id, dispatch]);

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
        <Row className="grid grid-cols-1 lg:grid-cols-[48%_52%] gap-[5px] md:gap-[40px] items-start">
          <div className="lg:sticky lg:top-[100px] self-start h-fit z-[1]">
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
              setAddingToCart={setAddingToCart}
              setHandleAddToCartFn={setHandleAddToCartFn}
              setHandleAddToWishlistFn={setHandleAddToWishlistFn}
              setSelectedPack={setSelectedPackState}
              setActiveVariant={setActiveVariantState}
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
      
      <Suspense>
        <SimilarProducts product={product} products={products} />
      </Suspense>

      <ProductSections
        sections={remainingSections}
        setShowLoginPopup={setShowLoginPopup}
      />

      <Productreviews
        productId={product?._id}
        setShowLoginPopup={setShowLoginPopup}
      />
      <Suspense>
        <CustomerAlsoViewed
          products={products}
          currentProductId={product?._id}
        />
      </Suspense>
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

            <div className="flex items-center justify-center gap-3">
              <BuyNowButton
                product={product}
                activeVariantState={activeVariantState}
                selectedPackState={selectedPackState}
                setShowLoginPopup={setShowLoginPopup}
                className="!w-[200px]"
              />

              <Button
                variant="common"
                onClick={async () => {
                  // if (addedToCart) {
                  //   navigate("/cart");
                  //   return;
                  // }
                  await handleAddToCartFn?.();
                  setAddedToCart(true);
                }}
                disabled={addingToCart}
                className="px-10 !w-[400px] h-[55px] flex gap-2 justify-center items-center text-nowrap rounded-lg bg-[var(--theme-color)] text-white font-semibold"
              >
                <Handbag size={22} />
                {addingToCart
                  ? "Adding..."        
                : "Add To Cart"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 h-[60px] lg:hidden">
            <BuyNowButton
              product={product}
              activeVariantState={activeVariantState}
              selectedPackState={selectedPackState}
              setShowLoginPopup={setShowLoginPopup}
              className="!bg-black !text-white !rounded-[0px]"
            />

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
