import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/helper";
import { Plus } from "lucide-react";

export default function TrendingCard ({ product }){
  return(
 <Link
     to={`/products/${product._id}`}
    className="block relative group overflow-hidden bg-white transition-transform duration-300 "
  >
      <div className="w-full h-auto overflow-hidden">
        <img
          src={getImageUrl(product.images)}
          alt={product.name}
          className="w-full h-full  aspect-[4/5] sm:aspect-square transition-transform duration-500"
        />
      </div>
    <div className="absolute right-3 bottom-3 sm:right-8 sm:bottom-8 w-11/12 max-w-[297px] h-[180px] sm:h-[231px] p-4 sm:py-[30px] pl-4 sm:pl-[30px] pr-[15px]
                    bg-white/60 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="pr-2 sm:pr-[20px]">
          <h3 className="text-[14px] font-medium font-inter tracking-wider text-black uppercase leading-tight line-clamp-6">
            {product.name}
          </h3>
        </div>
        <button className="flex-shrink-0 flex items-center justify-center w-[20px] h-[20px] rounded-full transition duration-300 border border-white">
          <Plus size={14}/>
        </button>
      </div>
      <div className="flex justify-end pr-[25px]">
        <p className="text-[14px] font-medium font-inter text-black">
          Rs {Number(product.variants?.[0]?.price || 0).toLocaleString("en-IN")}
        </p>
      </div>
    </div>
 </Link>
);
}