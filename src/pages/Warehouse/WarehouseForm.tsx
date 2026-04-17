import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useBasePath } from "@/hooks/useBasePath";

import {
  createWarehouse,
  getWarehouseById,
  updateWarehouse,
} from "@/features/warehouse/warehouseThunk";
import { toast } from "sonner";


export default function WarehouseFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const [name, setName] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getWarehouseById(id))
        .unwrap()
        .then((data) => {
          setName(data.name);
          setStatus(data.status === "active");
        })
        .catch(() => {
          toast.error("Failed to load warehouse data");
        });
    }
  }, [id, isEditMode, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Please enter warehouse name");

    const payload = {
      name,
      status: status ? "active" : "inactive",
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateWarehouse({ id, data: payload }));
      } else {
        result = await dispatch(createWarehouse(payload));
      }

      if (
        createWarehouse.fulfilled.match(result) ||
        updateWarehouse.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode
            ? "Warehouse updated successfully!"
            : "Warehouse created successfully!"
        );
        navigate(`${basePath}/warehouse`);
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
        <Link to={`${basePath}/warehouse`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Warehouse" : "Add New Warehouse"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update warehouse details."
              : "Create a new warehouse."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Warehouse Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">Warehouse Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter warehouse name"
                />
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
              {isEditMode ? "Update Warehouse" : "Create Warehouse"}
            </Button>
            <Link to={`${basePath}/warehouse`} className="flex-1">
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