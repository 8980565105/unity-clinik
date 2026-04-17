
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import { Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { toast } from "sonner";

import {
    fetchFaqs,
    deleteFaqs,
    bulkDeleteFaqs,
    updateFaqsStatus,
    saveFaqBanner,
    getFaqBanner,
} from "@/features/faqs/faqsThunk";
import { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Faqspage() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();

    const { banner, bannerLoading } = useSelector(
        (state: RootState) => state.faqs,
    );

    const [bannerDialog, setBannerDialog] = useState(false);
    const [bannerForm, setBannerForm] = useState({
        title: "",
        desc: "",
        imageUrl: "",
    });
    const bannerFileRef = useRef<HTMLInputElement>(null);


    useEffect(() => {
        dispatch(getFaqBanner());
    }, [dispatch]);

    const openBannerDialog = () => {
        if (banner) {
            setBannerForm({
                title: banner.title || "",
                desc: banner.description || "",
                imageUrl: banner.image || "",
            });
        } else {
            setBannerForm({
                title: "",
                desc: "",
                imageUrl: "",
            });
        }

        if (bannerFileRef.current) {
            bannerFileRef.current.value = "";
        }

        setBannerDialog(true);
    };

    const handleBannerSave = async () => {
        try {
            const fd = new FormData();

            fd.append("title", bannerForm.title);
            fd.append("desc", bannerForm.desc);

            const file = bannerFileRef.current?.files?.[0];
            if (file) {
                fd.append("image", file);
            }

            await dispatch(saveFaqBanner(fd)).unwrap();

            await dispatch(getFaqBanner());

            toast.success("Banner saved successfully!");
            setBannerDialog(false);

        } catch (err) {
            console.error(err);
            toast.error("Failed to save banner");
        }
    };

    const columns = [
        { key: "question", label: "Question", width: "w-48" },
        { key: "answer", label: "Answer", width: "w-32" },
        { key: "category", label: "Category", width: "w-32" },
    ];

    const previewImage =
        bannerFileRef.current?.files?.[0]
            ? URL.createObjectURL(bannerFileRef.current.files[0])
            : bannerForm.imageUrl || banner?.image || "";


    return (
        <>
            <GenericTable
                title="FAQs"
                columns={columns}
                rowKey="_id"
                searchEnabled
                statusToggleEnabled
                filters={[
                    { label: "Active", value: "active" },
                    { label: "Inactive", value: "inactive" },
                ]}
                fetchData={async ({ page, limit, search, status }) => {
                    const res = await dispatch(
                        fetchFaqs({ page, limit, search, status }),
                    ).unwrap();
                    return {
                        data: res.faqs || res,
                        total: res.total || res.length,
                    };
                }}
                deleteItem={async (id) => {
                    await dispatch(deleteFaqs(id)).unwrap();
                }}
                bulkDeleteItems={async (ids) => {
                    await dispatch(bulkDeleteFaqs(ids)).unwrap();
                }}
                onStatusToggle={async (id, newStatus) => {
                    await dispatch(
                        updateFaqsStatus({ id, status: newStatus ? "active" : "inactive" }),
                    ).unwrap();
                }}
                headerActions={
                    <>
                        <Button onClick={openBannerDialog}>
                            {banner ? "Edit Banner" : "Add Banner"}
                        </Button>
                        <Link to={`${basePath}/faqs/add`}>
                            <Button className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add FAQ
                            </Button>
                        </Link>
                    </>
                }
            />

            <Dialog open={bannerDialog} onOpenChange={setBannerDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>FAQ Banner</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 pt-2">

                        <div>
                            <Label>Banner Image</Label>

                            {previewImage && (
                                <img
                                    src={previewImage}
                                    alt="preview"
                                    className="w-full h-32 object-cover rounded mb-2"
                                />
                            )}

                            <Input
                                type="file"
                                accept="image/*"
                                ref={bannerFileRef}
                                className="mb-2"
                                onChange={() => setBannerForm((prev) => ({ ...prev }))}
                            />

                            <Input
                                value={bannerForm.imageUrl}
                                onChange={(e) =>
                                    setBannerForm({ ...bannerForm, imageUrl: e.target.value })
                                }
                                placeholder="Or paste image URL"
                            />
                        </div>

                        <div>
                            <Label>Title</Label>
                            <Input
                                value={bannerForm.title}
                                onChange={(e) =>
                                    setBannerForm({ ...bannerForm, title: e.target.value })
                                }
                                placeholder="Enter banner title"
                            />
                        </div>

                        <div>
                            <Label>Description</Label>
                            <Input
                                value={bannerForm.desc}
                                onChange={(e) =>
                                    setBannerForm({ ...bannerForm, desc: e.target.value })
                                }
                                placeholder="Enter banner description"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button
                                className="flex-1"
                                onClick={handleBannerSave}
                                disabled={bannerLoading}
                            >
                                {bannerLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                                    </span>
                                ) : banner ? (
                                    "Update Banner"
                                ) : (
                                    "Save Banner"
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setBannerDialog(false)}
                                disabled={bannerLoading}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}