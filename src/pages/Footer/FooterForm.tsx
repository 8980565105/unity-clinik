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
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";

import {
  createFooterItem,
  getFooterItemById,
  updateFooterItem,
} from "@/features/footer/footerThunk";

export default function FooterFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();

  const user = useSelector((state: RootState) => (state as any).auth?.user);
  const isAdmin = user?.role === "admin";

  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState(true);
  const [storeId, setStoreId] = useState<string>("");

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getFooterItemById(id)).then((res: any) => {
        if (res.payload) {
          const item = res.payload;
          setLabel(item.label || "");
          setUrl(item.url || "");
          setStatus(item.status === "active");
          setStoreId(item.storeId || "");
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return toast.error("Please enter footer label");
    if (!url.trim()) return toast.error("Please enter footer URL");

    const payload: any = {
      label,
      url,
      status: status ? "active" : "inactive",
    };

    if (isAdmin && storeId.trim()) {
      payload.storeId = storeId.trim();
    }

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateFooterItem({ id, data: payload }));
      } else {
        result = await dispatch(createFooterItem(payload));
      }

      if (
        createFooterItem.fulfilled.match(result) ||
        updateFooterItem.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode ? "Footer item updated successfully!" : "Footer item created successfully!"
        );
        navigate(`${basePath}/footer`);
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
        <Link to={`${basePath}/footer`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Footer Item" : "Add New Footer Item"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update footer item details." : "Create a new footer item."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Footer Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="label">
                  Label <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="e.g., Privacy Policy"
                />
              </div>

              <div>
                <Label htmlFor="url">
                  URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                  className="mt-1"
                  placeholder="/privacy, /contact, etc."
                />
              </div>

              {isAdmin && (
                <div>
                  <Label htmlFor="storeId">
                    Store ID{" "}
                    <span className="text-gray-400 text-xs">(admin only — leave blank for global)</span>
                  </Label>
                  <Input
                    id="storeId"
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    className="mt-1"
                    placeholder="Leave blank for global footer"
                  />
                </div>
              )}
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
                <Switch id="status" checked={status} onCheckedChange={setStatus} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isEditMode ? "Update Footer Item" : "Create Footer Item"}
            </Button>
            <Link to={`${basePath}/footer`} className="flex-1">
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