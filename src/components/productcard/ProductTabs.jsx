import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { fetchProductReviews } from "../../features/reivews/reviewsThunk";

export default function ProductTabs({ product, selectedVariant }) {
  const tabs = ["Product Information", "Customer Review"];
  const [activeTab, setActiveTab] = useState("Product Information");
  const [openAccordion, setOpenAccordion] = useState(null);

  const dispatch = useDispatch();
  const { loading, error, productReviews } = useSelector(
    (state) => state.reviews,
  );

  const productReviewData = productReviews?.[product?._id];
  const filteredReviews = productReviewData?.reviews || [];

  useEffect(() => {
    if (
      product?._id &&
      (activeTab === "Customer Review" || openAccordion === 1)
    ) {
      dispatch(
        fetchProductReviews({ productId: product._id, page: 1, limit: 50 }),
      );
    }
  }, [activeTab, openAccordion, dispatch, product?._id]);

  const handleAccordionToggle = (index) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const isValidHtml = (html) =>
    html && html.trim() !== "" && html.trim() !== "<p></p>";

  const activeDescription = isValidHtml(selectedVariant?.description)
    ? selectedVariant.description
    : product?.description;

  const REVIEW_ITEM_HEIGHT = 110;
  const VISIBLE_COUNT = 5;
  const scrollContainerHeight = REVIEW_ITEM_HEIGHT * VISIBLE_COUNT;

  const ReviewContent = () => {
    if (loading) return <p className="py-4 text-center">Loading reviews...</p>;
    if (error) return <p className="py-4 text-red-500 text-center">{error}</p>;

    if (filteredReviews.length === 0)
      return (
        <p className="py-10 text-center text-gray-500 font-medium">
          No reviews yet for this product.
        </p>
      );

    return (
      <div>
        <p className="text-sm mb-4 text-[var(--primary-color)]">
          {filteredReviews.length} review
          {filteredReviews.length !== 1 ? "s" : ""}
        </p>

        <div
          style={{ maxHeight: `${scrollContainerHeight}px` }}
          className="overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        >
          <div className="space-y-0">
            {filteredReviews.map((review, index) => (
              <div
                key={review._id}
                className={`py-5 ${
                  index !== filteredReviews.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-800">
                      {review.user_id?.name || "Anonymous User"}
                    </span>
                    <div className="flex text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          fill={i < review.rating ? "currentColor" : "none"}
                          className={
                            i < review.rating
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {review.title && (
                  <h4 className="font-semibold text-sm mb-1">{review.title}</h4>
                )}

                <p className="text-gray-600 text-sm leading-relaxed">
                  {review.comment || "No comment provided."}
                </p>
              </div>
            ))}
          </div>
        </div>

        {filteredReviews.length > VISIBLE_COUNT && (
          <p className="text-xs text-gray-400 mt-3 text-center">
            ↑ Scroll to see all reviews
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="mt-[30px] md:mt-[65px]">
      <div className="hidden md:flex w-full">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-[30px] py-[14px] text-center font-18 ${
              activeTab === tab
                ? "text-theme border-b-0 border border-[#BCBCBC] "
                : "text-black border-b border-[#BCBCBC] "
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="hidden md:block border border-[#BCBCBC] border-t-0 ps-[38px] py-[45px]">
        {activeTab === "Product Information" && (
          <div className="prose max-w-full">
            {activeDescription ? (
              <div dangerouslySetInnerHTML={{ __html: activeDescription }} />
            ) : (
              <p>Product details coming soon.</p>
            )}
          </div>
        )}
        {activeTab === "Customer Review" && <ReviewContent />}
      </div>

      <div className="md:hidden">
        {tabs.map((tab, index) => (
          <div key={index} className="border-b border-[#BCBCBC]">
            <button
              className="w-full flex justify-between items-center py-4 text-left font-18"
              onClick={() => handleAccordionToggle(index)}
            >
              {tab}
              {openAccordion === index ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>

            {openAccordion === index && (
              <div className="pb-4">
                {index === 0 && (
                  <div className="prose max-w-full">
                    {activeDescription ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: activeDescription }}
                      />
                    ) : (
                      <p>Product details coming soon.</p>
                    )}
                  </div>
                )}
                {index === 1 && <ReviewContent />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
