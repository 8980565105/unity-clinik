// // import { useState, useEffect, useCallback, useMemo } from "react";
// // import { getImageUrl } from "../utils/helper";
// // import { Link } from "react-router-dom";
// // import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
// // import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
// // import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useNavigate } from "react-router-dom";
// // import { Star } from "lucide-react";
// // import {
// //   addToCart,
// //   createCart,
// //   fetchCart,
// // } from "../../features/cart/cartThunk";
// // import toast from "react-hot-toast";
// // import Button from "../ui/Button";
// // import StarRating from "../reviews/starrating";

// // function CountdownTimer({ endDate }) {
// //   const calcTimeLeft = useCallback(() => {
// //     const diff = new Date(endDate).getTime() - Date.now();
// //     if (diff <= 0) return null;

// //     const hours = Math.floor(diff / (1000 * 60 * 60));
// //     const minutes = Math.floor((diff / (1000 * 60)) % 60);
// //     const seconds = Math.floor((diff / 1000) % 60);

// //     return {
// //       hours,
// //       minutes: String(minutes).padStart(2, "0"),
// //       seconds: String(seconds).padStart(2, "0"),
// //     };
// //   }, [endDate]);

// //   const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       const t = calcTimeLeft();
// //       setTimeLeft(t);
// //       if (!t) clearInterval(interval);
// //     }, 1000);

// //     return () => clearInterval(interval);
// //   }, [calcTimeLeft]);

// //   if (!timeLeft) return null;

// //   return (
// //     <span className="text-theme text-[12px] md:text-[15px] font-bold">
// //       Ends in {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
// //     </span>
// //   );
// // }

// // export default function ProductCard({ product, setShowLoginPopup }) {
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const { token } = useSelector((state) => state.auth);
// //   const cart = useSelector((state) => state.cart.cart);
// //   const reviewsState = useSelector((state) => state.reviews);
// //   const productReviewData = reviewsState?.productReviews?.[product?._id];
// //   const [addingToCart, setAddingToCart] = useState(false);
// //   const [selectedColor, setSelectedColor] = useState(null);

// //   const getPriceData = (product) => {
// //     const variant = product?.variants?.[0];

// //     const originalPrice = variant?.price || 0;
// //     const offerPrice = variant?.offerprice || originalPrice;

// //     let discountPercent = 0;

// //     if (originalPrice > offerPrice) {
// //       const rawDiscount = ((originalPrice - offerPrice) / originalPrice) * 100;

// //       const decimal = rawDiscount % 1;

// //       if (decimal >= 0.5) {
// //         discountPercent = Math.ceil(rawDiscount);
// //       } else {
// //         discountPercent = Math.floor(rawDiscount);
// //       }
// //     }

// //     return {
// //       originalPrice,
// //       offerPrice,
// //       discountPercent,
// //     };
// //   };
// //   const { productReviews } = useSelector((state) => state.reviews);
// //   const reviewData = useMemo(() => {
// //     const reviews = productReviews?.[product?._id]?.reviews || [];
// //     if (reviews.length === 0) return { average: 0, total: 0 };
// //     const total = reviews.length;
// //     const sum = reviews.reduce(
// //       (acc, curr) => acc + (Number(curr.rating) || 0),
// //       0,
// //     );
// //     return {
// //       average: (sum / total).toFixed(1),
// //       total,
// //     };
// //   }, [productReviews, product?._id]);

// //   const [currentIndex, setCurrentIndex] = useState(0);
// //   const firstVariantImages = Array.isArray(product?.variants?.[0]?.images)
// //     ? product.variants[0].images
// //     : [];
// //   const mainImages = Array.isArray(product?.images) ? product.images : [];
// //   const allImages =
// //     firstVariantImages.length > 0 ? firstVariantImages : mainImages;
// //   const displayedImage = getImageUrl(allImages[currentIndex]);
// //   const hasMultipleImages = allImages.length > 1;
// //   const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);
// //   const wishlistProductIds = useSelector((state) => state.wishlist.productIds);
// //   const isWishlisted = wishlistProductIds.includes(product._id);
// //   const uniqueColors = (() => {
// //     const seen = new Set();
// //     const result = [];
// //     (product?.variants || []).forEach((variant) => {
// //       const firstColor = Array.isArray(variant?.color)
// //         ? variant.color[0]
// //         : variant?.color;
// //       if (!firstColor) return;
// //       const colorCode = firstColor?.code || firstColor;
// //       const colorName = firstColor?.name || "";
// //       if (seen.has(colorCode)) return;
// //       seen.add(colorCode);
// //       result.push({ code: colorCode, name: colorName });
// //     });
// //     return result;
// //   })();
// //   const getVariantForColor = (product, colorCode) => {
// //     return (
// //       product?.variants?.find((v) =>
// //         v.color?.some((c) => c.code === colorCode),
// //       ) || product?.variants?.[0]
// //     );
// //   };
// //   const handleAddToCart = async (product) => {
// //     if (!token) {
// //       setShowLoginPopup(true);
// //       return;
// //     }
// //     const selectedColorCode = selectedColor;
// //     const variant = selectedColorCode
// //       ? getVariantForColor(product, selectedColorCode)
// //       : product?.variants?.[0];
// //     if (!variant?._id) {
// //       toast.error("Variant not found!");
// //       return;
// //     }
// //     if (variant?.stock_quantity === 0) {
// //       toast.error("This variant is out of stock!");
// //       return;
// //     }
// //     setAddingToCart(true);
// //     try {
// //       let cartId = cart?._id || localStorage.getItem("cart_id");

// //       if (!cartId) {
// //         const user = JSON.parse(localStorage.getItem("user") || "{}");

// //         if (!user?._id) {
// //           toast.error("Please login again");
// //           setShowLoginPopup(true);
// //           return;
// //         }

// //         const newCart = await dispatch(
// //           createCart({ user_id: user._id }),
// //         ).unwrap();

// //         cartId = newCart._id;
// //       }

// //       await dispatch(
// //         addToCart({
// //           cart_id: cartId,
// //           product_id: product._id,
// //           variant_id: variant._id,
// //           quantity: 1,
// //         }),
// //       ).unwrap();

// //       await dispatch(fetchCart(cartId));

// //       navigate("/cart");

// //       toast.success("Added to cart successfully!");
// //     } catch (err) {
// //       console.error(err);
// //       toast.error("Failed to add to cart");
// //     } finally {
// //       setAddingToCart(false);
// //     }
// //   };

// //   const discount = product?.discount || {};
// //   const hasDiscount = discount?.value > 0;
// //   const endsWithin24h =
// //     discount?.end_date &&
// //     new Date(discount.end_date).getTime() - Date.now() <= 24 * 60 * 60 * 1000;
// //   const currentSelectedColor = selectedColor || uniqueColors[0]?.code;
// //   const currentVariant = getVariantForColor(product, currentSelectedColor);
// //   const isOutOfStock = currentVariant?.stock_quantity === 0;
// //   const priceData = getPriceData(product);

// //   return (
// //     <>
// //       <Link to={`/products/${product._id}`}>
// //         <div className="rounded-2xl border p-3 w-full max-w-[500px] hover:shadow-lg transition-all group bg-white h-full">
// //           <div className="relative">
// //             <img
// //               src={displayedImage}
// //               alt={product.name}
// //               className="w-full rounded-xl h-[250px] object-cover transition-transform duration-300 group-hover:scale-105"
// //             />
// //           </div>

// //           <div className="mt-3 flex flex-col flex-grow">
// //             <p className="text-[16px] font-semibold line-clamp-2 h-[40px] leading-[20px] text-left">
// //               {product.name}
// //             </p>
// //             <div className="h-[22px]">
// //               {reviewData.total > 0 && (
// //                 <StarRating
// //                   rating={Number(reviewData.average)}
// //                   total={reviewData.total}
// //                 />
// //               )}
// //             </div>

// //             <div className="flex flex-wrap items-end gap-2 mt-1">
// //               <p className="text-[18px] font-semibold text-black">
// //                 ₹{priceData.offerPrice}
// //               </p>
// //               <div className="flex gap-1">
// //                 {priceData.discountPercent > 0 && (
// //                   <p className="line-through text-gray-400 text-[16px]">
// //                     ₹{priceData.originalPrice}
// //                   </p>
// //                 )}

// //                 {priceData.discountPercent > 0 && (
// //                   <span className="text-primary text-[14px]">
// //                     {priceData.discountPercent}% OFF
// //                   </span>
// //                 )}
// //               </div>
// //             </div>
// //             <Button
// //               onClick={(e) => {
// //                 e.preventDefault();
// //                 handleAddToCart(product);
// //               }}
// //               variant="outline"
// //               className="mt-3 w-full border text-primary hover:text-white rounded-full  flex items-center justify-center gap-2 transition"
// //             >
// //               ADD
// //             </Button>
// //           </div>
// //         </div>
// //       </Link>
// //     </>
// //   );
// // }

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { getImageUrl } from "../utils/helper";
// import { Link } from "react-router-dom";
// import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { Star } from "lucide-react";
// import {
//   addToCart,
//   createCart,
//   fetchCart,
//   updateCartItem,
//   deleteCartItem,
// } from "../../features/cart/cartThunk";
// import { updateLocalQuantity } from "../../features/cart/cartSlice";
// import toast from "react-hot-toast";
// import Button from "../ui/Button";
// import StarRating from "../reviews/starrating";

// function CountdownTimer({ endDate }) {
//   const calcTimeLeft = useCallback(() => {
//     const diff = new Date(endDate).getTime() - Date.now();
//     if (diff <= 0) return null;
//     const hours = Math.floor(diff / (1000 * 60 * 60));
//     const minutes = Math.floor((diff / (1000 * 60)) % 60);
//     const seconds = Math.floor((diff / 1000) % 60);
//     return {
//       hours,
//       minutes: String(minutes).padStart(2, "0"),
//       seconds: String(seconds).padStart(2, "0"),
//     };
//   }, [endDate]);

//   const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       const t = calcTimeLeft();
//       setTimeLeft(t);
//       if (!t) clearInterval(interval);
//     }, 1000);
//     return () => clearInterval(interval);
//   }, [calcTimeLeft]);

//   if (!timeLeft) return null;

//   return (
//     <span className="text-theme text-[12px] md:text-[15px] font-bold">
//       Ends in {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
//     </span>
//   );
// }

// export default function ProductCard({ product, setShowLoginPopup }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { token } = useSelector((state) => state.auth);
//   const cart = useSelector((state) => state.cart.cart);
//   const { items = [] } = useSelector((state) => state.cart);
//   const [addingToCart, setAddingToCart] = useState(false);
//   const [selectedColor, setSelectedColor] = useState(null);

//   // ✅ Cart ma aa product ni quantity check karo
//   const cartItem = useMemo(() => {
//     const variant = product?.variants?.[0];
//     if (!variant?._id) return null;
//     return (
//       items.find(
//         (item) =>
//           item.product_id?._id === product._id ||
//           item.product_id === product._id,
//       ) || null
//     );
//   }, [items, product]);

//   const cartQuantity = cartItem?.quantity || 0;

//   const getPriceData = (product) => {
//     const variant = product?.variants?.[0];
//     const originalPrice = variant?.price || 0;
//     const offerPrice = variant?.offerprice || originalPrice;
//     let discountPercent = 0;
//     if (originalPrice > offerPrice) {
//       const rawDiscount = ((originalPrice - offerPrice) / originalPrice) * 100;
//       const decimal = rawDiscount % 1;
//       discountPercent =
//         decimal >= 0.5 ? Math.ceil(rawDiscount) : Math.floor(rawDiscount);
//     }
//     return { originalPrice, offerPrice, discountPercent };
//   };

//   const { productReviews } = useSelector((state) => state.reviews);
//   const reviewData = useMemo(() => {
//     const reviews = productReviews?.[product?._id]?.reviews || [];
//     if (reviews.length === 0) return { average: 0, total: 0 };
//     const total = reviews.length;
//     const sum = reviews.reduce(
//       (acc, curr) => acc + (Number(curr.rating) || 0),
//       0,
//     );
//     return { average: (sum / total).toFixed(1), total };
//   }, [productReviews, product?._id]);

//   const [currentIndex, setCurrentIndex] = useState(0);
//   const firstVariantImages = Array.isArray(product?.variants?.[0]?.images)
//     ? product.variants[0].images
//     : [];
//   const mainImages = Array.isArray(product?.images) ? product.images : [];
//   const allImages =
//     firstVariantImages.length > 0 ? firstVariantImages : mainImages;
//   const displayedImage = getImageUrl(allImages[currentIndex]);

//   const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);
//   const wishlistProductIds = useSelector((state) => state.wishlist.productIds);
//   const isWishlisted = wishlistProductIds.includes(product._id);

//   const getVariantForColor = (product, colorCode) => {
//     return (
//       product?.variants?.find((v) =>
//         v.color?.some((c) => c.code === colorCode),
//       ) || product?.variants?.[0]
//     );
//   };

//   const currentSelectedColor = selectedColor;
//   const currentVariant =
//     getVariantForColor(product, currentSelectedColor) || product?.variants?.[0];
//   const isOutOfStock = currentVariant?.stock_quantity === 0;
//   const priceData = getPriceData(product);

//   // ✅ ADD button click — cart ma add karo
//   const handleAddToCart = async () => {
//     if (!token) {
//       setShowLoginPopup(true);
//       return;
//     }
//     const variant = currentVariant;
//     if (!variant?._id) return toast.error("Variant not found!");
//     if (variant?.stock_quantity === 0)
//       return toast.error("This variant is out of stock!");

//     setAddingToCart(true);
//     try {
//       let cartId = cart?._id || localStorage.getItem("cart_id");
//       if (!cartId) {
//         const user = JSON.parse(localStorage.getItem("user") || "{}");
//         if (!user?._id) {
//           toast.error("Please login again");
//           setShowLoginPopup(true);
//           return;
//         }
//         const newCart = await dispatch(
//           createCart({ user_id: user._id }),
//         ).unwrap();
//         cartId = newCart._id;
//       }
//       await dispatch(
//         addToCart({
//           cart_id: cartId,
//           product_id: product._id,
//           variant_id: variant._id,
//           quantity: 1,
//         }),
//       ).unwrap();
//       await dispatch(fetchCart(cartId));
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to add to cart");
//     } finally {
//       setAddingToCart(false);
//     }
//   };

//   // ✅ Quantity increase
//   const handleIncrease = async (e) => {
//     e.preventDefault();
//     if (!cartItem) return;
//     const cartId = cart?._id || localStorage.getItem("cart_id");
//     if (!cartId) return;
//     const newQty = cartItem.quantity + 1;
//     dispatch(updateLocalQuantity({ item_id: cartItem._id, quantity: newQty }));
//     dispatch(
//       updateCartItem({
//         cart_id: cartId,
//         item_id: cartItem._id,
//         quantity: newQty,
//       }),
//     )
//       .unwrap()
//       .catch(() => {
//         dispatch(
//           updateLocalQuantity({
//             item_id: cartItem._id,
//             quantity: cartItem.quantity,
//           }),
//         );
//       });
//   };

//   // ✅ Quantity decrease — 1 thi niche jaay to item remove karo
//   const handleDecrease = async (e) => {
//     e.preventDefault();
//     if (!cartItem) return;
//     const cartId = cart?._id || localStorage.getItem("cart_id");
//     if (!cartId) return;

//     if (cartItem.quantity <= 1) {
//       // ✅ Quantity 1 hoy to cart ma thi remove karo — ADD button pakad avshe
//       dispatch(deleteCartItem({ cart_id: cartId, item_id: cartItem._id }))
//         .unwrap()
//         .then(() => dispatch(fetchCart(cartId)));
//     } else {
//       const newQty = cartItem.quantity - 1;
//       dispatch(
//         updateLocalQuantity({ item_id: cartItem._id, quantity: newQty }),
//       );
//       dispatch(
//         updateCartItem({
//           cart_id: cartId,
//           item_id: cartItem._id,
//           quantity: newQty,
//         }),
//       )
//         .unwrap()
//         .catch(() => {
//           dispatch(
//             updateLocalQuantity({
//               item_id: cartItem._id,
//               quantity: cartItem.quantity,
//             }),
//           );
//         });
//     }
//   };

//   const discount = product?.discount || {};
//   const hasDiscount = discount?.value > 0;

//   return (
//     <>
//       <Link to={`/products/${product._id}`}>
//         <div className="rounded-2xl border p-3 w-full max-w-[500px] hover:shadow-lg transition-all group bg-white h-full">
//           <div className="relative">
//             <img
//               src={displayedImage}
//               alt={product.name}
//               className="w-full rounded-xl h-[250px] object-cover transition-transform duration-300 group-hover:scale-105"
//             />
//           </div>

//           <div className="mt-3 flex flex-col flex-grow">
//             <p className="text-[16px] font-semibold line-clamp-2 h-[40px] leading-[20px] text-left">
//               {product.name}
//             </p>
//             <div className="h-[22px]">
//               {reviewData.total > 0 && (
//                 <StarRating
//                   rating={Number(reviewData.average)}
//                   total={reviewData.total}
//                 />
//               )}
//             </div>

//             <div className="flex flex-wrap items-end gap-2 mt-1">
//               <p className="text-[18px] font-semibold text-black">
//                 ₹{priceData.offerPrice}
//               </p>
//               <div className="flex gap-1">
//                 {priceData.discountPercent > 0 && (
//                   <p className="line-through text-gray-400 text-[16px]">
//                     ₹{priceData.originalPrice}
//                   </p>
//                 )}
//                 {priceData.discountPercent > 0 && (
//                   <span className="text-primary text-[14px]">
//                     {priceData.discountPercent}% OFF
//                   </span>
//                 )}
//               </div>
//             </div>

//             {cartQuantity === 0 ? (
//               <Button
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleAddToCart();
//                 }}
//                 disabled={addingToCart || isOutOfStock}
//                 variant="outline"
//                 className="mt-3 w-full border text-primary hover:text-white rounded-full flex items-center justify-center gap-2 transition"
//               >
//                 {addingToCart
//                   ? "Adding..."
//                   : isOutOfStock
//                     ? "Out of Stock"
//                     : "ADD"}
//               </Button>
//             ) : (
//               <div
//                 onClick={(e) => e.preventDefault()}
//                 className="mt-3 w-full border border-primary rounded-full flex items-center justify-between overflow-hidden"
//               >
//                 <button
//                   onClick={handleDecrease}
//                   className="flex-1 h-[38px] text-primary hover:bg-primary hover:text-white transition text-xl font-bold"
//                 >
//                   −
//                 </button>
//                 <span className="flex-1 text-center text-[15px] font-semibold text-black">
//                   {cartQuantity}
//                 </span>
//                 <button
//                   onClick={handleIncrease}
//                   className="flex-1 h-[38px] text-primary hover:bg-primary hover:text-white transition text-xl font-bold"
//                 >
//                   +
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </Link>
//     </>
//   );
// }

import { useState, useEffect, useCallback, useMemo } from "react";
import { getImageUrl } from "../utils/helper";
import { Link } from "react-router-dom";
import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  createCart,
  fetchCart,
  updateCartItem,
  deleteCartItem,
} from "../../features/cart/cartThunk";
import { updateLocalQuantity } from "../../features/cart/cartSlice";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import StarRating from "../reviews/starrating";

function CountdownTimer({ endDate }) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return {
      hours,
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  }, [endDate]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = calcTimeLeft();
      setTimeLeft(t);
      if (!t) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calcTimeLeft]);

  if (!timeLeft) return null;

  return (
    <span className="text-theme text-[12px] md:text-[15px] font-bold">
      Ends in {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
    </span>
  );
}

export default function ProductCard({ product, setShowLoginPopup }) {
  const dispatch = useDispatch();
  // ✅ FIX: useNavigate component level par — handler ma nahi
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const { items = [] } = useSelector((state) => state.cart);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const cartItem = useMemo(() => {
    if (!product?._id) return null;
    return (
      items.find(
        (item) =>
          item.product_id?._id === product._id ||
          item.product_id === product._id,
      ) || null
    );
  }, [items, product]);

  const cartQuantity = cartItem?.quantity || 0;

  const getPriceData = (product) => {
    const variant = product?.variants?.[0];
    const originalPrice = variant?.price || 0;
    const offerPrice = variant?.offerprice || originalPrice;
    let discountPercent = 0;
    if (originalPrice > offerPrice) {
      const rawDiscount = ((originalPrice - offerPrice) / originalPrice) * 100;
      const decimal = rawDiscount % 1;
      discountPercent =
        decimal >= 0.5 ? Math.ceil(rawDiscount) : Math.floor(rawDiscount);
    }
    return { originalPrice, offerPrice, discountPercent };
  };

  const { productReviews } = useSelector((state) => state.reviews);
  const reviewData = useMemo(() => {
    const reviews = productReviews?.[product?._id]?.reviews || [];
    if (reviews.length === 0) return { average: 0, total: 0 };
    const total = reviews.length;
    const sum = reviews.reduce(
      (acc, curr) => acc + (Number(curr.rating) || 0),
      0,
    );
    return { average: (sum / total).toFixed(1), total };
  }, [productReviews, product?._id]);

  const [currentIndex] = useState(0);

  const displayedImage = product?.images
    ? getImageUrl(product.images)
    : "/placeholder.png";

  const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);
  const wishlistProductIds = useSelector((state) => state.wishlist.productIds);

  const getVariantForColor = (product, colorCode) => {
    return (
      product?.variants?.find((v) =>
        v.color?.some((c) => c.code === colorCode),
      ) || product?.variants?.[0]
    );
  };

  const currentVariant =
    getVariantForColor(product, selectedColor) || product?.variants?.[0];
  const isOutOfStock = currentVariant?.stock_quantity === 0;
  const priceData = getPriceData(product);

  const handleAddToCart = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    const variant = currentVariant;
    if (!variant?._id) return toast.error("Variant not found!");
    if (variant?.stock_quantity === 0)
      return toast.error("This variant is out of stock!");

    setAddingToCart(true);
    try {
      let cartId = cart?._id || localStorage.getItem("cart_id");
      if (!cartId) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          toast.error("Please login again");
          setShowLoginPopup(true);
          return;
        }
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
      toast.success("Added to cart!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIncrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const cartId = cart?._id || localStorage.getItem("cart_id");
    if (!cartId) return;
    const newQty = cartItem.quantity + 1;
    dispatch(updateLocalQuantity({ item_id: cartItem._id, quantity: newQty }));
    dispatch(
      updateCartItem({
        cart_id: cartId,
        item_id: cartItem._id,
        quantity: newQty,
      }),
    )
      .unwrap()
      .catch(() => {
        dispatch(
          updateLocalQuantity({
            item_id: cartItem._id,
            quantity: cartItem.quantity,
          }),
        );
      });
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const cartId = cart?._id || localStorage.getItem("cart_id");
    if (!cartId) return;

    if (cartItem.quantity <= 1) {
      dispatch(deleteCartItem({ cart_id: cartId, item_id: cartItem._id }))
        .unwrap()
        .then(() => dispatch(fetchCart(cartId)));
    } else {
      const newQty = cartItem.quantity - 1;
      dispatch(
        updateLocalQuantity({ item_id: cartItem._id, quantity: newQty }),
      );
      dispatch(
        updateCartItem({
          cart_id: cartId,
          item_id: cartItem._id,
          quantity: newQty,
        }),
      )
        .unwrap()
        .catch(() => {
          dispatch(
            updateLocalQuantity({
              item_id: cartItem._id,
              quantity: cartItem.quantity,
            }),
          );
        });
    }
  };

  return (
    <Link to={`/products/${product._id}`}>
      <div className="rounded-2xl border p-3 w-full max-w-[500px] hover:shadow-lg transition-all group bg-white h-full">
        <div className="relative">
          <img
            src={displayedImage}
            alt={product.name}
            className="w-full rounded-xl h-[250px] object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className="mt-3 flex flex-col flex-grow">
          <p className="text-[16px] font-semibold line-clamp-2 h-[40px] leading-[20px] text-left">
            {product.name}
          </p>
          <div className="h-[22px]">
            {reviewData.total > 0 && (
              <StarRating
                rating={Number(reviewData.average)}
                total={reviewData.total}
              />
            )}
          </div>

          <div className="flex flex-wrap items-end gap-2 mt-1">
            <p className="text-[18px] font-semibold text-black">
              ₹{priceData.offerPrice}
            </p>
            <div className="flex gap-1">
              {priceData.discountPercent > 0 && (
                <p className="line-through text-gray-400 text-[16px]">
                  ₹{priceData.originalPrice}
                </p>
              )}
              {priceData.discountPercent > 0 && (
                <span className="text-primary text-[14px]">
                  {priceData.discountPercent}% OFF
                </span>
              )}
            </div>
          </div>

          {cartQuantity === 0 ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={addingToCart || isOutOfStock}
              variant="outline"
              className="mt-3 w-full border text-primary hover:text-white rounded-full flex items-center justify-center gap-2 transition"
            >
              {addingToCart
                ? "Adding..."
                : isOutOfStock
                  ? "Out of Stock"
                  : "ADD"}
            </Button>
          ) : (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="mt-3 w-full border border-primary rounded-full flex items-center justify-between overflow-hidden"
            >
              <Button
                onClick={handleDecrease}
                className="flex-1 text-primary transition text-xl font-bold border-r border-primary"
              >
                −
              </Button>
              <span className="flex-1 text-center text-[15px] font-semibold text-black px-5">
                {cartQuantity}
              </span>
              <Button
                onClick={handleIncrease}
                className="flex-1  text-primary border-l border-primary transition text-xl font-bold"
              >
                +
              </Button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
