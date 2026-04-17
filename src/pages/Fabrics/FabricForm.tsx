import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";

import { ImageUpload } from "@/components/ui/ImageUpload";
import { createFabric, getFabricById, updateFabric } from "@/features/fabrics/fabricsThunk";

export default function FabricFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Fetch fabric details if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getFabricById(id)).then((res: any) => {
        if (res.payload) {
          const fab = res.payload;
          setName(fab.name || "");
          setDescription(fab.description || "");
          setStatus(fab.status === "active");
          setImageUrl(fab.image_url || null);
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
        result = await dispatch(updateFabric({ id, data: payload }));
      } else {
        result = await dispatch(createFabric(payload));
      }

      if (
        createFabric.fulfilled.match(result) ||
        updateFabric.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode
            ? "Fabric updated successfully!"
            : "Fabric created successfully!"
        );
        navigate(`${basePath}/fabrics`);

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
        <Link to={`${basePath}/fabrics`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Fabric" : "Add New Fabric"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update fabric details."
              : "Create a new fabric for your catalog."}
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
                <Label htmlFor="name">Fabric Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Enter fabric name"
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
                  placeholder="Fabric description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div>
                <Label>Fabric Image</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={imageUrl}
                    onChange={(url) => setImageUrl(url as string | null)}
                    size={150}
                  />
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
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isEditMode ? "Update Fabric" : "Create Fabric"}
            </Button>
            <Link to={`${basePath}/fabrics`} className="flex-1">
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
