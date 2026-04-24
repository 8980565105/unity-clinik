import React from "react";
import { Quote, Star } from "lucide-react";
const AVATAR_COLORS = ["#8bc34a", "#29b6f6", "#ffa726", "#ef5350", "#ab47bc"];
function ReviewCard({ review, index = 0 }) {
  const dynamicColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const rating = review?.rating || 5;
  return (
    <div className="relative group h-full">
      <div
        className="absolute -top-6 left-8 z-20 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: dynamicColor }}
      >
        <Quote size={28} fill="white" className="text-white rotate-180" />
      </div>
      <div
        className="bg-white p-10 pt-10 relative hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 h-full flex flex-col"
        style={{
          borderRadius: "40px 100px 40px 110px",
        }}
      >
        <div className="flex flex-col items-center text-center flex-grow mb-6">
          <h3 className="text-[20px] font-black text-gray-900 mb-1">
            {review?.user_id?.name || "Verified Client"}
          </h3>
          <p className="text-gray-400 text-xs font-medium mb-4">
            {review?.designation || "Verified Buyer"}
          </p>
          <div className="flex gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < rating ? "#fbbf24" : "none"}
                className={i < rating ? "text-yellow-400" : "text-gray-200"}
              />
            ))}
          </div>
          <p className="text-gray-500 text-sm text-center line-clamp-6 italic">
            "{review?.comment || "No comment provided for this review."}"
          </p>
        </div>
        <div className="absolute bottom-6 right-10 opacity-10 pointer-events-none">
          <Quote size={40} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}

export default ReviewCard;
