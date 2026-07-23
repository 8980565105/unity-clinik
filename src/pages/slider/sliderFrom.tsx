import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Loader2, X, Video, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import {
    createSlide,
    fetchSlides,
    getSlideById,
    updateSlide,
} from "@/features/slider/sliderThunk";
import { ImageUpload } from "@/components/ui/ImageUpload";
import api from "@/services/api";
interface Hero1Slide {
    title: string; description: string; button_name: string; button_link: string;
    location: string; name: string; age: string; review: string;
    mainImageUrl: string | null; beforeImageUrl: string | null; afterImageUrl: string | null;
}
interface Banner1Slide {
    title: string; description: string; button_name: string; button_link: string;
    badge: string; bgImageUrl: string | null; productimgUrl: string | null;
}
interface TopDoctorSlide { name: string; cases: string; doctorimg: string | null; }
interface BannerImageData { image: string | null; mobileimg: string | null; }
interface ShoppageSlide {
    title: string; description: string; button_name: string; button_link: string;
    badge: string; bgImageUrl: string | null; productimgUrl: string | null;
}
interface ReportCardSlide {
    beforeImageUrl: string | null;
    afterImageUrl: string | null;
    beforeMonth: string;
    afterMonth: string;
    stage: string;
    title: string;
    description: string;
    name: string;
    age: string;
    rating: string;
}
interface SuccessStorySlide {
    name: string;
    age: string;
    title: string;
    review: string;
    mainImageUrl: string | null;
    beforeImageUrl: string | null;
    afterImageUrl: string | null;
    videoUrl: string | null;
    videoUploading: boolean;
}
interface HonestStageItem {
    title: string;
    imageUrl: string | null;
    success: boolean;
}
interface HonestSlide {
    genderType: "male" | "female";
    stages: HonestStageItem[];
}

interface GetStartedStep {
    stepLabel: string;
    title: string;
    description: string;
    imageUrl: string | null;
}

interface TimelineStageItem {
    month: string;
    title: string;
    imageUrl: string | null;
}
interface TimelineSlide {
    genderType: "male" | "female";
    stages: TimelineStageItem[];
}
interface HolisticCard {
    title: string;
    description: string;
    imageUrl: string | null;
}
interface ContactSection {
    title: string;
    numberTitle: string;
    description: string;
    buttonText: string;
    buttonLink: string;

}
interface FeaturesCard {
    title: string;
    description: string;
    imageUrl: string | null;
}

type SectionType =
    | ""
    | "hero1" | "banner1" | "topDoctor" | "banner2" | "banner3" | "banner4"
    | "shoppage" | "successStory" | "reportCard"
    | "honestExpectations" | "getStarted" | "timelineResult" | "holisticApproach" | "contactSection" | "featuressection";

const ALL_SECTIONS: Exclude<SectionType, "">[] = [
    "hero1", "banner1", "topDoctor", "banner2", "banner3", "banner4",
    "shoppage", "successStory", "reportCard",
    "honestExpectations", "getStarted", "timelineResult", "holisticApproach", "contactSection", "featuressection",
];

const SECTION_LABELS: Record<string, string> = {
    hero1: "Hero Section 1", banner1: "Banner 1", topDoctor: "Top Doctors",
    banner2: "Banner 2", banner3: "Banner 3", banner4: "Banner 4",
    shoppage: "Shop Page Slider", successStory: "Success Stories",
    reportCard: "Report Cards (Before/After)",
    honestExpectations: "Honest Expectations (Stages)",
    getStarted: "How To Get Started (Steps)",
    timelineResult: "Timeline Result (Month wise)",
    holisticApproach: "Holistic Approach (Cards)",
    contactSection: "Contact Section",
    featuressection: "features Section"
};


const defaultReportCardSlide = (): ReportCardSlide => ({
    beforeImageUrl: null, afterImageUrl: null,
    beforeMonth: "", afterMonth: "",
    stage: "", title: "", description: "",
    name: "", age: "", rating: "",
});
const defaultFeaturesCard = (): FeaturesCard => ({ title: "", description: "", imageUrl: null });

const defaultHero1Slide = (): Hero1Slide => ({
    title: "", description: "", button_name: "", button_link: "",
    location: "", name: "", age: "", review: "",
    mainImageUrl: null, beforeImageUrl: null, afterImageUrl: null,
});
const defaultBanner1Slide = (): Banner1Slide => ({
    title: "", description: "", button_name: "", button_link: "",
    badge: "", bgImageUrl: null, productimgUrl: null,
});
const defaultTopDoctorSlide = (): TopDoctorSlide => ({ name: "", cases: "", doctorimg: null });
const defaultBannerData = (): BannerImageData => ({ image: null, mobileimg: null });
const defaultShoppageSlide = (): ShoppageSlide => ({
    title: "", description: "", button_name: "", button_link: "",
    badge: "", bgImageUrl: null, productimgUrl: null,
});
const defaultSuccessStorySlide = (): SuccessStorySlide => ({
    name: "", age: "", title: "", review: "",
    mainImageUrl: null, beforeImageUrl: null, afterImageUrl: null,
    videoUrl: null, videoUploading: false,
});
const defaultContactSection = () => ({
    title: "",
    numberTitle: "",
    description: "",
    buttonText: "",
    buttonLink: ""
});

const defaultHonestStage = (): HonestStageItem => ({ title: "", imageUrl: null, success: true });
const defaultHonestSlide = (gender: "male" | "female"): HonestSlide => ({
    genderType: gender,
    stages: [defaultHonestStage()],
});

const defaultGetStartedStep = (): GetStartedStep => ({
    stepLabel: "", title: "", description: "", imageUrl: null,
});

const defaultTimelineStage = (): TimelineStageItem => ({ month: "", title: "", imageUrl: null });
const defaultTimelineSlide = (gender: "male" | "female"): TimelineSlide => ({
    genderType: gender,
    stages: [defaultTimelineStage()],
});

const defaultHolisticCard = (): HolisticCard => ({ title: "", description: "", imageUrl: null });

function updateField<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number, field: keyof T, value: T[keyof T]) {
    setter(prev => { const u = [...prev]; u[index] = { ...u[index], [field]: value }; return u; });
}
function addSlideItem<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, factory: () => T) {
    setter(prev => [...prev, factory()]);
}
function removeSlideItem<T>(setter: React.Dispatch<React.SetStateAction<T[]>>, index: number) {
    setter(prev => prev.filter((_, i) => i !== index));
}


interface BannerImageSectionProps {
    title: string; data: BannerImageData;
    onChange: (field: keyof BannerImageData, value: string | null) => void;
}
function BannerImageSection({ title, data, onChange }: BannerImageSectionProps) {
    return (
        <Card className="border border-gray-200 shadow-sm">
            <CardHeader><CardTitle className="text-base font-semibold text-gray-700">{title}</CardTitle></CardHeader>
            <CardContent>
                <div className="flex gap-6 flex-wrap">
                    <div>
                        <Label>Desktop Image</Label>
                        <div className="mt-1">
                            <ImageUpload value={data.image} onChange={url => onChange("image", url as string | null)} size={150} />
                        </div>
                    </div>
                    <div>
                        <Label>Mobile Image</Label>
                        <div className="mt-1">
                            <ImageUpload value={data.mobileimg} onChange={url => onChange("mobileimg", url as string | null)} size={150} />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

interface VideoUploadProps {
    value: string | null;
    uploading: boolean;
    onChange: (url: string | null) => void;
    onUploadingChange: (loading: boolean) => void;
}

export function VideoUpload({ value, uploading, onChange, onUploadingChange }: VideoUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const MAX_MB = 15;
    const handleFile = async (file: File) => {
        if (!file.type.startsWith("video/")) {
            toast.error("Only video files are allowed");
            return;
        }
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > MAX_MB) {
            toast.error(`Video must be under ${MAX_MB}MB. Your file is ${sizeMB.toFixed(1)}MB`);
            return;
        }

        onUploadingChange(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const res = await api.post("/uploads/image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            const resData = res.data?.data;
            const url = Array.isArray(resData)
                ? (resData[0]?.url ?? resData[0]?.image_url ?? null)
                : (resData?.url ?? resData?.image_url ?? resData?.video_url ?? null);

            if (url) {
                onChange(url);
                toast.success("Video uploaded!");
            } else {
                toast.error("Upload failed");
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Video upload error");
        } finally {
            onUploadingChange(false);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = "copy";
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = Array.from(e.dataTransfer.files).find(f =>
            f.type.startsWith("video/")
        );

        if (!file) {
            toast.error("Please drop a video file");
            return;
        }

        handleFile(file);
    };

    return (
        <div className="mt-1">
            <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />

            {value ? (
                <div className="relative w-48 rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <video
                        src={value.startsWith("http") ? value : `${import.meta.env.VITE_API_URL_IMAGE}${value}`}
                        className="w-full h-32 object-cover"
                        controls={false}
                        muted
                        playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Video className="text-white h-8 w-8" />
                    </div>
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="absolute top-1 right-1 bg-red-500 rounded-full p-0.5 text-white hover:bg-red-600"
                    >
                        <X className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded hover:bg-blue-600"
                    >
                        Change
                    </button>
                </div>
            ) : (
                <div
                    onClick={() => !uploading && inputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
            flex flex-col items-center justify-center w-48 h-32 
            border-2 border-dashed rounded-lg cursor-pointer
            transition-all duration-200
            ${isDragging
                            ? "border-blue-500 bg-blue-50 scale-[1.02]"
                            : uploading
                                ? "border-gray-300 bg-gray-50 cursor-not-allowed opacity-60"
                                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                        }
          `}
                >
                    {uploading ? (
                        <>
                            <Loader2 className="h-7 w-7 text-blue-500 animate-spin mb-1" />
                            <span className="text-xs text-gray-500">Uploading...</span>
                        </>
                    ) : isDragging ? (
                        <>
                            <Video className="h-7 w-7 text-blue-500 mb-1" />
                            <span className="text-xs text-blue-500 font-medium">Drop Video Here</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-7 w-7 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500 font-medium">Upload Video</span>
                            <span className="text-xs text-gray-400">Click or Drop</span>
                            <span className="text-xs text-gray-400">Max 15MB</span>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

interface PageMultiSelectProps {
    selectedSlugs: string[];
    onChange: (slugs: string[]) => void;
}
function PageMultiSelect({ selectedSlugs, onChange }: PageMultiSelectProps) {
    const [pages, setPages] = useState<{ _id: string; page_name: string; slug: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get("/pages", { params: { isDownload: "true", status: "active" } })
            .then(res => {
                const data = res.data?.data?.pages ?? res.data?.pages ?? [];
                setPages(data);
            })
            .catch(() => toast.error("Could not load pages"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading pages...
        </div>
    );

    if (pages.length === 0) return (
        <p className="text-sm text-gray-400 italic">
            No active pages found. Add pages from Pages Manager first.
        </p>
    );

    return (
        <div className="border rounded-md p-3 min-h-[50px]">
            {selectedSlugs.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                    {selectedSlugs.map(slug => {
                        const page = pages.find(p => p.slug === slug);
                        return (
                            <div
                                key={slug}
                                className="bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-2 text-sm"
                            >
                                {page?.page_name ?? slug}
                                <button
                                    type="button"
                                    onClick={() => onChange(selectedSlugs.filter(s => s !== slug))}
                                    className="hover:text-blue-200 font-bold"
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            <select
                className="w-full bg-transparent border rounded-md p-2 text-sm"
                value=""
                onChange={e => {
                    const slug = e.target.value;
                    if (slug && !selectedSlugs.includes(slug)) {
                        onChange([...selectedSlugs, slug]);
                    }
                }}
            >
                <option value="">Select Page</option>
                {pages
                    .filter(p => !selectedSlugs.includes(p.slug))
                    .map(p => (
                        <option key={p._id} value={p.slug}>{p.page_name}</option>
                    ))
                }
            </select>
        </div>
    );
}

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
    const [showOnPages, setShowOnPages] = useState<string[]>([]);

    const [hero1Slides, setHero1Slides] = useState<Hero1Slide[]>([defaultHero1Slide()]);
    const [banner1Slides, setBanner1Slides] = useState<Banner1Slide[]>([defaultBanner1Slide()]);
    const [topDoctorSlides, setTopDoctorSlides] = useState<TopDoctorSlide[]>([defaultTopDoctorSlide()]);
    const [banner2Data, setBanner2Data] = useState<BannerImageData>(defaultBannerData());
    const [banner3Data, setBanner3Data] = useState<BannerImageData>(defaultBannerData());
    const [banner4Data, setBanner4Data] = useState<BannerImageData>(defaultBannerData());
    const [shoppageData, setShoppageData] = useState<ShoppageSlide[]>([defaultShoppageSlide()]);
    const [successStorySlides, setSuccessStorySlides] = useState<SuccessStorySlide[]>([defaultSuccessStorySlide()]);
    const [reportCardSlides, setReportCardSlides] = useState<ReportCardSlide[]>([defaultReportCardSlide()]);
    const [reportCardTitle, setReportCardTitle] = useState<string>("");
    const [honestMaleStages, setHonestMaleStages] = useState<HonestStageItem[]>([defaultHonestStage()]);
    const [honestFemaleStages, setHonestFemaleStages] = useState<HonestStageItem[]>([defaultHonestStage()]);
    const [getStartedSteps, setGetStartedSteps] = useState<GetStartedStep[]>([defaultGetStartedStep()]);
    const [timelineMaleStages, setTimelineMaleStages] = useState<TimelineStageItem[]>([defaultTimelineStage()]);
    const [timelineFemaleStages, setTimelineFemaleStages] = useState<TimelineStageItem[]>([defaultTimelineStage()]);
    const [holisticCards, setHolisticCards] = useState<HolisticCard[]>([defaultHolisticCard()]);
    const [contactSection, setContactSection] = useState(defaultContactSection());
    const [featuresCards, setFeaturesCards] = useState<FeaturesCard[]>([defaultFeaturesCard()]);
    const slidesState = useSelector((state: any) => state.slides);
    const allSlides: any[] = Array.isArray(slidesState)
        ? slidesState
        : Array.isArray(slidesState?.slides) ? slidesState.slides : [];

    const addedSections: string[] = allSlides
        .map((s: any) => s.section as string)
        .filter(sec => sec !== ownSection);

    useEffect(() => { dispatch(fetchSlides({})); }, [dispatch]);

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
                setShowOnPages(Array.isArray(doc.showOnPages) ? doc.showOnPages : []);

                if (doc.section === "hero1" && Array.isArray(doc.hero1Slides)) {
                    setHero1Slides(doc.hero1Slides.map((s: any) => ({
                        title: s.title ?? "", description: s.description ?? "",
                        button_name: s.button_name ?? "", button_link: s.button_link ?? "",
                        location: s.location ?? "", name: s.name ?? "",
                        age: s.age ?? "", review: s.review ?? "",
                        mainImageUrl: s.mainImage ?? null, beforeImageUrl: s.beforeImage ?? null,
                        afterImageUrl: s.afterImage ?? null,
                    })));
                }
                if (doc.section === "banner1" && Array.isArray(doc.banner1Slides)) {
                    setBanner1Slides(doc.banner1Slides.map((s: any) => ({
                        title: s.title ?? "", description: s.description ?? "",
                        button_name: s.button_name ?? "", button_link: s.button_link ?? "",
                        badge: s.badge ?? "", bgImageUrl: s.bgImage ?? null,
                        productimgUrl: s.productimg ?? null,
                    })));
                }
                if (doc.section === "topDoctor" && Array.isArray(doc.topDoctors)) {
                    setTopDoctorSlides(doc.topDoctors.map((s: any) => ({
                        name: s.name ?? "", cases: s.cases ?? "", doctorimg: s.image ?? null,
                    })));
                }
                if (doc.section === "banner2" && doc.banner2)
                    setBanner2Data({ image: doc.banner2.image ?? null, mobileimg: doc.banner2.mobileimg ?? null });
                if (doc.section === "banner3" && doc.banner3)
                    setBanner3Data({ image: doc.banner3.image ?? null, mobileimg: doc.banner3.mobileimg ?? null });
                if (doc.section === "banner4" && doc.banner4)
                    setBanner4Data({ image: doc.banner4.image ?? null, mobileimg: doc.banner4.mobileimg ?? null });
                if (doc.section === "shoppage" && Array.isArray(doc.shoppageSlides)) {
                    setShoppageData(doc.shoppageSlides.map((s: any) => ({
                        title: s.title ?? "", description: s.description ?? "",
                        button_name: s.button_name ?? "", button_link: s.button_link ?? "",
                        badge: s.badge ?? "", bgImageUrl: s.bgImage ?? null,
                        productimgUrl: s.productimg ?? null,
                    })));
                }
                if (doc.section === "successStory" && Array.isArray(doc.successStorySlides)) {
                    setSuccessStorySlides(doc.successStorySlides.map((s: any) => ({
                        name: s.name ?? "", age: s.age ?? "",
                        title: s.title ?? "", review: s.review ?? "",
                        mainImageUrl: s.mainImage ?? null,
                        beforeImageUrl: s.beforeImage ?? null,
                        afterImageUrl: s.afterImage ?? null,
                        videoUrl: s.videoUrl ?? null,
                        videoUploading: false,
                    })));
                }
                if (doc.section === "reportCard" && Array.isArray(doc.reportCardSlides)) {
                    setReportCardTitle(doc.reportCardTitle ?? "");
                    setReportCardSlides(doc.reportCardSlides.map((s: any) => ({
                        beforeImageUrl: s.beforeImage ?? null,
                        afterImageUrl: s.afterImage ?? null,
                        beforeMonth: s.beforeMonth ?? "",
                        afterMonth: s.afterMonth ?? "",
                        stage: s.stage ?? "",
                        title: s.title ?? "",
                        description: s.description ?? "",
                        name: s.name ?? "",
                        age: s.age ?? "",
                        rating: s.rating ?? "",
                    })));
                }

                if (doc.section === "honestExpectations" && doc.honestExpectations) {
                    setHonestMaleStages(
                        (doc.honestExpectations.male ?? []).map((s: any) => ({
                            title: s.title ?? "", imageUrl: s.image ?? null, success: !!s.success,
                        }))
                    );
                    setHonestFemaleStages(
                        (doc.honestExpectations.female ?? []).map((s: any) => ({
                            title: s.title ?? "", imageUrl: s.image ?? null, success: !!s.success,
                        }))
                    );
                }
                if (doc.section === "getStarted" && Array.isArray(doc.getStartedSteps)) {
                    setGetStartedSteps(doc.getStartedSteps.map((s: any) => ({
                        stepLabel: s.stepLabel ?? "", title: s.title ?? "",
                        description: s.description ?? "", imageUrl: s.image ?? null,
                    })));
                }
                if (doc.section === "timelineResult" && doc.timelineResult) {
                    setTimelineMaleStages(
                        (doc.timelineResult.male ?? []).map((s: any) => ({
                            month: s.month ?? "", title: s.title ?? "", imageUrl: s.image ?? null,
                        }))
                    );
                    setTimelineFemaleStages(
                        (doc.timelineResult.female ?? []).map((s: any) => ({
                            month: s.month ?? "", title: s.title ?? "", imageUrl: s.image ?? null,
                        }))
                    );
                }
                if (doc.section === "holisticApproach" && Array.isArray(doc.holisticCards)) {
                    setHolisticCards(doc.holisticCards.map((s: any) => ({
                        title: s.title ?? "", description: s.description ?? "", imageUrl: s.image ?? null,
                    })));
                }
                if (doc.section === "contactSection") {
                    setContactSection({
                        title: doc.contactSection?.title || "",
                        numberTitle: doc.contactSection?.numberTitle || "",
                        description: doc.contactSection?.description || "",
                        buttonText: doc.contactSection?.buttonText || "",
                        buttonLink: doc.contactSection?.buttonLink || ""
                    })

                }
                if (doc.section === "featuressection" && Array.isArray(doc.featuresCards)) {
                    setFeaturesCards(doc.featuresCards.map((s: any) => ({
                        title: s.title ?? "", description: s.description ?? "", imageUrl: s.image ?? null,
                    })));
                }
            })
            .catch(() => { toast.error("Failed to load slide data"); navigate(`${basePath}/slider`); })
            .finally(() => setPageLoading(false));
    }, [dispatch, id, isEditMode, basePath, navigate]);

    const handleSectionChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const value = e.target.value as SectionType;

        if (isEditMode) return;
        setSelectedSection("");

        if (!value) return;

        if (addedSections.includes(value)) {
            toast.error(
                `"${SECTION_LABELS[value]}" already exists.`
            );
            return;
        }

        setSelectedSection(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSection) { toast.error("Please select a section"); return; }
        if (!isEditMode && addedSections.includes(selectedSection)) {
            toast.error(`"${SECTION_LABELS[selectedSection]}" already exists.`);
            return;
        }

        if (selectedSection === "successStory" && successStorySlides.some(s => s.videoUploading)) {
            toast.error("Please wait for video upload to finish");
            return;
        }

        const statusValue = status ? "active" : "inactive";
        let payload: any = { section: selectedSection, status: statusValue, showOnPages };

        if (selectedSection === "hero1") {
            payload.slides = hero1Slides.map(s => ({
                title: s.title, description: s.description,
                button_name: s.button_name, button_link: s.button_link,
                location: s.location, name: s.name, age: s.age, review: s.review,
                mainImage: s.mainImageUrl, beforeImage: s.beforeImageUrl,
                afterImage: s.afterImageUrl, status: statusValue,
            }));
        } else if (selectedSection === "banner1") {
            payload.slides = banner1Slides.map(s => ({
                title: s.title, description: s.description,
                button_name: s.button_name, button_link: s.button_link,
                badge: s.badge, bgImage: s.bgImageUrl,
                productimg: s.productimgUrl, status: statusValue,
            }));
        } else if (selectedSection === "topDoctor") {
            payload.slides = topDoctorSlides.map(s => ({
                name: s.name, cases: s.cases, image: s.doctorimg, status: statusValue,
            }));
        } else if (selectedSection === "banner2") {
            payload.banner2 = { image: banner2Data.image, mobileimg: banner2Data.mobileimg };
        } else if (selectedSection === "banner3") {
            payload.banner3 = { image: banner3Data.image, mobileimg: banner3Data.mobileimg };
        } else if (selectedSection === "banner4") {
            payload.banner4 = { image: banner4Data.image, mobileimg: banner4Data.mobileimg };
        } else if (selectedSection === "shoppage") {
            payload.slides = shoppageData.map(s => ({
                title: s.title, description: s.description,
                button_name: s.button_name, button_link: s.button_link,
                badge: s.badge, bgImage: s.bgImageUrl,
                productimg: s.productimgUrl, status: statusValue,
            }));
        } else if (selectedSection === "successStory") {
            payload.slides = successStorySlides.map(s => ({
                name: s.name, age: s.age, title: s.title, review: s.review,
                mainImage: s.mainImageUrl,
                beforeImage: s.beforeImageUrl,
                afterImage: s.afterImageUrl,
                videoUrl: s.videoUrl,
                status: statusValue,
            }));

        } else if (selectedSection === "reportCard") {
            payload.reportCardTitle = reportCardTitle;
            payload.slides = reportCardSlides.map(s => ({
                beforeImage: s.beforeImageUrl,
                afterImage: s.afterImageUrl,
                beforeMonth: s.beforeMonth,
                afterMonth: s.afterMonth,
                stage: s.stage,
                title: s.title,
                description: s.description,
                name: s.name,
                age: s.age,
                rating: s.rating,
                status: statusValue,
            }));

        } else if (selectedSection === "honestExpectations") {
            payload.honestExpectations = {
                male: honestMaleStages.map(s => ({ title: s.title, image: s.imageUrl, success: s.success })),
                female: honestFemaleStages.map(s => ({ title: s.title, image: s.imageUrl, success: s.success })),
            };
        } else if (selectedSection === "getStarted") {
            payload.slides = getStartedSteps.map(s => ({
                stepLabel: s.stepLabel, title: s.title, description: s.description, image: s.imageUrl,
            }));
        } else if (selectedSection === "timelineResult") {
            payload.timelineResult = {
                male: timelineMaleStages.map(s => ({ month: s.month, title: s.title, image: s.imageUrl })),
                female: timelineFemaleStages.map(s => ({ month: s.month, title: s.title, image: s.imageUrl })),
            };
        } else if (selectedSection === "holisticApproach") {
            payload.slides = holisticCards.map(s => ({
                title: s.title, description: s.description, image: s.imageUrl,
            }));
        } else if (selectedSection === "contactSection") {
            payload.contactSection = {
                title: contactSection.title,
                numberTitle: contactSection.numberTitle,
                description: contactSection.description,
                buttonText: contactSection.buttonText,
                buttonLink: contactSection.buttonLink
            }

        } else if (selectedSection === "featuressection") {
            payload.slides = featuresCards.map(s => ({
                title: s.title, description: s.description, image: s.imageUrl,
            }));
        }



        try {
            setSubmitLoading(true);
            const result = isEditMode && id
                ? await dispatch(updateSlide({ id, data: payload }))
                : await dispatch(createSlide(payload));

            if (createSlide.fulfilled.match(result) || updateSlide.fulfilled.match(result)) {
                toast.success(isEditMode ? "Slider updated!" : "Slider created!");
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
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
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
                                {ALL_SECTIONS
                                    .filter(sec => !addedSections.includes(sec) || sec === ownSection)
                                    .map(sec => (
                                        <option
                                            key={sec}
                                            value={sec}
                                        >
                                            {SECTION_LABELS[sec]}
                                        </option>
                                    ))}
                            </select>
                            {isEditMode && (
                                <p className="text-xs text-gray-400 mt-2">Section cannot be changed in edit mode.</p>
                            )}
                        </CardContent>
                    </Card>



                    {(selectedSection === "successStory" || selectedSection === "reportCard") && (
                        <Card className="shadow-md border border-blue-100 bg-blue-50/30">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-blue-800">
                                    📄 Show On Pages
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PageMultiSelect
                                    selectedSlugs={showOnPages}
                                    onChange={setShowOnPages}
                                />
                            </CardContent>
                        </Card>
                    )}


                    {selectedSection === "hero1" && (
                        <div className="space-y-4">
                            {hero1Slides.map((slide, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-base font-semibold text-gray-700">Slide {index + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-5">
                                        <div>
                                            <Label>Title <span className="text-red-500">*</span></Label>
                                            <Input placeholder="Enter slide title" value={slide.title}
                                                onChange={e => updateField(setHero1Slides, index, "title", e.target.value)}
                                                required className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea placeholder="Slide description..." value={slide.description}
                                                onChange={e => updateField(setHero1Slides, index, "description", e.target.value)}
                                                className="mt-1 min-h-[100px]" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><Label>Name</Label><Input placeholder="e.g. Sunny" value={slide.name} onChange={e => updateField(setHero1Slides, index, "name", e.target.value)} className="mt-1" /></div>
                                            <div><Label>Age</Label><Input placeholder="e.g. 36" value={slide.age} type="number" min={0} onChange={e => updateField(setHero1Slides, index, "age", e.target.value)} className="mt-1" /></div>
                                            <div><Label>Location</Label><Input placeholder="e.g. Punjab, IN" value={slide.location} onChange={e => updateField(setHero1Slides, index, "location", e.target.value)} className="mt-1" /></div>
                                            <div><Label>Review</Label><Input placeholder="Short review text" value={slide.review} onChange={e => updateField(setHero1Slides, index, "review", e.target.value)} className="mt-1" /></div>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            <div><Label>Main Image</Label><div className="mt-1"><ImageUpload value={slide.mainImageUrl} onChange={url => updateField(setHero1Slides, index, "mainImageUrl", url as string | null)} size={150} /></div></div>
                                            <div><Label>Before Image</Label><div className="mt-1"><ImageUpload value={slide.beforeImageUrl} onChange={url => updateField(setHero1Slides, index, "beforeImageUrl", url as string | null)} size={150} /></div></div>
                                            <div><Label>After Image</Label><div className="mt-1"><ImageUpload value={slide.afterImageUrl} onChange={url => updateField(setHero1Slides, index, "afterImageUrl", url as string | null)} size={150} /></div></div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><Label>Button Name</Label><Input placeholder="e.g. Shop Now" value={slide.button_name} onChange={e => updateField(setHero1Slides, index, "button_name", e.target.value)} className="mt-1" /></div>
                                            <div><Label>Button Link</Label><Input placeholder="/shop" value={slide.button_link} onChange={e => updateField(setHero1Slides, index, "button_link", e.target.value)} className="mt-1" /></div>
                                        </div>
                                        <div className="flex justify-center gap-3 pt-2">
                                            <button type="button" onClick={() => addSlideItem(setHero1Slides, defaultHero1Slide)} className="bg-primary text-white px-4 py-2 rounded text-sm">+ Add Slide</button>
                                            {hero1Slides.length > 1 && <button type="button" onClick={() => removeSlideItem(setHero1Slides, index)} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Remove</button>}
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
                                    <CardHeader><CardTitle className="text-base font-semibold text-gray-700">Slide {index + 1}</CardTitle></CardHeader>
                                    <CardContent className="space-y-5">
                                        <div><Label>Title <span className="text-red-500">*</span></Label><Input placeholder="Enter slide title" value={slide.title} onChange={e => updateField(setBanner1Slides, index, "title", e.target.value)} required className="mt-1" /></div>
                                        <div><Label>Description</Label><Textarea placeholder="Slide description..." value={slide.description} onChange={e => updateField(setBanner1Slides, index, "description", e.target.value)} className="mt-1 min-h-[100px]" /></div>
                                        <div><Label>Badge</Label><Input placeholder="e.g. Trending / NEW" value={slide.badge} onChange={e => updateField(setBanner1Slides, index, "badge", e.target.value)} className="mt-1" /></div>
                                        <div className="flex gap-4 flex-wrap">
                                            <div><Label>Background Image</Label><div className="mt-1"><ImageUpload value={slide.bgImageUrl} onChange={url => updateField(setBanner1Slides, index, "bgImageUrl", url as string | null)} size={150} /></div></div>
                                            <div><Label>Product Image</Label><div className="mt-1"><ImageUpload value={slide.productimgUrl} onChange={url => updateField(setBanner1Slides, index, "productimgUrl", url as string | null)} size={150} /></div></div>
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><Label>Button Name</Label><Input placeholder="e.g. Shop Now" value={slide.button_name} onChange={e => updateField(setBanner1Slides, index, "button_name", e.target.value)} className="mt-1" /></div>
                                            <div><Label>Button Link</Label><Input placeholder="/shop" value={slide.button_link} onChange={e => updateField(setBanner1Slides, index, "button_link", e.target.value)} className="mt-1" /></div>
                                        </div>
                                        <div className="flex justify-center gap-3 pt-2">
                                            <button type="button" onClick={() => addSlideItem(setBanner1Slides, defaultBanner1Slide)} className="bg-primary text-white px-4 py-2 rounded text-sm">+ Add Slide</button>
                                            {banner1Slides.length > 1 && <button type="button" onClick={() => removeSlideItem(setBanner1Slides, index)} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Remove</button>}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    {selectedSection === "featuressection" && (
                        <div className="space-y-4">
                            {featuresCards.map((card, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-semibold text-gray-700">Feature {index + 1}</CardTitle>
                                            {featuresCards.length > 1 && (
                                                <Button type="button" variant="destructive" size="sm"
                                                    onClick={() => removeSlideItem(setFeaturesCards, index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Title <span className="text-red-500">*</span></Label>
                                            <Input placeholder="e.g. Shipping Worldwide" value={card.title}
                                                onChange={e => updateField(setFeaturesCards, index, "title", e.target.value)}
                                                required className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Subtitle / Description</Label>
                                            <Textarea placeholder="e.g. We deliver to all the locations across the world." value={card.description}
                                                onChange={e => updateField(setFeaturesCards, index, "description", e.target.value)}
                                                className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Icon / Image</Label>
                                            <div className="mt-1">
                                                <ImageUpload value={card.imageUrl}
                                                    onChange={url => updateField(setFeaturesCards, index, "imageUrl", url as string | null)}
                                                    size={130} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <button type="button" onClick={() => addSlideItem(setFeaturesCards, defaultFeaturesCard)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 text-sm font-medium">
                                + Add Feature
                            </button>
                        </div>
                    )}

                    {selectedSection === "topDoctor" && (
                        <div className="space-y-4">
                            {topDoctorSlides.map((slide, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader><CardTitle className="text-base font-semibold text-gray-700">Doctor {index + 1}</CardTitle></CardHeader>
                                    <CardContent className="space-y-5">
                                        <div><Label>Name <span className="text-red-500">*</span></Label><Input placeholder="Doctor name" value={slide.name} onChange={e => updateField(setTopDoctorSlides, index, "name", e.target.value)} required className="mt-1" /></div>
                                        <div><Label>Cases / Specialization</Label><Textarea placeholder="e.g. 500+ Hair Transplant Cases" value={slide.cases} onChange={e => updateField(setTopDoctorSlides, index, "cases", e.target.value)} className="mt-1 min-h-[80px]" /></div>
                                        <div><Label>Doctor Image</Label><div className="mt-1"><ImageUpload value={slide.doctorimg} onChange={url => updateField(setTopDoctorSlides, index, "doctorimg", url as string | null)} size={150} /></div></div>
                                        <div className="flex justify-center gap-3 pt-2">
                                            <button type="button" onClick={() => addSlideItem(setTopDoctorSlides, defaultTopDoctorSlide)} className="bg-primary text-white px-4 py-2 rounded text-sm">+ Add Doctor</button>
                                            {topDoctorSlides.length > 1 && <button type="button" onClick={() => removeSlideItem(setTopDoctorSlides, index)} className="bg-red-500 text-white px-4 py-2 rounded text-sm">Remove</button>}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {selectedSection === "banner2" && <BannerImageSection title="Banner 2" data={banner2Data} onChange={(f, v) => setBanner2Data(p => ({ ...p, [f]: v }))} />}
                    {selectedSection === "banner3" && <BannerImageSection title="Banner 3" data={banner3Data} onChange={(f, v) => setBanner3Data(p => ({ ...p, [f]: v }))} />}
                    {selectedSection === "banner4" && <BannerImageSection title="Banner 4" data={banner4Data} onChange={(f, v) => setBanner4Data(p => ({ ...p, [f]: v }))} />}

                    {selectedSection === "shoppage" && (
                        <Card>
                            <CardHeader><CardTitle>Shop Page Slider</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                {shoppageData.map((slide, index) => (
                                    <div key={index} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex justify-between">
                                            <h3 className="font-semibold">Slide {index + 1}</h3>
                                            {shoppageData.length > 1 && (
                                                <Button variant="destructive" type="button" onClick={() => removeSlideItem(setShoppageData, index)}>Remove</Button>
                                            )}
                                        </div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><Label>Title</Label><Input value={slide.title} onChange={e => updateField(setShoppageData, index, "title", e.target.value)} /></div>
                                            <div><Label>Badge</Label><Input value={slide.badge} onChange={e => updateField(setShoppageData, index, "badge", e.target.value)} /></div>
                                        </div>
                                        <div><Label>Description</Label><Textarea value={slide.description} onChange={e => updateField(setShoppageData, index, "description", e.target.value)} /></div>
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div><Label>Button Name</Label><Input value={slide.button_name} onChange={e => updateField(setShoppageData, index, "button_name", e.target.value)} /></div>
                                            <div><Label>Button Link</Label><Input value={slide.button_link} onChange={e => updateField(setShoppageData, index, "button_link", e.target.value)} /></div>
                                        </div>
                                        <div className="flex gap-6 flex-wrap">
                                            <div><Label>Background Image</Label><ImageUpload value={slide.bgImageUrl} onChange={url => updateField(setShoppageData, index, "bgImageUrl", url as string)} /></div>
                                            <div><Label>Product Image</Label><ImageUpload value={slide.productimgUrl} onChange={url => updateField(setShoppageData, index, "productimgUrl", url as string)} /></div>
                                        </div>
                                    </div>
                                ))}
                                <Button type="button" onClick={() => addSlideItem(setShoppageData, defaultShoppageSlide)}>Add Slide</Button>
                            </CardContent>
                        </Card>
                    )}

                    {selectedSection === "successStory" && (
                        <div className="space-y-4">
                            {successStorySlides.map((slide, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-semibold text-gray-700">
                                                Story {index + 1}
                                            </CardTitle>
                                            {successStorySlides.length > 1 && (<Button type="button" variant="destructive" size="sm" onClick={() => removeSlideItem(setSuccessStorySlides, index)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-5">

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Name <span className="text-red-500">*</span></Label>
                                                <Input
                                                    placeholder="e.g. Soham"
                                                    value={slide.name}
                                                    onChange={e => updateField(setSuccessStorySlides, index, "name", e.target.value)}
                                                    required
                                                    className="mt-1"
                                                />
                                            </div>
                                            <div>
                                                <Label>Age</Label>
                                                <Input
                                                    placeholder="e.g. 32"
                                                    value={slide.age}
                                                    type="number"
                                                    min={0}
                                                    onChange={e => updateField(setSuccessStorySlides, index, "age", e.target.value)}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Title / Heading</Label>
                                            <Input
                                                placeholder="e.g. I trusted the journey..."
                                                value={slide.title}
                                                onChange={e => updateField(setSuccessStorySlides, index, "title", e.target.value)}
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex gap-4 flex-wrap mt-2">
                                                <div>
                                                    <Label className="text-xs text-gray-500">Main Image</Label>
                                                    <div className="mt-1">
                                                        <ImageUpload
                                                            value={slide.mainImageUrl}
                                                            onChange={url => updateField(setSuccessStorySlides, index, "mainImageUrl", url as string | null)}
                                                            size={130}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">Before Image</Label>
                                                    <div className="mt-1">
                                                        <ImageUpload
                                                            value={slide.beforeImageUrl}
                                                            onChange={url => updateField(setSuccessStorySlides, index, "beforeImageUrl", url as string | null)}
                                                            size={130}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-xs text-gray-500">After Image</Label>
                                                    <div className="mt-1">
                                                        <ImageUpload
                                                            value={slide.afterImageUrl}
                                                            onChange={url => updateField(setSuccessStorySlides, index, "afterImageUrl", url as string | null)}
                                                            size={130}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <Label className="font-semibold text-gray-700">
                                                Video <span className="text-gray-400 font-normal text-xs">(Max 15MB)</span>
                                            </Label>

                                            <VideoUpload
                                                value={slide.videoUrl}
                                                uploading={slide.videoUploading}
                                                onChange={url => updateField(setSuccessStorySlides, index, "videoUrl", url)}
                                                onUploadingChange={loading => updateField(setSuccessStorySlides, index, "videoUploading", loading)}
                                            />
                                        </div>

                                    </CardContent>
                                </Card>
                            ))}

                            <button
                                type="button"
                                onClick={() => addSlideItem(setSuccessStorySlides, defaultSuccessStorySlide)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm font-medium"
                            >
                                + Add More Story
                            </button>
                        </div>
                    )}

                    {selectedSection === "reportCard" && (
                        <div className="space-y-4">
                            <Card className="border border-gray-200 shadow-sm">
                                <CardContent className="pt-6">
                                    <Label>Section Title <span className="text-red-500">*</span></Label>
                                    <Input
                                        placeholder="e.g. Our Transformation Stories"
                                        value={reportCardTitle}
                                        onChange={e => setReportCardTitle(e.target.value)}
                                        required
                                        className="mt-1"
                                    />
                                </CardContent>
                            </Card>

                            {reportCardSlides.map((slide, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-semibold text-gray-700">
                                                Card {index + 1}
                                            </CardTitle>
                                            {reportCardSlides.length > 1 && (
                                                <Button type="button" variant="destructive" size="sm" onClick={() => removeSlideItem(setReportCardSlides, index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-5">

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Name <span className="text-red-500">*</span></Label>
                                                <Input placeholder="e.g. Satya" value={slide.name}
                                                    onChange={e => updateField(setReportCardSlides, index, "name", e.target.value)}
                                                    required className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Age</Label>
                                                <Input placeholder="e.g. 36" value={slide.age} type="number" min={0}
                                                    onChange={e => updateField(setReportCardSlides, index, "age", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Stage</Label>
                                                <Input placeholder="e.g. Stage 4" value={slide.stage}
                                                    onChange={e => updateField(setReportCardSlides, index, "stage", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>Rating</Label>
                                                <Input placeholder="e.g. 4.7" value={slide.rating} type="number" step="0.1" min={0} max={5}
                                                    onChange={e => updateField(setReportCardSlides, index, "rating", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                        </div>

                                        <div>
                                            <Label>Title <span className="text-red-500">*</span></Label>
                                            <Input placeholder="e.g. Consistency paid off" value={slide.title}
                                                onChange={e => updateField(setReportCardSlides, index, "title", e.target.value)}
                                                required className="mt-1" />
                                        </div>

                                        <div>
                                            <Label>Description</Label>
                                            <Textarea placeholder="Review description..." value={slide.description}
                                                onChange={e => updateField(setReportCardSlides, index, "description", e.target.value)}
                                                className="mt-1 min-h-[100px]" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label>Before Month Label</Label>
                                                <Input placeholder="e.g. Month 1" value={slide.beforeMonth}
                                                    onChange={e => updateField(setReportCardSlides, index, "beforeMonth", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                            <div>
                                                <Label>After Month Label</Label>
                                                <Input placeholder="e.g. Month 6" value={slide.afterMonth}
                                                    onChange={e => updateField(setReportCardSlides, index, "afterMonth", e.target.value)}
                                                    className="mt-1" />
                                            </div>
                                        </div>

                                        <div className="flex gap-4 flex-wrap">
                                            <div>
                                                <Label>Before Image</Label>
                                                <div className="mt-1">
                                                    <ImageUpload value={slide.beforeImageUrl} onChange={url => updateField(setReportCardSlides, index, "beforeImageUrl", url as string | null)} size={150} />
                                                </div>
                                            </div>
                                            <div>
                                                <Label>After Image</Label>
                                                <div className="mt-1">
                                                    <ImageUpload value={slide.afterImageUrl} onChange={url => updateField(setReportCardSlides, index, "afterImageUrl", url as string | null)} size={150} />
                                                </div>
                                            </div>
                                        </div>

                                    </CardContent>
                                </Card>
                            ))}

                            <button
                                type="button"
                                onClick={() => addSlideItem(setReportCardSlides, defaultReportCardSlide)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors text-sm font-medium"
                            >
                                + Add More Report Card
                            </button>
                        </div>
                    )}


                    {selectedSection === "honestExpectations" && (
                        <div className="space-y-6">
                            {(["male", "female"] as const).map((gender) => {
                                const stages = gender === "male" ? honestMaleStages : honestFemaleStages;
                                const setStages = gender === "male" ? setHonestMaleStages : setHonestFemaleStages;
                                return (
                                    <Card key={gender} className="border border-gray-200 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-base font-semibold text-gray-700 uppercase">
                                                {gender} Stages
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {stages.map((stage, index) => (
                                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-medium">Stage {index + 1}</h4>
                                                        <div className="flex items-center gap-3">
                                                            <Label className="text-sm">Success?</Label>
                                                            <Switch
                                                                checked={stage.success}
                                                                onCheckedChange={val => updateField(setStages, index, "success", val)}
                                                            />
                                                            {stages.length > 1 && (
                                                                <Button type="button" variant="destructive" size="sm"
                                                                    onClick={() => removeSlideItem(setStages, index)}>
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Title</Label>
                                                        <Input placeholder="e.g. Stage 1" value={stage.title}
                                                            onChange={e => updateField(setStages, index, "title", e.target.value)}
                                                            className="mt-1" />
                                                    </div>
                                                    <div>
                                                        <Label>Image</Label>
                                                        <div className="mt-1">
                                                            <ImageUpload value={stage.imageUrl}
                                                                onChange={url => updateField(setStages, index, "imageUrl", url as string | null)}
                                                                size={130} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button"
                                                onClick={() => addSlideItem(setStages, defaultHonestStage)}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 text-sm font-medium">
                                                + Add {gender} Stage
                                            </button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {selectedSection === "getStarted" && (
                        <div className="space-y-4">
                            {getStartedSteps.map((step, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-semibold text-gray-700">Step {index + 1}</CardTitle>
                                            {getStartedSteps.length > 1 && (
                                                <Button type="button" variant="destructive" size="sm"
                                                    onClick={() => removeSlideItem(setGetStartedSteps, index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Step Label</Label>
                                            <Input placeholder="e.g. STEP 1" value={step.stepLabel}
                                                onChange={e => updateField(setGetStartedSteps, index, "stepLabel", e.target.value)}
                                                className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Title</Label>
                                            <Input placeholder="e.g. Take the hair test" value={step.title}
                                                onChange={e => updateField(setGetStartedSteps, index, "title", e.target.value)}
                                                className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea value={step.description}
                                                onChange={e => updateField(setGetStartedSteps, index, "description", e.target.value)}
                                                className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Image</Label>
                                            <div className="mt-1">
                                                <ImageUpload value={step.imageUrl}
                                                    onChange={url => updateField(setGetStartedSteps, index, "imageUrl", url as string | null)}
                                                    size={130} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <button type="button" onClick={() => addSlideItem(setGetStartedSteps, defaultGetStartedStep)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 text-sm font-medium">
                                + Add Step
                            </button>
                        </div>
                    )}

                    {selectedSection === "timelineResult" && (
                        <div className="space-y-6">
                            {(["male", "female"] as const).map((gender) => {
                                const stages = gender === "male" ? timelineMaleStages : timelineFemaleStages;
                                const setStages = gender === "male" ? setTimelineMaleStages : setTimelineFemaleStages;
                                return (
                                    <Card key={gender} className="border border-gray-200 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-base font-semibold text-gray-700 uppercase">
                                                {gender} Timeline
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {stages.map((stage, index) => (
                                                <div key={index} className="border rounded-lg p-4 space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="font-medium">Month {index + 1}</h4>
                                                        {stages.length > 1 && (
                                                            <Button type="button" variant="destructive" size="sm"
                                                                onClick={() => removeSlideItem(setStages, index)}>
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <Label>Month Label</Label>
                                                            <Input placeholder="e.g. Month 1" value={stage.month}
                                                                onChange={e => updateField(setStages, index, "month", e.target.value)}
                                                                className="mt-1" />
                                                        </div>
                                                        <div>
                                                            <Label>Title</Label>
                                                            <Input placeholder="e.g. Control dandruff" value={stage.title}
                                                                onChange={e => updateField(setStages, index, "title", e.target.value)}
                                                                className="mt-1" />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <Label>Image</Label>
                                                        <div className="mt-1">
                                                            <ImageUpload value={stage.imageUrl}
                                                                onChange={url => updateField(setStages, index, "imageUrl", url as string | null)}
                                                                size={130} />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => addSlideItem(setStages, defaultTimelineStage)}
                                                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 text-sm font-medium">
                                                + Add {gender} Month
                                            </button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}

                    {selectedSection === "holisticApproach" && (
                        <div className="space-y-4">
                            {holisticCards.map((card, index) => (
                                <Card key={index} className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-semibold text-gray-700">Card {index + 1}</CardTitle>
                                            {holisticCards.length > 1 && (
                                                <Button type="button" variant="destructive" size="sm"
                                                    onClick={() => removeSlideItem(setHolisticCards, index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div>
                                            <Label>Title</Label>
                                            <Input placeholder="e.g. Customised Kit" value={card.title}
                                                onChange={e => updateField(setHolisticCards, index, "title", e.target.value)}
                                                className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Description</Label>
                                            <Textarea value={card.description}
                                                onChange={e => updateField(setHolisticCards, index, "description", e.target.value)}
                                                className="mt-1" />
                                        </div>
                                        <div>
                                            <Label>Image</Label>
                                            <div className="mt-1">
                                                <ImageUpload value={card.imageUrl}
                                                    onChange={url => updateField(setHolisticCards, index, "imageUrl", url as string | null)}
                                                    size={130} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <button type="button" onClick={() => addSlideItem(setHolisticCards, defaultHolisticCard)}
                                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 text-sm font-medium">
                                + Add Card
                            </button>
                        </div>
                    )}
                    {selectedSection === "contactSection" && (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    Contact Section
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>
                                        Title
                                    </Label>
                                    <Input
                                        value={contactSection.title}
                                        onChange={(e) =>
                                            setContactSection({
                                                ...contactSection,
                                                title: e.target.value
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Number Title
                                    </Label>
                                    <Input
                                        value={contactSection.numberTitle}
                                        onChange={(e) =>
                                            setContactSection({
                                                ...contactSection,
                                                numberTitle: e.target.value
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Description
                                    </Label>
                                    <Textarea
                                        value={contactSection.description}
                                        onChange={(e) =>
                                            setContactSection({
                                                ...contactSection,
                                                description: e.target.value
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Button Text
                                    </Label>
                                    <Input
                                        value={contactSection.buttonText}
                                        onChange={(e) =>
                                            setContactSection({
                                                ...contactSection,
                                                buttonText: e.target.value
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <Label>
                                        Button Link
                                    </Label>
                                    <Input
                                        value={contactSection.buttonLink}
                                        onChange={(e) =>
                                            setContactSection({
                                                ...contactSection,
                                                buttonLink: e.target.value
                                            })
                                        }
                                    />
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
                            {showOnPages.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Showing on:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {showOnPages.map(slug => (
                                            <span key={slug} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{slug}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button type="submit" disabled={submitLoading} className="flex-1">
                                    {submitLoading
                                        ? <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Saving...</span>
                                        : isEditMode ? "Update Slider" : "Create Slider"}
                                </Button>
                                <Link to={`${basePath}/slider`} className="flex-1">
                                    <Button type="button" variant="outline" className="w-full">Cancel</Button>
                                </Link>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </form>
        </div>
    );
}