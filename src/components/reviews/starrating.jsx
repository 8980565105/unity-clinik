import { Star } from "lucide-react";

export default function StarRating({ rating = 0, total = 0 }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => {
        if (rating >= star) {
          return (
            <Star
              key={star}
              // size={}
              className="md:h-[16px] h-[12px] w-[12px] md:w-[16px] text-yellow-400 fill-yellow-400"
            />
          );
        }

        if (rating >= star - 0.5) {
          return (
            <div
              key={star}
              className="relative w-[12px] md:w-[16px] h-[12px] md:h-[16px]"
            >
              <Star className="text-yellow-400 absolute top-0 left-0 w-[12px] md:w-[16px] h-[12px] md:h-[16px]" />

              <div className="absolute top-0 left-0 w-1/2 h-full overflow-hidden">
                <Star className="text-yellow-400 fill-yellow-400 w-[12px] md:w-[16px] h-[12px] md:h-[16px]" />
              </div>
            </div>
          );
        }

        return (
          <Star
            key={star}
            className="text-yellow-300 w-[12px] md:w-[16px] h-[12px] md:h-[16px]"
          />
        );
      })}

      <span className="font-medium text-black text-[12px] md:text-[16px]">
        {rating}
      </span>
      <span className="text-gray-500 text-[12px] md:text-[16px]">
        ({total})
      </span>
    </div>
  );
}
