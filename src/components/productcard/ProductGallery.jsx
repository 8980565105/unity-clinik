

import { useEffect, useMemo, useState, useRef } from "react";
import Slider from "react-slick";
import { getImageUrl } from "../utils/helper";
import { ChevronUp, ChevronDown } from "lucide-react";

const THUMB_SIZE = 80; 
const THUMB_GAP = 8; 
const THUMB_STEP = THUMB_SIZE + THUMB_GAP;
const VISIBLE_THUMBS = 4; 
const VIEWPORT_H = VISIBLE_THUMBS * THUMB_STEP - THUMB_GAP; 

export default function ProductGallery({
  product,
  activeVariant,
  selectedColor,
  setSelectedColor,
}) {
  const [currentImage, setCurrentImage] = useState(null);
  const [zoomStyle, setZoomStyle] = useState({ display: "none" });
  const [showZoom, setShowZoom] = useState(false);
  const [thumbIndex, setThumbIndex] = useState(0);
  const imgRef = useRef(null);

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
    if (
      Array.isArray(activeVariant?.images) &&
      activeVariant.images.length > 0
    ) {
      return activeVariant.images.map((img) => getImageUrl(img));
    }
    const firstVariant = product?.variants?.[0];
    if (Array.isArray(firstVariant?.images) && firstVariant.images.length > 0) {
      return firstVariant.images.map((img) => getImageUrl(img));
    }
    if (product?.images) return [getImageUrl(product.images)];
    return [];
  }, [activeVariant, product]);

  useEffect(() => {
    if (fullImageUrls.length > 0) {
      setCurrentImage(fullImageUrls[0]);
      setThumbIndex(0);
    } else {
      setCurrentImage(null);
      setThumbIndex(0);
    }
  }, [activeVariant?._id]);

  const maxIndex = Math.max(0, fullImageUrls.length - VISIBLE_THUMBS);
  const canUp = thumbIndex > 0;
  const canDown = thumbIndex < maxIndex;

  const handleUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbIndex((i) => Math.max(0, i - 1));
  };

  const handleDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbIndex((i) => Math.min(maxIndex, i + 1));
  };

  const handleMouseMove = (e) => {
    if (window.innerWidth < 1024) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      display: "block",
      backgroundImage: `url(${currentImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: "250%",
      backgroundRepeat: "no-repeat",
    });
  };

  const handleMouseEnter = () => {
    if (window.innerWidth >= 1024) setShowZoom(true);
  };

  const handleMouseLeave = () => {
    setShowZoom(false);
    setZoomStyle({ display: "none" });
  };

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
    <div className="flex flex-col md:flex-row gap-[30px] h-[500px]">
      <div
        className="hidden md:flex md:flex-col items-center"
        style={{ width: `${THUMB_SIZE}px` }}
      >
        <button
          type="button"
          onClick={handleUp}
          disabled={!canUp}
          className={`flex items-center justify-center mb-2 p-1 transition-colors z-10
            ${
              canUp
                ? "text-gray-500 hover:text-[#005BAA] cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
        >
          <ChevronUp size={20} />
        </button>

        <div
          className="overflow-hidden"
          style={{ height: `${VIEWPORT_H}px`, width: `${THUMB_SIZE}px` }}
        >
          <div
            className="flex flex-col transition-transform duration-300 ease-in-out"
            style={{
              gap: `${THUMB_GAP}px`,
              transform: `translateY(-${thumbIndex * THUMB_STEP}px)`,
            }}
          >
            {fullImageUrls.map((img, index) => (
              <div
                key={index}
                onClick={() => setCurrentImage(img)}
                style={{
                  width: `${THUMB_SIZE}px`,
                  height: `${THUMB_SIZE}px`,
                  flexShrink: 0,
                }}
                className={`rounded-xl border-2 overflow-hidden cursor-pointer transition-colors
                  ${
                    currentImage === img
                      ? "border-[#005BAA]"
                      : "border-transparent hover:border-[#005BAA]"
                  }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index}`}
                  className="w-full h-full object-fill"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleDown}
          disabled={!canDown}
          className={`flex items-center justify-center mt-2 p-1 transition-colors z-10
            ${
              canDown
                ? "text-gray-500 hover:text-[#005BAA] cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
        >
          <ChevronDown size={20} />
        </button>
      </div>

      <div className="hidden md:block flex-1 relative">
        {currentImage ? (
          <div className="relative">
            <img
              ref={imgRef}
              key={currentImage}
              src={currentImage}
              alt="Main product"
              className="w-full h-auto rounded-[10px] object-contain transition-all duration-300 ease-in-out cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            />
            {showZoom && (
              <div
                className="absolute top-0 rounded-[10px] border border-gray-200 shadow-xl pointer-events-none z-50 bg-white"
                style={{
                  left: "calc(100% + 16px)",
                  width: "450px",
                  height: "450px",
                  ...zoomStyle,
                }}
              />
            )}
          </div>
        ) : (
          <div className="w-full h-[500px] rounded-[10px] bg-gray-100 flex items-center justify-center text-gray-400">
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
                  className="w-full h-[300px] sm:h-[500px] object-cover"
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
