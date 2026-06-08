import React, { useEffect, useState } from "react";
import { Star, BadgeCheck, X } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductReviews,
  addReview,
} from "../../features/reivews/reviewsThunk";
import { resetReviewStatus } from "../../features/reivews/reviewsSlice";
import Section from "../ui/Section";
import Row from "../ui/Row";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import LoginForm from "../../pages/Login";
import { getImageUrl } from "../utils/helper";
import ImageUpload from "../ui/ImageUpload";

function Productreviews({ productId, setShowLoginPopup }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    productReviews,
    success: reviewSuccess,
    loading: reviewLoading,
  } = useSelector((state) => state.reviews);

  const [visibleReviews, setVisibleReviews] = useState(2);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [beforePreview, setBeforePreview] = useState("");
  const [afterPreview, setAfterPreview] = useState("");

  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    beforeImage: null,
    afterImage: null,
  });

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductReviews({ productId, page: 1, limit: 100 }));
    }
  }, [dispatch, productId]);

  useEffect(() => {
    if (reviewSuccess) {
      toast.success("Review submitted successfully!", {
        position: "top-center",
        duration: 4000,
      });
      setShowReviewModal(false);
      setReviewData({
        rating: 5,
        title: "",
        comment: "",
        beforeImage: null,
        afterImage: null,
      });
      dispatch(resetReviewStatus());
      if (productId) {
        dispatch(fetchProductReviews({ productId, page: 1, limit: 100 }));
      }
    }
  }, [reviewSuccess, dispatch, productId]);

  const reviewData2 = productReviews?.[productId];
  const reviews = (reviewData2?.reviews || [])
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const totalReviews = reviews.length;

  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(
          1,
        )
      : 0;

  const ratingBreakdown = {
    5: reviews.filter((r) => r.rating === 5).length,
    4: reviews.filter((r) => r.rating === 4).length,
    3: reviews.filter((r) => r.rating === 3).length,
    2: reviews.filter((r) => r.rating === 2).length,
    1: reviews.filter((r) => r.rating === 1).length,
  };

  const getWidth = (count) =>
    !totalReviews ? 0 : (count / totalReviews) * 100;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${d.getFullYear()}`;
  };

  const handleWriteReview = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      setShowLoginPopup(true);
      return;
    }

    setShowReviewModal(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      toast.error("Please login to write a review.", {
        position: "top-center",
      });
      return;
    }
    if (!reviewData.title.trim()) {
      toast.error("Please enter a review title.", { position: "top-center" });
      return;
    }
    dispatch(
      addReview({
        product_id: productId,
        user_id: user._id,
        rating: reviewData.rating,
        title: reviewData.title.trim(),
        comment: reviewData.comment.trim(),
        beforeImage: reviewData.beforeImage,
        afterImage: reviewData.afterImage,
        is_approved: false,
      }),
    );
  };

  return (
    <>
      <Section className="py-20">
        <Row>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-center text-4xl font-bold mb-12">
              Ratings & Reviews
            </h2>

            <div className="grid lg:grid-cols-[250px_1fr] gap-10 mb-14">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-6xl font-bold">{averageRating}</h3>
                  <Star fill="#facc15" className="text-yellow-400" size={40} />
                </div>
                <p className="text-gray-500 text-xl mt-2">
                  {totalReviews} Reviews
                </p>
              </div>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="font-medium w-5">{star}</span>
                    <Star
                      size={12}
                      fill="#facc15"
                      className="text-yellow-400"
                    />
                    <div className="flex-1 h-[7px] bg-[#dce9f5] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#17396b]"
                        style={{ width: `${getWidth(ratingBreakdown[star])}%` }}
                      />
                    </div>
                    <span className="font-medium text-gray-600 w-8">
                      {ratingBreakdown[star]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              {reviews.length === 0 ? (
                <p className="text-center text-gray-400 text-lg py-8">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                reviews.slice(0, visibleReviews).map((review) => (
                  <div key={review._id} className="border-b pb-8">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={24}
                          fill={i < review.rating ? "#facc15" : "none"}
                          className={
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <h3 className="text-3xl font-semibold mb-3">
                      {review.title}
                    </h3>
                    <p className="text-gray-700 text-xl leading-relaxed">
                      {review.comment}
                    </p>

                    <div className="flex gap-3 ">
                      <div>
                        {review?.beforeImage && (
                          <img
                            src={getImageUrl(review?.beforeImage)}
                            alt="Before"
                            className="w-[120px] h-[120px] object-cover rounded-lg"
                          />
                        )}
                      </div>
                      <div>
                        {review?.afterImage && (
                          <img
                            src={getImageUrl(review?.afterImage)}
                            alt="After"
                            className="w-[120px] h-[120px] object-cover rounded-lg"
                          />
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xl">
                          {review?.user_id?.name || "Customer"}
                        </span>
                        <BadgeCheck size={18} className="text-green-600" />
                      </div>
                      <p className="text-gray-500 mt-2">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-between gap-5 items-center mt-10">
              {visibleReviews < reviews.length && (
                <Button
                  variant="outline"
                  onClick={() => navigate(`/allreviews/${productId}`)}
                  className="border w-full items-center font-bold"
                >
                  View More Reviews
                </Button>
              )}
              <Button
                variant="common"
                onClick={handleWriteReview}
                className="text-white w-full rounded-xl font-bold items-center"
              >
                Write Review
              </Button>
            </div>
          </div>
        </Row>
      </Section>

      {showReviewModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-[600px] max-h-[90vh] rounded-3xl overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-3xl font-bold">Write Review</h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6">
              <div className="mb-6">
                <h4 className="font-bold text-xl mb-4">Rate this Product</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewData((prev) => ({ ...prev, rating: star }))
                      }
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={36}
                        fill={star <= reviewData.rating ? "#facc15" : "none"}
                        strokeWidth={1.5}
                        className={
                          star <= reviewData.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Review Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Give your review a title"
                    value={reviewData.title}
                    onChange={(e) =>
                      setReviewData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full h-[55px] border border-gray-200 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Review Description
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Share your experience with this product"
                    value={reviewData.comment}
                    onChange={(e) =>
                      setReviewData((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block font-semibold mb-2">
                    Before Image
                  </label>

                  <ImageUpload
                    value={reviewData.beforeImage}
                    onChange={(url) =>
                      setReviewData((prev) => ({
                        ...prev,
                        beforeImage: url,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    After Image
                  </label>

                  <ImageUpload
                    value={reviewData.afterImage}
                    onChange={(url) =>
                      setReviewData((prev) => ({
                        ...prev,
                        afterImage: url,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex  gap-4 mt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="items-center !min-w-[150px] w-full rounded-xl font-semibold h-[55px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="common"
                  type="submit"
                  disabled={reviewLoading}
                  className="items-center w-full text-white rounded-xl font-semibold h-[55px]"
                >
                  {reviewLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default Productreviews;
