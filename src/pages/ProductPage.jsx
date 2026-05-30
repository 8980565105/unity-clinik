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
import ProductGallery from "../components/productcard/ProductGallery";
import ProductInfo from "../components/productcard/ProductInfo";
import ProductTabs from "../components/productcard/ProductTabs";
import SimilarProducts from "../components/productcard/SimilarProducts";
import CustomerAlsoViewed from "../components/productcard/CustomerAlsoViewed";
import { fetchPages } from "../features/pages/pagesThunk";
import { addRecentlyViewed } from "../components/utils/recentlyViewed";
import LoginForm from "./Login";
import Heading from "../components/ui/Heading";
import NavBtn from "../components/ui/Navbtn";
import ReviewCard from "../components/reviews/reviewscard";
import ProductSections from "../components/productcard/ProductSections";
import SEO from "../components/seo/seo";
import Loding from "../components/loding/loding";

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
    dispatch(fetchPages());
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

  // if (loading) return <p className="text-center py-10">Loading product...</p>;
  if (loading) return <Loding />;

  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!product) return <p className="text-center py-10">No Product Found.</p>;

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
            />

            <div className="border-dashed border-b-[2px] light-border my-5"></div>

            <ProductTabs product={product} selectedVariant={selectedVariant} />
          </div>
        </Row>
      </Section>

      <SimilarProducts
        product={product}
        products={products}
        setShowLoginPopup={setShowLoginPopup}
      />
      <ProductSections sections={product?.sections} />

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

      <CustomerAlsoViewed
        pr
        oducts={products}
        currentProductId={product?._id}
      />

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
