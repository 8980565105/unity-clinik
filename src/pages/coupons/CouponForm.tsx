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

export default function CouponFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();

  // 📝 Form States
  const [name, setName] = useState("");

  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">(
    "percentage"
  );
  const [discountValue, setDiscountValue] = useState<string>("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState<string>("0");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState<string>("");
  const [usageLimit, setUsageLimit] = useState<string>("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(true);

  // ✨ Fetch existing coupon in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getCouponById(id)).then((res: any) => {
        if (res.payload) {
          const coupon = res.payload;
          setName(coupon.name || "");
          setDescription(coupon.description || "");
          setDiscountType(coupon.discount_type || "percentage");
          setDiscountValue(String(coupon.discount_value || ""));
          setMinPurchaseAmount(String(coupon.min_purchase_amount ?? "0"));
          setMaxDiscountAmount(
            coupon.max_discount_amount !== null
              ? String(coupon.max_discount_amount)
              : ""
          );
          setUsageLimit(String(coupon.usage_limit || "1"));
          setStartDate(coupon.start_date?.slice(0, 10) || "");
          setEndDate(coupon.end_date?.slice(0, 10) || "");
          setStatus(coupon.status === "active");
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  // 📝 Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic Validation
    if (!name.trim()) return toast.error("Please enter coupon name");
    if (!discountValue || Number(discountValue) <= 0)
      return toast.error(
        `Please enter a valid ${discountType === "percentage" ? "percentage" : "fixed"
        } value`
      );
    if (!usageLimit || Number(usageLimit) < 1)
      return toast.error("Please enter a valid usage limit");
    if (!startDate) return toast.error("Please select a start date");
    if (!endDate) return toast.error("Please select an end date");
    if (new Date(endDate) < new Date(startDate))
      return toast.error("End date cannot be before start date");

    const payload = {
      name,
      description,
      discount_type: discountType,
      discount_value: Number(discountValue),
      min_purchase_amount: Number(minPurchaseAmount),
      max_discount_amount: maxDiscountAmount ? Number(maxDiscountAmount) : null,
      usage_limit: Number(usageLimit),
      start_date: startDate,
      end_date: endDate,
      status: status ? "active" : "inactive",
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
          isEditMode
            ? "Coupon updated successfully!"
            : "Coupon created successfully!"
        );
        // navigate("/coupons");
        navigate(`${basePath}/coupons`);

      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
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

      {/* Form */}
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
                <Label htmlFor="discountType">Discount Type</Label>
                <select
                  id="discountType"
                  value={discountType}
                  onChange={(e) =>
                    setDiscountType(e.target.value as "percentage" | "fixed")
                  }
                  className="mt-1 w-full border rounded-md p-2"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              {discountType === "percentage" ? (
                <div>
                  <Label htmlFor="percentage">Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min={1}
                    max={100}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="fixedValue">Fixed Value</Label>
                  <Input
                    id="fixedValue"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min={1}
                  />
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

              <div>
                <Label htmlFor="usageLimit">Usage Limit</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  min={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right section */}
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
            </CardContent>
          </Card>

          <div className="flex gap-3">
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
        </div>
      </form>
    </div>
  );
}
