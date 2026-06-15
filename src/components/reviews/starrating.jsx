import { Star } from "lucide-react";

export default function StarRating({ rating = 0, total = 0 }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600">
      {stars.map((star) => {
        if (rating >= star) {
          return (
            <Star
              key={star}
              size={16}
              className="text-yellow-400 fill-yellow-400"
            />
          );
        }

        if (rating >= star - 0.5) {
          return (
            <div key={star} className="relative w-[16px] h-[16px]">
              <Star size={16} className="text-yellow-400 absolute top-0 left-0" />

              <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />
              </div>
            </div>
          );
        }

        return <Star key={star} size={16} className="text-yellow-300" />;
      })}

      <span className="ml-1 font-medium text-black">{rating}</span>
      <span className="text-gray-500">({total})</span>
    </div>
  );
}
