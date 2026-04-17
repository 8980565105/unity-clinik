import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import {
  createBrand,
  getBrandById,
  updateBrand,
} from "@/features/brands/brandsThunk";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function BrandFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getBrandById(id)).then((res: any) => {
        const brand = res.payload;
        if (brand && brand._id) {
          setName(brand.name || "");
          setDescription(brand.description || "");
          setStatus(brand.status === "active");
          setImageUrl(brand.image_url || null);
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      status: status ? "active" : "inactive",
      image: imageUrl,
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateBrand({ id, data: payload }));
      } else {
        result = await dispatch(createBrand(payload));
      }

      if (createBrand.fulfilled.match(result) || updateBrand.fulfilled.match(result)) {
        toast.success(isEditMode ? "Brand updated successfully!" : "Brand created successfully!");
        navigate(`${basePath}/brands`);

      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch (err) {
      console.log("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/brands`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Brand" : "Add New Brand"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update brand details." : "Create a new brand."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">Brand Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Enter brand name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brand description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label>Brand Image</Label>
                <div className="mt-1">
                  <ImageUpload value={imageUrl} onChange={(url) => setImageUrl(url as string | null)} size={150} />
                </div>
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
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isEditMode ? "Update Brand" : "Create Brand"}
            </Button>
            <Link to={`${basePath}/brands`} className="flex-1">
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
