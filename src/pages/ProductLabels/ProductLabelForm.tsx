import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { useBasePath } from "@/hooks/useBasePath";
import { toast } from "sonner";
import { createProductLabel, getProductLabelById, updateProductLabel } from "@/features/productLabels/productLabelsThunk";


export default function ProductLabelFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");
  const [status, setStatus] = useState(true);

  // If edit mode → fetch label details
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getProductLabelById(id)).then((res: any) => {
        if (res.payload) {
          const label = res.payload;
          setName(label.name || "");
          setColor(label.color || "#000000");
          setStatus(label.status === "active");
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      color,
      status: status ? "active" : "inactive",
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateProductLabel({ id, data: payload }));
      } else {
        result = await dispatch(createProductLabel(payload));
      }

      if (
        createProductLabel.fulfilled.match(result) ||
        updateProductLabel.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode
            ? "Product label updated successfully!"
            : "Product label created successfully!"
        );
        navigate(`${basePath}/product-labels`);

      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/product-labels`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Product Label" : "Add New Product Label"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update product label details."
              : "Create a new product label for your catalog."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Label Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">
                  Label Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter label name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="color">
                  Color <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="mt-1 w-16 h-10 p-0 border-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isEditMode ? "Update Label" : "Create Label"}
            </Button>
            <Link to={`${basePath}/product-labels`} className="flex-1">
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
