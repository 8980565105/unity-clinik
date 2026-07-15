"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Gift, Save, Wallet, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { fetchReferralSettings, ReferralSettings, updateReferralSettings, WalletOffer } from "@/features/reffrelsetting/reffrellsettingThunk";
import { AppDispatch, RootState } from "@/store";

const DEFAULT_SETTINGS: ReferralSettings = {
    referrerPoints: 0,
    refereePoints: 0,
    walletOffers: [
        { minAmount: 200, bonusPoints: 0 },
        { minAmount: 500, bonusPoints: 0 },
        { minAmount: 1000, bonusPoints: 0 },
    ],
};

export default function ReffrelForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, loading, saving } = useSelector((state: RootState) => state.referral);

    const [settings, setSettings] = useState<ReferralSettings>(DEFAULT_SETTINGS);

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
            });
        }
    }, [data]);

    const handleChange = (field: keyof Omit<ReferralSettings, "walletOffers">, value: string) => {
        setSettings((prev) => ({
            ...prev,
            [field]: Number(value),
        }));
    };

    const handleWalletOfferChange = (
        index: number,
        field: keyof WalletOffer,
        value: string
    ) => {
        setSettings((prev) => {
            const updated = [...prev.walletOffers];
            updated[index] = {
                ...updated[index],
                [field]: Number(value),
            };
            return { ...prev, walletOffers: updated };
        });
    };

    // 👇 Naru slab ekdum add karva mate (admin thi)
    const handleAddOffer = () => {
        setSettings((prev) => ({
            ...prev,
            walletOffers: [...prev.walletOffers, { minAmount: 0, bonusPoints: 0 }],
        }));
    };

    // 👇 Slab remove karva mate
    const handleRemoveOffer = (index: number) => {
        setSettings((prev) => ({
            ...prev,
            walletOffers: prev.walletOffers.filter((_, i) => i !== index),
        }));
    };

    const handleSave = async () => {
        // empty/invalid slabs ne filter karo (0 minAmount vada skip, jo khali add karyu hoy)
        const cleanedOffers = settings.walletOffers.filter(
            (o) => o.minAmount > 0 || o.bonusPoints > 0
        );

        if (cleanedOffers.length === 0) {
            toast.error("Please add at least one wallet offer slab");
            return;
        }

        const payload = { ...settings, walletOffers: cleanedOffers };

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
                            {loading ? (
                                <div className="flex items-center justify-center py-10 text-muted-foreground">
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Loading referral settings...
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                        <div>
                                            <Label htmlFor="refereePoints">Referrer ₹</Label>

                                            <div className="relative mt-3">

                                                <span className="absolute left-4 top-5 -translate-y-1/2">
                                                    ₹
                                                </span>

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

                                                <span className="absolute left-4 top-5 -translate-y-1/2">
                                                    ₹
                                                </span>

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
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet size={20} />
                                    Wallet Balance Offer  Setting
                                </CardTitle>
                                <CardDescription>
                            add balence offers
                                </CardDescription>
                            </div>
                            {!loading && (
                                <Button
                                    type="button"
                                    size="sm"
                                    className="gap-1"
                                    onClick={handleAddOffer}
                                >
                                    <Plus size={16} />
                                    Add Slab
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-10 text-muted-foreground">
                                    <Loader2 className="animate-spin mr-2" size={18} />
                                    Loading...
                                </div>
                            ) : settings.walletOffers.length === 0 ? (
                                <div className="text-center text-muted-foreground py-6 text-sm">
                                    No slabs added yet. Click "Add Slab" to create one.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {settings.walletOffers.map((offer, index) => (
                                        <div
                                            key={index}
                                            className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-4 items-end border-b pb-4 last:border-b-0"
                                        >

                                            <div>
                                                <Label htmlFor={`minAmount-${index}`}>
                                                    Minimum Amount  {index + 1}
                                                </Label>
                                                <div className="relative mt-3">
                                                    <span className="absolute left-4 top-5 -translate-y-1/2">
                                                        ₹
                                                    </span>
                                                    <Input
                                                        id={`minAmount-${index}`}
                                                        type="number"
                                                        min={0}
                                                        value={offer.minAmount}
                                                        onChange={(e) =>
                                                            handleWalletOfferChange(index, "minAmount", e.target.value)
                                                        }
                                                        className="py-4 pl-7 pr-4"
                                                    />
                                                </div>
                                            </div>
                                    
                                            <div>
                                                <Label htmlFor={`bonusPoints-${index}`}>
                                                    Bonus {index + 1}
                                                </Label>
                                                <div className="relative mt-3">
                                                    <span className="absolute left-4 top-5 -translate-y-1/2">
                                                        ₹
                                                    </span>
                                                    <Input
                                                        id={`bonusPoints-${index}`}
                                                        type="number"
                                                        min={0}
                                                        value={offer.bonusPoints}
                                                        onChange={(e) =>
                                                            handleWalletOfferChange(index, "bonusPoints", e.target.value)
                                                        }
                                                        className="py-4 pl-7 pr-4"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => handleRemoveOffer(index)}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="w-[25%]">
                    <Card>
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