import React, { useEffect, useState } from "react";
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
  createNavbarItem,
  getNavbarItemById,
  updateNavbarItem,
} from "@/features/navbar/navbarThunk";
import { ImageUpload } from "@/components/ui/ImageUpload";

export default function NavbarFormPage() {
  const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
  
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [icon, setIcon] = useState("");
  const [order, setOrder] = useState<number | "">("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getNavbarItemById(id)).then((res: any) => {
        if (res.payload) {
          const item = res.payload;
          setLabel(item.label || "");
          setUrl(item.url || "");
          setIcon(item.icon || "");
          setOrder(item.order ?? 0);
          setStatus(item.status === "active");
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return toast.error("Please enter navbar label");
    if (!url.trim()) return toast.error("Please enter navbar URL");

    const payload = {
      label,
      url,
      order,
      icon,
      status: status ? "active" : "inactive",
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateNavbarItem({ id, data: payload }));
      } else {
        result = await dispatch(createNavbarItem(payload));
      }

      if (
        createNavbarItem.fulfilled.match(result) ||
        updateNavbarItem.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode
            ? "Navbar item updated successfully!"
            : "Navbar item created successfully!"
        );
        navigate(`${basePath}/navbar`);
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
        <Link to={`${basePath}/navbar`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Navbar Item" : "Add New Navbar Item"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update navbar item details."
              : "Create a new navbar item."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Navbar Item Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="label">Label *</Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="/home, /about, etc."
                />
              </div>

              <div>
                <Label>Icon *</Label>
                <div className="mt-1">
                  <ImageUpload
                    value={icon}
                    onChange={(url) => setIcon(url as string | null)}
                    size={150}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={order === "" ? "" : order}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOrder(val === "" ? "" : Number(val));
                  }}
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
                  onCheckedChange={setStatus}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isEditMode ? "Update Navbar Item" : "Create Navbar Item"}
            </Button>
            <Link to={`${basePath}/navbar`} className="flex-1">
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
