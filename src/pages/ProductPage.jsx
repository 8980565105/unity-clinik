import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchProductById,
  fetchProducts,
} from "../features/products/productsThunk";
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

export default function Product() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { product, products, loading, error } = useSelector(
    (state) => state.products,
  );
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

  const [showLoginPopup, setShowLoginPopup] = useState(false);

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
    }
  }, [product]);
  if (loading) return <p className="text-center py-10">Loading product...</p>;
  if (error) return <p className="text-center text-red-500 py-10">{error}</p>;
  if (!product) return <p className="text-center py-10">No Product Found.</p>;
  return (
    <>
      <Section>
        <Row>
          <Breadcrumb />
        </Row>
        <Row className="grid grid-cols-1 lg:grid-cols-2 gap-[30px]">
          <ProductGallery
            product={product}
            activeVariant={selectedVariant}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
          <div>
            <ProductInfo
              product={product}
              setSelectedVariant={setSelectedVariant}
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              setShowLoginPopup={setShowLoginPopup}
            />
          </div>
        </Row>
        <Row>
          <ProductTabs product={product} selectedVariant={selectedVariant} />
        </Row>
      </Section>
      <SimilarProducts
        product={product}
        products={products}
        setShowLoginPopup={setShowLoginPopup}
      />
      <CustomerAlsoViewed products={products} currentProductId={product?._id} />
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center px-4">
          <div className="relative bg-white w-full max-w-[1062px] rounded-md overflow-hidden">
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
