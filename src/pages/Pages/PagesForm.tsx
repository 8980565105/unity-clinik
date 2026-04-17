import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useBasePath } from "@/hooks/useBasePath";
import {
  createPage,
  getPageById,
  updatePage,
} from "@/features/pages/pagesThunk";
import { SectionType, Slide } from "@/features/pages/pagesSlice";

export default function PageFormPage() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();

  const { user } = useSelector((state: any) => state.auth);
  const { stores = [] } = useSelector((state: any) => state.stores || {});

  // Page fields
  const [pageName, setPageName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [order, setOrder] = useState<number | "">("");
  const [selectedStoreId, setSelectedStoreId] = useState("");

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [metaKeyphrase, setMetaKeyphrase] = useState("");
  const [seoImage, setSeoImage] = useState("");

  // Sections
  const [sections, setSections] = useState<SectionType[]>([
    {
      type: "content",
      title: "",
      description: "",
      image_url: "",
      background_image_url: "",
      order: 1,
      is_button: false,
      button_name: "",
      button_link: "",
      status: "active",
    },
  ]);

  // Store owner auto storeId
  useEffect(() => {
    if (user?.role === "store_owner" && user?.storeId) {
      setSelectedStoreId(user.storeId);
    }
  }, [user]);

  // Fetch page if edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getPageById(id)).then((res: any) => {
        if (res.payload) {
          const page = res.payload;
          setPageName(page.page_name || "");
          setDescription(page.description || "");
          setMetaTitle(page.meta_title || "");
          setMetaDescription(page.meta_description || "");
          setMetaKeyphrase(page.meta_keyphrase || "");
          setSeoImage(page.seo_image || "");
          setStatus(page.status || "active");
          setOrder(page.order || 1);
          setSections(page.sections?.length ? page.sections : []);
          if (page.storeId) setSelectedStoreId(page.storeId);
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  // Add / remove sections
  const addSection = (type: SectionType["type"] = "content") => {
    const newSection: SectionType = {
      type,
      title: "",
      description: "",
      image_url: "",
      background_image_url: "",
      order: sections.length + 1,
      is_button: false,
      button_name: "",
      button_link: "",
      status: "active",
    };
    if (type === "hero_slider") newSection.slides = [];
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (
    index: number,
    field: keyof SectionType,
    value: SectionType[keyof SectionType]
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Slide handlers
  const addSlide = (sectionIndex: number) => {
    const updated = [...sections];
    if (!updated[sectionIndex].slides) updated[sectionIndex].slides = [];
    updated[sectionIndex].slides!.push({
      title: "",
      description: "",
      background_image_url: "",
      is_button: false,
      button_name: "",
      button_link: "",
      order: updated[sectionIndex].slides!.length + 1,
    });
    setSections(updated);
  };

  const updateSlide = (
    sectionIndex: number,
    slideIndex: number,
    field: keyof Slide,
    value: Slide[keyof Slide]
  ) => {
    setSections((prev) => {
      const updated = [...prev];
      if (!updated[sectionIndex].slides) return updated;
      updated[sectionIndex].slides![slideIndex] = {
        ...updated[sectionIndex].slides![slideIndex],
        [field]: value,
      };
      return updated;
    });
  };

  const removeSlide = (sectionIndex: number, slideIndex: number) => {
    const updated = [...sections];
    updated[sectionIndex].slides!.splice(slideIndex, 1);
    setSections(updated);
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageName.trim()) return toast.error("Please enter page name");

    const payload: any = {
      page_name: pageName,
      slug: pageName.toLowerCase().replace(/\s+/g, "-"),
      description,
      meta_title: metaTitle,
      meta_description: metaDescription,
      meta_keyphrase: metaKeyphrase,
      seo_image: seoImage,
      status,
      order,
      sections: sections.map((section) => {
        const { slides, ...rest } = section;
        return {
          ...rest,
          slides: slides?.length
            ? slides.map((slide) => ({ ...slide }))
            : undefined,
        };
      }),
    };

    if (selectedStoreId) payload.storeId = selectedStoreId;

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updatePage({ id, data: payload }));
      } else {
        result = await dispatch(createPage(payload));
      }

      if (
        createPage.fulfilled.match(result) ||
        updatePage.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode ? "Page updated successfully!" : "Page created successfully!"
        );
        navigate(`${basePath}/pages`);
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/pages`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Page" : "Add New Page"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode
              ? "Update page content and sections."
              : "Create a new dynamic page."}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">

        {/* ─── Left Column ─── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Page Details */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Page Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Page Name *</Label>
                <Input
                  value={pageName}
                  onChange={(e) => setPageName(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short page description..."
                />
              </div>

              {/* Admin — store selector */}
              {user?.role === "admin" && (
                <div>
                  <Label>Store</Label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full mt-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Global (No Store) --</option>
                    {stores.map((store: any) => (
                      <option key={store._id} value={store._id}>
                        {store.store_name || store.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Store select karo to page te store mate j show thase
                  </p>
                </div>
              )}

              {/* Store owner — read only */}
              {user?.role === "store_owner" && (
                <div>
                  <Label>Store</Label>
                  <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                    Auto-assigned to your store
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO Details */}
          <Card className="shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">SEO Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Meta Title</Label>
                <Input
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
              </div>
              <div>
                <Label>Meta Description</Label>
                <Textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
              </div>
              <div>
                <Label>Meta Keyphrase</Label>
                <Input
                  value={metaKeyphrase}
                  onChange={(e) => setMetaKeyphrase(e.target.value)}
                />
              </div>
              <div>
                <Label>SEO Image</Label>
                <ImageUpload
                  value={seoImage}
                  onChange={(url) => setSeoImage(url as string)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Page Sections */}
          <Card className="shadow-sm border border-gray-100">
            <CardHeader className="flex justify-between items-center pb-2">
              <CardTitle className="text-lg font-semibold">Page Sections</CardTitle>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addSection("hero_slider")}
                >
                  <Plus className="w-4 h-4" /> Add Hero Slide
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => addSection("content")}
                >
                  <Plus className="w-4 h-4" /> Add Content
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {sections.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-6 border rounded-md bg-gray-50">
                  No sections added yet. Click "Add Section" to get started.
                </p>
              ) : (
                sections.map((section, sectionIndex) => (
                  <div
                    key={sectionIndex}
                    className="relative rounded-xl border border-gray-200 bg-white shadow-sm p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Remove Section */}
                    <button
                      type="button"
                      onClick={() => removeSection(sectionIndex)}
                      className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition"
                    >
                      <Trash className="h-4 w-4" />
                    </button>

                    <h4 className="text-base font-medium text-gray-800 mb-4">
                      Section {sectionIndex + 1}
                    </h4>

                    {/* Section Type */}
                    <div className="mb-4">
                      <Label>Section Type</Label>
                      <select
                        value={section.type}
                        onChange={(e) =>
                          updateSection(sectionIndex, "type", e.target.value)
                        }
                        className="border rounded p-2 w-full"
                      >
                        <option value="hero_slider">Hero Slider</option>
                        <option value="content">Content</option>
                        <option value="feature">Feature</option>
                      </select>
                    </div>

                    {/* Section Fields */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input
                          value={section.title}
                          placeholder="Enter section title"
                          onChange={(e) =>
                            updateSection(sectionIndex, "title", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={section.description}
                          placeholder="Enter section description"
                          onChange={(e) =>
                            updateSection(sectionIndex, "description", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Image</Label>
                        <ImageUpload
                          value={section.image_url}
                          onChange={(url) =>
                            updateSection(sectionIndex, "image_url", url as string)
                          }
                        />
                      </div>

                      {section.type === "hero_slider" && (
                        <div className="space-y-2">
                          <Label>Background Image</Label>
                          <ImageUpload
                            value={section.background_image_url}
                            onChange={(url) =>
                              updateSection(
                                sectionIndex,
                                "background_image_url",
                                url as string
                              )
                            }
                          />
                        </div>
                      )}
                    </div>

                    {/* Include Button */}
                    <div className="flex items-center justify-between mt-5 border-t pt-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={section.is_button || false}
                          onCheckedChange={(val) =>
                            updateSection(sectionIndex, "is_button", val)
                          }
                        />
                        <Label>Include Button</Label>
                      </div>
                    </div>

                    {section.is_button && (
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                          <Label>Button Name</Label>
                          <Input
                            placeholder="e.g. Shop Now"
                            value={section.button_name || ""}
                            onChange={(e) =>
                              updateSection(sectionIndex, "button_name", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Button Link</Label>
                          <Input
                            placeholder="/shop"
                            value={section.button_link || ""}
                            onChange={(e) =>
                              updateSection(sectionIndex, "button_link", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    )}

                    {/* Hero Slider Slides */}
                    {section.type === "hero_slider" && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <Label>Slides</Label>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => addSlide(sectionIndex)}
                          >
                            <Plus className="w-4 h-4" /> Add Slide
                          </Button>
                        </div>

                        {section.slides && section.slides.length === 0 && (
                          <p className="text-sm text-gray-500">No slides yet</p>
                        )}

                        {section.slides?.map((slide, slideIndex) => (
                          <div
                            key={slideIndex}
                            className="relative border border-gray-200 rounded p-4 mb-3"
                          >
                            <button
                              type="button"
                              onClick={() => removeSlide(sectionIndex, slideIndex)}
                              className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </button>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Slide Title</Label>
                                <Input
                                  value={slide.title}
                                  onChange={(e) =>
                                    updateSlide(sectionIndex, slideIndex, "title", e.target.value)
                                  }
                                  placeholder="Enter slide title"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Slide Description</Label>
                                <Textarea
                                  value={slide.description}
                                  onChange={(e) =>
                                    updateSlide(sectionIndex, slideIndex, "description", e.target.value)
                                  }
                                   placeholder="Enter slide description"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Background Image</Label>
                                <ImageUpload
                                  value={slide.background_image_url}
                                  onChange={(url) =>
                                    updateSlide(
                                      sectionIndex,
                                      slideIndex,
                                      "background_image_url",
                                      url as string
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Include Button</Label>
                                <Switch
                                  checked={slide.is_button}
                                  onCheckedChange={(val) =>
                                    updateSlide(sectionIndex, slideIndex, "is_button", val)
                                  }
                                />
                              </div>
                              {slide.is_button && (
                                <>
                                  <div className="space-y-2">
                                    <Label>Button Name</Label>
                                    <Input
                                      value={slide.button_name}
                                      onChange={(e) =>
                                        updateSlide(sectionIndex, slideIndex, "button_name", e.target.value)
                                      }
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Button Link</Label>
                                    <Input
                                      value={slide.button_link}
                                      onChange={(e) =>
                                        updateSlide(sectionIndex, slideIndex, "button_link", e.target.value)
                                      }
                                    />
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* ─── Right Column ─── */}
        <div className="space-y-6 relative">
          <Card className="sticky top-6 shadow-md border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="status">Active</Label>
                <Switch
                  id="status"
                  checked={status === "active"}
                  onCheckedChange={(val) => setStatus(val ? "active" : "inactive")}
                />
              </div>
              <div>
                <Label>Order</Label>
                <Input
                  type="number"
                  value={order === "" ? "" : order}
                  onChange={(e) =>
                    setOrder(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 sticky top-[250px]">
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
              {isEditMode ? "Update Page" : "Create Page"}
            </Button>
            <Link to={`${basePath}/pages`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}