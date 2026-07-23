import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Layers, Trash2, Truck, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { fetchShippingCharge, saveShippingCharge } from "@/features/sippingcharge/sippingchargeThunk";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import { fetchProducts } from "@/features/products/productsThunk";
import ReactSelect from "react-select";
import { Switch } from "@/components/ui/switch";

type Range = {
    from: string;
    to: string;
    charge: string;
    chargeType: "fixed" | "percentage" | "free_shipping";
};

type ShippingType = "price" | "weight" | "quntity";

type ApplyTo =
    | "allproducts"
    | "specificproducts"
    | "specificsubcategory"
    | "Excludeproduct"
    | "Excludecategories";
type PaymentType = "all" | "cod" | "partial" | "prepaid" | "wallet";
type Option = { value: string; label: string };
type ProductRule = {
    id: string;
    applyTo: ApplyTo;
    products: Option[];
    subCategories: Option[];
    shippingType: ShippingType;
    paymentType: PaymentType;
    freeThreshold: string;
    ranges: Range[];
};

type GiftRule = {
    id: string;
    status: boolean;
    applyTo:
    | "allproducts"
    | "specificproducts"
    | "specificsubcategory"
    | "Excludeproduct"
    | "Excludecategories";
    products: Option[];
    subCategories: Option[];
    minimumAmount: string;
    maximumAmount: string;
    giftProduct: Option | null;
    shortDescription: string;
    priority: number;
}



type TabKey = "cod" | "partial" | "prepaid" | "wallet" | "gift";
const uid = () => Math.random().toString(36).slice(2, 10);
const emptyRange = (): Range => ({ from: "", to: "", charge: "", chargeType: "fixed" });
const emptyRule = (shippingType: ShippingType = "price"): ProductRule => ({
    id: uid(),
    applyTo: "allproducts",
    products: [],
    subCategories: [],
    shippingType,
    freeThreshold: "",
    paymentType: "all",
    ranges: [emptyRange()],
});

const toFormRange = (r: any): Range => ({
    from: r?.from !== undefined && r?.from !== null ? String(r.from) : "",
    to: r?.to !== undefined && r?.to !== null ? String(r.to) : "",
    charge: r?.charge !== undefined && r?.charge !== null ? String(r.charge) : "",
    chargeType: r?.chargeType || "fixed",
});

const toFormRanges = (ranges: any[]): Range[] => {
    if (!Array.isArray(ranges) || ranges.length === 0) return [emptyRange()];
    return ranges.map(toFormRange);
};

const toApiRange = (r: Range) => ({
    from: r.from === "" ? null : Number(r.from),
    to: r.to === "" ? null : Number(r.to),
    chargeType: r.chargeType,
    charge: r.chargeType === "free_shipping" ? 0 : r.charge === "" ? null : Number(r.charge),
});

const mapIdsToOptions = (ids: any[], allItems: any[]): Option[] => {
    if (!Array.isArray(ids)) return [];
    return ids.map((id) => {
        const found = allItems.find((item) => item._id === id);
        return { value: id, label: found ? found.name : id };
    });
};

const mapRuleFromApi = (rule: any, allProducts: any[], allSubCats: any[]): ProductRule => ({
    id: uid(),
    applyTo: rule?.applyTo || "allproducts",
    products: mapIdsToOptions(rule?.products, allProducts),
    subCategories: mapIdsToOptions(rule?.subCategories, allSubCats),
    shippingType: rule?.shippingType || "price",
    paymentType: rule?.paymentType || "all",
    freeThreshold:
        rule?.freeThreshold !== undefined && rule?.freeThreshold !== null
            ? String(rule.freeThreshold)
            : "",
    ranges: toFormRanges(rule?.ranges),
});

const mapRulesFromApi = (rules: any[], allProducts: any[], allSubCats: any[]): ProductRule[] => {
    if (!Array.isArray(rules) || rules.length === 0) return [emptyRule()];
    return rules.map((r) => mapRuleFromApi(r, allProducts, allSubCats));
};

const toApiRule = (rule: ProductRule) => ({
    applyTo: rule.applyTo,
    products: rule.products.map((p) => p.value),
    subCategories: rule.subCategories.map((c) => c.value),
    shippingType: rule.shippingType,
    paymentType: rule.paymentType,
    freeThreshold: rule.freeThreshold === "" ? 0 : Number(rule.freeThreshold),
    ranges: rule.ranges.map(toApiRange),
});

const RangeRow = ({
    range, index, prefix, unit = "₹",
    onChange, onDelete, canDelete, errors,
}: {
    range: Range; index: number; prefix: string; unit?: string;
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
                <p className="font-semibold text-sm">Range {index + 1}</p>
                {canDelete && (
                    <Button variant="destructive" size="icon" onClick={() => onDelete(index)}>
                        <Trash2 size={16} />
                    </Button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4">
                <div className="space-y-2">
                    <Label>From ({unit}) *</Label>
                    <Input
                        type="number"
                        value={range.from}
                        className={errCls(`${prefix}_from_${index}`)}
                        onChange={(e) => onChange(index, "from", e.target.value)}
                    />
                    <Err field={`${prefix}_from_${index}`} />
                </div>
                <div className="space-y-2">
                    <Label>To ({unit}) *</Label>
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
                    <Select
                        value={range.chargeType}
                        onValueChange={(value) => onChange(index, "chargeType", value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Charge Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="percentage">Percentage (%)</SelectItem>
                            <SelectItem value="free_shipping">Free Shipping</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>{range.chargeType === "percentage" ? "Charge (%) *" : "Charge (₹) *"}</Label>
                    <Input
                        type="number"
                        min={0}
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

const RuleCard = ({
    rule,
    ruleIndex,
    prefix,
    productOptions,
    subCatOptions,
    onUpdate,
    onDelete,
    canDelete,
    errors,
}: {
    rule: ProductRule;
    ruleIndex: number;
    prefix: string;
    productOptions: Option[];
    subCatOptions: Option[];
    onUpdate: (index: number, updated: ProductRule) => void;
    onDelete: (index: number) => void;
    canDelete: boolean;
    errors: Record<string, string>;
}) => {
    const fieldPrefix = `${prefix}_${ruleIndex}`;
    const unit = rule.shippingType === "weight" ? "g" : rule.shippingType === "quntity" ? "qty" : "₹";

    const Err = ({ field }: { field: string }) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;

    const patch = (partial: Partial<ProductRule>) => onUpdate(ruleIndex, { ...rule, ...partial });

    const handleRangeChange = (i: number, field: keyof Range, value: string) => {
        const updated = [...rule.ranges];
        updated[i] = { ...updated[i], [field]: value };
        if (field === "chargeType") {
            updated[i].charge = value === "free_shipping" ? "0" : "";
        }
        patch({ ranges: updated });
    };
    const addRange = () => patch({ ranges: [...rule.ranges, emptyRange()] });
    const deleteRange = (i: number) => patch({ ranges: rule.ranges.filter((_, idx) => idx !== i) });
    return (
        <Card className="py-3 border-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Product Charge #{ruleIndex + 1}</CardTitle>
                {canDelete && (
                    <Button variant="destructive" size="icon" onClick={() => onDelete(ruleIndex)}>
                        <Trash2 size={16} />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Applies To *</Label>
                        <Select
                            value={rule.applyTo}
                            onValueChange={(val) =>
                                patch({ applyTo: val as ApplyTo, products: [], subCategories: [] })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="allproducts">All Products</SelectItem>
                                <SelectItem value="specificproducts">Specific Products</SelectItem>
                                <SelectItem value="specificsubcategory">Specific SubCategory</SelectItem>
                                <SelectItem value="Excludeproduct">Exclude Selected Products</SelectItem>
                                <SelectItem value="Excludecategories">Exclude Selected SubCategories</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Shipping Type *</Label>
                        <Select
                            value={rule.shippingType}
                            onValueChange={(val) => patch({ shippingType: val as ShippingType })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="price">Price wise</SelectItem>
                                <SelectItem value="weight">Weight wise</SelectItem>
                                <SelectItem value="quntity">Quantity wise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        {(rule.applyTo === "specificproducts" || rule.applyTo === "Excludeproduct") && (
                            <div className="space-y-2 md:col-span-2">
                                <Label>
                                    {rule.applyTo === "Excludeproduct" ? "Exclude Products" : "Select Products"}
                                </Label>
                                <ReactSelect
                                    isMulti
                                    options={productOptions}
                                    value={rule.products}
                                    onChange={(selected) => patch({ products: [...(selected || [])] })}
                                    placeholder="Search and select products..."
                                    className="mt-1"
                                />
                                <Err field={`${fieldPrefix}_products`} />
                            </div>
                        )}

                        {(rule.applyTo === "specificsubcategory" || rule.applyTo === "Excludecategories") && (
                            <div className="space-y-2 md:col-span-2">
                                <Label>
                                    {rule.applyTo === "Excludecategories" ? "Exclude SubCategories" : "Select SubCategory"}
                                </Label>
                                <ReactSelect
                                    isMulti
                                    options={subCatOptions}
                                    value={rule.subCategories}
                                    onChange={(selected) => patch({ subCategories: [...(selected || [])] })}
                                    placeholder="Search and select subcategories..."
                                    className="mt-1"
                                />
                                <Err field={`${fieldPrefix}_subCategories`} />
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label>Free Threshold ({unit})</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 500"
                            value={rule.freeThreshold}
                            onChange={(e) => patch({ freeThreshold: e.target.value })}
                        />
                    </div>
                </div>
                <p className="text-sm font-semibold">Ranges</p>
                {rule.ranges.map((range, i) => (
                    <RangeRow
                        key={i}
                        range={range}
                        index={i}
                        prefix={`${fieldPrefix}_range`}
                        unit={unit}
                        onChange={handleRangeChange}
                        onDelete={deleteRange}
                        canDelete={rule.ranges.length > 1}
                        errors={errors}
                    />
                ))}
                <div className="flex justify-center">
                    <Button type="button" onClick={addRange}>
                        + Add Range
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

const GiftRuleCard = ({
    rule,
    ruleIndex,
    productOptions,
    subCatOptions,
    onUpdate,
    onDelete,
    errors,
}: {
    rule: GiftRule;
    ruleIndex: number;
    productOptions: Option[];
    subCatOptions: Option[];
    onUpdate: (index: number, updated: GiftRule) => void;
    onDelete: (index: number) => void;
    errors: Record<string, string>;
}) => {
    const fieldPrefix = `gift_${ruleIndex}`;
    const patch = (partial: Partial<GiftRule>) => onUpdate(ruleIndex, { ...rule, ...partial });

    const Err = ({ field }: { field: string }) =>
        errors[field] ? <p className="text-red-500 text-xs mt-1">{errors[field]}</p> : null;

    return (
        <Card className="py-3 border-2">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Gift Rule #{ruleIndex + 1}</CardTitle>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Label className="text-xs">Active</Label>
                        <input
                            type="checkbox"
                            checked={rule.status}
                            onChange={(e) => patch({ status: e.target.checked })}
                            className="w-4 h-4"
                        />
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => onDelete(ruleIndex)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Applies To *</Label>
                        <Select
                            value={rule.applyTo}
                            onValueChange={(val) =>
                                patch({ applyTo: val as GiftRule["applyTo"], products: [], subCategories: [] })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="allproducts">All Products</SelectItem>
                                <SelectItem value="specificproducts">Specific Products</SelectItem>
                                <SelectItem value="specificsubcategory">Specific SubCategory</SelectItem>
                                <SelectItem value="Excludeproduct">Exclude Selected Products</SelectItem>
                                <SelectItem value="Excludecategories">Exclude Selected SubCategories</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Priority (lower = higher priority)</Label>
                        <Input
                            type="number"
                            value={rule.priority}
                            onChange={(e) => patch({ priority: Number(e.target.value) })}
                        />
                    </div>

                    <div className="md:col-span-2">
                        {(rule.applyTo === "specificproducts" || rule.applyTo === "Excludeproduct") && (
                            <div className="space-y-2">
                                <Label>
                                    {rule.applyTo === "Excludeproduct" ? "Exclude Products" : "Select Products"}
                                </Label>
                                <ReactSelect
                                    isMulti
                                    options={productOptions}
                                    value={rule.products}
                                    onChange={(selected) => patch({ products: [...(selected || [])] })}
                                    placeholder="Search and select products..."
                                    className="mt-1"
                                />
                                <Err field={`${fieldPrefix}_products`} />
                            </div>
                        )}
                        {(rule.applyTo === "specificsubcategory" || rule.applyTo === "Excludecategories") && (
                            <div className="space-y-2">
                                <Label>
                                    {rule.applyTo === "Excludecategories" ? "Exclude SubCategories" : "Select SubCategory"}
                                </Label>
                                <ReactSelect
                                    isMulti
                                    options={subCatOptions}
                                    value={rule.subCategories}
                                    onChange={(selected) => patch({ subCategories: [...(selected || [])] })}
                                    placeholder="Search and select subcategories..."
                                    className="mt-1"
                                />
                                <Err field={`${fieldPrefix}_subCategories`} />
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Minimum Cart Amount (₹) *</Label>
                        <Input
                            type="number"
                            placeholder="e.g. 500"
                            value={rule.minimumAmount}
                            className={errors[`${fieldPrefix}_minimumAmount`] ? "border-red-500" : ""}
                            onChange={(e) => patch({ minimumAmount: e.target.value })}
                        />
                        <Err field={`${fieldPrefix}_minimumAmount`} />
                    </div>

                    <div className="space-y-2">
                        <Label>Maximum Cart Amount (₹) — optional</Label>
                        <Input
                            type="number"
                            placeholder="Leave blank = no upper limit"
                            value={rule.maximumAmount}
                            onChange={(e) => patch({ maximumAmount: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Gift Product *</Label>
                        <ReactSelect
                            options={productOptions}
                            value={rule.giftProduct}
                            onChange={(selected) => patch({ giftProduct: selected as Option })}
                            placeholder="Select the free gift product..."
                            className="mt-1"
                        />
                        <Err field={`${fieldPrefix}_giftProduct`} />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>Short Description</Label>
                        <Input
                            placeholder="e.g. Get a free water bottle on orders above ₹500"
                            value={rule.shortDescription}
                            onChange={(e) => patch({ shortDescription: e.target.value })}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default function SippingCharge() {
    const dispatch = useDispatch<AppDispatch>();
    const [activeTab, setActiveTab] = useState<TabKey>("cod");
    const [pcodType, setPcodType] = useState<"fixed" | "percentage">("fixed");
    const [pcodValue, setPcodValue] = useState("");
    const [products, setProducts] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [codRules, setCodRules] = useState<ProductRule[]>([emptyRule()]);
    const [prepaidRules, setPrepaidRules] = useState<ProductRule[]>([emptyRule()]);
    const [partialRules, setPartialRules] = useState<ProductRule[]>([emptyRule()]);
    const [walletRules, setWalletRules] = useState<ProductRule[]>([emptyRule()]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [methodStatus, setMethodStatus] = useState({
        cod: true,
        prepaid: true,
        partialCod: true,
        wallet: true,
    });
    const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const productOptions: Option[] = useMemo(
        () => products.map((p) => ({ value: p._id, label: p.name })),
        [products]
    );
    const subCatOptions: Option[] = useMemo(
        () => subCategories.map((c) => ({ value: c._id, label: c.name })),
        [subCategories]
    );


    const [giftRules, setGiftRules] = useState<GiftRule[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            let loadedProducts: any[] = [];
            let loadedSubCategories: any[] = [];
            try {
                const productData = await dispatch(fetchProducts({})).unwrap();
                loadedProducts = productData?.products || [];
                setProducts(loadedProducts);
            } catch (err) {
                console.error("Failed to load products:", err);
            }
            try {
                const subCatData = await dispatch(fetchsubCategories({ page: 1, limit: 1000 })).unwrap();
                loadedSubCategories = subCatData?.categories || [];
                setSubCategories(loadedSubCategories);
            } catch (err) {
                console.error("Failed to load subcategories:", err);
            }
            try {
                const data = await dispatch(fetchShippingCharge()).unwrap();
                if (data) {
                    setPcodType(data?.partialCod?.codType || "fixed");
                    setPcodValue(
                        data?.partialCod?.value !== undefined ? String(data.partialCod.value) : ""
                    );
                    setMethodStatus({
                        cod: data?.methodStatus?.cod ?? true,
                        prepaid: data?.methodStatus?.prepaid ?? true,
                        partialCod: data?.methodStatus?.partialCod ?? true,
                        wallet: data?.methodStatus?.wallet ?? true,
                    });

                    setCodRules(mapRulesFromApi(data?.productRules?.cod, loadedProducts, loadedSubCategories));
                    setPrepaidRules(mapRulesFromApi(data?.productRules?.prepaid, loadedProducts, loadedSubCategories));
                    setPartialRules(mapRulesFromApi(data?.productRules?.partialCod, loadedProducts, loadedSubCategories));
                    setWalletRules(mapRulesFromApi(data?.productRules?.wallet, loadedProducts, loadedSubCategories));
                    setGiftRules(mapGiftRulesFromApi(data?.giftRules, loadedProducts, loadedSubCategories));
                }
            } catch (err) {
                console.error("Failed to load shipping charge settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [dispatch]);
    const getRulesSetter = (tab: TabKey) =>
        tab === "cod" ? setCodRules : tab === "prepaid" ? setPrepaidRules : tab === "wallet" ? setWalletRules : setPartialRules;

    const getRules = (tab: TabKey) =>
        tab === "cod" ? codRules : tab === "prepaid" ? prepaidRules : tab === "wallet" ? walletRules : partialRules;
    const getStatusKey = (tab: TabKey) =>
        tab === "cod" ? "cod" : tab === "prepaid" ? "prepaid" : tab === "wallet" ? "wallet" : "partialCod";

    const addRule = (tab: TabKey) => {
        const setter = getRulesSetter(tab);
        setter((prev) => [...prev, emptyRule()]);
    };
    const deleteRule = (tab: TabKey, index: number) => {
        const setter = getRulesSetter(tab);
        setter((prev) => prev.filter((_, i) => i !== index));
    };
    const updateRule = (tab: TabKey, index: number, updated: ProductRule) => {
        const setter = getRulesSetter(tab);
        setter((prev) => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });
    };


    const uidG = () => Math.random().toString(36).slice(2, 10);
    const emptyGiftRule = (): GiftRule => ({
        id: uidG(),
        status: true,
        applyTo: "allproducts",
        products: [],
        subCategories: [],
        minimumAmount: "",
        maximumAmount: "",
        giftProduct: null,
        shortDescription: "",
        priority: 0,
    });

    const mapGiftRuleFromApi = (rule: any, allProducts: any[], allSubCats: any[]): GiftRule => ({
        id: uidG(),
        status: rule?.status !== undefined ? rule.status : true,
        applyTo: rule?.applyTo || "allproducts",
        products: mapIdsToOptions(rule?.products, allProducts),
        subCategories: mapIdsToOptions(rule?.subCategories, allSubCats),
        minimumAmount: rule?.minimumAmount !== undefined ? String(rule.minimumAmount) : "",
        maximumAmount: rule?.maximumAmount !== undefined ? String(rule.maximumAmount) : "",
        giftProduct: rule?.giftProduct
            ? {
                value: rule.giftProduct,
                label: allProducts.find((p) => p._id === rule.giftProduct)?.name || rule.giftProduct,
            }
            : null,
        shortDescription: rule?.shortDescription || "",
        priority: rule?.priority || 0,
    });

    const mapGiftRulesFromApi = (rules: any[], allProducts: any[], allSubCats: any[]): GiftRule[] => {
        if (!Array.isArray(rules) || rules.length === 0) return [];
        return rules.map((r) => mapGiftRuleFromApi(r, allProducts, allSubCats));
    };

    const toApiGiftRule = (rule: GiftRule) => ({
        status: rule.status,
        applyTo: rule.applyTo,
        products: rule.products.map((p) => p.value),
        subCategories: rule.subCategories.map((c) => c.value),
        minimumAmount: rule.minimumAmount === "" ? 0 : Number(rule.minimumAmount),
        maximumAmount: rule.maximumAmount === "" ? 0 : Number(rule.maximumAmount),
        giftProduct: rule.giftProduct?.value || null,
        shortDescription: rule.shortDescription,
        priority: rule.priority,
    });



    const addGiftRule = () => setGiftRules((prev) => [...prev, emptyGiftRule()]);
    const deleteGiftRule = (index: number) =>
        setGiftRules((prev) => prev.filter((_, i) => i !== index));
    const updateGiftRule = (index: number, updated: GiftRule) =>
        setGiftRules((prev) => {
            const copy = [...prev];
            copy[index] = updated;
            return copy;
        });

    const validateRuleList = (rules: ProductRule[], prefix: string, newErrors: Record<string, string>) => {
        let valid = true;
        rules.forEach((rule, ruleIndex) => {
            const fieldPrefix = `${prefix}_${ruleIndex}`;

            if (
                (rule.applyTo === "specificproducts" || rule.applyTo === "Excludeproduct") &&
                rule.products.length === 0
            ) {
                newErrors[`${fieldPrefix}_products`] = "At least one product is required";
                valid = false;
            }
            if (
                (rule.applyTo === "specificsubcategory" || rule.applyTo === "Excludecategories") &&
                rule.subCategories.length === 0
            ) {
                newErrors[`${fieldPrefix}_subCategories`] = "At least one subcategory is required";
                valid = false;
            }
        });
        return valid;
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        let valid = true;
        if (activeTab === "cod") {
            valid = validateRuleList(codRules, "cod", newErrors) && valid;
        } else if (activeTab === "prepaid") {
            valid = validateRuleList(prepaidRules, "prepaid", newErrors) && valid;
        } else if (activeTab === "partial") {
            valid = validateRuleList(partialRules, "partial", newErrors) && valid;
            if (pcodValue === "") {
                newErrors["pcodValue"] = "Required";
                valid = false;
            }
        } else if (activeTab === "wallet") {
            valid = validateRuleList(walletRules, "wallet", newErrors) && valid;
        } else if (activeTab === "gift") {
            giftRules.forEach((rule, i) => {
                if (
                    (rule.applyTo === "specificproducts" || rule.applyTo === "Excludeproduct") &&
                    rule.products.length === 0
                ) {
                    newErrors[`gift_${i}_products`] = "At least one product is required";
                    valid = false;
                }
                if (
                    (rule.applyTo === "specificsubcategory" || rule.applyTo === "Excludecategories") &&
                    rule.subCategories.length === 0
                ) {
                    newErrors[`gift_${i}_subCategories`] = "At least one subcategory is required";
                    valid = false;
                }
                if (!rule.giftProduct) {
                    newErrors[`gift_${i}_giftProduct`] = "Gift product is required";
                    valid = false;
                }
                if (rule.minimumAmount === "") {
                    newErrors[`gift_${i}_minimumAmount`] = "Minimum amount is required";
                    valid = false;
                }
            });
        }
        setErrors(newErrors);
        return valid;
    };

    const handleSave = async () => {
        setSaveMessage(null);

        if (!validateForm()) {
            setSaveMessage({ type: "error", text: "Please fix the highlighted fields before saving." });
            return;
        }

        const payload: any = {
            shippingType: "price",
            methodStatus,
        };

        if (activeTab === "cod") {
            payload.productRules = { cod: codRules.map(toApiRule) };
        } else if (activeTab === "prepaid") {
            payload.productRules = { prepaid: prepaidRules.map(toApiRule) };
        } else if (activeTab === "partial") {
            payload.partialCod = {
                codType: pcodType,
                value: pcodValue === "" ? 0 : Number(pcodValue),
            };
            payload.productRules = { partialCod: partialRules.map(toApiRule) };
        } else if (activeTab === "wallet") {
            payload.productRules = { wallet: walletRules.map(toApiRule) };
        } else if (activeTab === "gift") {
            payload.giftRules = giftRules.map(toApiGiftRule);
        }

        const tabLabel =
            activeTab === "cod" ? "COD" : activeTab === "prepaid" ? "Prepaid" :
                activeTab === "wallet" ? "Wallet" : activeTab === "gift" ? "Gift" : "Partial COD";
        setSaving(true);
        try {
            await dispatch(saveShippingCharge(payload)).unwrap();
            setSaveMessage({ type: "success", text: `${tabLabel} shipping charge settings saved successfully.` });
        } catch (err: any) {
            console.error("Save failed:", err);
            const apiErrors = err?.data?.errors;
            setSaveMessage({
                type: "error",
                text: Array.isArray(apiErrors) && apiErrors.length
                    ? apiErrors.join(", ")
                    : err?.message || err || "Something went wrong while saving.",
            });
        } finally {
            setSaving(false);
        }
    };

    const renderTabRules = (tab: TabKey, prefix: string) => {
        const rules = getRules(tab);
        return (
            <div className="space-y-4">
                {rules.map((rule, index) => (
                    <RuleCard
                        key={rule.id}
                        rule={rule}
                        ruleIndex={index}
                        prefix={prefix}
                        productOptions={productOptions}
                        subCatOptions={subCatOptions}
                        onUpdate={(i, updated) => updateRule(tab, i, updated)}
                        onDelete={(i) => deleteRule(tab, i)}
                        canDelete={rules.length > 1}
                        errors={errors}
                    />
                ))}
                <div className="flex justify-center items-center">
                    <Button type="button" onClick={() => addRule(tab)}>
                        + add more product charge
                    </Button>
                </div>
            </div>
        );
    };
    const handleTabChange = (tab: TabKey) => {
        setActiveTab(tab);
        setErrors({});
        setSaveMessage(null);
    };


    return (
        <>
            <div>
                <div className="flex flex-wrap items-center gap-3 mb-6 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                    <button
                        onClick={() => handleTabChange("cod")}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === "cod" ? "bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm" : "hover:bg-slate-100 text-slate-600 border border-transparent"}`}
                    >
                        <ClipboardList size={16} />
                        COD Rules
                    </button>
                    <button
                        onClick={() => handleTabChange("partial")}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === "partial" ? "bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm" : "hover:bg-slate-100 text-slate-600 border border-transparent"}`}
                    >
                        <Layers size={16} />
                        Partial COD Rules
                    </button>
                    <button
                        onClick={() => handleTabChange("prepaid")}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === "prepaid" ? "bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm" : "hover:bg-slate-100 text-slate-600 border border-transparent"}`}
                    >
                        <Truck size={16} />
                        Prepaid Rules
                    </button>

                    <button
                        onClick={() => handleTabChange("wallet")}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === "wallet" ? "bg-indigo-50 border border-indigo-200 text-indigo-600 shadow-sm" : "hover:bg-slate-100 text-slate-600 border border-transparent"}`}
                    >
                        <Wallet size={16} />
                        Wallet Rules
                    </button>
                    <button
                        onClick={() => handleTabChange("gift")}
                        className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-semibold text-sm transition-all
    ${activeTab === "gift"
                                ? "bg-indigo-50 border border-indigo-200 text-indigo-600"
                                : "hover:bg-slate-100 text-slate-600"
                            }`}
                    >
                        🎁 Gift Rules
                    </button>
                </div>
            </div>
            <div className="flex justify-between gap-4">
                <div className="w-[75%]">
                    {activeTab === "cod" && (
                        <Card>
                            <CardHeader><CardTitle>COD Rules</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col space-y-6">
                                    <Label>{methodStatus.cod ? "cod is Active" : "cod is Inactive"}</Label>
                                    <Switch
                                        id="cod-status"
                                        checked={methodStatus.cod}
                                        onCheckedChange={(val) => setMethodStatus((prev) => ({ ...prev, cod: val }))}
                                    />
                                </div>
                                {methodStatus.cod ? renderTabRules("cod", "cod") : (
                                    <p className="text-sm text-gray-500">cod payment is currently disabled for all customers.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === "partial" && (
                        <Card>
                            <CardHeader><CardTitle>Partial COD Rules</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">


                                    {/* <div className="flex flex-col space-y-6">
                                        <Label>{status === true ? "partial is Active" : "partial is Inactive"}</Label>

                                        <Switch
                                            id="status"
                                            checked={status}
                                            onCheckedChange={setStatus}
                                        />
                                    </div> */}



                                    <div className="flex flex-col space-y-6">
                                        <Label>{methodStatus.partialCod ? "partial Cod is Active" : "partial Cod is Inactive"}</Label>
                                        <Switch
                                            id="partial-status"
                                            checked={methodStatus.partialCod}
                                            onCheckedChange={(val) => setMethodStatus((prev) => ({ ...prev, partialCod: val }))}
                                        />
                                    </div>



                                    <div className="space-y-2">
                                        <Label>Partial COD Type *</Label>
                                        <Select value={pcodType} onValueChange={(val) => setPcodType(val as "fixed" | "percentage")}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="fixed">Fixed Amount</SelectItem>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>{pcodType === "percentage" ? "Advance (%) *" : "Advance Amount (₹) *"}</Label>
                                        <Input
                                            type="number"
                                            value={pcodValue}
                                            className={errors["pcodValue"] ? "border-red-500" : ""}
                                            onChange={(e) => setPcodValue(e.target.value)}
                                        />
                                        {errors["pcodValue"] && (
                                            <p className="text-red-500 text-xs mt-1">{errors["pcodValue"]}</p>
                                        )}
                                    </div>
                                </div>

                                {/* {status === true ? (renderTabRules("partial", "partial")) : ""} */}
                                {methodStatus.partialCod ? renderTabRules("partial", "partial") : (
                                    <p className="text-sm text-gray-500">partial Cod  payment is currently disabled for all customers.</p>
                                )}
                                {/* {renderTabRules("partial", "partial")} */}
                            </CardContent>
                        </Card>
                    )}
                    {activeTab === "prepaid" && (
                        <Card>
                            <CardHeader><CardTitle>Prepaid Rules</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col space-y-6">
                                    <Label>{methodStatus.prepaid ? "prepaid is Active" : "prepaid is Inactive"}</Label>
                                    <Switch
                                        id="prepaid-status"
                                        checked={methodStatus.prepaid}
                                        onCheckedChange={(val) => setMethodStatus((prev) => ({ ...prev, prepaid: val }))}
                                    />
                                </div>
                                {methodStatus.prepaid ? renderTabRules("prepaid", "prepaid") : (
                                    <p className="text-sm text-gray-500">prepaid payment is currently disabled for all customers.</p>
                                )}

                            </CardContent>
                        </Card>
                    )}
                    {activeTab === "wallet" && (
                        <Card>
                            <CardHeader><CardTitle>Wallet Rules</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex flex-col space-y-6">
                                    <Label>{methodStatus.wallet ? "Wallet is Active" : "Wallet is Inactive"}</Label>
                                    <Switch
                                        id="wallet-status"
                                        checked={methodStatus.wallet}
                                        onCheckedChange={(val) => setMethodStatus((prev) => ({ ...prev, wallet: val }))}
                                    />
                                </div>
                                {methodStatus.wallet ? renderTabRules("wallet", "wallet") : (
                                    <p className="text-sm text-gray-500">Wallet payment is currently disabled for all customers.</p>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {activeTab === "gift" && (
                        <Card>
                            <CardHeader><CardTitle>Gift Rules</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                {giftRules.map((rule, index) => (
                                    <GiftRuleCard
                                        key={rule.id}
                                        rule={rule}
                                        ruleIndex={index}
                                        productOptions={productOptions}
                                        subCatOptions={subCatOptions}
                                        onUpdate={updateGiftRule}
                                        onDelete={deleteGiftRule}
                                        errors={errors}
                                    />
                                ))}
                                <div className="flex justify-center">
                                    <Button type="button" onClick={addGiftRule}>
                                        + Add Gift Rule
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
                <Card className="w-[25%] !h-fit p-4 sticky top-5 space-y-3">
                    <div className="flex flex-col gap-2">
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? "Saving..." : `Save ${activeTab === "cod" ? "COD" : activeTab === "prepaid" ? "Prepaid" : activeTab === "wallet" ? "Wallet" : activeTab === "gift" ? "gift" : "Partial COD"} Rules`}
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    );
}