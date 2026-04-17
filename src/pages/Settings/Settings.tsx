import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, Save, Palette, Trash, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchMe, updateMe } from "@/features/profile/profileThunk";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { fetchSettings, updateSettings } from "@/features/settings/settingsThunk";
import { fetchMyStore, updateMyStore } from "@/features/stores/storesThunk";

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "other" | "">("");
  const [dob, setDob] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");

  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeEmail, setStoreEmail] = useState("");
  const [storePhone, setStorePhone] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [contactStreet, setContactStreet] = useState("");
  const [contactCity, setContactCity] = useState("");
  const [contactState, setContactState] = useState("");
  const [contactCountry, setContactCountry] = useState("");
  const [contactPostal, setContactPostal] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [favicon, setFavicon] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [secondaryColor, setSecondaryColor] = useState("#ffffff");
  // const [buttonColor, setButtonColor] = useState("#007bff");
  const [fontFamily, setFontFamily] = useState("");
  const [footerText, setFooterText] = useState("");
  const [copyrightText, setCopyrightText] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeyphrase, setMetaKeyphrase] = useState("");
  const [seoImage, setSeoImage] = useState<string | null>(null);
  const [socialLinks, setSocialLinks] = useState<{ platform: string; url: string }[]>([]);
  // const [customCss, setCustomCss] = useState("");
  // const [customJs, setCustomJs] = useState("");
  useEffect(() => {
    dispatch(fetchMe()).then((res: any) => {
      if (res.payload?.user) {
        const u = res.payload.user;
        setName(u.name || "");
        setEmail(u.email || "");
        setPhone(u.mobile_number || "");
        setGender(u.gender || "");
        setDob(u.date_of_birth
          ? new Date(u.date_of_birth).toISOString().split("T")[0] : "");
        setProfilePic(u.profile_picture || null);
        if (u.address) {
          setStreet(u.address.street || "");
          setCity(u.address.city || "");
          setState(u.address.state || "");
          setZip(u.address.zip_code || "");
          setCountry(u.address.country || "");
        }
      }
    });
  }, [dispatch]);
  useEffect(() => {
    dispatch(fetchMyStore()).then((res: any) => {
      if (res.payload) {
        const s = res.payload;
        setStoreId(s._id);
        setStoreName(s.name || "");
        setStoreEmail(s.email || "");
        setStorePhone(s.phone || "");
        setGstNumber(s.gst_number || "");
        if (s.address) {
          setContactStreet(s.address.street || "");
          setContactCity(s.address.city || "");
          setContactState(s.address.state || "");
          setContactCountry(s.address.country || "");
          setContactPostal(s.address.zip_code || "");
        }
        if (s.theme) {
          setLogo(s.theme.logoUrl || null);
          setFavicon(s.theme.faviconUrl || null);
          setPrimaryColor(s.theme.primaryColor || "#000000");
          setSecondaryColor(s.theme.secondaryColor || "#ffffff");
          // setButtonColor(s.theme.buttonColor || "#007bff");
          setFontFamily(s.theme.fontFamily || "");
          setFooterText(s.theme.footerText || "");
          setCopyrightText(s.theme.copyrightText || "");
        }
        if (s.seo) {
          setMetaTitle(s.seo.meta_title || "");
          setMetaDescription(s.seo.meta_description || "");
          setMetaKeyphrase(s.seo.meta_keyphrase || "");
          setSeoImage(s.seo.seo_image || null);
        }
        setSocialLinks(s.social_links || []);
      }
    });
  }, [dispatch]);
  useEffect(() => {
    dispatch(fetchSettings()).then((res: any) => {
      // if (res.payload) {
      //   setCustomCss(res.payload.custom_css || "");
      //   setCustomJs(res.payload.custom_js || "");
      // }
    });
  }, [dispatch]);
  const handleSaveProfile = async () => {
    const res = await dispatch(updateMe({
      name,
      mobile_number: phone,
      gender,
      date_of_birth: dob || null,
      profile_picture: profilePic,
      address: { street, city, state, zip_code: zip, country },
    }));
    if (updateMe.fulfilled.match(res)) {
      toast({ title: "Profile Updated", description: "Profile saved successfully." });
    } else {
      toast({ title: "Update Failed", description: res.payload as string, variant: "destructive" });
    }
  };
  const handleSaveAppearance = async () => {
    const res = await dispatch(updateMyStore({
      theme: {
        logoUrl: logo,
        faviconUrl: favicon,
        primaryColor,
        secondaryColor,
        // buttonColor,
        fontFamily,
        footerText,
        copyrightText,
      },
    }));
    if (updateMyStore.fulfilled.match(res)) {
      toast({ title: "Appearance Updated", description: "Theme saved successfully." });
    } else {
      toast({ title: "Update Failed", description: res.payload as string, variant: "destructive" });
    }
  };
  const handleSaveContact = async () => {
    const res = await dispatch(updateMyStore({
      name: storeName,
      email: storeEmail,
      phone: storePhone,
      gst_number: gstNumber,
      address: {
        street: contactStreet,
        city: contactCity,
        state: contactState,
        country: contactCountry,
        zip_code: contactPostal,
      },
    }));
    if (updateMyStore.fulfilled.match(res)) {
      toast({ title: "Contact Updated", description: "Store info saved successfully." });
    } else {
      toast({ title: "Update Failed", description: res.payload as string, variant: "destructive" });
    }
  };
  const handleSaveSocial = async () => {
    const res = await dispatch(updateMyStore({ social_links: socialLinks }));
    if (updateMyStore.fulfilled.match(res)) {
      toast({ title: "Social Links Updated", description: "Social links saved." });
    } else {
      toast({ title: "Update Failed", description: res.payload as string, variant: "destructive" });
    }
  };
  const handleSaveSeo = async () => {
    const res = await dispatch(updateMyStore({
      seo: {
        meta_title: metaTitle,
        meta_description: metaDescription,
        meta_keyphrase: metaKeyphrase,
        seo_image: seoImage,
      },
    }));
    if (updateMyStore.fulfilled.match(res)) {
      toast({ title: "SEO Updated", description: "SEO settings saved." });
    } else {
      toast({ title: "Update Failed", description: res.payload as string, variant: "destructive" });
    }
  };
  const addSocialLink = () => setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  const removeSocialLink = (i: number) => setSocialLinks(socialLinks.filter((_, idx) => idx !== i));
  const updateSocialLink = (i: number, key: "platform" | "url", val: string) => {
    const updated = [...socialLinks];
    updated[i][key] = val;
    setSocialLinks(updated);
  };
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your store configuration and preferences</p>
      </div>
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="gap-2">
            <SettingsIcon className="h-4 w-4" /> General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle>Profile Information</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <ImageUpload value={profilePic} onChange={(v) => setProfilePic(v as string | null)}  className="w-10 h-10 "/>
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={email} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <select className="border rounded-md p-2 w-full" value={gender}
                    onChange={(e) => setGender(e.target.value as any)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Address & Location</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Street Address</Label>
                  <Input value={street} onChange={(e) => setStreet(e.target.value)} />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>State/Province</Label>
                    <Input value={state} onChange={(e) => setState(e.target.value)} />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>ZIP/Postal Code</Label>
                    <Input value={zip} onChange={(e) => setZip(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Input value={country} onChange={(e) => setCountry(e.target.value)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle>Theme Settings</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <ImageUpload value={logo} onChange={(v) => setLogo(v as string | null)} />
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <ImageUpload value={favicon} onChange={(v) => setFavicon(v as string | null)} />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <Input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} />
                </div>
                {/* <div className="space-y-2">
                  <Label>Button Color</Label>
                  <Input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} />
                </div> */}
              </div>
              <div className="space-y-2">
                <Label>Font Family</Label>
                <select className="border rounded-md p-2 w-full" value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}>
                  <option value="">Select Font</option>
                  <option value="Arial, sans-serif">Arial</option>
                  <option value="Roboto, sans-serif">Roboto</option>
                  <option value="Poppins, sans-serif">Poppins</option>
                  <option value="Helvetica, sans-serif">Helvetica</option>
                  <option value="Times New Roman, serif">Times New Roman</option>
                  <option value="Georgia, serif">Georgia</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Footer Text</Label>
                <Textarea value={footerText} onChange={(e) => setFooterText(e.target.value)} className="min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <Label>Copyright Text</Label>
                <Input value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)} />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveAppearance} className="gap-2">
                  <Save className="h-4 w-4" /> Save Appearance
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="contact">
          <Card>
            <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Store Name</Label>
                  <Input value={storeName} onChange={(e) => setStoreName(e.target.value)} placeholder="Enter store name" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={storeEmail} onChange={(e) => setStoreEmail(e.target.value)} placeholder="Enter email" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input value={storePhone} onChange={(e) => setStorePhone(e.target.value)} placeholder="Enter phone number" />
                </div>
                <div className="space-y-2">
                  <Label>GST Number</Label>
                  <Input value={gstNumber} onChange={(e) => setGstNumber(e.target.value)} placeholder="Enter GST number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Street</Label>
                <Input value={contactStreet} onChange={(e) => setContactStreet(e.target.value)} placeholder="e.g. 15 Dhara Arcade" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input value={contactCity} onChange={(e) => setContactCity(e.target.value)} placeholder="Enter city" />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input value={contactState} onChange={(e) => setContactState(e.target.value)} placeholder="Enter state" />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={contactCountry} onChange={(e) => setContactCountry(e.target.value)} placeholder="Enter country" />
                </div>
                <div className="space-y-2">
                  <Label>Postal Code</Label>
                  <Input value={contactPostal} onChange={(e) => setContactPostal(e.target.value)} placeholder="Enter postal code" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveContact}>Save Store Info</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="social">
          <Card>
            <CardHeader><CardTitle>Social Media Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 items-center">
                  <Input placeholder="Platform (e.g. Facebook)" value={link.platform}
                    onChange={(e) => updateSocialLink(index, "platform", e.target.value)} />
                  <Input placeholder="URL" value={link.url}
                    onChange={(e) => updateSocialLink(index, "url", e.target.value)} />
                  <Button variant="destructive" onClick={() => removeSocialLink(index)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={addSocialLink} className="gap-2">
                <Plus className="h-4 w-4" /> Add Social Link
              </Button>
              <div className="flex justify-end">
                <Button onClick={handleSaveSocial}>Save Social Links</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="seo">
          <Card>
            <CardHeader><CardTitle>SEO Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Meta Keyphrase</Label>
                <Input value={metaKeyphrase} onChange={(e) => setMetaKeyphrase(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>SEO Image</Label>
                <ImageUpload value={seoImage} onChange={(v) => setSeoImage(v as string | null)} />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSeo}>Save SEO Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}