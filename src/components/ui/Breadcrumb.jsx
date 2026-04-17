import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import { fetchProducts } from "../../features/products/productsThunk";

export default function Breadcrumb() {
  const { productSlug } = useParams();
  const dispatch = useDispatch();

  const { product, loading } = useSelector((state) => state.products);

  useEffect(() => {
    if (productSlug) {
      dispatch(fetchProducts(productSlug));
    }
  }, [dispatch, productSlug]);

  if (loading) return <p>Loading...</p>;
  if (!product) return null;

  const categoryName = product?.category_id?.name || "Category";
  const productName = product?.name || "Product";

  return (
    <nav className="text-p text-black mb-[30px] custom-lg:mb-[50px]">
      <ol className="flex items-center">
        <li>
          <Link to="/">Home</Link>
        </li>

        <span className="mx-2">/</span>

        <li>
          <Link
            to={`/shop?category=${encodeURIComponent(categoryName)}`}
            className="capitalize"
          >
            {categoryName}
          </Link>
        </li>

        <span className="mx-2">/</span>

        <li className="capitalize text-gray-600 line-clamp-1">{productName}</li>
      </ol>
    </nav>
  );
}
