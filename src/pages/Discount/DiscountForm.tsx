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
  createDiscount,
  getDiscountById,
  updateDiscount,
} from "@/features/discounts/discountsThunk";

export default function DiscountFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const [name, setName] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState(true);
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<string>("");

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getDiscountById(id)).then((res: any) => {
        if (res.payload) {
          const discount = res.payload;
          setName(discount.name || "");
          setType(discount.type || "percentage");
          setDiscountValue(discount.value || 0);
          setStartDate(discount.start_date?.slice(0, 10) || "");
          setEndDate(discount.end_date?.slice(0, 10) || "");
          setStatus(discount.status === "active");
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!name.trim()) {
      toast.error("Please enter discount name");
      return;
    }
    if (!discountValue || Number(discountValue) <= 0) {
      toast.error(
        `Please enter a valid ${type === "percentage" ? "percentage" : "fixed"
        } value`
      );
      return;
    }
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }
    if (!endDate) {
      toast.error("Please select an end date");
      return;
    }

    // Optional: validate that endDate >= startDate
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("End date cannot be before start date");
      return;
    }

    const payload = {
      name,
      type,
      value: Number(discountValue),
      start_date: startDate,
      end_date: endDate,
      status: status ? "active" : "inactive",
    };

    try {
      let result;
      if (isEditMode && id)
        result = await dispatch(updateDiscount({ id, data: payload }));
      else result = await dispatch(createDiscount(payload));

      if (
        createDiscount.fulfilled.match(result) ||
        updateDiscount.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode
            ? "Discount updated successfully!"
            : "Discount created successfully!"
        );
         navigate(`${basePath}/discounts`);
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/discounts`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Discount" : "Add New Discount"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update discount details." : "Create a new discount."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">
                  Discount Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="type">
                  Discount Type <span className="text-red-500">*</span>
                </Label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "percentage" | "fixed")
                  }
                  className="mt-1 w-full border rounded-md p-2"
                  required
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
              </div>

              {type === "percentage" ? (
                <div>
                  <Label htmlFor="percentage">
                    Percentage <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min={0}
                    max={100}
                    required
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="fixedValue">
                    Fixed Value <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fixedValue"
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    min={0}
                    required
                    className="mt-1"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
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
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isEditMode ? "Update Discount" : "Create Discount"}
            </Button>
            <Link to={`${basePath}/discounts`} className="flex-1">
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
