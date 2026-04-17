import React, { useEffect, useState } from "react";
import CartProgress from "../components/cart/CartProgress";
import CartSummary from "../components/cart/CartSummary";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import Button from "../components/ui/Button";
import CartItem from "../components/cart/CartItem";
import CouponCard from "../components/cart/CouponCard";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCoupons } from "../features/coupons/couponsThunk";

export default function Cart() {
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const dispatch = useDispatch();
  const { coupons = [] } = useSelector((state) => state.coupons);
  const [cartCouponCode, setCartCouponCode] = useState("");
  const { items = [] } = useSelector((state) => state.cart);
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });
  useEffect(() => {
    dispatch(fetchCoupons({ status: "active" }));
  }, [dispatch]);

  const applyCouponByCode = (code) => {
    const coupon = coupons.find((c) => c.code === code);
    if (!coupon) {
      setCouponMsg({ text: "Enter the coupon code!", type: "error" });
      return;
    }
    setAppliedCoupon(coupon);
    setCouponMsg({
      text: `Coupon "${coupon.code}" applied successfully!`,
      type: "success",
    });
  };

  const handleApplyCartCoupon = () => {
    applyCouponByCode(cartCouponCode);
  };

  const handleSelectCoupon = (code) => {
    setCartCouponCode(code);
    applyCouponByCode(code);
  };

  return (
    <>
      <CartProgress currentStep={1} />
      <Section>
        <Row>
          <h2 className="text-[28px]  mb-[50px] hidden md:block leading">
            <Link to="/home">Home </Link>/{" "}
            <span className="font-light">Cart</span>
          </h2>
        </Row>
        <Row className="grid grid-cols-1 custom-lg:grid-cols-[3fr_1fr] gap-[30px] items-start">
          <div className="flex-1">
            <CartItem />

            {items.length > 0 && (
              <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-[12px] mt-[20px] md:mt-[30px]">
                  <div className="flex flex-col md:flex-row gap-[12px] md:gap-[16px] items-start">
                    <div>
                      <input
                        value={cartCouponCode}
                        onChange={(e) => {
                          setCartCouponCode(e.target.value);
                          setCouponMsg({ text: "", type: "" });
                        }}
                        placeholder="COUPON CODE"
                        className="text-center border border-theme rounded-[3px] px-[10px] py-[7px]  md:py-[14px] text-18 w-[200px] md:w-[181px] "
                      />
                      {couponMsg.text && (
                        <p
                          className={`text-[13px] font-medium mt-[4px] ${
                            couponMsg.type === "success"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {couponMsg.text}
                        </p>
                      )}
                    </div>
                    <Button
                      onClick={handleApplyCartCoupon}
                      variant="common"
                      className="uppercase text-18 md:min-w-[181px]"
                    >
                      APPLY COUPON
                    </Button>
                  </div>

                  <Link to="/updatecart">
                    <Button
                      variant="secondary"
                      className="uppercase !text-18 md:min-w-[181px] self-center md:self-auto"
                    >
                      UPDATE CART
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            <CouponCard
              appliedCoupon={appliedCoupon}
              setAppliedCoupon={setAppliedCoupon}
              onSelectCoupon={handleSelectCoupon}
            />
          </div>
          <CartSummary appliedCoupon={appliedCoupon} />
        </Row>
      </Section>
    </>
  );
}
