import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { fetchMe, updateMe } from "@/features/profile/profileThunk";

export default function ProfileFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // 📝 Profile states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Address
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [zipCode, setZipCode] = useState("");

  // Optional password change
  const [password, setPassword] = useState("");

  // ✅ Fetch current profile
  useEffect(() => {
    dispatch(fetchMe()).then((res: any) => {
      if (res.payload) {
        const user = res.payload;
        setName(user.name || "");
        setEmail(user.email || "");
        setMobileNumber(user.mobile_number || "");
        setGender(user.gender || "");
        setDateOfBirth(
          user.date_of_birth ? new Date(user.date_of_birth).toISOString().split("T")[0] : ""
        );
        setProfilePicture(user.profile_picture || null);

        if (user.address) {
          setStreet(user.address.street || "");
          setCity(user.address.city || "");
          setState(user.address.state || "");
          setCountry(user.address.country || "");
          setZipCode(user.address.zip_code || "");
        }
      }
    });
  }, [dispatch]);

  // ✅ Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name is required");
    if (!email.trim()) return toast.error("Email is required");

    const payload = {
      name,
      email,
      mobile_number: mobileNumber,
      gender,
      date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
      profile_picture: profilePicture,
      address: { street, city, state, country, zip_code: zipCode },
      ...(password ? { password } : {}),
    };

    const result = await dispatch(updateMe(payload));

    if (updateMe.fulfilled.match(result)) {
      toast.success("Profile updated successfully!");
      navigate("/dashboard");
    } else {
      toast.error((result.payload as string) || "Failed to update profile");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-gray-500 mt-1">Update your personal information.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="mobile_number">Mobile Number</Label>
                <Input id="mobile_number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="male / female / other" />
              </div>
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="password">Change Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Leave blank to keep current" />
              </div>
              {/* <div>
                <Label>Profile Picture</Label>
                <ImageUpload value={profilePicture} onChange={setProfilePicture} />
              </div> */}
            </CardContent>
          </Card>

          {/* Address */}
          <Card className="shadow-md border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Address</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div><Label>Street</Label><Input value={street} onChange={(e) => setStreet(e.target.value)} /></div>
              <div><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
              <div><Label>State</Label><Input value={state} onChange={(e) => setState(e.target.value)} /></div>
              <div><Label>Country</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
              <div><Label>Zip Code</Label><Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} /></div>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-6">
          <Card className="sticky top-6 shadow-md border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)} className="w-full">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
