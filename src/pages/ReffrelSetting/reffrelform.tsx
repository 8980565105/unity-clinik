import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, Save, Wallet, Plus, Trash2, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import {
    fetchReferralSettings,
    ReferralSettings,
    updateReferralSettings,
    WalletOffer,
    WalletBox,
    faqs,
    WalletPoint,
} from "@/features/reffrelsetting/reffrellsettingThunk";
import { AppDispatch, RootState } from "@/store";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/ui/ImageUpload";

const DEFAULT_SETTINGS: ReferralSettings = {
    referrerPoints: 0,
    refereePoints: 0,
    walletOffers: [
        { minAmount: 200, bonusPoints: 0, chargeType: "fixed", charge: 0 },
        { minAmount: 500, bonusPoints: 0, chargeType: "fixed", charge: 0 },
        { minAmount: 1000, bonusPoints: 0, chargeType: "fixed", charge: 0 },
    ],
    walletbox: [
        { amount: 910, chargeType: "percentage", charge: 10, badge: "" },
        { amount: 2500, chargeType: "percentage", charge: 20, badge: "Most preferred" },
        { amount: 5000, chargeType: "percentage", charge: 30, badge: "Best value offer" },
    ],
    points: [
        { image: "", text: "" },
    ],
    faqs: [
        { question: "What is the Wallet?", answer: "Your wallet recharge balance, coins earned, purchases, and referrals are all collected here — usable on your next purchase." },
    ],
};



function getBoxResultAmount(box: WalletBox) {
    if (box.chargeType === "percentage") {
        return Math.round(box.amount + (box.amount * box.charge) / 100);
    }
    return Math.round(box.amount + box.charge);
}


export default function ReffrelForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, saving } = useSelector((state: RootState) => state.referral);

    const [settings, setSettings] = useState<ReferralSettings>(DEFAULT_SETTINGS);
    const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

    useEffect(() => {
        dispatch(fetchReferralSettings());
    }, [dispatch]);

    useEffect(() => {
        if (data) {
            setSettings({
                ...data,
                walletOffers:
                    data.walletOffers && data.walletOffers.length > 0
                        ? data.walletOffers
                        : DEFAULT_SETTINGS.walletOffers,
                walletbox:
                    data.walletbox && data.walletbox.length > 0
                        ? data.walletbox
                        : DEFAULT_SETTINGS.walletbox,
                faqs: data.faqs?.length ? data.faqs : DEFAULT_SETTINGS.faqs,
                points:
                    data.points && data.points.length > 0
                        ? data.points
                        : DEFAULT_SETTINGS.points,
            });
        }
    }, [data]);

    const handleChange = (
        field: keyof Omit<ReferralSettings, "walletOffers" | "walletbox">,
        value: string
    ) => {
        setSettings((prev) => ({
            ...prev,
            [field]: Number(value),
        }));
    };

    const handleWalletOfferChange = (index: number, field: keyof WalletOffer, value: string) => {
        setSettings((prev) => {
            const updated = [...prev.walletOffers];
            updated[index] = {
                ...updated[index],
                [field]: field === "chargeType" ? value : Number(value),
            };
            return { ...prev, walletOffers: updated };
        });
    };

    const handleAddOffer = () => {
        setSettings((prev) => ({
            ...prev,
            walletOffers: [
                ...prev.walletOffers,
                { minAmount: 0, bonusPoints: 0, chargeType: "fixed", charge: 0 },
            ],
        }));
    };

    const handleRemoveOffer = (index: number) => {
        setSettings((prev) => ({
            ...prev,
            walletOffers: prev.walletOffers.filter((_, i) => i !== index),
        }));
    };

    const handleWalletboxChange = (index: number, field: keyof WalletBox, value: string) => {
        setSettings((prev) => {
            const updated = [...prev.walletbox];
            updated[index] = {
                ...updated[index],
                [field]: field === "chargeType" || field === "badge" ? value : Number(value),
            };
            return { ...prev, walletbox: updated };
        });
    };

    const handleAddbox = () => {
        setSettings((prev) => ({
            ...prev,
            walletbox: [...prev.walletbox, { amount: 0, chargeType: "fixed", charge: 0, badge: "" }],
        }));
    };

    const handleRemovebox = (index: number) => {
        setSettings((prev) => ({
            ...prev,
            walletbox: prev.walletbox.filter((_, i) => i !== index),
        }));
    };

    const handleFaqChange = (index: number, field: keyof faqs, value: string) => {
        setSettings((prev) => {
            const updated = [...prev.faqs];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, faqs: updated };
        });
    };

    const handleAddFaq = () => {
        setSettings((prev) => ({
            ...prev,
            faqs: [...prev.faqs, { question: "", answer: "" }],
        }));
    };

    const handleRemoveFaq = (index: number) => {
        setSettings((prev) => ({
            ...prev,
            faqs: prev.faqs.filter((_, i) => i !== index),
        }));
    };

    const handlePointChange = (index: number, field: keyof WalletPoint, value: string) => {
        setSettings((prev) => {
            const updated = [...prev.points];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, points: updated };
        });
    };

    const handleAddPoint = () => {
        setSettings((prev) => ({
            ...prev,
            points: [...prev.points, { image: "", text: "" }],
        }));
    };

    const handleRemovePoint = (index: number) => {
        setSettings((prev) => ({
            ...prev,
            points: prev.points.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        const cleanedOffers = settings.walletOffers.filter(
            (o) => o.minAmount > 0 || o.bonusPoints > 0 || o.charge > 0
        );
        const cleanedBoxes = settings.walletbox.filter((b) => b.amount > 0 || b.charge > 0);
        const cleanedFaqs = settings.faqs.filter((f) => f.question.trim().length > 0);
        const cleanedPoints = settings.points.filter((p) => p.text.trim().length > 0);
        if (cleanedOffers.length === 0 && cleanedBoxes.length === 0) {
            toast.error("Please add at least one wallet offer");
            return;
        }

        const payload = {
            ...settings,
            walletOffers: cleanedOffers,
            walletbox: cleanedBoxes,
            faqs: cleanedFaqs,
            points: cleanedPoints,
        };

        const res = await dispatch(updateReferralSettings(payload));
        if (updateReferralSettings.fulfilled.match(res)) {
            toast.success("Referral settings updated successfully!");
        } else {
            toast.error((res.payload as string) || "Failed to update settings");
        }
    };
    return (
        <>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Refer Settings</h1>
                <p className="text-muted-foreground">Manage your store referral program</p>
            </div>
            <div className="flex gap-4">
                <div className="w-[75%] space-y-5">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Gift size={20} />
                                    Referral Program
                                </CardTitle>
                                <CardDescription>
                                    Configure how many points referrer and referred users earn
                                </CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label htmlFor="referrerPoints">Referrer ₹</Label>
                                    <div className="relative mt-3">
                                        <span className="absolute left-4 top-5 -translate-y-1/2">₹</span>
                                        <Input
                                            id="referrerPoints"
                                            type="number"
                                            min={0}
                                            value={settings.referrerPoints}
                                            onChange={(e) => handleChange("referrerPoints", e.target.value)}
                                            className="py-4 pl-7 pr-4"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="refereePoints">New User ₹</Label>
                                    <div className="relative mt-3">
                                        <span className="absolute left-4 top-5 -translate-y-1/2">₹</span>
                                        <Input
                                            id="refereePoints"
                                            type="number"
                                            value={settings.refereePoints}
                                            onChange={(e) => handleChange("refereePoints", e.target.value)}
                                            className="py-4 pl-7 pr-4"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet size={20} />
                                Wallet Bonus Boxes
                            </CardTitle>
                            <CardDescription>Recharge bonus cards shown to users</CardDescription>
                        </CardHeader>
                        <div className="space-y-3">
                            <Card>
                                <CardContent className="pt-5">

                                    {settings.walletbox.length === 0 ? (
                                        <div className="text-center text-muted-foreground py-6 text-sm">
                                            No boxes added yet. Click "Add Box" to create one.
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {settings.walletbox.map((box, index) => (
                                                <div key={index} className="border rounded-lg overflow-hidden">
                                                    <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                                                        <p className="font-semibold text-sm">Box {index + 1}</p>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleRemovebox(index)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
                                                        <div>
                                                            <Label htmlFor={`box-amount-${index}`}>Amount</Label>
                                                            <div className="relative mt-2">
                                                                <span className="absolute left-4 top-5 -translate-y-1/2">₹</span>
                                                                <Input
                                                                    id={`box-amount-${index}`}
                                                                    type="number"
                                                                    min={0}
                                                                    value={box.amount}
                                                                    onChange={(e) => handleWalletboxChange(index, "amount", e.target.value)}
                                                                    className="py-4 pl-7 pr-4"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>Charge Type *</Label>
                                                            <Select
                                                                value={box.chargeType}
                                                                onValueChange={(value) => handleWalletboxChange(index, "chargeType", value)}
                                                            >
                                                                <SelectTrigger className="w-full">
                                                                    <SelectValue placeholder="Select Charge Type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="fixed">Fixed</SelectItem>
                                                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`box-charge-${index}`}>
                                                                {box.chargeType === "percentage" ? "Bonus (%)" : "Bonus (₹)"}
                                                            </Label>
                                                            <div className="relative mt-2">
                                                                <Input
                                                                    id={`box-charge-${index}`}
                                                                    type="number"
                                                                    min={0}
                                                                    value={box.charge}
                                                                    onChange={(e) => handleWalletboxChange(index, "charge", e.target.value)}
                                                                    className="py-4 pl-4 pr-4"
                                                                />
                                                            </div>
                                                            <p className="text-xs text-muted-foreground mt-1">
                                                                Get ₹{getBoxResultAmount(box).toLocaleString()}
                                                            </p>
                                                        </div>

                                                        <div>
                                                            <Label htmlFor={`box-badge-${index}`}>Badge Text (optional)</Label>
                                                            <Input
                                                                id={`box-badge-${index}`}
                                                                type="text"
                                                                placeholder="e.g. Most preferred"
                                                                value={box.badge || ""}
                                                                onChange={(e) => handleWalletboxChange(index, "badge", e.target.value)}
                                                                className="mt-2 py-4"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-center mt-4">
                                        <Button type="button" size="sm" className="gap-1" onClick={handleAddbox}>
                                            <Plus size={16} />
                                            Add Box
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wallet size={20} />
                                Wallet Balance Offer Setting
                            </CardTitle>
                            <CardDescription>add balance offers</CardDescription>
                        </CardHeader>
                        <CardContent>

                            {settings.walletOffers.length === 0 ? (
                                <div className="text-center text-muted-foreground py-6 text-sm">
                                    No ranges added yet. Click "Add Range" to create one.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {settings.walletOffers.map((offer, index) => (
                                        <div key={index} className="border rounded-lg overflow-hidden">
                                            <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                                                <p className="font-semibold text-sm">Range {index + 1}</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleRemoveOffer(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4">
                                                <div>
                                                    <Label htmlFor={`minAmount-${index}`}>Minimum Amount {index + 1}</Label>
                                                    <div className="relative mt-2">
                                                        <span className="absolute left-4 top-5 -translate-y-1/2">₹</span>
                                                        <Input
                                                            id={`minAmount-${index}`}
                                                            type="number"
                                                            min={0}
                                                            value={offer.minAmount}
                                                            onChange={(e) => handleWalletOfferChange(index, "minAmount", e.target.value)}
                                                            className="py-4 pl-7 pr-4"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor={`bonusPoints-${index}`}>Bonus {index + 1}</Label>
                                                    <div className="relative mt-2">
                                                        <span className="absolute left-4 top-5 -translate-y-1/2">₹</span>
                                                        <Input
                                                            id={`bonusPoints-${index}`}
                                                            type="number"
                                                            min={0}
                                                            value={offer.bonusPoints}
                                                            onChange={(e) => handleWalletOfferChange(index, "bonusPoints", e.target.value)}
                                                            className="py-4 pl-7 pr-4"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Charge Type *</Label>
                                                    <Select
                                                        value={offer.chargeType}
                                                        onValueChange={(value) => handleWalletOfferChange(index, "chargeType", value)}
                                                    >
                                                        <SelectTrigger className="w-full">
                                                            <SelectValue placeholder="Select Charge Type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="fixed">Fixed</SelectItem>
                                                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label htmlFor={`charge-${index}`}>
                                                        {offer.chargeType === "percentage" ? "Amount (%)" : "Amount (₹)"}
                                                    </Label>
                                                    <div className="relative mt-2">
                                                        <Input
                                                            id={`charge-${index}`}
                                                            type="number"
                                                            min={0}
                                                            value={offer.charge}
                                                            onChange={(e) => handleWalletOfferChange(index, "charge", e.target.value)}
                                                            className="py-4 pl-4 pr-4"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-center mt-4">
                                <Button type="button" size="sm" className="gap-1" onClick={handleAddOffer}>
                                    <Plus size={16} />
                                    Add Range
                                </Button>
                            </div>
                        </CardContent>
                    </Card>





                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Gift size={20} />
                                    Wallet Points
                                </CardTitle>
                                <CardDescription>
                                    Short bullet points shown above the wallet (with icon)
                                </CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {settings.points.length === 0 ? (
                                <div className="text-center text-muted-foreground py-6 text-sm">
                                    No points added yet. Click "Add Point" to create one.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {settings.points.map((point, index) => (
                                        <div key={index} className="border rounded-lg overflow-hidden">
                                            <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                                                <p className="font-semibold text-sm">Point {index + 1}</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleRemovePoint(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <Label>Image</Label>
                                                    <ImageUpload
                                                        value={point.image || null}
                                                        onChange={(url) => handlePointChange(index, "image", (url as string) || "")}
                                                        size={150}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`point-text-${index}`}>Text</Label>
                                                    <Input
                                                        id={`point-text-${index}`}
                                                        type="text"
                                                        placeholder="e.g. Earn 5% wallet cashback on every order"
                                                        value={point.text}
                                                        onChange={(e) => handlePointChange(index, "text", e.target.value)}
                                                        className="mt-2"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-center mt-4">
                                <Button type="button" size="sm" className="gap-1" onClick={handleAddPoint}>
                                    <Plus size={16} />
                                    Add Point
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* ---------------- FAQs ---------------- */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <HelpCircle size={20} />
                                    Wallet FAQs
                                </CardTitle>
                                <CardDescription>Question & answer pairs shown to users</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {settings.faqs.length === 0 ? (
                                <div className="text-center text-muted-foreground py-6 text-sm">
                                    No FAQs added yet. Click "Add Faq" to create one.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {settings.faqs.map((faq, index) => (
                                        <div key={index} className="border rounded-lg overflow-hidden">
                                            <div className="flex justify-between items-center bg-gray-100 px-4 py-2">
                                                <p className="font-semibold text-sm">FAQ {index + 1}</p>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleRemoveFaq(index)}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <Label htmlFor={`faq-q-${index}`}>Question</Label>
                                                    <Input
                                                        id={`faq-q-${index}`}
                                                        type="text"
                                                        placeholder="e.g. How do I earn wallet coins?"
                                                        value={faq.question}
                                                        onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                                                        className="mt-2"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor={`faq-a-${index}`}>Answer</Label>
                                                    <textarea
                                                        id={`faq-a-${index}`}
                                                        placeholder="Write the answer..."
                                                        value={faq.answer}
                                                        onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                                                        rows={3}
                                                        className="mt-2 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex justify-center mt-4">
                                <Button type="button" size="sm" className="gap-1" onClick={handleAddFaq}>
                                    <Plus size={16} />
                                    Add Faq
                                </Button>
                            </div>
                        </CardContent>
                    </Card>




                </div>

                <div className="w-[25%]">
                    <Card className="sticky top-5">
                        <CardContent className="!p-3">
                            <Button onClick={handleSave} disabled={saving || loading} className="gap-2 w-full">
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Settings
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}