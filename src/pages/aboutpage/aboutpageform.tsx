
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, GripVertical } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchAboutPage, updateAboutPage } from "@/features/about/aboutThunk";
import { toast } from "sonner";


interface ContentSection {
    _id?: string;
    id: string;
    image: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    status: boolean;
}

interface MissionItem {
    _id?: string;
    id: string;
    icon: string;
    title: string;
    description: string;
    status: boolean;
}

interface AboutFormData {
    title: string;
    description: string;
    contentSections: ContentSection[];
    missionSectionTitle: string;
    missionSectionDescription: string;
    missionItems: MissionItem[];
}


const uid = () => Math.random().toString(36).slice(2, 9);

const defaultSection = (): ContentSection => ({
    id: uid(),
    image: "",
    title: "",
    description: "",
    buttonText: "",
    buttonLink: "",
    status: true,
});

const defaultMission = (): MissionItem => ({
    id: uid(),
    icon: "",
    title: "",
    description: "",
    status: true,
});

const mapApiToForm = (data: any): AboutFormData => ({
    title: data?.title || "",
    description: data?.description || "",
    missionSectionTitle: data?.missionSectionTitle || "",
    missionSectionDescription: data?.missionSectionDescription || "",
    contentSections: (data?.contentSections || []).map((s: any) => ({
        ...s,
        id: s._id || uid(),
        status: s.status !== undefined ? s.status : true,
    })),
    missionItems: (data?.missionItems || []).map((m: any) => ({
        ...m,
        id: m._id || uid(),
        status: m.status !== undefined ? m.status : true,
    })),
});


function AboutPageForm() {
    const dispatch = useDispatch<AppDispatch>();
    const { data } = useSelector(
        (state: RootState) => state.aboutpage
    );


    const [formData, setFormData] = useState<AboutFormData>({
        title: "",
        description: "",
        missionSectionTitle: "",
        missionSectionDescription: "",
        contentSections: [defaultSection()],
        missionItems: [defaultMission()],
    });

    useEffect(() => {
        dispatch(fetchAboutPage());
    }, [dispatch]);

    useEffect(() => {
        if (data) {
            setFormData(mapApiToForm(data));
        }
    }, [data]);


    const updateHeader = (
        field: "title" | "description" | "missionSectionTitle" | "missionSectionDescription",
        value: string
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };


    const addSection = () => {
        setFormData((prev) => ({
            ...prev,
            contentSections: [...prev.contentSections, defaultSection()],
        }));
    };

    const removeSection = (id: string, index: number) => {
        if (index === 0) return;
        setFormData((prev) => ({
            ...prev,
            contentSections: prev.contentSections.filter((s) => s.id !== id),
        }));
    };

    const updateSection = (
        id: string,
        field: keyof ContentSection,
        value: string | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            contentSections: prev.contentSections.map((s) =>
                s.id === id ? { ...s, [field]: value } : s
            ),
        }));
    };


    const addMission = () => {
        setFormData((prev) => ({
            ...prev,
            missionItems: [...prev.missionItems, defaultMission()],
        }));
    };

    const removeMission = (id: string, index: number) => {
        if (index === 0) return;
        setFormData((prev) => ({
            ...prev,
            missionItems: prev.missionItems.filter((m) => m.id !== id),
        }));
    };

    const updateMission = (
        id: string,
        field: keyof MissionItem,
        value: string | boolean
    ) => {
        setFormData((prev) => ({
            ...prev,
            missionItems: prev.missionItems.map((m) =>
                m.id === id ? { ...m, [field]: value } : m
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            title: formData.title,
            description: formData.description,
            missionSectionTitle: formData.missionSectionTitle,
            missionSectionDescription: formData.missionSectionDescription,
            contentSections: formData.contentSections.map(
                ({ id, ...rest }) => rest
            ),
            missionItems: formData.missionItems.map(
                ({ id, ...rest }) => rest
            ),
        };

        try {
            await dispatch(updateAboutPage(payload)).unwrap();

            await dispatch(fetchAboutPage());

            toast.success(
                "About page saved successfully!"
            );
        } catch (err: any) {
            toast.error(
                err || "Failed to save about page"
            );
        }
    };
    const { saving } = useSelector(
        (state: RootState) => state.aboutpage
    );

    return (
        <div>
            <div>
                <h1 className="text-3xl font-bold text-foreground">About Management</h1>
                <p className="text-muted-foreground">Manage your About Us page content</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div className="flex gap-5">

                    <div className="w-[75%] space-y-6">

                        <Card>
                            <CardHeader>
                                <CardTitle>Title & Description</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="about-title">Title</Label>
                                    <Input
                                        id="about-title"
                                        placeholder="e.g. About Us"
                                        value={formData.title}
                                        onChange={(e) => updateHeader("title", e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="about-desc">Description</Label>
                                    <Textarea
                                        id="about-desc"
                                        placeholder="Short description shown below the title..."
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => updateHeader("description", e.target.value)}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Content Sections</CardTitle>
                                <Button type="button" size="sm" onClick={addSection} className="flex items-center gap-1">
                                    <Plus className="h-4 w-4" /> Add Section
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {formData.contentSections.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                                        No sections yet. Click "Add Section" to begin.
                                    </p>
                                )}

                                {formData.contentSections.map((section, index) => (
                                    <div key={section.id} className="border rounded-lg p-4 space-y-4 bg-muted/20">

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-sm">Section {index + 1}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={index === 0}
                                                onClick={() => removeSection(section.id, index)}
                                                title={index === 0 ? "First section cannot be deleted" : "Delete section"}
                                                className={index === 0
                                                    ? "opacity-30 cursor-not-allowed"
                                                    : "text-destructive hover:text-destructive hover:bg-destructive/10"
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                            <Label className="cursor-pointer">
                                                Status
                                            </Label>
                                            <Switch
                                                checked={section.status}
                                                onCheckedChange={(val) => updateSection(section.id, "status", val)}
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="space-y-4 w-[75%]">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        placeholder="e.g. Multi purpose smart phones"
                                                        value={section.title}
                                                        onChange={(e) => updateSection(section.id, "title", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea
                                                        placeholder="Section description..."
                                                        rows={4}
                                                        value={section.description}
                                                        onChange={(e) => updateSection(section.id, "description", e.target.value)}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-2">
                                                        <Label>Button Text</Label>
                                                        <Input
                                                            placeholder="Read More"
                                                            value={section.buttonText}
                                                            onChange={(e) => updateSection(section.id, "buttonText", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Button Link</Label>
                                                        <Input
                                                            placeholder="/link"
                                                            value={section.buttonLink}
                                                            onChange={(e) => updateSection(section.id, "buttonLink", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2 w-[25%]">
                                                <Label>Image</Label>
                                                <ImageUpload
                                                    value={section.image || null}
                                                    onChange={(url) => updateSection(section.id, "image", (url as string) || "")}
                                                    size={150}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Our Mission Section</CardTitle>
                                <Button type="button" size="sm" onClick={addMission} className="flex items-center gap-1">
                                    <Plus className="h-4 w-4" /> Add Item
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">

                                <div className="space-y-4 border rounded-lg p-4 bg-muted/10">
                                    <div className="space-y-2">
                                        <Label>Section Title</Label>
                                        <Input
                                            placeholder="e.g. Our Values"
                                            value={formData.missionSectionTitle}
                                            onChange={(e) => updateHeader("missionSectionTitle", e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Section Description</Label>
                                        <Textarea
                                            placeholder="Short intro for this section..."
                                            rows={2}
                                            value={formData.missionSectionDescription}
                                            onChange={(e) => updateHeader("missionSectionDescription", e.target.value)}
                                        />
                                    </div>
                                </div>

                                {formData.missionItems.length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
                                        No items yet. Click "Add Item" to begin.
                                    </p>
                                )}

                                {formData.missionItems.map((item, index) => (
                                    <div key={item.id} className="border rounded-lg p-4 space-y-4 bg-muted/20">

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium text-sm">Item {index + 1}</span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                disabled={index === 0}
                                                onClick={() => removeMission(item.id, index)}
                                                title={index === 0 ? "First item cannot be deleted" : "Delete item"}
                                                className={index === 0
                                                    ? "opacity-30 cursor-not-allowed"
                                                    : "text-destructive hover:text-destructive hover:bg-destructive/10"
                                                }
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between border rounded-md px-3 py-2">
                                            <Label className="cursor-pointer">
                                                Status
                                            </Label>
                                            <Switch
                                                checked={item.status}
                                                onCheckedChange={(val) => updateMission(item.id, "status", val)}
                                            />
                                        </div>

                                        <div className="flex gap-4">
                                            <div className="space-y-4 w-[75%]">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        placeholder="e.g. Our Mission"
                                                        value={item.title}
                                                        onChange={(e) => updateMission(item.id, "title", e.target.value)}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Sub Title</Label>
                                                    <Input
                                                        placeholder="Short description..."
                                                        value={item.description}
                                                        onChange={(e) => updateMission(item.id, "description", e.target.value)}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2 w-[25%]">
                                                <Label>Icon / Image</Label>
                                                <ImageUpload
                                                    value={item.icon || null}
                                                    onChange={(url) => updateMission(item.id, "icon", (url as string) || "")}
                                                    size={150}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                    </div>

                    <Card className="w-[25%] !h-fit p-4 sticky top-5 space-y-3">
                        <div className="flex flex-col gap-2">

                            <Button type="submit" disabled={saving}>
                                {saving ? "Saving..." : "Save About Page"}
                            </Button>

                        </div>
                    </Card>

                </div>
            </form>
        </div>
    );
}

export default AboutPageForm;