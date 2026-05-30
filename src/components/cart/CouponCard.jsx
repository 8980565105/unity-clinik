import Button from "../ui/Button";
import logo from "../../assets/logo.png";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

export default function CouponCard({
  appliedCoupon,
  setAppliedCoupon,
  onSelectCoupon,
}) {
  const { coupons = [] } = useSelector((state) => state.coupons);
  const { items = [] } = useSelector((state) => state.cart);

  if (items.length === 0) {
    return null;
  }

  const cartProductOwnerIds = [
    ...new Set(
      items
        .map((item) => {
          const createdBy = item?.product_id?.createdBy;
          return createdBy?._id
            ? String(createdBy._id)
            : createdBy
              ? String(createdBy)
              : null;
        })
        .filter(Boolean),
    ),
  ];

  // const filteredCoupons = coupons.filter((coupon) => {
  //   if (coupon.apply_type === "allproducts") {
  //     return true;
  //   }

  //   if (coupon.apply_type === "specificproducts") {
  //     return items.some((item) =>
  //       coupon.products?.some(
  //         (product) =>
  //           String(product?._id || product) === String(item?.product_id?._id),
  //       ),
  //     );
  //   }

  //   if (coupon.apply_type === "specificsubcategory") {
  //     return items.some((item) => {
  //       const product = item?.product_id;

  //       const possibleIds = [product?.category_id].filter(Boolean).map(String);

  //       console.log("possibleIds", possibleIds);

  //       console.log("couponSubCategories", coupon.subcategories);

  //       return coupon.subcategories?.some((subcategory) =>
  //         possibleIds.includes(String(subcategory?._id || subcategory)),
  //       );
  //     });
  //   }
  //   return false;
  // });

  const filteredCoupons = coupons.filter((coupon) => {
    if (coupon.apply_type === "allproducts") {
      return true;
    }

    if (coupon.apply_type === "specificproducts") {
      return items.some((item) =>
        coupon.products?.some(
          (product) =>
            String(product?._id || product) === String(item?.product_id?._id),
        ),
      );
    }

    if (coupon.apply_type === "specificsubcategory") {
      return items.some((item) => {
        const product = item?.product_id;

        const productSubCategoryId = String(
          product?.category_id?._id ||
            product?.category_id ||
            product?.parent_id?._id ||
            product?.parent_id ||
            product?.subcategory_id?._id ||
            product?.subcategory_id ||
            product?.subcategory?._id ||
            product?.subcategory ||
            "",
        );

        return coupon.subcategories?.some(
          (subcategory) =>
            String(subcategory?._id || subcategory) === productSubCategoryId,
        );
      });
    }

    return false;
  });

  return (
    <>
      {filteredCoupons.map((coupon) => (
        <div
          key={coupon._id}
          className="flex flex-col custom-lg:flex-row gap-[10px] shadow-md rounded-[3px] overflow-hidden w-full custom-lg:max-w-[343px] mt-[30px] custom-lg:mt-[40px]"
        >
          <div className="bg-color text-white flex items-center justify-center px-4 py-6 custom-lg:py-0 custom-lg:w-[80px]">
            <span className="text-20px font-bold tracking-wider custom-lg:-rotate-90">
              DISCOUNT
            </span>
          </div>

          <div className="flex-1 p-5 custom-lg:p-4 flex flex-col justify-between bg-white">
            <div className="flex gap-[10px] justify-between items-center">
              <div>
                <p className="sec-text-color text-[14px] custom-lg:text-base font-medium">
                  {coupon.discount_type === "fixed"
                    ? `Flat ₹${coupon.discount_value} off*`
                    : `Flat ${coupon.discount_value}% off*`}
                </p>
                <h2 className="font-18 font-semibold text-black mt-1">
                  {coupon.code}
                </h2>
              </div>
            </div>
            <p className="sec-text-color font-medium text-[12px] mt-[10px]">
              {coupon.name}
            </p>
            <p className="text-[12px] font-medium text-primary mt-[5px] cursor-pointer hover:underline">
              *Terms & conditions
            </p>

            <div className="mt-4">
              <Button
                onClick={() => onSelectCoupon(coupon.code)}
                className="w-full text-black !text-[12px] font-bold !py-[6px] rounded-full transition"
                variant="outline"
              >
                Apply Code
              </Button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
