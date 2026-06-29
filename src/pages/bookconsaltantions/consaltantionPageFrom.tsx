import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { toast } from "sonner";
import { fetchConsultationPage, updateConsultationPage } from "../../features/consoltantion/consoltantionThunk";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { DraggableImageList } from "../Products/AddProduct";

interface StatItem {
    _id?: string;
    id: string;
    label: string;
    sub: string;
}

interface BulletItem {
    _id?: string;
    id: string;
    text: string;
}

interface HeroSection {
    status: boolean;
    badge: string;
    heading: string;
    headingHighlight: string;
    para1: string;
    para2: string;
    para3: string;
    bullets: BulletItem[];
    stats: StatItem[];
    withoutList: BulletItem[];
    withList: BulletItem[];
    withoutImage: string;   // NEW
    withImage: string;      // NEW
}

interface SocialPlatform {
    handle: string;
    followers?: string;
    subscribers?: string;
    tags: string;
    buttonText: string;
    buttonLink: string;
    image: string;
}

interface SocialSection {
    status: boolean;
    sectionTitle: string;
    sectionSubtitle: string;
    instagram: SocialPlatform;
    facebook: SocialPlatform;
    youtube: SocialPlatform;
}

interface ChatMessage {
    _id?: string;
    id: string;
    sender: "doctor" | "patient";
    text: string;
    time: string;
}

interface ChatItem {
    _id?: string;
    id: string;
    name: string;
    messages: ChatMessage[];
}

interface WhatsappSection {
    status: boolean;
    sectionTitle: string;
    sectionSubtitle: string;
    images: string[];
    chats: ChatItem[];
}

interface FaqItem {
    _id?: string;
    id: string;
    q: string;
    a: string;
}

interface FaqSection {
    status: boolean;
    sectionTitle: string;
    items: FaqItem[];
}

interface ConsultationFormData {
    hero: HeroSection;
    social: SocialSection;
    whatsapp: WhatsappSection;
    faq: FaqSection;
}

const uid = () => Math.random().toString(36).slice(2, 9);
const defaultBullet = (): BulletItem => ({ id: uid(), text: "" });
const defaultStat = (): StatItem => ({ id: uid(), label: "", sub: "" });
const defaultWithItem = (): BulletItem => ({ id: uid(), text: "" });
const defaultMessage = (): ChatMessage => ({ id: uid(), sender: "patient", text: "", time: "" });
const defaultChat = (): ChatItem => ({ id: uid(), name: "Dr. Ajay (Health Coach)", messages: [defaultMessage()] });
const defaultFaq = (): FaqItem => ({ id: uid(), q: "", a: "" });

const defaultSocialPlatform = (): SocialPlatform => ({
    handle: "",
    followers: "",
    subscribers: "",
    tags: "",
    buttonText: "",
    buttonLink: "",
    image: "",
});

const mapSocialPlatform = (p: any): SocialPlatform => ({
    handle: p?.handle || "",
    followers: p?.followers || "",
    subscribers: p?.subscribers || "",
    tags: (p?.tags || []).join(", "),
    buttonText: p?.buttonText || "",
    buttonLink: p?.buttonLink || "",
    image: p?.image || "",
});

const mapApiToForm = (data: any): ConsultationFormData => ({
    hero: {
        status: data?.hero?.status ?? true,
        badge: data?.hero?.badge || "",
        heading: data?.hero?.heading || "",
        headingHighlight: data?.hero?.headingHighlight || "",
        para1: data?.hero?.para1 || "",
        para2: data?.hero?.para2 || "",
        para3: data?.hero?.para3 || "",
        bullets: (data?.hero?.bullets || []).map((b: any) => ({
            id: b._id || uid(),
            text: typeof b === "string" ? b : b.text,
        })),
        stats: (data?.hero?.stats || []).map((s: any) => ({
            id: s._id || uid(),
            label: s.label || "",
            sub: s.sub || "",
        })),
        withoutList: (data?.hero?.withoutList || []).map((b: any) => ({
            id: b._id || uid(),
            text: typeof b === "string" ? b : b.text,
        })),
        withList: (data?.hero?.withList || []).map((b: any) => ({
            id: b._id || uid(),
            text: typeof b === "string" ? b : b.text,
        })),
        withoutImage: data?.hero?.withoutImage || "",
        withImage: data?.hero?.withImage || "",
    },
    social: {
        status: data?.social?.status ?? true,
        sectionTitle: data?.social?.sectionTitle || "",
        sectionSubtitle: data?.social?.sectionSubtitle || "",
        instagram: mapSocialPlatform(data?.social?.instagram),
        facebook: mapSocialPlatform(data?.social?.facebook),
        youtube: mapSocialPlatform(data?.social?.youtube),
    },
    whatsapp: {
        status: data?.whatsapp?.status ?? true,
        sectionTitle: data?.whatsapp?.sectionTitle || "",
        sectionSubtitle: data?.whatsapp?.sectionSubtitle || "",
        images: data?.whatsapp?.images || [],
        chats: (data?.whatsapp?.chats || []).map((c: any) => ({
            id: c._id || uid(),
            name: c.name || "",
            messages: (c.messages || []).map((m: any) => ({
                id: m._id || uid(),
                sender: m.sender || "patient",
                text: m.text || "",
                time: m.time || "",
            })),
        })),
    },
    faq: {
        status: data?.faq?.status ?? true,
        sectionTitle: data?.faq?.sectionTitle || "",
        items: (data?.faq?.items || []).map((f: any) => ({
            id: f._id || uid(),
            q: f.q || "",
            a: f.a || "",
        })),
    },
});

const mapSocialPlatformToPayload = (p: SocialPlatform) => ({
    handle: p.handle,
    followers: p.followers,
    subscribers: p.subscribers,
    tags: p.tags.split(",").map((t) => t.trim()).filter(Boolean),
    buttonText: p.buttonText,
    buttonLink: p.buttonLink,
    image: p.image,
});

const mapFormToPayload = (form: ConsultationFormData) => ({
    hero: {
        ...form.hero,
        bullets: form.hero.bullets.map(({ id, ...rest }) => rest),
        stats: form.hero.stats.map(({ id, ...rest }) => rest),
        withoutList: form.hero.withoutList.map(({ id, ...rest }) => rest),
        withList: form.hero.withList.map(({ id, ...rest }) => rest),
        withoutImage: form.hero.withoutImage,
        withImage: form.hero.withImage,
    },
    social: {
        status: form.social.status,
        sectionTitle: form.social.sectionTitle,
        sectionSubtitle: form.social.sectionSubtitle,
        instagram: mapSocialPlatformToPayload(form.social.instagram),
        facebook: mapSocialPlatformToPayload(form.social.facebook),
        youtube: mapSocialPlatformToPayload(form.social.youtube),
    },
    whatsapp: {
        status: form.whatsapp.status,
        sectionTitle: form.whatsapp.sectionTitle,
        sectionSubtitle: form.whatsapp.sectionSubtitle,
        images: form.whatsapp.images,
        chats: form.whatsapp.chats.map(({ id, ...chat }) => ({
            ...chat,
            messages: chat.messages.map(({ id: _id, ...msg }) => msg),
        })),
    },
    faq: {
        ...form.faq,
        items: form.faq.items.map(({ id, ...rest }) => rest),
    },
});

const defaultForm: ConsultationFormData = {
    hero: {
        status: true,
        badge: "",
        heading: "",
        headingHighlight: "",
        para1: "",
        para2: "",
        para3: "",
        bullets: [defaultBullet()],
        stats: [defaultStat()],
        withoutList: [defaultWithItem()],
        withList: [defaultWithItem()],
        withoutImage: "",
        withImage: "",
    },
    social: {
        status: true,
        sectionTitle: "",
        sectionSubtitle: "",
        instagram: defaultSocialPlatform(),
        facebook: defaultSocialPlatform(),
        youtube: defaultSocialPlatform(),
    },
    whatsapp: {
        status: true,
        sectionTitle: "",
        sectionSubtitle: "",
        images: [],
        chats: [defaultChat()],
    },
    faq: {
        status: true,
        sectionTitle: "",
        items: [defaultFaq()],
    },
};

function ConsultationPageForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { data, saving } = useSelector((state: RootState) => state.consultationpage);

    const [formData, setFormData] = useState<ConsultationFormData>(defaultForm);

    useEffect(() => {
        dispatch(fetchConsultationPage());
    }, [dispatch]);

    useEffect(() => {
        if (data) {
            setFormData(mapApiToForm(data));
        }
    }, [data]);

    const updateSectionStatus = (section: keyof ConsultationFormData, val: boolean) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...prev[section], status: val },
        }));
    };

    const updateField = (section: keyof ConsultationFormData, field: string, val: any) => {
        setFormData((prev) => ({
            ...prev,
            [section]: { ...(prev[section] as any), [field]: val },
        }));
    };

    const updateHeroList = (
        listKey: "bullets" | "stats" | "withoutList" | "withList",
        index: number,
        field: string,
        val: string
    ) => {
        const list = [...(formData.hero[listKey] as any[])];
        list[index] = { ...list[index], [field]: val };
        updateField("hero", listKey, list);
    };

    const addHeroListItem = (listKey: "bullets" | "stats" | "withoutList" | "withList") => {
        const newItem = listKey === "stats" ? defaultStat() : defaultBullet();
        updateField("hero", listKey, [...(formData.hero[listKey] as any[]), newItem]);
    };

    const removeHeroListItem = (listKey: "bullets" | "stats" | "withoutList" | "withList", index: number) => {
        if (index === 0) return;
        const list = (formData.hero[listKey] as any[]).filter((_, i) => i !== index);
        updateField("hero", listKey, list);
    };

    const updateSocial = (
        platform: "instagram" | "facebook" | "youtube",
        field: keyof SocialPlatform,
        val: string
    ) => {
        setFormData((prev) => ({
            ...prev,
            social: {
                ...prev.social,
                [platform]: { ...prev.social[platform], [field]: val },
            },
        }));
    };

    const updateWhatsappImages = (imgs: string[]) => {
        updateField("whatsapp", "images", imgs);
    };

    const addChat = () => updateField("whatsapp", "chats", [...formData.whatsapp.chats, defaultChat()]);
    const removeChat = (id: string, index: number) => {
        if (index === 0) return;
        updateField("whatsapp", "chats", formData.whatsapp.chats.filter((c) => c.id !== id));
    };
    const updateChatName = (id: string, name: string) => {
        updateField(
            "whatsapp",
            "chats",
            formData.whatsapp.chats.map((c) => (c.id === id ? { ...c, name } : c))
        );
    };
    const addMessage = (chatId: string) => {
        updateField(
            "whatsapp",
            "chats",
            formData.whatsapp.chats.map((c) =>
                c.id === chatId ? { ...c, messages: [...c.messages, defaultMessage()] } : c
            )
        );
    };
    const removeMessage = (chatId: string, msgIndex: number) => {
        if (msgIndex === 0) return;
        updateField(
            "whatsapp",
            "chats",
            formData.whatsapp.chats.map((c) =>
                c.id === chatId
                    ? { ...c, messages: c.messages.filter((_, i) => i !== msgIndex) }
                    : c
            )
        );
    };
    const updateMessage = (chatId: string, msgIndex: number, field: string, val: string) => {
        updateField(
            "whatsapp",
            "chats",
            formData.whatsapp.chats.map((c) =>
                c.id === chatId
                    ? {
                        ...c,
                        messages: c.messages.map((m, i) =>
                            i === msgIndex ? { ...m, [field]: val } : m
                        ),
                    }
                    : c
            )
        );
    };

    const addFaq = () => updateField("faq", "items", [...formData.faq.items, defaultFaq()]);
    const removeFaq = (index: number) => {
        if (index === 0) return;
        updateField("faq", "items", formData.faq.items.filter((_, i) => i !== index));
    };
    const updateFaq = (index: number, field: "q" | "a", val: string) => {
        const items = formData.faq.items.map((f, i) =>
            i === index ? { ...f, [field]: val } : f
        );
        updateField("faq", "items", items);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(updateConsultationPage(mapFormToPayload(formData))).unwrap();
            await dispatch(fetchConsultationPage());
            toast.success("Consultation page saved successfully!");
        } catch (err: any) {
            toast.error(err || "Failed to save consultation page");
        }
    };

    return (
        <div>
            <div>
                <h1 className="text-3xl font-bold text-foreground">Consultation Management</h1>
                <p className="text-muted-foreground">Manage your Consultation page content</p>
            </div>

            <form onSubmit={handleSubmit} className="flex gap-5 mt-8">

                <div className="w-[75%] space-y-6">

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Hero Section</span>
                                <div className="flex items-center gap-2">
                                    <Label>Status</Label>
                                    <Switch
                                        checked={formData.hero.status}
                                        onCheckedChange={(val) => updateSectionStatus("hero", val)}
                                    />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">







                            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                <div>
                                    <h3>Without Doctor's Guidance</h3>
                                    <div>
                                        <ImageUpload
                                            value={formData.social[key].image}
                                            onChange={(val: any) => {
                                                const image =
                                                    typeof val === "string"
                                                        ? val
                                                        : Array.isArray(val)
                                                            ? val[0]
                                                            : "";
                                                updateSocial(key, "image", image);
                                            }}
                                            multiple={false}
                                        />

                                    </div>


                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>withoutList</Label>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => addHeroListItem("withoutList")}
                                                className="flex items-center gap-1"
                                            >
                                                <Plus className="h-4 w-4" /> Add withoutList
                                            </Button>
                                        </div>
                                        {formData.hero.withoutList.map((withoutList, i) => (
                                            <div key={withoutList.id} className="flex items-center gap-3 border rounded-lg p-3 bg-muted/20">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Years Experience"
                                                    value={withoutList.sub}
                                                    onChange={(e) => updateHeroList("withoutList", i, "sub", e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={i === 0}
                                                    onClick={() => removeHeroListItem("withoutList", i)}
                                                    className={i === 0 ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3>
                                        With Doctor's Consultation
                                    </h3>
                                    <div>
                                        <ImageUpload
                                            // value={formData.social[key].image}
                                            // onChange={(val: any) => {
                                            //     const image =
                                            //         typeof val === "string"
                                            //             ? val
                                            //             : Array.isArray(val)
                                            //                 ? val[0]
                                            //                 : "";
                                            //     updateSocial(key, "image", image);
                                            // }}
                                            multiple={false}
                                        />

                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>withList</Label>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => addHeroListItem("withList")}
                                                className="flex items-center gap-1"
                                            >
                                                <Plus className="h-4 w-4" /> Add withList
                                            </Button>
                                        </div>
                                        {formData.hero.withList.map((withList, i) => (
                                            <div key={withList.id} className="flex items-center gap-3 border rounded-lg p-3 bg-muted/20">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="Years Experience"
                                                    value={withList.sub}
                                                    onChange={(e) => updateHeroList("withList", i, "sub", e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={i === 0}
                                                    onClick={() => removeHeroListItem("withList", i)}
                                                    className={i === 0 ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div> */}


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                {/* WITHOUT DOCTOR'S GUIDANCE */}
                                <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                                    <h3 className="font-semibold text-sm">Without Doctor's Guidance</h3>

                                    <div className="space-y-2">
                                        <Label>Image</Label>
                                        <ImageUpload
                                            value={formData.hero.withoutImage}
                                            onChange={(val: any) => {
                                                const image =
                                                    typeof val === "string"
                                                        ? val
                                                        : Array.isArray(val)
                                                            ? val[0]
                                                            : "";
                                                updateField("hero", "withoutImage", image);
                                            }}
                                            multiple={false}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>List Items</Label>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => addHeroListItem("withoutList")}
                                                className="flex items-center gap-1"
                                            >
                                                <Plus className="h-4 w-4" /> Add Item
                                            </Button>
                                        </div>
                                        {formData.hero.withoutList.map((item, i) => (
                                            <div key={item.id} className="flex items-center gap-3 border rounded-lg p-3 bg-background">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="e.g. Hair thinning continues..."
                                                    value={item.text}
                                                    onChange={(e) => updateHeroList("withoutList", i, "text", e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={i === 0}
                                                    onClick={() => removeHeroListItem("withoutList", i)}
                                                    className={i === 0 ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* WITH DOCTOR'S CONSULTATION */}
                                <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                                    <h3 className="font-semibold text-sm">With Doctor's Consultation</h3>

                                    <div className="space-y-2">
                                        <Label>Image</Label>
                                        <ImageUpload
                                            value={formData.hero.withImage}
                                            onChange={(val: any) => {
                                                const image =
                                                    typeof val === "string"
                                                        ? val
                                                        : Array.isArray(val)
                                                            ? val[0]
                                                            : "";
                                                updateField("hero", "withImage", image);
                                            }}
                                            multiple={false}
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label>List Items</Label>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => addHeroListItem("withList")}
                                                className="flex items-center gap-1"
                                            >
                                                <Plus className="h-4 w-4" /> Add Item
                                            </Button>
                                        </div>
                                        {formData.hero.withList.map((item, i) => (
                                            <div key={item.id} className="flex items-center gap-3 border rounded-lg p-3 bg-background">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    placeholder="e.g. Healthy hair growth restored..."
                                                    value={item.text}
                                                    onChange={(e) => updateHeroList("withList", i, "text", e.target.value)}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    disabled={i === 0}
                                                    onClick={() => removeHeroListItem("withList", i)}
                                                    className={i === 0 ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>





                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Badge Text</Label>
                                    <Input
                                        placeholder="EXPERT CONSULTATION IN INDIA"
                                        value={formData.hero.badge}
                                        onChange={(e) => updateField("hero", "badge", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Heading Highlight Word</Label>
                                    <Input
                                        placeholder="Regrowth"
                                        value={formData.hero.headingHighlight}
                                        onChange={(e) => updateField("hero", "headingHighlight", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Main Heading</Label>
                                <Textarea
                                    rows={2}
                                    placeholder="Book Your Hair..."
                                    value={formData.hero.heading}
                                    onChange={(e) => updateField("hero", "heading", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Paragraph 1</Label>
                                <Textarea
                                    rows={3}
                                    value={formData.hero.para1}
                                    onChange={(e) => updateField("hero", "para1", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Paragraph 2</Label>
                                <Textarea
                                    rows={3}
                                    value={formData.hero.para2}
                                    onChange={(e) => updateField("hero", "para2", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Paragraph 3</Label>
                                <Textarea
                                    rows={3}
                                    value={formData.hero.para3}
                                    onChange={(e) => updateField("hero", "para3", e.target.value)}
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Stats</Label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => addHeroListItem("stats")}
                                        className="flex items-center gap-1"
                                    >
                                        <Plus className="h-4 w-4" /> Add Stat
                                    </Button>
                                </div>
                                {formData.hero.stats.map((stat, i) => (
                                    <div key={stat.id} className="flex items-center gap-3 border rounded-lg p-3 bg-muted/20">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="15+"
                                            className="w-28"
                                            value={stat.label}
                                            onChange={(e) => updateHeroList("stats", i, "label", e.target.value)}
                                        />
                                        <Input
                                            placeholder="Years Experience"
                                            value={stat.sub}
                                            onChange={(e) => updateHeroList("stats", i, "sub", e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={i === 0}
                                            onClick={() => removeHeroListItem("stats", i)}
                                            className={i === 0 ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Service Bullets</Label>
                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => addHeroListItem("bullets")}
                                        className="flex items-center gap-1"
                                    >
                                        <Plus className="h-4 w-4" /> Add Bullet
                                    </Button>
                                </div>
                                {formData.hero.bullets.map((b, i) => (
                                    <div key={b.id} className="flex items-center gap-3">
                                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Service bullet..."
                                            value={b.text}
                                            onChange={(e) => updateHeroList("bullets", i, "text", e.target.value)}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={i === 0}
                                            onClick={() => removeHeroListItem("bullets", i)}
                                            className={i === 0 ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Social Section</span>
                                <div className="flex items-center gap-2">
                                    <Label>Status</Label>
                                    <Switch
                                        checked={formData.social.status}
                                        onCheckedChange={(val) => updateSectionStatus("social", val)}
                                    />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    placeholder="Join 2 Lakh+ Members..."
                                    value={formData.social.sectionTitle}
                                    onChange={(e) => updateField("social", "sectionTitle", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Section Subtitle</Label>
                                <Textarea
                                    rows={2}
                                    value={formData.social.sectionSubtitle}
                                    onChange={(e) => updateField("social", "sectionSubtitle", e.target.value)}
                                />
                            </div>

                            {(
                                [
                                    { key: "instagram" as const, label: "Instagram", countKey: "followers" as const, countLabel: "Followers" },
                                    { key: "facebook" as const, label: "Facebook", countKey: "followers" as const, countLabel: "Followers" },
                                    { key: "youtube" as const, label: "YouTube", countKey: "subscribers" as const, countLabel: "Subscribers" },
                                ]
                            ).map(({ key, label, countKey, countLabel }) => (
                                <div key={key} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                                    <span className="font-semibold text-sm">{label}</span>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <Label>Handle</Label>
                                            <Input
                                                placeholder="@username"
                                                value={formData.social[key].handle}
                                                onChange={(e) => updateSocial(key, "handle", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{countLabel}</Label>
                                            <Input
                                                placeholder="100k+"
                                                value={(formData.social[key] as any)[countKey] || ""}
                                                onChange={(e) => updateSocial(key, countKey, e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Tags <span className="text-muted-foreground text-xs">(comma-separated)</span></Label>
                                        <Input
                                            placeholder="haircare, regrowth, tips"
                                            value={formData.social[key].tags}
                                            onChange={(e) => updateSocial(key, "tags", e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Button Text</Label>
                                            <Input
                                                placeholder="Follow us"
                                                value={formData.social[key].buttonText}
                                                onChange={(e) => updateSocial(key, "buttonText", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Button Link</Label>
                                            <Input
                                                placeholder="https://instagram.com/..."
                                                value={formData.social[key].buttonLink}
                                                onChange={(e) => updateSocial(key, "buttonLink", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Image</Label>
                                        <ImageUpload
                                            value={formData.social[key].image}
                                            onChange={(val: any) => {
                                                const image =
                                                    typeof val === "string"
                                                        ? val
                                                        : Array.isArray(val)
                                                            ? val[0]
                                                            : "";
                                                updateSocial(key, "image", image);
                                            }}
                                            multiple={false}
                                        />
                                    </div>
                                </div>
                            ))}

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between w-full">
                                <span>WhatsApp Section</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label>Status</Label>
                                        <Switch
                                            checked={formData.whatsapp.status}
                                            onCheckedChange={(val) => updateSectionStatus("whatsapp", val)}
                                        />
                                    </div>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    value={formData.whatsapp.sectionTitle}
                                    onChange={(e) => updateField("whatsapp", "sectionTitle", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Section Subtitle</Label>
                                <Textarea
                                    rows={2}
                                    value={formData.whatsapp.sectionSubtitle}
                                    onChange={(e) => updateField("whatsapp", "sectionSubtitle", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Images</Label>
                                <DraggableImageList
                                    images={formData.whatsapp.images}
                                    onChange={(imgs: string[]) => updateWhatsappImages(imgs)}
                                    onAddMore={(newUrls: string[]) => {
                                        updateWhatsappImages([...formData.whatsapp.images, ...newUrls]);
                                    }}
                                    apiUrlImage={import.meta.env.VITE_API_URL_IMAGE}
                                />
                            </div>

                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>FAQ Section</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Label>Status</Label>
                                        <Switch
                                            checked={formData.faq.status}
                                            onCheckedChange={(val) => updateSectionStatus("faq", val)}
                                        />
                                    </div>
                                    <Button type="button" size="sm" onClick={addFaq} className="flex items-center gap-1">
                                        <Plus className="h-4 w-4" /> Add FAQ
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">

                            <div className="space-y-2">
                                <Label>Section Title</Label>
                                <Input
                                    placeholder="Frequently Asked Questions"
                                    value={formData.faq.sectionTitle}
                                    onChange={(e) => updateField("faq", "sectionTitle", e.target.value)}
                                />
                            </div>

                            {formData.faq.items.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                                    No FAQs yet. Click "Add FAQ" to begin.
                                </p>
                            )}

                            {formData.faq.items.map((faq, i) => (
                                <div key={faq.id} className="border rounded-lg p-4 space-y-3 bg-muted/20">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium text-sm">FAQ {i + 1}</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={i === 0}
                                            onClick={() => removeFaq(i)}
                                            title={i === 0 ? "First FAQ cannot be deleted" : "Delete FAQ"}
                                            className={i === 0 ? "opacity-30 cursor-not-allowed" : "text-destructive hover:text-destructive hover:bg-destructive/10"}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Question</Label>
                                        <Input
                                            placeholder="Enter question..."
                                            value={faq.q}
                                            onChange={(e) => updateFaq(i, "q", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Answer</Label>
                                        <Textarea
                                            rows={3}
                                            placeholder="Enter answer..."
                                            value={faq.a}
                                            onChange={(e) => updateFaq(i, "a", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}

                        </CardContent>
                    </Card>

                </div>

                <Card className="w-[25%] !h-fit p-4 sticky top-5 space-y-3">
                    <CardContent className="p-0 space-y-4">

                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Section Visibility</p>
                            {(
                                [
                                    { key: "hero" as const, label: "Hero Section" },
                                    { key: "social" as const, label: "Social Section" },
                                    { key: "whatsapp" as const, label: "WhatsApp Section" },
                                    { key: "faq" as const, label: "FAQ Section" },
                                ]
                            ).map(({ key, label }) => (
                                <div key={key} className="flex items-center justify-between border rounded-md px-3 py-2">
                                    <Label className="cursor-pointer text-sm">{label}</Label>
                                    <Switch
                                        checked={formData[key].status}
                                        onCheckedChange={(val) => updateSectionStatus(key, val)}
                                    />
                                </div>
                            ))}
                        </div>

                        <Button type="submit" className="w-full" disabled={saving}>
                            {saving ? "Saving..." : "Save Consultation Page"}
                        </Button>

                    </CardContent>
                </Card>

            </form>
        </div>
    );
}

export default ConsultationPageForm;