import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import {
    createPopup,
    getPopupById,
    updatePopup,
} from "@/features/popup/PopupThunk";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/services/routes";
import { fetchProducts } from "@/features/products/productsThunk";

type PopupType = "" | "coupon" | "consultation" | "BookConsultation";

const ALL_POPUP_TYPES: Exclude<PopupType, "">[] = ["coupon", "consultation", "BookConsultation"];

const POPUP_TYPE_LABELS: Record<string, string> = {
    coupon: "Coupon Popup",
    consultation: "Consultation Popup",
    BookConsultation: "BookConsultation",
};

function PopupForm() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const basePath = useBasePath();

    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [popupType, setPopupType] = useState<PopupType>("");
    const [status, setStatus] = useState(true);
    const [description, setDescription] = useState("");
    const [buttonText, setButtonText] = useState("");

    const [title, setTitle] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState("");

    const [title1, setTitle1] = useState("");
    const [title2, setTitle2] = useState("");
    const [image, setImage] = useState("");
    const [heading, setHeading] = useState("");
    const [price, setPrice] = useState("");
    const [offerPrice, setOfferPrice] = useState("");
    const [products, setProducts] = useState<any[]>([]);

    const [bookConsultation, setBookConsultation] = useState({
        productTitle: "",
        subtitle: "",
        productPrice: "",
        productOfferPrice: "",
        tag: "",
        image: "",
        popupTitle: "",
        popupDescription: "",
        voicePrice: "",
        videoPrice: "",
        product_id: "",
    });

    const updateBookConsultation = (key, value) => {
        setBookConsultation((prev) => ({
            ...prev,
            [key]: value,
        }));
    };



    useEffect(() => {
        dispatch(fetchProducts({ limit: 1000, status: "active" }))
            .unwrap()
            .then((data) => {
                const list = data?.products || data || [];
                setProducts(Array.isArray(list) ? list : []);
            })
            .catch(() => setProducts([]))
    }, [dispatch]);


    useEffect(() => {
        if (!isEditMode || !id) return;
        setPageLoading(true);
        dispatch(getPopupById(id))
            .then((res: any) => {
                const data = res?.payload?.data ?? res?.payload;

                if (!data || !data._id) {
                    toast.error("Popup not found");
                    navigate(`${basePath}/popup`);
                    return;
                }

                const type = data.type || "coupon";
                setPopupType(type);
                setStatus(data.status === "active");

                if (type === "coupon") {
                    const coupon = data.coupon || {};
                    setTitle(coupon.title || "");
                    setCouponCode(coupon.couponCode || "");
                    setDiscount(coupon.discount !== undefined ? String(coupon.discount) : "");
                    setButtonText(coupon.buttonText || "SIGN UP NOW");
                    setDescription(coupon.description || "");
                } else if (type === "consultation") {
                    const consultation = data.consultation || {};
                    setTitle1(consultation.title1 || "");
                    setTitle2(consultation.title2 || "");
                    setImage(consultation.image || "");
                    setHeading(consultation.heading || "");
                    setPrice(consultation.price !== undefined ? String(consultation.price) : "");
                    setOfferPrice(consultation.offerPrice !== undefined ? String(consultation.offerPrice) : "");
                    setButtonText(consultation.buttonText || "Book Consultation");
                    setDescription(consultation.description || "");
                } else if (type === "BookConsultation") {
                    const bc = data.BookConsultation || {};
                    setBookConsultation({
                        productTitle: bc.productTitle || "",
                        subtitle: bc.subtitle || "",
                        productPrice: bc.productPrice !== undefined ? String(bc.productPrice) : "",
                        productOfferPrice: bc.productOfferPrice !== undefined ? String(bc.productOfferPrice) : "",
                        tag: bc.tag || "",
                        image: bc.image || "",
                        popupTitle: bc.popupTitle || "",
                        popupDescription: bc.popupDescription || "",
                        voicePrice: bc.voicePrice !== undefined ? String(bc.voicePrice) : "",
                        videoPrice: bc.videoPrice !== undefined ? String(bc.videoPrice) : "",
                        product_id: bc.product_id || "",
                    });
                }

            })
            .catch(() => {
                toast.error("Failed to load popup details");
                navigate(`${basePath}/popup`);
            })
            .finally(() => {
                setPageLoading(false);
            });
    }, [dispatch, id, isEditMode, basePath, navigate]);

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as PopupType;
        if (isEditMode) return;
        setPopupType(value);
        if (value === "consultation") {
            setButtonText("Book Consultation");
        } else if (value === "coupon") {
            setButtonText("SIGN UP NOW");
        } else {
            setButtonText("");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!popupType) {
            toast.error("Please select a popup type");
            return;
        }

        const payload: any = {
            type: popupType,
            status: status ? "active" : "inactive",
        };

        if (popupType === "coupon") {
            if (!title.trim()) return toast.error("Please enter a title");
            if (!couponCode.trim()) return toast.error("Please enter a coupon code");

            payload.coupon = {
                title,
                couponCode: couponCode.toUpperCase().trim(),
                discount: discount ? Number(discount) : 0,
                buttonText: buttonText || "SIGN UP NOW",
                description,
            };
        }


        if (popupType === "consultation") {
            if (!title1.trim()) return toast.error("Please enter Title 1");
            if (!title2.trim()) return toast.error("Please enter Title 2");
            if (!image) return toast.error("Please upload an image");
            if (!heading.trim()) return toast.error("Please enter a heading");
            if (!price || Number(price) < 0) return toast.error("Please enter a valid price");
            // if (!offerPrice || Number(offerPrice) < 0) return toast.error("Please enter a valid offer price");
            if (
                offerPrice === "" ||
                Number(offerPrice) < 0
            ) {
                return toast.error("Please enter a valid offer price");
            }
            if (
                bookConsultation.productOfferPrice === "" ||
                Number(bookConsultation.productOfferPrice) < 0
            ) {
                return toast.error("Please enter product offer price");
            }

            payload.consultation = {
                title1,
                title2,
                image,
                heading,
                price: Number(price),
                offerPrice: Number(offerPrice),
                buttonText: buttonText || "Book Consultation",
                description,
            };
        }

        if (popupType === "BookConsultation") {

            if (!bookConsultation.productTitle.trim())
                return toast.error("Please enter Product Title");

            if (!bookConsultation.subtitle.trim())
                return toast.error("Please enter Subtitle");

            if (!bookConsultation.image)
                return toast.error("Please upload Image");

            if (!bookConsultation.popupTitle.trim())
                return toast.error("Please enter Popup Title");

            if (!bookConsultation.popupDescription.trim())
                return toast.error("Please enter Popup Description");

            payload.BookConsultation = {
                productTitle: bookConsultation.productTitle,
                subtitle: bookConsultation.subtitle,
                productPrice: Number(bookConsultation.productPrice),
                productOfferPrice: Number(bookConsultation.productOfferPrice),
                tag: bookConsultation.tag,
                image: bookConsultation.image,
                popupTitle: bookConsultation.popupTitle,
                popupDescription: bookConsultation.popupDescription,
                voicePrice: Number(bookConsultation.voicePrice),
                videoPrice: Number(bookConsultation.videoPrice),
                product_id: bookConsultation.product_id || null,
            };
        }






        setSubmitLoading(true);
        try {
            const result = isEditMode && id
                ? await dispatch(updatePopup({ id, data: payload }))
                : await dispatch(createPopup(payload));

            if (createPopup.fulfilled.match(result) || updatePopup.fulfilled.match(result)) {
                toast.success(isEditMode ? "Popup updated successfully" : "Popup created successfully");
                navigate(`${basePath}/popup`);
            } else {
                toast.error((result.payload as string) || "Something went wrong");
            }
        } catch (err) {
            toast.error("Failed to save popup settings");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm">Loading popup details...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to={`${basePath}/popup`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? "Edit Popup" : "Add New Popup"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode ? "Update popup details." : "Create a new sidebar popup."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Select Popup Type</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select
                                value={popupType}
                                onChange={handleTypeChange}
                                disabled={isEditMode}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">— Select Type —</option>
                                {ALL_POPUP_TYPES.map(type => (
                                    <option key={type} value={type}>
                                        {POPUP_TYPE_LABELS[type]}
                                    </option>
                                ))}
                            </select>
                            {isEditMode && (
                                <p className="text-xs text-gray-400 mt-2">Popup type cannot be changed in edit mode.</p>
                            )}
                        </CardContent>
                    </Card>

                    {popupType === "coupon" && (
                        <Card className="shadow-md border border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Coupon Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Popup Title * (e.g. 300 OFF)</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g. 300 OFF"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="couponCode">Coupon Code *</Label>
                                        <Input
                                            id="couponCode"
                                            placeholder="e.g. UNITY300"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="discount">Discount Value (₹)</Label>
                                        <Input
                                            id="discount"
                                            type="number"
                                            placeholder="e.g. 300"
                                            value={discount}
                                            onChange={(e) => setDiscount(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="buttonText">Button Text</Label>
                                        <Input
                                            id="buttonText"
                                            placeholder="e.g. SIGN UP NOW"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description / Subtext</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="e.g. Applicable on your first order"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {popupType === "consultation" && (
                        <Card className="shadow-md border border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Consultation Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title1">Title 1 (Badge Text) *</Label>
                                        <Input
                                            id="title1"
                                            placeholder="e.g. LIMITED TIME OFFER"
                                            value={title1}
                                            onChange={(e) => setTitle1(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title2">Title 2 (Heading Text) *</Label>
                                        <Input
                                            id="title2"
                                            placeholder="e.g. HAIR EXPERT CONSULTATION"
                                            value={title2}
                                            onChange={(e) => setTitle2(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="heading">Bottom Banner Heading *</Label>
                                        <Input
                                            id="heading"
                                            placeholder="e.g. Book Consultation"
                                            value={heading}
                                            onChange={(e) => setHeading(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="consultationButtonText">Button Subtext / Text</Label>
                                        <Input
                                            id="consultationButtonText"
                                            placeholder="e.g. TAP TO CONFIRM YOUR SLOT"
                                            value={buttonText}
                                            onChange={(e) => setButtonText(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Original Price (₹) *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            placeholder="e.g. 499"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="offerPrice">Offer Price (₹) *</Label>
                                        <Input
                                            id="offerPrice"
                                            type="number"
                                            placeholder="e.g. 99"
                                            value={offerPrice}
                                            onChange={(e) => setOfferPrice(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="consultationDescription">Description / Bullet points (Optional)</Label>
                                    <Textarea
                                        id="consultationDescription"
                                        placeholder="e.g. Personalized Hair Plan, Expert Hair Analysis (comma separated)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Popup Image *</Label>
                                    <div className="mt-1">
                                        <ImageUpload
                                            value={image}
                                            onChange={(url) => setImage(url as string | null || "")}
                                            size={200}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {popupType === "BookConsultation" && (

                        <Card className="shadow-md border border-gray-200">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Book Consultation Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">


                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">product Title </Label>
                                        <Input
                                            value={bookConsultation.productTitle}
                                            placeholder="product title"
                                            onChange={(e) =>
                                                updateBookConsultation(
                                                    "productTitle",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">subtitel</Label>
                                        <Input
                                            placeholder="After A Successful Consultation!"
                                            value={bookConsultation.subtitle}
                                            onChange={(e) =>
                                                updateBookConsultation(
                                                    "subtitle",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">product price </Label>
                                        <Input
                                            type="number"
                                            placeholder="249"
                                            value={bookConsultation.productPrice}
                                            onChange={(e) =>
                                                updateBookConsultation(
                                                    "productPrice",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="title">product offerprice</Label>
                                        <Input
                                            type="number"
                                            placeholder="199"
                                            value={bookConsultation.productOfferPrice}
                                            onChange={(e) =>
                                                updateBookConsultation(
                                                    "productOfferPrice",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">

                                    <div className="space-y-2">
                                        <Label htmlFor="title">Tag</Label>
                                        <Input
                                            placeholder="ONLY FOR TODAY!"
                                            value={bookConsultation.tag}
                                            onChange={(e) =>
                                                updateBookConsultation(
                                                    "tag",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div>

                                        <Label>Select Product</Label>
                                        <Select
                                            value={bookConsultation.product_id || ""}
                                            onValueChange={(val) =>
                                                updateBookConsultation("product_id", val)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map((p) => (
                                                    <SelectItem key={p._id} value={p._id}>
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                </div>




                                <div className="space-y-2">
                                    <Label>Image</Label>
                                    <ImageUpload
                                        value={bookConsultation.image}
                                        onChange={(val) => {

                                            const image =
                                                typeof val === "string"
                                                    ? val
                                                    : Array.isArray(val)
                                                        ? val[0]
                                                        : "";

                                            updateBookConsultation(
                                                "image",
                                                image
                                            );
                                        }}
                                    />
                                </div>







                                <div className="space-y-2">
                                    <Label htmlFor="title">Popup Title *</Label>
                                    <Input
                                        placeholder="Book Consultation"
                                        value={bookConsultation.popupTitle}
                                        onChange={(e) =>
                                            updateBookConsultation(
                                                "popupTitle",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discription">Popup description *</Label>
                                    <Input
                                        placeholder="Find the exact root cause..."
                                        value={bookConsultation.popupDescription}
                                        onChange={(e) =>
                                            updateBookConsultation(
                                                "popupDescription",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="price">voice price *</Label>
                                        <Input
                                            type="number"
                                            placeholder="249"
                                            value={bookConsultation.voicePrice}
                                            onChange={(e) =>
                                                updateBookConsultation(
                                                    "voicePrice",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="offerPrice">video Price *</Label>
                                        <Input
                                            type="number"
                                            placeholder="99"
                                            value={bookConsultation.videoPrice}
                                            onChange={(e) =>
                                                updateBookConsultation(
                                                    "videoPrice",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}


                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6 shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="status" className="cursor-pointer font-medium">
                                    {status ? "Active" : "Inactive"}
                                </Label>
                                <Switch id="status" checked={status} onCheckedChange={setStatus} />
                            </div>
                            {popupType && (
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={submitLoading} className="flex-1">
                                        {submitLoading ? (
                                            <span className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                            </span>
                                        ) : isEditMode ? (
                                            "Update Popup"
                                        ) : (
                                            "Create Popup"
                                        )}
                                    </Button>
                                    <Link to={`${basePath}/popup`} className="flex-1">
                                        <Button type="button" variant="outline" className="w-full">
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}

export default PopupForm;