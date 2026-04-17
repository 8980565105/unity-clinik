import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";


import { Textarea } from "@/components/ui/textarea";
import { createUser, getUserById, updateUser } from "@/features/users/usersThunk";
import { fetchStores } from "@/features/stores/storesThunk";

export default function StoreOwnerFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // ✅ Basic Info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [status, setStatus] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // ✅ Store Info
  const [storeId, setStoreId] = useState<string>(""); // 🟡 NEW: selected store ID
 

  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [storeWebsite, setStoreWebsite] = useState("");
  const [storeLogo, setStoreLogo] = useState<string | null>(null);
  const [storeBanner, setStoreBanner] = useState<string | null>(null);
  const [storeFavicon, setStoreFavicon] = useState<string | null>(null);
  const [storeDescription, setStoreDescription] = useState("");

  // ✅ Store Address
  const [storeAddress, setStoreAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  });

  // ✅ Theme
  const [theme, setTheme] = useState({
    primaryColor: "#000000",
    secondaryColor: "#ffffff",
    buttonColor: "#007bff",
    fontFamily: "Roboto",
  });

  const { stores, loading, error } = useSelector((state: RootState) => state.stores);

  useEffect(() => {
    dispatch(fetchStores({ status: "active" })); // You can pass page/search if needed
  }, [dispatch]);


    // ❗ depends on how you define "assigned" in your schema. If you check for a missing field:
  const availableStores = (stores || []).filter(store => store.assignedName === null);


  // Fetch store owner if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getUserById(id)).then((res: any) => {
        const u = res.payload;
        if (!u) return;

        setName(u.name ?? "");
        setEmail(u.email ?? "");
        setMobile(u.mobile_number ?? "");
        setStatus(u.is_active ?? true);
        setAvatarUrl(u.profile_picture ?? null);

        if (u.store?._id) {
          setStoreId(u.store._id); // 🟡 preselect store if assigned
        }

        setStoreName(u.store?.name ?? "");
        setStoreEmail(u.store?.email ?? "");
        setStorePhone(u.store?.phone ?? "");
        setStoreWebsite(u.store?.website ?? "");
        setStoreLogo(u.store?.logo ?? null);
        setStoreBanner(u.store?.banner ?? null);
        setStoreFavicon(u.store?.theme?.faviconUrl ?? null);
        setStoreDescription(u.store?.description ?? "");
        setStoreAddress({
          street: u.store?.address?.street ?? "",
          city: u.store?.address?.city ?? "",
          state: u.store?.address?.state ?? "",
          country: u.store?.address?.country ?? "",
          zip_code: u.store?.address?.zip_code ?? "",
        });
        setTheme({
          primaryColor: u.store?.theme?.primaryColor ?? "#000000",
          secondaryColor: u.store?.theme?.secondaryColor ?? "#ffffff",
          buttonColor: u.store?.theme?.buttonColor ?? "#007bff",
          fontFamily: u.store?.theme?.fontFamily ?? "Roboto",
        });
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeId) {
      toast.error("Please select a store");
      return;
    }

    const payload = {
      name,
      email,
      mobile_number: mobile,
      is_active: status,
      profile_picture: avatarUrl,
      store_id: storeId, // 🟡 Include store ID in payload
      store: {
        name: storeName,
        email: storeEmail,
        phone: storePhone,
        website: storeWebsite,
        logo: storeLogo,
        banner: storeBanner,
        description: storeDescription,
        address: storeAddress,
        theme: {
          ...theme,
          faviconUrl: storeFavicon,
        },
      },
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateUser({ id, data: payload }));
      } else {
        result = await dispatch(createUser(payload));
      }

      if (createUser.fulfilled.match(result) || updateUser.fulfilled.match(result)) {
        toast.success(isEditMode ? "Store owner updated!" : "Store owner created!");
        navigate("/store-owners");
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
        <Link to="/store-owners">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Store Owner" : "Add Store Owner"}
          </h1>
          <p className="text-gray-500">
            {isEditMode ? "Update store owner details." : "Create a new store owner account."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Owner Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input placeholder="Owner Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} />

              <div>
                <Label>Avatar</Label>
                <ImageUpload
                  value={avatarUrl}
                  onChange={(url) => setAvatarUrl(url as string | null)}
                  size={120}
                />
              </div>

              {/* 🟡 Store Dropdown */}
        <div>
  <Label>Select Store</Label>
  <Select value={storeId} onValueChange={setStoreId}>
    <SelectTrigger>
      <SelectValue placeholder="Choose a store" />
    </SelectTrigger>
    <SelectContent>
      {availableStores.map(store => (
        <SelectItem key={store._id} value={store._id}>
          {store.name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>

            </CardContent>
          </Card>

          {/* Store Info */}
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Store Name" value={storeName} onChange={(e) => setStoreName(e.target.value)} required />
              <Input placeholder="Store Email" value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} required />
              <Input placeholder="Store Phone" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} />
              <Input placeholder="Website" value={storeWebsite} onChange={(e) => setStoreWebsite(e.target.value)} />
              <Textarea placeholder="Store Description" value={storeDescription} onChange={(e) => setStoreDescription(e.target.value)} />
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Logo</Label>
                  <ImageUpload
  value={storeLogo}
  onChange={(url) => setStoreLogo(url as string | null)}
  size={100}
/>

                 
                </div>
                <div>
                  <Label>Banner</Label>
                         <ImageUpload
  value={storeBanner}
  onChange={(url) => setStoreBanner(url as string | null)}
  size={100}
/>
            
                </div>
                <div>
                  <Label>Favicon</Label>
                                    <ImageUpload
  value={storeFavicon}
  onChange={(url) => setStoreFavicon(url as string | null)}
  size={64}
/>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Store Address */}
          <Card>
            <CardHeader>
              <CardTitle>Store Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(storeAddress).map((key) => (
                <Input
                  key={key}
                  placeholder={key.replace("_", " ").toUpperCase()}
                  value={(storeAddress as any)[key]}
                  onChange={(e) => setStoreAddress({ ...storeAddress, [key]: e.target.value })}
                />
              ))}
            </CardContent>
          </Card>

          {/* Theme */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Color</Label>
                <Input type="color" value={theme.primaryColor} onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })} />
              </div>
              <div>
                <Label>Secondary Color</Label>
                <Input type="color" value={theme.secondaryColor} onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })} />
              </div>
              <div>
                <Label>Button Color</Label>
                <Input type="color" value={theme.buttonColor} onChange={(e) => setTheme({ ...theme, buttonColor: e.target.value })} />
              </div>
              <div>
                <Label>Font Family</Label>
                <Input value={theme.fontFamily} onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch id="status" checked={status} onCheckedChange={setStatus} />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isEditMode ? "Update Store Owner" : "Create Store Owner"}
            </Button>
            <Link to="/store-owners" className="flex-1">
              <Button variant="outline" className="w-full">Cancel</Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
