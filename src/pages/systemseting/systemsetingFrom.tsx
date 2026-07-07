import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Car, Eye, EyeOff, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { fetchSystemSettings, updateSystemSetting } from "@/features/systemsetting/systemsettingThunk";
export default function SystemSettings() {
    const dispatch = useDispatch<AppDispatch>();
    const { toast } = useToast();
    const { data, loading } = useSelector((state: RootState) => state.systemseting);
    const [razorpaykey, setRazorpaykey] = useState("");
    const [razorpaysecretkey, setRazorpaysecretkey] = useState("");
    const [showRzSecret, setShowRzSecret] = useState(false);
    const [phonepaymId, setPhonepaymId] = useState("");
    const [phonepaymuserId, setPhonepaymuserId] = useState("");
    const [phonepayEnv, setPhonepayEnv] = useState("");
    const [phonepaySaltKey, setPhonepaySaltKey] = useState("");
    const [phonepaySaltIndex, setPhonepaySaltIndex] = useState("");
    const [phonepayCallbackUrl, setPhonepayCallbackUrl] = useState("");
    const [ithinkToken, setIthinkToken] = useState("");
    const [ithinkSecret, setIthinkSecret] = useState("");
    const [showItSecret, setShowItSecret] = useState(false);
    const [ithinkApiUrl, setIthinkApiUrl] = useState("");
    const [ithinkPickupId, setIthinkPickupId] = useState("");
    const [termService, setTermService] = useState("");
    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [refundPolicy, setRefundPolicy] = useState("");
    const [shippingPolicy, setShippingPolicy] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    useEffect(() => {
        dispatch(fetchSystemSettings());
    }, [dispatch]);
    useEffect(() => {
        if (!data) return;
        setRazorpaykey(data.razorpaykey || "");
        setRazorpaysecretkey(data.razorpaysecretkey || "");
        setPhonepaymId(data.phonepe?.merchantId || "");
        setPhonepaymuserId(data.phonepe?.merchantUserId || "");
        setPhonepayEnv(data.phonepe?.env || "");
        setPhonepaySaltKey(data.phonepe?.saltKey || "");
        setPhonepaySaltIndex(data.phonepe?.saltIndex || "");
        setPhonepayCallbackUrl(data.phonepe?.callbackUrl || "");
        setIthinkToken(data.ithink?.token || "");
        setIthinkSecret(data.ithink?.secret || "");
        setIthinkApiUrl(data.ithink?.apiUrl || "");
        setIthinkPickupId(data.ithink?.pickupAddressId || "");
        setTermService(data.general?.termService || "");
        setPrivacyPolicy(data.general?.privacyPolicy || "");
        setRefundPolicy(data.general?.refundPolicy || "");
        setShippingPolicy(data.general?.shippingPolicy || "");
    }, [data]);

    const isValidUrl = (str: string) => { try { new URL(str); return true; } catch { return false; } };
    const validate = (): boolean => {
        const errs: Record<string, string> = {};
        if (phonepayCallbackUrl && !isValidUrl(phonepayCallbackUrl))
            errs.phonepayCallbackUrl = "Enter a valid URL (https://...)";
        if (ithinkApiUrl && !isValidUrl(ithinkApiUrl))
            errs.ithinkApiUrl = "Enter a valid URL";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };
    const handleSave = async () => {
        if (!validate()) {
            toast({ title: "Validation Error", description: "Please fix all errors before saving.", variant: "destructive" });
            return;
        }
        const payload = {
            razorpaykey,
            razorpaysecretkey,
            phonepe: {
                merchantId: phonepaymId,
                merchantUserId: phonepaymuserId,
                env: phonepayEnv,
                saltKey: phonepaySaltKey,
                saltIndex: phonepaySaltIndex,
                callbackUrl: phonepayCallbackUrl,
            },
            ithink: {
                token: ithinkToken,
                secret: ithinkSecret,
                apiUrl: ithinkApiUrl,
                pickupAddressId: ithinkPickupId,
            },
            general: { termService, privacyPolicy, refundPolicy, shippingPolicy },
        };
        const result = await dispatch(updateSystemSetting(payload));
        if (updateSystemSetting.fulfilled.match(result)) {
            toast({ title: "Success", description: "Settings saved successfully!" });
        } else {
            toast({ title: "Error", description: (result.payload as string) || "Failed to save settings.", variant: "destructive" });
        }
    };
    const Err = ({ field }: { field: string }) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;
    const errCls = (field: string) => (errors[field] ? "border-red-500" : "");

    if (loading && !data) {
        return <div className="p-8 text-center text-muted-foreground">Loading settings...</div>;
    }
    return (
        <>
            <div>
                <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
                <p className="text-muted-foreground">Manage your store configuration and preferences</p>
            </div>

            <Card className="mt-8">
                <CardHeader><CardTitle>Razorpay</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Razorpay Key Id</Label>
                            <Input value={razorpaykey} className={errCls("razorpaykey")} onChange={(e) => setRazorpaykey(e.target.value)} placeholder="rzp_live_..." />
                            <Err field="razorpaykey" />
                        </div>
                        <div className="space-y-2">
                            <Label>Razorpay Secret Key</Label>
                            <div className="relative">
                                <Input type={showRzSecret ? "text" : "password"} value={razorpaysecretkey} className={errCls("razorpaysecretkey")} onChange={(e) => setRazorpaysecretkey(e.target.value)} />
                                <button type="button" onClick={() => setShowRzSecret(!showRzSecret)} className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500 hover:text-gray-700 transition-colors border-l border-gray-300">
                                    {showRzSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <Err field="razorpaysecretkey" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader><CardTitle>PhonePe</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2"><Label>Merchant Id</Label><Input value={phonepaymId} onChange={(e) => setPhonepaymId(e.target.value)} /><Err field="phonepaymId" /></div>
                        <div className="space-y-2"><Label>Merchant User Id</Label><Input value={phonepaymuserId} onChange={(e) => setPhonepaymuserId(e.target.value)} /><Err field="phonepaymuserId" /></div>
                        <div className="space-y-2"><Label>PhonePe Env</Label><Input value={phonepayEnv} onChange={(e) => setPhonepayEnv(e.target.value)} placeholder="UAT or PRODUCTION" /><Err field="phonepayEnv" /></div>
                        <div className="space-y-2"><Label>Salt Key</Label><Input value={phonepaySaltKey} onChange={(e) => setPhonepaySaltKey(e.target.value)} /><Err field="phonepaySaltKey" /></div>
                        <div className="space-y-2"><Label>Salt Index</Label><Input value={phonepaySaltIndex} onChange={(e) => setPhonepaySaltIndex(e.target.value)} /><Err field="phonepaySaltIndex" /></div>
                        <div className="space-y-2">
                            <Label>Callback Url</Label>
                            <Input value={phonepayCallbackUrl} className={errCls("phonepayCallbackUrl")} onChange={(e) => setPhonepayCallbackUrl(e.target.value)} placeholder="https://yourdomain.com/callback" />
                            <Err field="phonepayCallbackUrl" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader><CardTitle>iThink Logistics</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2"><Label>Access Token</Label><Input value={ithinkToken} onChange={(e) => setIthinkToken(e.target.value)} /><Err field="ithinkToken" /></div>
                        <div className="space-y-2">
                            <Label>Secret Key</Label>
                            <div className="relative">
                                <Input type={showItSecret ? "text" : "password"} value={ithinkSecret} onChange={(e) => setIthinkSecret(e.target.value)} />
                                <button type="button" onClick={() => setShowItSecret(!showItSecret)} className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-gray-500 hover:text-gray-700 transition-colors border-l border-gray-300">
                                    {showItSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>API URL</Label>
                            <Input value={ithinkApiUrl} className={errCls("ithinkApiUrl")} onChange={(e) => setIthinkApiUrl(e.target.value)} placeholder="https://api.ithink.co.in/" />
                            <Err field="ithinkApiUrl" />
                        </div>
                        <div className="space-y-2"><Label>Pickup Address ID</Label><Input value={ithinkPickupId} onChange={(e) => setIthinkPickupId(e.target.value)} /></div>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader><CardTitle>General Policies</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-5">
                        <div><Label>Terms of Service</Label><TiptapEditor value={termService} onChange={setTermService} /><Err field="termService" /></div>
                        <div><Label>Privacy Policy</Label><TiptapEditor value={privacyPolicy} onChange={setPrivacyPolicy} /><Err field="privacyPolicy" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div><Label>Refund Policy</Label><TiptapEditor value={refundPolicy} onChange={setRefundPolicy} /><Err field="refundPolicy" /></div>
                        <div><Label>Shipping &amp; Delivery Policy</Label><TiptapEditor value={shippingPolicy} onChange={setShippingPolicy} /><Err field="shippingPolicy" /></div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-center my-8">
                <Button onClick={handleSave} disabled={loading} className="px-10">
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </>
    );
}