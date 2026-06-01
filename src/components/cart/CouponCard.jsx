
// import { useState } from "react";
// import { useSelector } from "react-redux";
// import { Tag, ChevronDown, ChevronUp } from "lucide-react";

// export default function CouponCard({
//   appliedCoupon,
//   setAppliedCoupon,
//   onSelectCoupon,
//   cartCouponCode,
//   setCartCouponCode,
//   couponMsg,
//   setCouponMsg,
//   onApplyCartCoupon,
// }) {
//   const { coupons = [] } = useSelector((state) => state.coupons);
//   const { items = [] } = useSelector((state) => state.cart);
//   const [showCoupons, setShowCoupons] = useState(false);

//   if (items.length === 0) return null;

//   const filteredCoupons = coupons.filter((coupon) => {
//     if (coupon.apply_type === "allproducts") return true;

//     if (coupon.apply_type === "specificproducts") {
//       return items.some((item) =>
//         coupon.products?.some(
//           (product) =>
//             String(product?._id || product) === String(item?.product_id?._id),
//         ),
//       );
//     }

//     if (coupon.apply_type === "specificsubcategory") {
//       return items.some((item) => {
//         const product = item?.product_id;
//         const productSubCategoryId = String(
//           product?.category_id?._id ||
//             product?.category_id ||
//             product?.parent_id?._id ||
//             product?.parent_id ||
//             product?.subcategory_id?._id ||
//             product?.subcategory_id ||
//             product?.subcategory?._id ||
//             product?.subcategory ||
//             "",
//         );
//         return coupon.subcategories?.some(
//           (subcategory) =>
//             String(subcategory?._id || subcategory) === productSubCategoryId,
//         );
//       });
//     }
//     return false;
//   });

//   return (
//     <div className="bg-white rounded-[12px] border border-gray-100 shadow-sm p-[18px] mb-[16px]">
//       {/* Header */}
//       <div className="flex items-center gap-[8px] mb-[14px]">
//         <Tag size={18} className="text-gray-800" />
//         <span className="text-[15px] font-semibold text-gray-900">
//           Apply Coupon
//         </span>
//       </div>

//       <div className="flex gap-[8px] mb-[10px]">
//         <input
//           type="text"
//            value={cartCouponCode}
//           onChange={(e) => {
//                           setCartCouponCode(e.target.value);
//                           setCouponMsg({ text: "", type: "" });
//                         }}
//           placeholder="ENTER COUPON CODE"
//           className="flex-1 border border-gray-200 rounded-[8px] px-[14px] py-[10px] text-[13px] tracking-widest placeholder:tracking-widest placeholder:text-gray-400 focus:outline-none focus:border-gray-400 uppercase"
//         />
//         <button
//           onClick={onApplyCartCoupon}
//           className="bg-gray-900 text-white text-[14px] font-semibold px-[20px] py-[10px] rounded-[8px] hover:bg-gray-700 transition-colors whitespace-nowrap"
//         >
//           Apply
//         </button>
//       </div>

//       {couponMsg?.text && (
//         <p
//           className={`text-[12px] font-medium mb-[10px] ${
//             couponMsg.type === "success" ? "text-green-600" : "text-red-500"
//           }`}
//         >
//           {couponMsg.text}
//         </p>
//       )}

//       {filteredCoupons.length > 0 && (
//         <>
//           <button
//             onClick={() => setShowCoupons((p) => !p)}
//             className="w-full flex items-center justify-center gap-[6px] border border-gray-200 rounded-[8px] py-[9px] text-[13px] font-semibold text-[#1a5fb4] hover:bg-gray-50 transition-colors"
//           >
//             View Available Coupons ({filteredCoupons.length})
//             {showCoupons ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
//           </button>

//           {showCoupons && (
//             <div className="mt-[12px] space-y-[8px]">
//               {filteredCoupons.map((coupon) => (
//                 <div
//                   key={coupon._id}
//                   className={`flex items-center justify-between border rounded-[8px] px-[14px] py-[12px] transition-colors
//                     ${
//                       appliedCoupon?.code === coupon.code
//                         ? "border-green-400 bg-green-50"
//                         : "border-gray-200 bg-white hover:border-gray-300"
//                     }`}
//                 >
//                   <div>
//                     <span className="inline-block border border-gray-300 rounded-[4px] text-[11px] font-bold tracking-widest px-[8px] py-[2px] text-gray-800 bg-gray-50 mb-[4px]">
//                       {coupon.code}
//                     </span>
//                     <p className="text-[12px] text-gray-500">
//                       {coupon.discount_type === "fixed"
//                         ? `extra ₹${coupon.discount_value} off`
//                         : `extra ${coupon.discount_value}% off`}
//                     </p>
//                   </div>

//                   {appliedCoupon?.code === coupon.code ? (
//                     <button
//                       onClick={() => {
//                         setAppliedCoupon(null);
//                         setCartCouponCode("");
//                         setCouponMsg({ text: "", type: "" });
//                       }}
//                       className="text-[12px] font-semibold text-red-500 border border-red-300 rounded-[6px] px-[14px] py-[6px] hover:bg-red-50 transition-colors"
//                     >
//                       Remove
//                     </button>
//                   ) : (
//                     <button
//                       onClick={() => onSelectCoupon(coupon.code)}
//                       className="text-[13px] font-bold text-white bg-[#1a5fb4] rounded-[6px] px-[18px] py-[6px] hover:bg-[#174fa0] transition-colors"
//                     >
//                       Apply
//                     </button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
