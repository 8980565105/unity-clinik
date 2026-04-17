import { useEffect, useMemo, useState } from "react";
import Slider from "react-slick";
import { getImageUrl } from "../utils/helper";
export default function ProductGallery({
  product,
  activeVariant,
  selectedColor,
  setSelectedColor,
}) {
  const [currentImage, setCurrentImage] = useState(null);

  const variants = product?.variants || [];

  const colorOptions = useMemo(() => {
    const seen = new Map();
    variants.forEach((v) => {
      if (v.color_id?._id) {
        seen.set(v.color_id._id, {
          id: v.color_id._id,
          name: v.color_id.name,
          code: v.color_id.code,
        });
      }
    });
    return Array.from(seen.values());
  }, [variants]);

  const fullImageUrls = useMemo(() => {
    if (activeVariant?.images?.length > 0) {
      return activeVariant.images.map((img) => getImageUrl(img));
    }
    if (product?.images?.length > 0) {
      return product.images.map((img) => getImageUrl(img));
    }
    return [];
  }, [activeVariant, product]);

  useEffect(() => {
    if (fullImageUrls.length > 0) {
      setCurrentImage(fullImageUrls[0]);
    } else {
      setCurrentImage(null);
    }
  }, [activeVariant?._id]);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    appendDots: (dots) => (
      <div className="w-full relative">
        <ul className="absolute left-1/2 transform -translate-x-1/2 flex justify-center rounded-full">
          {dots}
        </ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-[10px] h-[10px] rounded-full border border-[#D2AF9F] transition-all duration-300"></div>
    ),
  };

  return (
    <div className="flex flex-col md:flex-row gap-[30px]">
      <div
        className="hidden md:flex md:flex-col gap-[20px] h-[727px] overflow-y-auto hide-scrollbar p-1"
        style={{
          scrollBehavior: "smooth",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {fullImageUrls.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Thumbnail ${index}`}
            onClick={() => setCurrentImage(img)}
            className={`w-[160px] h-[208px] object-cover rounded-[3px] cursor-pointer transition-all duration-200 ${
              currentImage === img
                ? "ring-1 ring-theme scale-[1.02]"
                : "opacity-50 hover:opacity-100"
            }`}
          />
        ))}
      </div>

      <div className="hidden md:block flex-1">
        {currentImage ? (
          <img
            key={currentImage}
            src={currentImage}
            alt="Main product"
            className="w-full h-[727px] rounded-[10px] object-cover transition-all duration-300 ease-in-out"
          />
        ) : (
          <div className="w-full h-[727px] rounded-[10px] bg-gray-100 flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}

        <div className="flex gap-[8px] mt-[30px] justify-center">
          {colorOptions.map((color) => (
            <span
              key={color.id}
              onClick={() => setSelectedColor(color.id)}
              className={`w-[24px] h-[24px] rounded-full border-2 transition-all cursor-pointer
                ${
                  selectedColor === color.id
                    ? "border-black scale-110"
                    : "border-gray-300 hover:border-gray-500"
                }`}
              style={{ backgroundColor: color.code }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      <div className="block md:hidden w-full rounded-[10px]">
        {fullImageUrls.length > 0 ? (
          <Slider {...sliderSettings}>
            {fullImageUrls.map((img, index) => (
              <div key={index}>
                <img
                  src={img}
                  alt={`Slide ${index}`}
                  className="w-full h-300px sm:h-[500px] object-cover"
                />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="w-full h-[300px] bg-gray-100 flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}
      </div>
    </div>
  );
}
