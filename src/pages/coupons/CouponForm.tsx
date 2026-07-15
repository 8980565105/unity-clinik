import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import {
  createCoupon,
  getCouponById,
  updateCoupon,
} from "@/features/coupons/couponsThunk";
import { Textarea } from "@/components/ui/textarea";
import { fetchProducts } from "@/features/products/productsThunk";
import Select from "react-select";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
// import { Header } from "@radix-ui/react-accordion";
const generateCouponCode = (length = 8) => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function CouponFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [header_title, setheader_title] = useState("");

  const [discountType, setDiscountType] = useState<
    "percentage" | "fixed" | "freeshiping" | "product" | "buy x get y"
  >("percentage");
  const [giftProducts, setGiftProducts] = useState<
    { value: string; label: string }[]
  >([]);
  const [buyQuantity, setBuyQuantity] = useState(0);
  const [getQuantity, setGetQuantity] = useState(0);
  const [couponType, setCouponType] = useState<
    "normal" | "first_order" | "free_gift" | "referral" | "buy_x_get_y"
  >("normal");
  const [discountValue, setDiscountValue] = useState<string>("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<string>("0");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("1");
  const [userusageLimit, setuserUsageLimit] = useState<string>("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(true);
  const [code, setCode] = useState("");
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [apply, setApplyCoupon] = useState("allproducts");
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [freeProducts, setFreeProducts] = useState<any[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<any[]>([]);
  const [usedCount, setUsedCount] = useState(0);
  // const [status, setStatus] = useState(true);
  const [isPrepaidOnly, setIsPrepaidOnly] = useState(false);

  useEffect(() => {
    loadProducts();
    loadSubCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await dispatch(fetchProducts({})).unwrap();
      setProducts(res.products || []);
    } catch (error) {
      toast.error(error);
    }
  };

  const loadSubCategories = async () => {
    try {
      const res = await dispatch(
        fetchsubCategories({ page: 1, limit: 1000 })
      ).unwrap();
      setSubCategories(res?.categories || []);
    } catch (error) {
      toast.error(error);
    }
  };

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getCouponById(id)).then((res: any) => {
        if (res.payload) {
          const coupon = res.payload;
          setName(coupon.name || "");
          setCode(coupon.code || "");
          setDescription(coupon.description || "");
          setheader_title(coupon.header_title || "");
          setDiscountType(coupon.discount_type || "percentage");
          setCouponType(coupon.coupon_type || "normal");
          setBuyQuantity(Number(coupon.buy_x_get_y?.buy_quantity));
          setGetQuantity(Number(coupon.buy_x_get_y?.get_quantity));
          setUsageLimit(String(coupon.usage_limit || 0));
          setuserUsageLimit(String(coupon.userusage_limit || 0));
          setUsedCount(Number(coupon.used_count || 0));
          setStatus(coupon.status === "active");
          setIsPrepaidOnly(Boolean(coupon.is_prepaid_only));

          if (coupon.gift_product_ids && coupon.gift_product_ids.length > 0) {
            setGiftProducts(
              coupon.gift_product_ids.map((p: any) => ({
                value: p._id || p,
                label: p.name || "Gift Product",
              }))
            );
          }
          if (coupon.coupon_type === "buy_x_get_y") {
            setBuyQuantity(coupon.buy_x_get_y?.buy_quantity || 0);
            setGetQuantity(coupon.buy_x_get_y?.get_quantity || 0);

            setFreeProducts(
              (coupon.buy_x_get_y?.free_products || []).map((product) => ({
                value: product._id,
                label: product.name,
              }))
            );
          }

          setDiscountValue(String(coupon.discount_value || ""));
          setMinPurchaseAmount(String(coupon.min_purchase_amount ?? "0"));
          setMaxDiscountAmount(
            coupon.max_discount_amount !== null
              ? String(coupon.max_discount_amount)
              : ""
          );
          setUsageLimit(String(coupon.usage_limit || "1"));
          setStartDate(
            coupon.start_date
              ? new Date(coupon.start_date).toISOString().slice(0, 16)
              : ""
          );
          setEndDate(
            coupon.end_date
              ? new Date(coupon.end_date).toISOString().slice(0, 16)
              : ""
          );

          setApplyCoupon(coupon.apply_type || "allproducts");

          setSelectedProducts(
            coupon.products?.map((p: any) => ({
              value: p._id || p,
              label: p.name || p.title || "Product",
            })) || []
          );

          setSelectedSubCategories(
            coupon.subcategories?.map((s: any) => ({
              value: s._id || s,
              label: s.name || s.title || "SubCategory",
            })) || []
          );

          setStatus(coupon.status === "active");
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleAutoGenerateToggle = (checked: boolean) => {
    setAutoGenerate(checked);
    if (checked) {
      setCode(generateCouponCode());
    } else {
      setCode("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Please enter coupon name");
    if (!code.trim())
      return toast.error("Please enter or generate a coupon code");
    if (!usageLimit || Number(usageLimit) < 1)
      return toast.error("Please enter a valid usage limit");
    if (!userusageLimit || Number(userusageLimit) < 1)
      return toast.error("Please enter a valid user usage limit");
    if (!startDate) return toast.error("Please select a start date & time");
    if (!endDate) return toast.error("Please select an end date & time");
    if (new Date(endDate) < new Date(startDate))
      return toast.error("End date cannot be before start date");
    if (couponType === "free_gift" && giftProducts.length === 0) {
      return toast.error("Please select at least one gift product");
    }

    const payload: any = {
      name,
      code: code.toUpperCase(),
      description,
      header_title,
      discount_type: discountType,
      coupon_type: couponType,
      discount_value: Number(discountValue),
      min_purchase_amount: Number(minPurchaseAmount),
      max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usage_limit: Number(usageLimit),
      userusage_limit: Number(userusageLimit),
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      status: status ? "active" : "inactive",
      is_prepaid_only: isPrepaidOnly,
      gift_product_ids:
        couponType === "free_gift"
          ? giftProducts.map((p) => p.value)
          : [],

      buy_x_get_y:
        couponType === "buy_x_get_y"
          ? { buy_quantity: buyQuantity, get_quantity: getQuantity, free_products: freeProducts.map((p) => p.value), }
          : undefined,

      apply_type: apply,

      products:
        apply === "specificproducts" || apply === "Excludeproduct"
          ? selectedProducts.map((p) => p.value)
          : [],

      subcategories:
        apply === "specificsubcategory" || apply === "Excludecategories"
          ? selectedSubCategories.map((s) => s.value)
          : [],
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateCoupon({ id, data: payload }));
      } else {
        result = await dispatch(createCoupon(payload));
      }

      if (
        createCoupon.fulfilled.match(result) ||
        updateCoupon.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode ? "Coupon updated successfully!" : "Coupon created successfully!"
        );
        navigate(`${basePath}/coupons`);
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch {
      toast.error("Server Error");
    }
  };

  const handleDiscountTypeChange = (value: string) => {
    setDiscountType(value as any);
    setDiscountValue("0");
  };

  const handleCouponTypeChange = (value: string) => {
    setCouponType(value as any);
    if (value === "free_gift") {
      setDiscountType("product" as any);
      setDiscountValue("0");
    }
    if (value !== "free_gift") {
      setGiftProducts([]);
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/coupons`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Coupon" : "Add New Coupon"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update coupon details." : "Create a new coupon."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Coupon Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">Coupon Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <Label htmlFor="code">Coupon Code *</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => {
                      if (!autoGenerate) {
                        setCode(e.target.value.toUpperCase());
                      }
                    }}
                    readOnly={autoGenerate}
                    placeholder="e.g. SAVE20"
                    className={autoGenerate ? "bg-gray-100 cursor-not-allowed" : ""}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <Label>Prepaid Only</Label>
                  <Switch
                    id="prepaid_only"
                    checked={isPrepaidOnly}
                    onCheckedChange={(val) => setIsPrepaidOnly(val)}
                  />
                </div>

                <div className="flex gap-3 items-center">
                  <Input
                    className="w-5 h-5"
                    type="checkbox"
                    onChange={(e) => handleAutoGenerateToggle(e.target.checked)}
                  />
                  <Label>Auto Generate</Label>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter coupon description..."
                />
              </div>
              <div>
                <div>
                  <Label htmlFor="header">Header title</Label>

                  <TiptapEditor
                    value={header_title}
                    onChange={(value) => setheader_title(value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="discountType">Discount Type</Label>
                  <select
                    id="discountType"
                    value={discountType}
                    onChange={(e) => handleDiscountTypeChange(e.target.value)}
                    disabled={
                      couponType === "free_gift" || couponType === "buy_x_get_y"
                    }
                    className="mt-1 w-full border rounded-md p-2"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                    <option value="freeshiping">Free Shipping</option>
                    {couponType === "free_gift" && (
                      <option value="product">Free Gift Product</option>
                    )}
                    {couponType === "buy_x_get_y" && (
                      <option value="buy_x_get_y">Buy X Get Y</option>
                    )}
                  </select>
                </div>
                <div>
                  <Label htmlFor="couponType">Coupon Type</Label>
                  <select
                    id="couponType"
                    value={couponType}
                    onChange={(e) => handleCouponTypeChange(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2"
                  >
                    <option value="normal">Normal</option>
                    <option value="first_order">First Order Coupon</option>
                    <option value="free_gift">Free Gift Coupon</option>
                    <option value="referral">Referral Coupon</option>
                    <option value="buy_x_get_y">Buy X Get Y Free</option>
                    <option value="privet">privet</option>
                  </select>
                </div>
              </div>

              {discountType === "percentage" && couponType !== "free_gift" && (
                <div>
                  <Label>Percentage (%) Value</Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min={1}
                    max={100}
                  />
                </div>
              )}

              {discountType === "fixed" && couponType !== "free_gift" && (
                <div>
                  <Label>Fixed Value</Label>
                  <Input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min={1}
                  />
                </div>
              )}

              {couponType === "free_gift" && (
                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <Label className="text-blue-800 font-semibold mb-2 block">
                    🎁 Select Gift Products (Multiple Allowed)
                  </Label>
                  <Select
                    isMulti
                    options={products.map((p: any) => ({
                      value: p._id,
                      label: p.name,
                    }))}
                    value={giftProducts}
                    onChange={(selected: any) =>
                      setGiftProducts(selected || [])
                    }
                    placeholder="Search and select gift products..."
                    isClearable
                  />
                  {giftProducts.length > 0 && (
                    <p className="text-blue-600 text-sm mt-2">
                      {giftProducts.length} gift product(s) selected
                    </p>
                  )}
                </div>
              )}

              {couponType === "buy_x_get_y" && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Buy X *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={buyQuantity}
                      onChange={(e) => setBuyQuantity(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <Label>Get Y *</Label>
                    <Input
                      type="number"
                      min={1}
                      value={getQuantity}
                      onChange={(e) => setGetQuantity(Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <Label>select product</Label>

                    <Select
                      isMulti
                      options={products.map((p) => ({
                        value: p._id,
                        label: p.name,
                      }))}
                      value={freeProducts}
                      onChange={(selected) => setFreeProducts(selected as any || [])}
                      placeholder="Search Products..."
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minPurchase">Min Purchase Amount</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    value={minPurchaseAmount}
                    onChange={(e) => setMinPurchaseAmount(e.target.value)}
                    min={0}
                  />
                </div>
                <div>
                  <Label htmlFor="maxDiscount">Max Discount Amount</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    min={0}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Total Usage Limit</Label>
                  <Input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Used Count</Label>
                  <Input
                    value={usedCount}
                    readOnly
                    disabled
                  />
                </div>

                <div>
                  <Label>Remaining</Label>
                  <Input
                    value={
                      Number(usageLimit || 0) - Number(usedCount || 0)
                    }
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label>User Use Limit</Label>
                <Input
                  type="number"
                  value={userusageLimit}
                  onChange={(e) => setuserUsageLimit(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apply">Applies To *</Label>
                  <select
                    id="apply"
                    value={apply}
                    onChange={(e) => setApplyCoupon(e.target.value)}
                    className="mt-1 w-full border rounded-md p-2"
                  >
                    <option value="allproducts">All Products</option>
                    <option value="specificproducts">Specific Products</option>
                    <option value="specificsubcategory">Specific SubCategory</option>
                    <option value="Excludeproduct">Exclude Selected Products</option>
                    <option value="Excludecategories">Exclude Selected SubCategories</option>
                  </select>
                </div>

                {(apply === "specificproducts" || apply === "Excludeproduct") && (
                  <div>
                    <Label>
                      {apply === "Excludeproduct" ? "Exclude Products" : "Select Products"}
                    </Label>
                    <Select
                      isMulti
                      options={products.map((product: any) => ({
                        value: product._id,
                        label: product.name,
                      }))}
                      value={selectedProducts}
                      onChange={(selected: any) =>
                        setSelectedProducts(selected as any)
                      }
                      placeholder="Search Products..."
                    />
                  </div>
                )}

                {(apply === "specificsubcategory" || apply === "Excludecategories") && (
                  <div>
                    <Label>
                      {apply === "Excludecategories"
                        ? "Exclude SubCategories"
                        : "Select SubCategory"}
                    </Label>
                    <Select
                      isMulti
                      options={subCategories.map((subcategory: any) => ({
                        value: subcategory._id,
                        label: subcategory.name,
                      }))}
                      value={selectedSubCategories}
                      onChange={(selected: any) =>
                        setSelectedSubCategories(selected || [])
                      }
                      placeholder="Search SubCategory..."
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-6 shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch
                  id="status"
                  checked={status}
                  onCheckedChange={(val) => setStatus(val)}
                />
              </div>
              <div className="flex gap-3 mt-3">
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isEditMode ? "Update Coupon" : "Create Coupon"}
                </Button>
                <Link to={`${basePath}/coupons`} className="flex-1">
                  <Button type="button" variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </form >
    </div >
  );
}