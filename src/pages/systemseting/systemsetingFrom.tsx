import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { fetchSystemSettings, updateSystemSetting } from "@/features/systemsetting/systemsettingThunk";

type Range = {
    from: string;
    to: string;
    charge: string;
    chargeType: string;
};

const RangeRow = ({
    range, index, prefix,
    onChange, onDelete, canDelete, errors,
}: {
    range: Range; index: number; prefix: "pre" | "cod";
    onChange: (i: number, f: keyof Range, v: string) => void;
    onDelete: (i: number) => void;
    canDelete: boolean;
    errors: Record<string, string>;
}) => {
    const errCls = (field: string) => (errors[field] ? "border-red-500" : "");
    const Err = ({ field }: { field: string }) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;

    return (
        <div className="border rounded-lg overflow-hidden">
            <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                <p className="font-semibold text-sm">{index + 1}</p>
                {canDelete && (
                    <Button variant="destructive" size="icon" onClick={() => onDelete(index)}>
                        <Trash2 size={16} />
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                <div className="space-y-2">
                    <Label>From (₹) *</Label>
                    <Input
                        type="number"
                        value={range.from}
                        className={errCls(`${prefix}_from_${index}`)}
                        onChange={(e) => onChange(index, "from", e.target.value)}
                    />
                    <Err field={`${prefix}_from_${index}`} />
                </div>
                <div className="space-y-2">
                    <Label>To (₹) *</Label>
                    <Input
                        type="number"
                        value={range.to}
                        className={errCls(`${prefix}_to_${index}`)}
                        onChange={(e) => onChange(index, "to", e.target.value)}
                    />
                    <Err field={`${prefix}_to_${index}`} />
                </div>
                <div className="space-y-2">
                    <Label>Charge Type *</Label>
                    <select
                        value={range.chargeType}
                        onChange={(e) => onChange(index, "chargeType", e.target.value)}
                        className="w-full border border-input rounded-md px-3 py-2 text-sm"
                    >
                        <option value="fixed">Fixed</option>
                        <option value="percentage">Percentage (%)</option>
                        <option value="free_shipping">Free Shipping</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <Label>{range.chargeType === "percentage" ? "Charge (%) *" : "Charge (₹) *"}</Label>
                    <Input
                        type="number"
                        disabled={range.chargeType === "free_shipping"}
                        value={range.chargeType === "free_shipping" ? "0" : range.charge}
                        className={errCls(`${prefix}_charge_${index}`)}
                        onChange={(e) => onChange(index, "charge", e.target.value)}
                    />
                    <Err field={`${prefix}_charge_${index}`} />
                </div>
            </div>
        </div>
    );
};

const emptyRange = (): Range => ({ from: "", to: "", charge: "", chargeType: "fixed" });
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

    const [prepaidFreeThreshold, setPrepaidFreeThreshold] = useState("");
    const [codFreeThreshold, setCodFreeThreshold] = useState("");

    const [prepaidRanges, setPrepaidRanges] = useState<Range[]>([emptyRange()]);
    const [codRanges, setCodRanges] = useState<Range[]>([emptyRange()]);

    const [pcodType, setPcodType] = useState("fixed");
    const [pcodValue, setPcodValue] = useState("");

    const [termService, setTermService] = useState("");
    const [privacyPolicy, setPrivacyPolicy] = useState("");
    const [refundPolicy, setRefundPolicy] = useState("");
    const [aboutUs, setAboutUs] = useState("");
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

        setPrepaidFreeThreshold(String(data.prepaid?.freeThreshold ?? ""));
        setPrepaidRanges(
            data.prepaid?.ranges?.length
                ? data.prepaid.ranges.map((r: any) => ({
                    from: String(r.from ?? ""),
                    to: String(r.to ?? ""),
                    charge: String(r.charge ?? ""),
                    chargeType: r.chargeType || "fixed",
                }))
                : [emptyRange()]
        );

        setCodFreeThreshold(String(data.cod?.freeThreshold ?? ""));
        setCodRanges(
            data.cod?.ranges?.length
                ? data.cod.ranges.map((r: any) => ({
                    from: String(r.from ?? ""),
                    to: String(r.to ?? ""),
                    charge: String(r.charge ?? ""),
                    chargeType: r.chargeType || "fixed",
                }))
                : [emptyRange()]
        );

        setPcodType(data.partialCod?.codType || "fixed");
        setPcodValue(String(data.partialCod?.value ?? ""));

        setTermService(data.general?.termService || "");
        setPrivacyPolicy(data.general?.privacyPolicy || "");
        setRefundPolicy(data.general?.refundPolicy || "");
        setAboutUs(data.general?.aboutUs || "");
        setShippingPolicy(data.general?.shippingPolicy || "");
    }, [data]);

    const addPrepaidRange = () => setPrepaidRanges([...prepaidRanges, emptyRange()]);
    const deletePrepaidRange = (i: number) => setPrepaidRanges(prepaidRanges.filter((_, idx) => idx !== i));
    const handlePrepaidChange = (index: number, field: keyof Range, value: string) => {
        const updated = [...prepaidRanges];
        updated[index] = { ...updated[index], [field]: value };
        if (field === "chargeType") {
            updated[index].charge = value === "free_shipping" ? "0" : "";
        }
        setPrepaidRanges(updated);
    };

    const addCodRange = () => setCodRanges([...codRanges, emptyRange()]);
    const deleteCodRange = (i: number) => setCodRanges(codRanges.filter((_, idx) => idx !== i));
    const handleCodChange = (index: number, field: keyof Range, value: string) => {
        const updated = [...codRanges];
        updated[index] = { ...updated[index], [field]: value };
        if (field === "chargeType") {
            updated[index].charge = value === "free_shipping" ? "0" : "";
        }
        setCodRanges(updated);
    };

    const isValidUrl = (str: string) => { try { new URL(str); return true; } catch { return false; } };

    const validate = (): boolean => {
        const errs: Record<string, string> = {};

        if (phonepayCallbackUrl && !isValidUrl(phonepayCallbackUrl))
            errs.phonepayCallbackUrl = "Enter a valid URL (https://...)";
        if (ithinkApiUrl && !isValidUrl(ithinkApiUrl))
            errs.ithinkApiUrl = "Enter a valid URL";

        prepaidRanges.forEach((r, i) => {
            if (r.from === "" && r.to === "" && r.charge === "") return;
            if (!r.from) errs[`pre_from_${i}`] = "Required";
            if (!r.to) errs[`pre_to_${i}`] = "Required";
            else if (r.from && Number(r.from) >= Number(r.to))
                errs[`pre_to_${i}`] = "Must be > From";
            if (r.chargeType !== "free_shipping" && !r.charge)
                errs[`pre_charge_${i}`] = "Required";
        });

        codRanges.forEach((r, i) => {
            if (r.from === "" && r.to === "" && r.charge === "") return;
            if (!r.from) errs[`cod_from_${i}`] = "Required";
            if (!r.to) errs[`cod_to_${i}`] = "Required";
            else if (r.from && Number(r.from) >= Number(r.to))
                errs[`cod_to_${i}`] = "Must be > From";
            if (r.chargeType !== "free_shipping" && !r.charge)
                errs[`cod_charge_${i}`] = "Required";
        });

        if (pcodValue && (isNaN(Number(pcodValue)) || Number(pcodValue) < 0))
            errs.pcodValue = "Enter a valid positive number";
        if (pcodType === "percentage" && pcodValue && Number(pcodValue) > 100)
            errs.pcodValue = "Cannot exceed 100%";

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const serializeRange = (r: Range) => ({
        from: Number(r.from),
        to: Number(r.to),
        chargeType: r.chargeType,
        charge: r.chargeType === "free_shipping" ? 0 : Number(r.charge),
    });

    const isRangeEmpty = (r: Range) => r.from === "" && r.to === "" && r.charge === "";

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
            prepaid: {
                freeThreshold: Number(prepaidFreeThreshold) || 0,
                ranges: prepaidRanges.filter(r => !isRangeEmpty(r)).map(serializeRange),
            },
            cod: {
                freeThreshold: Number(codFreeThreshold) || 0,
                ranges: codRanges.filter(r => !isRangeEmpty(r)).map(serializeRange),
            },
            partialCod: {
                codType: pcodType,
                value: Number(pcodValue) || 0,
            },
            general: { termService, privacyPolicy, refundPolicy, aboutUs, shippingPolicy },
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
                <CardHeader><CardTitle>Prepaid Shipping Rules</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Free Shipping Threshold (₹)</Label>
                            <Input type="number" placeholder="e.g. 500" value={prepaidFreeThreshold} onChange={(e) => setPrepaidFreeThreshold(e.target.value)} />
                        </div>
                    </div>
                    <p className="text-lg font-semibold">Prepaid Shipping Ranges</p>
                    {prepaidRanges.map((range, index) => (
                        <RangeRow
                            key={index}
                            range={range}
                            index={index}
                            prefix="pre"
                            onChange={handlePrepaidChange}
                            onDelete={deletePrepaidRange}
                            canDelete={prepaidRanges.length > 1}
                            errors={errors}
                        />
                    ))}
                    <div className="flex justify-center">
                        <Button onClick={addPrepaidRange}>+ Add Prepaid Range</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader><CardTitle>COD Rules</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>COD Free Threshold (₹)</Label>
                            <Input type="number" placeholder="e.g. 1000" value={codFreeThreshold} onChange={(e) => setCodFreeThreshold(e.target.value)} />
                        </div>
                    </div>
                    <p className="text-lg font-semibold">COD Shipping Ranges</p>
                    {codRanges.map((range, index) => (
                        <RangeRow
                            key={index}
                            range={range}
                            index={index}
                            prefix="cod"
                            onChange={handleCodChange}
                            onDelete={deleteCodRange}
                            canDelete={codRanges.length > 1}
                            errors={errors}
                        />
                    ))}
                    <div className="flex justify-center">
                        <Button onClick={addCodRange}>+ Add COD Range</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader><CardTitle>Partial COD Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <select value={pcodType} onChange={(e) => setPcodType(e.target.value)} className="w-full border border-input rounded-md px-3 py-2 text-sm">
                                <option value="fixed">Fixed Amount</option>
                                <option value="percentage">Percentage (%)</option>
                                <option value="range">Order Amount Range</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>{pcodType === "percentage" ? "Percentage Value (%)" : pcodType === "range" ? "Min Order Amount (₹)" : "Fixed Amount (₹)"}</Label>
                            <Input type="number" value={pcodValue} className={errCls("pcodValue")} onChange={(e) => setPcodValue(e.target.value)} />
                            <Err field="pcodValue" />
                        </div>
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
                        <div><Label>About Us</Label><TiptapEditor value={aboutUs} onChange={setAboutUs} /><Err field="aboutUs" /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
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