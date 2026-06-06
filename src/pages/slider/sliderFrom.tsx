
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import {
    createSlide,
    fetchSlides,
    getSlideById,
    updateSlide,
} from "@/features/slider/sliderThunk";
import { ImageUpload } from "@/components/ui/ImageUpload";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Hero1Slide {
    title: string;
    description: string;
    button_name: string;
    button_link: string;
    location: string;
    name: string;
    age: string;
    review: string;
    mainImageUrl: string | null;
    beforeImageUrl: string | null;
    afterImageUrl: string | null;
}

interface Banner1Slide {
    title: string;
    description: string;
    button_name: string;
    button_link: string;
    badge: string;
    bgImageUrl: string | null;
    productimgUrl: string | null;
}

interface TopDoctorSlide {
    name: string;
    cases: string;
    doctorimg: string | null;
}

interface BannerImageData {
    image: string | null;
    mobileimg: string | null;
}

interface shoppageSlide {
    title: string;
    description: string;
    button_name: string;
    button_link: string;
    badge: string;
    bgImageUrl: string | null;
    productimgUrl: string | null;
}
type SectionType =
    | ""
    | "hero1"
    | "banner1"
    | "topDoctor"
    | "banner2"
    | "banner3"
    | "banner4"
    | "shoppage";

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_SECTIONS: Exclude<SectionType, "">[] = [
    "hero1", "banner1", "topDoctor", "banner2", "banner3", "banner4", "shoppage",
];

const SECTION_LABELS: Record<string, string> = {
    hero1: "Hero Section 1",
    banner1: "Banner 1",
    topDoctor: "Top Doctors",
    banner2: "Banner 2",
    banner3: "Banner 3",
    banner4: "Banner 4",
    shoppage: "shop page slider banner"
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultHero1Slide = (): Hero1Slide => ({
    title: "", description: "", button_name: "", button_link: "",
    location: "", name: "", age: "", review: "",
    mainImageUrl: null, beforeImageUrl: null, afterImageUrl: null,
});

const defaultBanner1Slide = (): Banner1Slide => ({
    title: "", description: "", button_name: "", button_link: "",
    badge: "", bgImageUrl: null, productimgUrl: null,
});

const defaultTopDoctorSlide = (): TopDoctorSlide => ({
    name: "", cases: "", doctorimg: null,
});

const defaultBannerData = (): BannerImageData => ({
    image: null, mobileimg: null,
});

const defaultshoppageSlide = (): shoppageSlide => ({
    title: "", description: "", button_name: "", button_link: "",
    badge: "", bgImageUrl: null, productimgUrl: null,
});


function updateField<T>(
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    index: number,
    field: keyof T,
    value: T[keyof T]
) {
    setter((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], [field]: value };
        return updated;
    });
}

function addSlideItem<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, factory: () => T) {
    setter((prev) => [...prev, factory()]);
}

function removeSlideItem<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) {
    setter((prev) => prev.filter((_, i) => i !== index));
}

// ─── BannerImageSection — MUST be OUTSIDE the main component ─────────────────
// If defined inside, React treats it as a new component on every render → unmounts
// all child inputs → blank/flickering screen in edit mode.

interface BannerImageSectionProps {
    title: string;
    data: BannerImageData;
    onChange: (field: keyof BannerImageData, value: string | null) => void;
}

function BannerImageSection({ title, data, onChange }: BannerImageSectionProps) {
    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-semibold text-gray-700">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex gap-6 flex-wrap">
                    <div>
                        <Label>Desktop Image</Label>
                        <div className="mt-1">
                            <ImageUpload
                                value={data.image}
                                onChange={(url) => onChange("image", url as string | null)}
                                size={150}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Mobile Image</Label>
                        <div className="mt-1">
                            <ImageUpload
                                value={data.mobileimg}
                                onChange={(url) => onChange("mobileimg", url as string | null)}
                                size={150}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SlideFormPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = Boolean(id);
    const basePath = useBasePath();

    const [pageLoading, setPageLoading] = useState(isEditMode);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [status, setStatus] = useState(true);
    const [selectedSection, setSelectedSection] = useState<SectionType>("");
    const [ownSection, setOwnSection] = useState<string>("");

    const [hero1Slides, setHero1Slides] = useState<Hero1Slide[]>([defaultHero1Slide()]);
    const [banner1Slides, setBanner1Slides] = useState<Banner1Slide[]>([defaultBanner1Slide()]);
    const [topDoctorSlides, setTopDoctorSlides] = useState<TopDoctorSlide[]>([defaultTopDoctorSlide()]);
    const [banner2Data, setBanner2Data] = useState<BannerImageData>(defaultBannerData());
    const [banner3Data, setBanner3Data] = useState<BannerImageData>(defaultBannerData());
    const [banner4Data, setBanner4Data] = useState<BannerImageData>(defaultBannerData());
    const [shoppagedata, setshoppagedata] =
        useState<shoppageSlide[]>([
            defaultshoppageSlide(),
        ]);


    const slidesState = useSelector((state: any) => state.slides);
    const allSlides: any[] = Array.isArray(slidesState)
        ? slidesState
        : Array.isArray(slidesState?.slides)
            ? slidesState.slides
            : [];

    const addedSections: string[] = allSlides
        .map((s: any) => s.section as string)
        .filter((sec) => sec !== ownSection);

    useEffect(() => {
        dispatch(fetchSlides({}));
    }, [dispatch]);

    useEffect(() => {
        if (!isEditMode || !id) return;

        setPageLoading(true);

        dispatch(getSlideById(id))
            .then((res: any) => {
                const doc = res?.payload ?? res;

                if (!doc || !doc._id) {
                    toast.error("Slide not found");
                    navigate(`${basePath}/slider`);
                    return;
                }

                setOwnSection(doc.section ?? "");
                setStatus(doc.status === "active");
                setSelectedSection(doc.section ?? "");

                if (doc.section === "hero1" && Array.isArray(doc.hero1Slides)) {
                    setHero1Slides(doc.hero1Slides.map((s: any) => ({
                        title: s.title ?? "",
                        description: s.description ?? "",
                        button_name: s.button_name ?? "",
                        button_link: s.button_link ?? "",
                        location: s.location ?? "",
                        name: s.name ?? "",
                        age: s.age ?? "",
                        review: s.review ?? "",
                        mainImageUrl: s.mainImage ?? null,
                        beforeImageUrl: s.beforeImage ?? null,
                        afterImageUrl: s.afterImage ?? null,
                    })));
                }

                if (doc.section === "banner1" && Array.isArray(doc.banner1Slides)) {
                    setBanner1Slides(doc.banner1Slides.map((s: any) => ({
                        title: s.title ?? "",
                        description: s.description ?? "",
                        button_name: s.button_name ?? "",
                        button_link: s.button_link ?? "",
                        badge: s.badge ?? "",
                        bgImageUrl: s.bgImage ?? null,
                        productimgUrl: s.productimg ?? null,
                    })));
                }

                if (doc.section === "topDoctor" && Array.isArray(doc.topDoctors)) {
                    setTopDoctorSlides(doc.topDoctors.map((s: any) => ({
                        name: s.name ?? "",
                        cases: s.cases ?? "",
                        doctorimg: s.image ?? null,
                    })));
                }

                if (doc.section === "banner2" && doc.banner2) {
                    setBanner2Data({ image: doc.banner2.image ?? null, mobileimg: doc.banner2.mobileimg ?? null });
                }
                if (doc.section === "banner3" && doc.banner3) {
                    setBanner3Data({ image: doc.banner3.image ?? null, mobileimg: doc.banner3.mobileimg ?? null });
                }
                if (doc.section === "banner4" && doc.banner4) {
                    setBanner4Data({ image: doc.banner4.image ?? null, mobileimg: doc.banner4.mobileimg ?? null });
                }
                if (doc.section === "shoppage" && Array.isArray(doc.shoppageSlides)) {  
                    setshoppagedata(doc.shoppageSlides.map((s: any) => ({
                        title: s.title ?? "",
                        description: s.description ?? "",
                        button_name: s.button_name ?? "",
                        button_link: s.button_link ?? "",
                        badge: s.badge ?? "",
                        bgImageUrl: s.bgImage ?? null,   
                        productimgUrl: s.productimg ?? null,   
                    })));
                }
            })
            .catch(() => {
                toast.error("Failed to load slide data");
                navigate(`${basePath}/slider`);
            })
            .finally(() => setPageLoading(false));
    }, [dispatch, id, isEditMode, basePath, navigate]);

    // ── Section change ────────────────────────────────────────────────────────
    const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as SectionType;
        if (isEditMode) return;
        if (value && addedSections.includes(value)) {
            toast.error(`"${SECTION_LABELS[value]}" already exists. Delete it first to recreate.`);
            return;
        }
        setSelectedSection(value);
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedSection) {
            toast.error("Please select a section");
            return;
        }

        if (!isEditMode && addedSections.includes(selectedSection)) {
            toast.error(`"${SECTION_LABELS[selectedSection]}" already exists. Please edit the existing one.`);
            return;
        }

        const statusValue = status ? "active" : "inactive";
        let payload: any = { section: selectedSection, status: statusValue };

        if (selectedSection === "hero1") {
            payload.slides = hero1Slides.map((s) => ({
                title: s.title, description: s.description,
                button_name: s.button_name, button_link: s.button_link,
                location: s.location, name: s.name, age: s.age, review: s.review,
                mainImage: s.mainImageUrl, beforeImage: s.beforeImageUrl,
                afterImage: s.afterImageUrl, status: statusValue,
            }));
        } else if (selectedSection === "banner1") {
            payload.slides = banner1Slides.map((s) => ({
                title: s.title, description: s.description,
                button_name: s.button_name, button_link: s.button_link,
                badge: s.badge, bgImage: s.bgImageUrl,
                productimg: s.productimgUrl, status: statusValue,
            }));
        } else if (selectedSection === "topDoctor") {
            payload.slides = topDoctorSlides.map((s) => ({
                name: s.name, cases: s.cases, image: s.doctorimg, status: statusValue,
            }));
        } else if (selectedSection === "banner2") {
            payload.banner2 = { image: banner2Data.image, mobileimg: banner2Data.mobileimg };
        } else if (selectedSection === "banner3") {
            payload.banner3 = { image: banner3Data.image, mobileimg: banner3Data.mobileimg };
        } else if (selectedSection === "banner4") {
            payload.banner4 = { image: banner4Data.image, mobileimg: banner4Data.mobileimg };
        }

        else if (selectedSection === "shoppage") {
            payload.slides = shoppagedata.map((s) => ({
                title: s.title,
                description: s.description,
                button_name: s.button_name,
                button_link: s.button_link,
                badge: s.badge,
                bgImage: s.bgImageUrl,
                productimg: s.productimgUrl,
                status: statusValue,
            }));
        }


        try {
            setSubmitLoading(true);
            const result = isEditMode && id
                ? await dispatch(updateSlide({ id, data: payload }))
                : await dispatch(createSlide(payload));
            console.log("RESULT =>", result);
            console.log("PAYLOAD =>", payload);
            if (createSlide.fulfilled.match(result) || updateSlide.fulfilled.match(result)) {
                toast.success(isEditMode ? "Slider updated successfully!" : "Slider created successfully!");
                navigate(`${basePath}/slider`);
            } else {
                toast.error((result.payload as string) || "Something went wrong");
            }
        } catch {
            toast.error("Server error occurred");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm">Loading slider data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link to={`${basePath}/slider`}>
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isEditMode ? "Edit Slider" : "Add New Slide"}
                    </h1>
                    <p className="text-gray-500 mt-1">
                        {isEditMode ? "Update slider details." : "Create a new slider section."}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">

                    <Card className="shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Select Section</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <select
                                value={selectedSection}
                                onChange={handleSectionChange}
                                disabled={isEditMode}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">— Select Section —</option>
                                {ALL_SECTIONS.map((sec) => {
                                    const isAdded = addedSections.includes(sec);
                                    return (
                                        <option key={sec} value={sec} disabled={isAdded}>
                                            {isAdded
                                                ? `✅ ${SECTION_LABELS[sec]} (Already Added)`
                                                : SECTION_LABELS[sec]}
                                        </option>
                                    );
                                })}
                            </select>
                            {isEditMode && (
                                <p className="text-xs text-gray-400 mt-2">
                                    Section cannot be changed in edit mode.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {selectedSection === "hero1" && (
                        <div className="space-y-4">
                            {hero1Slides.map((slide, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold text-gray-700">
                                            Slide {index + 1}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div>
                                            <Label>Title <span className="text-red-500">*</span></Label>
                                            <Input placeholder="Enter slide title" value={slide.title}
                                                onChange={(e) => updateField(setHero1Slides, index, "title", e.target.value)}
                                                required className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea placeholder="Slide description..." value={slide.description}
                                                onChange={(e) => updateField(setHero1Slides, index, "description", e.target.value)}
                                                className="mt-1 min-h-[100px]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Name</Label>
                                                <Input placeholder="e.g. Sunny" value={slide.name}
                                                    onChange={(e) => updateField(setHero1Slides, index, "name", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Age</Label>
                                                <Input placeholder="e.g. 36" value={slide.age} type="number" min={0}
                                                    onChange={(e) => updateField(setHero1Slides, index, "age", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Location</Label>
                                                <Input placeholder="e.g. Punjab, IN" value={slide.location}
                                                    onChange={(e) => updateField(setHero1Slides, index, "location", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Review</Label>
                                                <Input placeholder="Short review text" value={slide.review}
                                                    onChange={(e) => updateField(setHero1Slides, index, "review", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            <div>
                                                <Label>Main Image</Label>
                                                <div className="mt-1">
                                                    <ImageUpload value={slide.mainImageUrl}
                                                        onChange={(url) => updateField(setHero1Slides, index, "mainImageUrl", url as string | null)}
                                                        size={150} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Before Image</Label>
                                                <div className="mt-1">
                                                    <ImageUpload value={slide.beforeImageUrl}
                                                        onChange={(url) => updateField(setHero1Slides, index, "beforeImageUrl", url as string | null)}
                                                        size={150} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>After Image</Label>
                                                <div className="mt-1">
                                                    <ImageUpload value={slide.afterImageUrl}
                                                        onChange={(url) => updateField(setHero1Slides, index, "afterImageUrl", url as string | null)}
                                                        size={150} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Button Name</Label>
                                                <Input placeholder="e.g. Shop Now" value={slide.button_name}
                                                    onChange={(e) => updateField(setHero1Slides, index, "button_name", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Button Link</Label>
                                                <Input placeholder="/shop" value={slide.button_link}
                                                    onChange={(e) => updateField(setHero1Slides, index, "button_link", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="flex justify-center gap-3 pt-2">
                                            <button type="button"
                                                onClick={() => addSlideItem(setHero1Slides, defaultHero1Slide)}
                                                className="bg-primary text-white px-4 py-2 rounded text-sm">
                                                + Add Slide
                                            </button>
                                            {hero1Slides.length > 1 && (
                                                <button type="button"
                                                    onClick={() => removeSlideItem(setHero1Slides, index)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded text-sm">
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {selectedSection === "banner1" && (
                        <div className="space-y-4">
                            {banner1Slides.map((slide, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold text-gray-700">
                                            Slide {index + 1}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div>
                                            <Label>Title <span className="text-red-500">*</span></Label>
                                            <Input placeholder="Enter slide title" value={slide.title}
                                                onChange={(e) => updateField(setBanner1Slides, index, "title", e.target.value)}
                                                required className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea placeholder="Slide description..." value={slide.description}
                                                onChange={(e) => updateField(setBanner1Slides, index, "description", e.target.value)}
                                                className="mt-1 min-h-[100px]" />
                                        </div>
                                        <div>
                                            <Label>Badge</Label>
                                            <Input placeholder="e.g. Trending / NEW" value={slide.badge}
                                                onChange={(e) => updateField(setBanner1Slides, index, "badge", e.target.value)}
                                                className="mt-1" />
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            <div>
                                                <Label>Background Image</Label>
                                                <div className="mt-1">
                                                    <ImageUpload value={slide.bgImageUrl}
                                                        onChange={(url) => updateField(setBanner1Slides, index, "bgImageUrl", url as string | null)}
                                                        size={150} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>Product Image</Label>
                                                <div className="mt-1">
                                                    <ImageUpload value={slide.productimgUrl}
                                                        onChange={(url) => updateField(setBanner1Slides, index, "productimgUrl", url as string | null)}
                                                        size={150} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Button Name</Label>
                                                <Input placeholder="e.g. Shop Now" value={slide.button_name}
                                                    onChange={(e) => updateField(setBanner1Slides, index, "button_name", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Button Link</Label>
                                                <Input placeholder="/shop" value={slide.button_link}
                                                    onChange={(e) => updateField(setBanner1Slides, index, "button_link", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                        </div>
                                        <div className="flex justify-center gap-3 pt-2">
                                            <button type="button"
                                                onClick={() => addSlideItem(setBanner1Slides, defaultBanner1Slide)}
                                                className="bg-primary text-white px-4 py-2 rounded text-sm">
                                                + Add Slide
                                            </button>
                                            {banner1Slides.length > 1 && (
                                                <button type="button"
                                                    onClick={() => removeSlideItem(setBanner1Slides, index)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded text-sm">
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {selectedSection === "topDoctor" && (
                        <div className="space-y-4">
                            {topDoctorSlides.map((slide, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold text-gray-700">
                                            Doctor {index + 1}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div>
                                            <Label>Name <span className="text-red-500">*</span></Label>
                                            <Input placeholder="Doctor name" value={slide.name}
                                                onChange={(e) => updateField(setTopDoctorSlides, index, "name", e.target.value)}
                                                required className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Cases / Specialization</Label>
                                            <Textarea placeholder="e.g. 500+ Hair Transplant Cases" value={slide.cases}
                                                onChange={(e) => updateField(setTopDoctorSlides, index, "cases", e.target.value)}
                                                className="mt-1 min-h-[80px]" />
                                        </div>
                                        <div>
                                            <Label>Doctor Image</Label>
                                            <div className="mt-1">
                                                <ImageUpload value={slide.doctorimg}
                                                    onChange={(url) => updateField(setTopDoctorSlides, index, "doctorimg", url as string | null)}
                                                    size={150} />
                                            </div>
                                        </div>
                                        <div className="flex justify-center gap-3 pt-2">
                                            <button type="button"
                                                onClick={() => addSlideItem(setTopDoctorSlides, defaultTopDoctorSlide)}
                                                className="bg-primary text-white px-4 py-2 rounded text-sm">
                                                + Add Doctor
                                            </button>
                                            {topDoctorSlides.length > 1 && (
                                                <button type="button"
                                                    onClick={() => removeSlideItem(setTopDoctorSlides, index)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded text-sm">
                                                    Remove
                                                </button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {selectedSection === "banner2" && (
                        <BannerImageSection
                            title="Banner 2"
                            data={banner2Data}
                            onChange={(field, value) => setBanner2Data((prev) => ({ ...prev, [field]: value }))}
                        />
                    )}

                    {selectedSection === "banner3" && (
                        <BannerImageSection
                            title="Banner 3"
                            data={banner3Data}
                            onChange={(field, value) => setBanner3Data((prev) => ({ ...prev, [field]: value }))}
                        />
                    )}

                    {selectedSection === "banner4" && (
                        <BannerImageSection
                            title="Banner 4"
                            data={banner4Data}
                            onChange={(field, value) => setBanner4Data((prev) => ({ ...prev, [field]: value }))}
                        />
                    )}

                    {selectedSection === "shoppage" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Shop Page Slider</CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {shoppagedata.map((slide, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-lg p-4 space-y-4"
                                    >
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold">
                                                Slide {index + 1}
                                            </h3>

                                            {shoppagedata.length > 1 && (
                                                <Button
                                                    variant="destructive"
                                                    type="button"
                                                    onClick={() =>
                                                        removeSlideItem(
                                                            setshoppagedata,
                                                            index
                                                        )
                                                    }
                                                >
                                                    Remove
                                                </Button>
                                            )}
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Title</Label>
                                                <Input
                                                    value={slide.title}
                                                    onChange={(e) =>
                                                        updateField(
                                                            setshoppagedata,
                                                            index,
                                                            "title",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label>Badge</Label>
                                                <Input
                                                    value={slide.badge}
                                                    onChange={(e) =>
                                                        updateField(
                                                            setshoppagedata,
                                                            index,
                                                            "badge",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Description</Label>
                                            <Textarea
                                                value={slide.description}
                                                onChange={(e) =>
                                                    updateField(
                                                        setshoppagedata,
                                                        index,
                                                        "description",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div>
                                                <Label>Button Name</Label>
                                                <Input
                                                    value={slide.button_name}
                                                    onChange={(e) =>
                                                        updateField(
                                                            setshoppagedata,
                                                            index,
                                                            "button_name",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label>Button Link</Label>
                                                <Input
                                                    value={slide.button_link}
                                                    onChange={(e) =>
                                                        updateField(
                                                            setshoppagedata,
                                                            index,
                                                            "button_link",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="flex gap-6 flex-wrap">
                                            <div>
                                                <Label>Background Image</Label>
                                                <ImageUpload
                                                    value={slide.bgImageUrl}
                                                    onChange={(url) =>
                                                        updateField(
                                                            setshoppagedata,
                                                            index,
                                                            "bgImageUrl",
                                                            url as string
                                                        )
                                                    }
                                                />
                                            </div>

                                            <div>
                                                <Label>Product Image</Label>
                                                <ImageUpload
                                                    value={slide.productimgUrl}
                                                    onChange={(url) =>
                                                        updateField(
                                                            setshoppagedata,
                                                            index,
                                                            "productimgUrl",
                                                            url as string
                                                        )
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    type="button"
                                    onClick={() =>
                                        addSlideItem(
                                            setshoppagedata,
                                            defaultshoppageSlide
                                        )
                                    }
                                >
                                    Add Slide
                                </Button>
                            </CardContent>
                        </Card>
                    )}


                    <div className="flex gap-3">
                        <Button type="submit" disabled={submitLoading}
                            className="flex-1">
                            {submitLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                                </span>
                            ) : isEditMode ? "Update Slider" : "Create Slider"}
                        </Button>
                        <Link to={`${basePath}/slider`} className="flex-1">
                            <Button type="button" variant="outline" className="w-full">Cancel</Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="sticky top-6 shadow-md border border-gray-200">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="status" className="cursor-pointer font-medium">
                                    {status ? "Active" : "Inactive"}
                                </Label>
                                <Switch id="status" checked={status} onCheckedChange={setStatus} />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {status ? "Visible on the website." : "Hidden from the website."}
                            </p>
                        </CardContent>
                    </Card>

                </div>
            </form>
        </div>
    );
}