import React from "react";
import Section from "../ui/Section";
import Row from "../ui/Row";
import Description from "../ui/Description";
import Heading from "../ui/Heading";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../utils/helper";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function Solutionstagecard({ data, items = [], products = [] }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();

    if (!token) {
      toast.error("Please login first");
      return;
    }

    const variant = product?.variants?.[0];
    if (!variant?._id) {
      toast.error("Variant not found");
      return;
    }

    try {
      let cartId = cart?._id || localStorage.getItem("cart_id");

      if (!cartId) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const newCart = await dispatch(
          createCart({ user_id: user._id }),
        ).unwrap();
        cartId = newCart._id;
      }

      await dispatch(
        addToCart({
          cart_id: cartId,
          product_id: product._id,
          variant_id: variant._id,
          quantity: 1,
        }),
      ).unwrap();

      await dispatch(fetchCart(cartId));
      toast.success("Added to cart");
      navigate("/cart");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    }
  };

  if (!items || items.length === 0) return null;

  const enableLoop = items.length > 3;

  return (
    <Section className="py-16 bg-white">
      <Row>
        <Heading title={data?.title} />
        <Description Description={data?.description} />

        <div className="mt-6 w-full">
          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={enableLoop}
            spaceBetween={20}
            breakpoints={{
              0: { slidesPerView: 2 },
              678: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
            className="!pb-12"
          >
            {items.map((item, i) => {
              const linkedProduct = (products || []).find(
                (p) => p._id === item.product_id,
              );

              const rawMainImg =
                linkedProduct?.variants?.[0]?.images?.[0] ||
                linkedProduct?.images ||
                null;
              const mainImg = rawMainImg
                ? rawMainImg.startsWith("http")
                  ? rawMainImg
                  : getImageUrl(rawMainImg)
                : null;

              const bgImg = item.image
                ? item.image.startsWith("http")
                  ? item.image
                  : getImageUrl(item.image)
                : null;

              const variant = linkedProduct?.variants?.[0];
              const offerPrice = variant?.offerprice || variant?.price || 0;
              const origPrice = variant?.price || 0;
              const discount =
                origPrice > offerPrice
                  ? Math.floor(((origPrice - offerPrice) / origPrice) * 100)
                  : 0;
              const reviewCount = linkedProduct?.reviewCount || 0;

              return (
                <SwiperSlide key={i}>
                  <div
                    onClick={() =>
                      item.product_id &&
                      navigate(`/products/${item.product_id}`)
                    }
                    className="bg-white rounded-3xl border border-gray-200 p-2 flex flex-col shadow-sm cursor-pointer h-full"
                  >
                    <div className="relative bg-[#f8f9fa] rounded-2xl h-56 overflow-hidden">
                      {bgImg && (
                        <img
                          src={bgImg}
                          alt={item.title}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      )}

                      <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm z-10">
                        ⭐
                        <span className="text-xs font-bold text-gray-600">
                          {reviewCount}
                        </span>
                      </div>

                      <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[#005b9f] font-black uppercase text-lg z-10 whitespace-nowrap">
                        {item.title}
                      </span>
                    </div>

                    {mainImg && (
                      <div className="relative z-30 flex justify-center -mt-14">
                        <div className="w-[105px] h-[105px] bg-white rounded-[20px] shadow-xl border border-gray-100 overflow-hidden">
                          <img
                            src={mainImg}
                            alt={linkedProduct?.name}
                            className="w-full h-full object-contain p-2"
                          />
                        </div>
                      </div>
                    )}

                    <div className="px-2 pb-2 flex flex-col flex-1">
                      <span className="text-primary text-xs font-bold mb-1">
                        {item.title}
                      </span>

                      <h3 className="text-[15px] font-bold text-gray-900 line-clamp-2 leading-snug mb-3">
                        {linkedProduct?.name}
                      </h3>

                      <div className="mt-auto">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl font-black text-gray-900">
                            ₹{offerPrice}
                          </span>
                          {origPrice > offerPrice && (
                            <span className="text-sm font-bold text-gray-400 line-through">
                              ₹{origPrice}
                            </span>
                          )}
                          {discount > 0 && (
                            <span className="text-xs font-bold text-[#005b9f]">
                              {discount}% OFF
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          onClick={(e) => handleAddToCart(e, linkedProduct)}
                          variant="outline"
                          className="!w-full border-2 font-bold !min-w-[auto]"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </Row>
    </Section>
  );
}

export default Solutionstagecard;
