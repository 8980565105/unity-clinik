import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Star, ThumbsUp, ThumbsDown, ArrowLeft } from "lucide-react";
import { fetchProductById } from "../features/products/productsThunk";
import { fetchProductReviews } from "../features/reivews/reviewsThunk";
import { getImageUrl } from "../components/utils/helper";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import SEO from "../components/seo/seo";

function Allreviews() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product } = useSelector((state) => state.products);
  const { productReviews } = useSelector((state) => state.reviews);
  const { pages, slugLoading } = useSelector((state) => state.pages);
  const allreviewsPage = pages?.find((page) => page.slug === "all-reviews");
  useEffect(() => {
    dispatch(fetchProductById(productId));
    dispatch(fetchPageBySlug("all-reviews"));
    dispatch(
      fetchProductReviews({
        productId,
        page: 1,
        limit: 1000,
      }),
    );
  }, [dispatch, productId]);
  const reviews = productReviews?.[productId]?.reviews || [];

  const firstVariant = product?.variants?.[0];

  const discountprice = firstVariant?.price
    ? Math.round(
        ((firstVariant.price - firstVariant.offerprice) / firstVariant.price) *
          100,
      )
    : 0;
  const stats = useMemo(() => {
    const total = reviews.length;
    const counts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };
    let totalRating = 0;
    reviews.forEach((r) => {
      counts[r.rating]++;
      totalRating += r.rating;
    });
    return {
      average: total ? (totalRating / total).toFixed(1) : 0,
      total,
      counts,
    };
  }, [reviews]);
  return (
    <>
      <SEO
        title={allreviewsPage?.meta_title}
        description={allreviewsPage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${allreviewsPage?.seo_image}`}
      />

      <div className="max-w-6xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-center text-5xl font-bold mb-10">All Reviews</h1>

        <div className="flex gap-6 items-center mb-10">
          <img
            src={getImageUrl(product?.images)}
            alt={product?.name}
            className="w-[120px] h-[120px] rounded-xl object-cover border"
          />

          <div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i <= Math.round(stats.average) ? "#FFC107" : "#E5E7EB"}
                  className="text-yellow-400"
                />
              ))}
            </div>

            <p className="text-sm text-gray-500">{stats.total} reviews</p>

            <h2 className="text-3xl font-bold">{product?.name}</h2>

            <div className="mt-2 flex items-center md:gap-3">
              <div className="flex items-center md:gap-3">
                <span className="text-3xl font-bold">
                  ₹{firstVariant?.offerprice || 0}
                </span>

                <span className="text-xl text-gray-400 line-through">
                  ₹{firstVariant?.price || 0}
                </span>
              </div>
              <span className="bg-green-500 rounded-full px-2 py-1">
                {" "}
                ₹{discountprice}% off
              </span>
            </div>
          </div>
        </div>

        <h2 className="text-4xl font-bold mb-10">Ratings & Reviews</h2>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-6xl font-bold">{stats.average}</span>

              <Star size={36} fill="#FFC107" className="text-yellow-400" />
            </div>

            <p className="text-gray-500 mt-3">{stats.total} Reviews</p>
          </div>

          <div>
            {[5, 4, 3, 2, 1].map((star) => {
              const percent =
                stats.total > 0 ? (stats.counts[star] / stats.total) * 100 : 0;

              return (
                <div key={star} className="flex items-center gap-4 mb-4">
                  <span className="w-6">{star}★</span>

                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{
                        width: `${percent}%`,
                      }}
                    />
                  </div>

                  <span className="w-10 text-right">{stats.counts[star]}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-10">
          {reviews.map((review) => (
            <div key={review._id} className="border-b pb-10">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i <= review.rating ? "#FFC107" : "#E5E7EB"}
                    className="text-yellow-400"
                  />
                ))}
              </div>

              <h3 className="text-3xl font-bold mb-4">{review.title}</h3>

              <p className="text-lg leading-8">{review.comment}</p>

              {(review.beforeImage || review.afterImage) && (
                <div className="flex gap-4 mt-6">
                  {review.beforeImage && (
                    <img
                      src={getImageUrl(review.beforeImage)}
                      alt=""
                      className="w-28 h-28 rounded-lg object-cover"
                    />
                  )}

                  {review.afterImage && (
                    <img
                      src={getImageUrl(review.afterImage)}
                      alt=""
                      className="w-28 h-28 rounded-lg object-cover"
                    />
                  )}
                </div>
              )}

              <div className="mt-6">
                <h4 className="font-bold text-lg">{review?.user_id?.name}</h4>

                <p className="text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-8 mt-6 text-gray-500">
                <div className="flex items-center gap-2">
                  <ThumbsUp size={18} />
                  {review.likes || 0}
                </div>

                <div className="flex items-center gap-2">
                  <ThumbsDown size={18} />
                  {review.dislikes || 0}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* <div className="fixed bottom-0 left-0 right-0 bg-[#0C2D62] p-4 z-50">
        <button className="w-full text-white font-bold">Buy Now</button>
      </div> */}
      </div>
    </>
  );
}

export default Allreviews;
