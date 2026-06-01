// // import React, { useEffect } from "react";
// // import { Link } from "react-router-dom";
// // import Button from "../ui/Button";
// // import { useSelector, useDispatch } from "react-redux";
// // import { calculateShipping } from "../../utils/shippingCalculator";
// // import { fetchSystemSettings } from "../../features/systemsetting/systemsetting.Thunk";

// // export default function CartSummary({ appliedCoupon }) {
// //   const { items = [] } = useSelector((state) => state.cart);
// //   const settings = useSelector((state) => state.systemseting.data);
// //   const dispatch = useDispatch();

// //   useEffect(() => {
// //     dispatch(fetchSystemSettings());
// //   }, [dispatch]);

// //   const getDiscountedPrice = (item) => {
// //     const originalPrice = Number(
// //       item?.original_price || item?.variant_id?.price || 0,
// //     );
// //     const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);
// //     if (offerPrice > 0 && offerPrice < originalPrice) {
// //       return { originalPrice, discountedPrice: offerPrice };
// //     }
// //     const discount = item?.product_id?.discount_id?.value || 0;
// //     const discountedPrice =
// //       discount > 0
// //         ? originalPrice - (originalPrice * discount) / 100
// //         : originalPrice;
// //     return { originalPrice, discountedPrice };
// //   };

// //   const mrpTotal = items.reduce((sum, item) => {
// //     const { originalPrice } = getDiscountedPrice(item);
// //     return sum + originalPrice * (item.quantity || 1);
// //   }, 0);

// //   const subtotal = items.reduce((sum, item) => {
// //     const { discountedPrice } = getDiscountedPrice(item);
// //     return sum + discountedPrice * (item.quantity || 1);
// //   }, 0);

// //   const productDiscount = mrpTotal - subtotal;

// //   const settingsLoaded = !!settings;
// //   const shipping = settingsLoaded
// //     ? calculateShipping(subtotal, "prepaid", settings)
// //     : null;

// //   let couponDiscount = 0;
// //   if (appliedCoupon) {
// //     couponDiscount =
// //       appliedCoupon.discount_type === "fixed"
// //         ? appliedCoupon.discount_value
// //         : (subtotal * appliedCoupon.discount_value) / 100;
// //     if (appliedCoupon.max_discount_amount) {
// //       couponDiscount = Math.min(
// //         couponDiscount,
// //         appliedCoupon.max_discount_amount,
// //       );
// //     }
// //     localStorage.setItem("applied_coupon", JSON.stringify(appliedCoupon));
// //   } else {
// //     localStorage.removeItem("applied_coupon");
// //   }

// //   const shippingForTotal = shipping ?? 0;
// //   const orderTotal = subtotal + shippingForTotal - couponDiscount;
// //   const totalSaved = productDiscount + couponDiscount;

// //   return (
// //     <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
// //       <div className="px-[20px] py-[16px] border-b border-gray-100">
// //         <span className="text-[16px] font-bold text-gray-900">
// //           Order Summary
// //         </span>
// //       </div>

// //       <div className="px-[20px] py-[16px] space-y-[14px]">
// //         <div className="flex items-center justify-between">
// //           <span className="text-[13px] font-medium text-gray-500">
// //             Item Total (MRP)
// //           </span>

// //           <span className="text-[14px] font-semibold text-gray-900">
// //             ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
// //           </span>
// //         </div>

// //         <div className="flex items-center justify-between">
// //           <span className="text-[13px] font-medium text-gray-500">
// //             Product Discount
// //           </span>
// //           <span className="text-[14px] font-bold text-green-600">
// //             {productDiscount > 0
// //               ? `−₹${Math.round(productDiscount).toLocaleString("en-IN")}`
// //               : "₹0"}
// //           </span>
// //         </div>
// //         {appliedCoupon && couponDiscount > 0 && (
// //           <div className="flex items-center justify-between">
// //             <span className="text-[13px] font-medium text-gray-500">
// //               Coupon ({appliedCoupon.code}):
// //             </span>
// //             <span className="text-[14px] font-bold text-green-600">
// //               −₹{Math.round(couponDiscount).toLocaleString("en-IN")}
// //             </span>
// //           </div>
// //         )}
// //         <div className="border-t border-gray-100" />

// //         <div className="flex items-center justify-between">
// //           <span className="text-[13px] font-bold text-gray-800">Subtotal</span>
// //           <span className="text-[14px] font-bold text-gray-900">
// //             ₹{Math.round(subtotal).toLocaleString("en-IN")}
// //           </span>
// //         </div>

// //         <div className="flex items-center justify-between">
// //           <span className="text-[13px] font-medium text-gray-500">
// //             Shipping
// //           </span>
// //           {!settingsLoaded ? (
// //             <span className="text-[12px] font-medium text-gray-400 italic">
// //               Calculating...
// //             </span>
// //           ) : shipping === 0 ? (
// //             <span className="text-[12px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-[4px] px-[8px] py-[2px] tracking-wide">
// //               FREE
// //             </span>
// //           ) : (
// //             <span className="text-gray-500 bg-gray-50 uppercase text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-lg">
// //               Calculated at Checkout
// //             </span>
// //           )}
// //         </div>

// //         <div className="border-t border-gray-100" />

// //         <div className="flex items-center justify-between">
// //           <div>
// //             <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-[2px]">
// //               Order Total
// //             </p>
// //             <span className="text-[22px] font-bold text-gray-900">
// //               ₹{Math.round(orderTotal).toLocaleString("en-IN")}
// //             </span>
// //           </div>
// //           {totalSaved > 0 && (
// //             <span className="text-[12px] font-bold text-white bg-green-500 rounded-[6px] px-[10px] py-[5px]">
// //               SAVE ₹{Math.round(totalSaved).toLocaleString("en-IN")}
// //             </span>
// //           )}
// //         </div>
// //       </div>

// //       <div className="px-[20px] pb-[20px]">
// //         <Link to="/checkout">
// //           <Button
// //             variant="common"
// //             className="w-full uppercase text-[14px] font-bold py-[14px]"
// //           >
// //             PROCEED TO CHECKOUT
// //           </Button>
// //         </Link>
// //       </div>
// //     </div>
// //   );
// // }

// import React, { useEffect } from "react";
// import { Link } from "react-router-dom";
// import Button from "../ui/Button";
// import { useSelector, useDispatch } from "react-redux";
// import { calculateShipping } from "../../utils/shippingCalculator";
// import { fetchSystemSettings } from "../../features/systemsetting/systemsetting.Thunk";

// export default function CartSummary({ appliedCoupon }) {
//   const { items = [] } = useSelector((state) => state.cart);
//   const settings = useSelector((state) => state.systemseting.data);
//   const dispatch = useDispatch();

//   useEffect(() => {
//     dispatch(fetchSystemSettings());
//   }, [dispatch]);

//   const getDiscountedPrice = (item) => {
//     const originalPrice = Number(
//       item?.original_price || item?.variant_id?.price || 0,
//     );
//     const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);
//     if (offerPrice > 0 && offerPrice < originalPrice) {
//       return { originalPrice, discountedPrice: offerPrice };
//     }
//     const discount = item?.product_id?.discount_id?.value || 0;
//     const discountedPrice =
//       discount > 0
//         ? originalPrice - (originalPrice * discount) / 100
//         : originalPrice;
//     return { originalPrice, discountedPrice };
//   };

//   // ✅ Step 1: MRP total
//   const mrpTotal = items.reduce((sum, item) => {
//     const { originalPrice } = getDiscountedPrice(item);
//     return sum + originalPrice * (item.quantity || 1);
//   }, 0);

//   // ✅ Step 2: Offer price thi discounted total (product discount)
//   const discountedItemsTotal = items.reduce((sum, item) => {
//     const { discountedPrice } = getDiscountedPrice(item);
//     return sum + discountedPrice * (item.quantity || 1);
//   }, 0);

//   // ✅ Step 3: Product discount = MRP - offer price total
//   const productDiscount = mrpTotal - discountedItemsTotal;

//   // ✅ Step 4: Coupon discount - offer price total par apply karo
//   let couponDiscount = 0;
//   if (appliedCoupon) {
//     couponDiscount =
//       appliedCoupon.discount_type === "fixed"
//         ? appliedCoupon.discount_value
//         : (discountedItemsTotal * appliedCoupon.discount_value) / 100;
//     if (appliedCoupon.max_discount_amount) {
//       couponDiscount = Math.min(
//         couponDiscount,
//         appliedCoupon.max_discount_amount,
//       );
//     }
//     localStorage.setItem("applied_coupon", JSON.stringify(appliedCoupon));
//   } else {
//     localStorage.removeItem("applied_coupon");
//   }

//   // ✅ Step 5: Subtotal = offer price total - coupon discount
//   // (Product discount + Coupon discount baad no amount)
//   const subtotal = discountedItemsTotal - couponDiscount;

//   // ✅ Step 6: Shipping - subtotal par based (after all discounts)
//   const settingsLoaded = !!settings;
//   const shipping = settingsLoaded
//     ? calculateShipping(subtotal, "prepaid", settings)
//     : null;

//   // ✅ Step 7: Order Total = Subtotal + Shipping
//   const shippingForTotal = shipping ?? 0;
//   const orderTotal = subtotal + shippingForTotal;

//   // ✅ Total saved = product discount + coupon discount
//   const totalSaved = productDiscount + couponDiscount;

//   return (
//     <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
//       <div className="px-[20px] py-[16px] border-b border-gray-100">
//         <span className="text-[16px] font-bold text-gray-900">
//           Order Summary
//         </span>
//       </div>

//       <div className="px-[20px] py-[16px] space-y-[14px]">
//         {/* ✅ Step 1: MRP */}
//         <div className="flex items-center justify-between">
//           <span className="text-[13px] font-medium text-gray-500">
//             Item Total (MRP)
//           </span>
//           <span className="text-[14px] font-semibold text-gray-900">
//             ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
//           </span>
//         </div>

//         {/* ✅ Step 2: Product Discount */}
//         {productDiscount > 0 && (
//           <div className="flex items-center justify-between">
//             <span className="text-[13px] font-medium text-gray-500">
//               Product Discount
//             </span>
//             <span className="text-[14px] font-bold text-green-600">
//               −₹{Math.round(productDiscount).toLocaleString("en-IN")}
//             </span>
//           </div>
//         )}

//         {/* ✅ Step 3: Coupon Discount */}
//         {appliedCoupon && couponDiscount > 0 && (
//           <div className="flex items-center justify-between">
//             <span className="text-[13px] font-medium text-gray-500">
//               Coupon ({appliedCoupon.code})
//             </span>
//             <span className="text-[14px] font-bold text-green-600">
//               −₹{Math.round(couponDiscount).toLocaleString("en-IN")}
//             </span>
//           </div>
//         )}

//         <div className="border-t border-gray-100" />

//         {/* ✅ Step 4: Subtotal = after product + coupon discount */}
//         <div className="flex items-center justify-between">
//           <span className="text-[13px] font-bold text-gray-800">Subtotal</span>
//           <span className="text-[14px] font-bold text-gray-900">
//             ₹{Math.round(subtotal).toLocaleString("en-IN")}
//           </span>
//         </div>

//         {/* ✅ Step 5: Shipping */}
//         <div className="flex items-center justify-between">
//           <span className="text-[13px] font-medium text-gray-500">
//             Shipping
//           </span>
//           {!settingsLoaded ? (
//             <span className="text-[12px] font-medium text-gray-400 italic">
//               Calculating...
//             </span>
//           ) : shipping === 0 ? (
//             <span className="text-[12px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-[4px] px-[8px] py-[2px] tracking-wide">
//               FREE
//             </span>
//           ) : (
//             <span className="text-gray-500 bg-gray-50 uppercase text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-lg">
//               Calculated at Checkout
//             </span>
//           )}
//         </div>

//         <div className="border-t border-gray-100" />

//         {/* ✅ Step 6: Order Total = Subtotal + Shipping */}
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-[2px]">
//               Order Total
//             </p>
//             <span className="text-[22px] font-bold text-gray-900">
//               ₹{Math.round(orderTotal).toLocaleString("en-IN")}
//             </span>
//           </div>
//           {totalSaved > 0 && (
//             <span className="text-[12px] font-bold text-white bg-green-500 rounded-[6px] px-[10px] py-[5px]">
//               SAVE ₹{Math.round(totalSaved).toLocaleString("en-IN")}
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="px-[20px] pb-[20px]">
//         <Link to="/checkout">
//           <Button
//             variant="common"
//             className="w-full uppercase text-[14px] font-bold py-[14px]"
//           >
//             PROCEED TO CHECKOUT
//           </Button>
//         </Link>
//       </div>
//     </div>
//   );
// }

import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { useSelector, useDispatch } from "react-redux";
import { calculateShipping } from "../../utils/shippingCalculator";
import { fetchSystemSettings } from "../../features/systemsetting/systemsetting.Thunk";

export default function CartSummary({ appliedCoupon }) {
  const { items = [] } = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.systemseting.data);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  const getDiscountedPrice = (item) => {
    const originalPrice = Number(
      item?.original_price || item?.variant_id?.price || 0,
    );
    const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);
    if (offerPrice > 0 && offerPrice < originalPrice) {
      return { originalPrice, discountedPrice: offerPrice };
    }
    const discount = item?.product_id?.discount_id?.value || 0;
    const discountedPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;
    return { originalPrice, discountedPrice };
  };

  // Step 1: MRP total
  const mrpTotal = items.reduce((sum, item) => {
    const { originalPrice } = getDiscountedPrice(item);
    return sum + originalPrice * (item.quantity || 1);
  }, 0);

  // Step 2: After offer price total
  const discountedItemsTotal = items.reduce((sum, item) => {
    const { discountedPrice } = getDiscountedPrice(item);
    return sum + discountedPrice * (item.quantity || 1);
  }, 0);

  // Step 3: Product discount
  const productDiscount = mrpTotal - discountedItemsTotal;

  // Step 4: Coupon discount on discountedItemsTotal
  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount =
      appliedCoupon.discount_type === "fixed"
        ? appliedCoupon.discount_value
        : (discountedItemsTotal * appliedCoupon.discount_value) / 100;
    if (appliedCoupon.max_discount_amount) {
      couponDiscount = Math.min(
        couponDiscount,
        appliedCoupon.max_discount_amount,
      );
    }
    localStorage.setItem("applied_coupon", JSON.stringify(appliedCoupon));
  } else {
    localStorage.removeItem("applied_coupon");
  }

  // Step 5: Subtotal = discountedItemsTotal - couponDiscount
  const subtotal = discountedItemsTotal - couponDiscount;

  // Step 6: Shipping check - FREE hoy to 0, nahi to "Calculated at Checkout"
  const settingsLoaded = !!settings;
  const shippingRaw = settingsLoaded
    ? calculateShipping(subtotal, "prepaid", settings)
    : null;

  // ✅ KEY FIX: Cart page par shipping display mate use karo
  // FREE hoy to 0 show karo, nahi to "Calculated at Checkout"
  // Order Total ma HAMESHA shipping 0 j levo - checkout par add thase
  const isFreeShipping = shippingRaw === 0;

  // ✅ Order Total = subtotal only (shipping checkout par add thase)
  // FREE hoy to subtotal j Total, nahi to pan subtotal j (checkout par confirm thase)
  const orderTotal = subtotal; // shipping cart page par Total ma ADD NAHI KARVI

  // Total saved = product discount + coupon discount
  const totalSaved = productDiscount + couponDiscount;

  return (
    <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-[20px] py-[16px] border-b border-gray-100">
        <span className="text-[16px] font-bold text-gray-900">
          Order Summary
        </span>
      </div>

      <div className="px-[20px] py-[16px] space-y-[14px]">
        {/* MRP */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-gray-500">
            Item Total (MRP)
          </span>
          <span className="text-[14px] font-semibold text-gray-900">
            ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Product Discount */}
        {productDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-gray-500">
              Product Discount
            </span>
            <span className="text-[14px] font-bold text-green-600">
              −₹{Math.round(productDiscount).toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {/* Coupon Discount */}
        {appliedCoupon && couponDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-gray-500">
              Coupon ({appliedCoupon.code})
            </span>
            <span className="text-[14px] font-bold text-green-600">
              −₹{Math.round(couponDiscount).toLocaleString("en-IN")}
            </span>
          </div>
        )}

        <div className="border-t border-gray-100" />

        {/* Subtotal = MRP - Product Discount - Coupon */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-gray-800">Subtotal</span>
          <span className="text-[14px] font-bold text-gray-900">
            ₹{Math.round(subtotal).toLocaleString("en-IN")}
          </span>
        </div>

        {/* Shipping */}
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-gray-500">
            Shipping
          </span>
          {!settingsLoaded ? (
            <span className="text-[12px] font-medium text-gray-400 italic">
              Calculating...
            </span>
          ) : isFreeShipping ? (
            <span className="text-[12px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-[4px] px-[8px] py-[2px] tracking-wide">
              FREE
            </span>
          ) : (
            <span className="text-gray-500 bg-gray-50 uppercase text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-lg">
              Calculated at Checkout
            </span>
          )}
        </div>

        <div className="border-t border-gray-100" />

        {/* ✅ Order Total = Subtotal only (shipping checkout par) */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-[2px]">
              Order Total
            </p>
            <span className="text-[22px] font-bold text-gray-900">
              ₹{Math.round(orderTotal).toLocaleString("en-IN")}
            </span>
          </div>
          {totalSaved > 0 && (
            <span className="text-[12px] font-bold text-white bg-green-500 rounded-[6px] px-[10px] py-[5px]">
              SAVE ₹{Math.round(totalSaved).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>

      <div className="px-[20px] pb-[20px]">
        <Link to="/checkout">
          <Button
            variant="common"
            className="w-full uppercase text-[14px] font-bold py-[14px]"
          >
            PROCEED TO CHECKOUT
          </Button>
        </Link>
      </div>
    </div>
  );
}
