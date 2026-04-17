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

import { createSize, getSizeById, updateSize } from "@/features/sizes/sizesThunk";

export default function SizeFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const [name, setName] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getSizeById(id)).then((res: any) => {
        if (res.payload) {
          const size = res.payload;
          setName(size.name || "");
          setMeasurement(size.measurement || "");
          setStatus(size.status === "active");
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, measurement, status: status ? "active" : "inactive" };

    try {
      let result;
      if (isEditMode && id) result = await dispatch(updateSize({ id, data: payload }));
      else result = await dispatch(createSize(payload));

      if (createSize.fulfilled.match(result) || updateSize.fulfilled.match(result)) {
        toast.success(isEditMode ? "Size updated successfully!" : "Size created successfully!");
        navigate(`${basePath}/sizes`);

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
        <Link to={`${basePath}/sizes`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Size" : "Add New Size"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update size details." : "Create a new size."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">Size Name <span className="text-red-500">*</span></Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
              </div>

              <div>
                <Label htmlFor="measurement">Measurement</Label>
                <Input id="measurement" value={measurement} onChange={(e) => setMeasurement(e.target.value)} placeholder="e.g., Small, 40cm" className="mt-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch id="status" checked={status} onCheckedChange={(val) => setStatus(val)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isEditMode ? "Update Size" : "Create Size"}
            </Button>
            <Link to={`${basePath}/sizes`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">Cancel</Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
