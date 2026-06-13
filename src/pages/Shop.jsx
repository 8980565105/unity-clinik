// import React, { useEffect } from "react";
// import WomenCollections from "../components/shop/WomenCollections";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPageBySlug } from "../features/pages/pagesThunk";
// import { getImageUrl } from "../components/utils/helper";
// import shopBg from "../assets/shopBannerImage.jpg";
// import { Toaster } from "react-hot-toast";
// import SEO from "../components/seo/seo.js";
// import { ChevronRight, ShoppingCart } from "lucide-react";
// import Button from "../components/ui/Button.jsx";
// import { useNavigate } from "react-router-dom";
// import ShopBannerSlider from "../components/shop/ShopBannerSlider.jsx";
// import { fetchSlides } from "../features/slides/slideThunk.js";

// const staticShopPage = {
//   sections: [
//     {
//       _id: "static-1",
//       title: "Shop",
//       description: "Wearing Fancy Clothes.",
//       image_url: shopBg,
//       isStatic: true,
//     },
//   ],
// };

// export default function Shop() {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { pages } = useSelector((state) => state.pages);

//   const { items = [] } = useSelector((state) => state.cart);
//   const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
//   const totalPrice = (items || []).reduce((sum, item) => {
//     if (!item) return sum;

//     const price =
//       Number(item?.variant_id?.offerprice ?? 0) > 0
//         ? Number(item?.variant_id?.offerprice ?? 0)
//         : Number(item?.variant_id?.price ?? 0);

//     return sum + price * Number(item?.quantity ?? 1);
//   }, 0);

//   useEffect(() => {
//     dispatch(fetchPageBySlug("shop"));
//     dispatch(fetchSlides());
//   }, [dispatch]);

//   const shopPageFromApi = pages?.find((page) => page.slug === "shop");

//   const shopPage = shopPageFromApi || staticShopPage;

//   return (
//     <>
//       <SEO
//         title={shopPage?.meta_title || "Shop"}
//         description={shopPage?.meta_description || "Shop page description"}
//         image={`${process.env.REACT_APP_API_URL_IMAGE}${shopPage?.seo_image}`}
//       />
//       <Toaster position="top-center" reverseOrder={false} />
//       <div className="py-8 w-[90%] md:w-[90%] lg:max-w-[1440px] mx-auto ">
//         <ShopBannerSlider />
//       </div>

//       <WomenCollections />

//       {totalItems > 0 && (
//         <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
//           <Button
//             variants="common"
//             onClick={() => navigate("/cart")}
//             className="flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 whitespace-nowrap
//             bg-primary text-white text-[18px] min-w-[100px] py-[8px] md:py-[15px] hover:bg-[var(--theme-hover-color)] hover:text-white"
//           >
//             <div className="relative">
//               <ShoppingCart size={20} />
//               <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
//                 {totalItems}
//               </span>
//             </div>

//             <div className="flex flex-col items-center leading-tight">
//               <span className="text-[18px] font-semibold">View cart</span>

//               <span className="text-xs md:text-sm">
//                 {totalItems} {totalItems === 1 ? "item" : "items"} | ₹
//                 {totalPrice ? totalPrice.toLocaleString("en-IN") : "0"}
//               </span>
//             </div>
//             <div className="bg-[#0C387E] rounded-full">
//               <ChevronRight size={24} />
//             </div>
//           </Button>
//         </div>
//       )}
//     </>
//   );
// }
