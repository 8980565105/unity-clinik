import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useBasePath } from "@/hooks/useBasePath";

import { createUser, getUserById, updateUser } from "@/features/users/usersThunk";

export default function UserFormPage() {
  const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();

  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);

  // Basic info
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [status, setStatus] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Additional info
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [dob, setDob] = useState<string>("");
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  });

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getUserById(id)).then((res: any) => {
        if (res.payload) {
          const u = res.payload;

          setName(u.name ?? "");
          setEmail(u.email ?? "");
          setRole(u.role ?? "user");
          setStatus(!!u.is_active); // ensure boolean
          setAvatarUrl(u.profile_picture ?? null);
          setMobileNumber(u.mobile_number ?? "");
          setGender(u.gender ?? "male");
          setDob(u.date_of_birth ? new Date(u.date_of_birth).toISOString().split("T")[0] : "");
          setAddress({
            street: u.address?.street ?? "",
            city: u.address?.city ?? "",
            state: u.address?.state ?? "",
            country: u.address?.country ?? "",
            zip_code: u.address?.zip_code ?? "",
          });
        }
      });
    }
  }, [dispatch, id, isEditMode]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      email,
      role,
      is_active: status,
      profile_picture: avatarUrl,
      mobile_number: mobileNumber,
      gender,
      date_of_birth: dob || null,
      address,
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateUser({ id, data: payload }));
      } else {
        result = await dispatch(createUser(payload));
      }

      if (createUser.fulfilled.match(result) || updateUser.fulfilled.match(result)) {
        toast.success(isEditMode ? "User updated successfully!" : "User created successfully!");
        navigate(`${basePath}/users`);
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
        <Link to={`${basePath}/users`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit User" : "Add New User"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update user details." : "Create a new user."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
                <Input id="name" placeholder="Enter user name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1" />
              </div>

              <div>
                <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                <Input id="email" type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={(val) => setRole(val as "admin" | "user")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" placeholder="Enter mobile number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select value={gender} onValueChange={(val) => setGender(val as "male" | "female" | "other")}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1" />
              </div>

              <div>
                <Label>Profile Picture</Label>
                <div className="mt-1">
                  <ImageUpload value={avatarUrl} onChange={(url) => setAvatarUrl(url as string | null)} size={150} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
              <Input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
              <Input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
              <Input placeholder="Country" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
              <Input placeholder="Zip Code" value={address.zip_code} onChange={(e) => setAddress({ ...address, zip_code: e.target.value })} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className=" top-6 shadow-md border border-gray-200">
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

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isEditMode ? "Update User" : "Create User"}
            </Button>
            <Link to={`${basePath}/users`} className="flex-1">
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
