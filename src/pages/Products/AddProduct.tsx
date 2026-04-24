
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { TiptapEditor } from "@/components/ui/TiptapEditor";
import { ImageUpload } from "@/components/ui/ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import { fetchDiscounts } from "@/features/discounts/discountsThunk";
import { fetchBrands } from "@/features/brands/brandsThunk";
import { fetchTypes } from "@/features/types/typesThunk";
import { useBasePath } from "@/hooks/useBasePath";
import { fetchProductLabels } from "@/features/productLabels/productLabelsThunk";
import {
  createProduct,
  fetchProducts,
  getProductById,
  updateProduct,
} from "@/features/products/productsThunk";
import { Action } from "@radix-ui/react-toast";

const SECTION_TYPES = [
  "Select your scalp type",
  "Select your age",
  "Root Cause Section",
  "How Does It Do It Section",
  "Benefits Section",
  "Treatment Kit Section",
  "Treatment Journey Section",
  "Ingredients Section",
  "use and Others points",

];

const ITEM_LIST_SECTIONS = [
  "Select your scalp type",
  "Root Cause Section",
  "Select your age",
  "Benefits Section",
  "Ingredients Section",
  "Treatment Kit Section",
  "Treatment Journey Section",
  "How Does It Do It Section",
  "use and Others points",

];

export default function ProductFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();
  const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
  const { brands } = useSelector((state: RootState) => state.brands);
  const { types } = useSelector((state: RootState) => state.types);
  const { products } = useSelector((state: RootState) => state.products);
  const { discounts } = useSelector((state: RootState) => state.discounts);

  const { labels: productLabels } = useSelector(
    (state: RootState) => state.productLabels
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState(true);
  const [discountId, setDiscountId] = useState<string>("none");
  const [variants, setVariants] = useState<any[]>([
    {
      brand_id: "",
      type_id: "",
      price: "",
      stock_quantity: "0",
      sku: "",
      offerprice: "",
      ProductHeight: "",
      ProductWeight: "",
      ProductWidth: "",
      ProductLength: "",
      Manufactured: "",
      CountryOrigin: "",
      Marketed: "",
      barcode: "",
      images: [],
      labels: [],
      status: "active",
      is_featured: false,
      is_best_seller: false,
      is_trending: false,
      description: "",
      steps: "",
    },
  ]);
  const [sections, setSections] = useState<{ type: string; data: any }[]>([]);
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchsubCategories({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchProducts({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchDiscounts({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchBrands({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchTypes({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchProductLabels({ page: 1, limit: 100, status: "active" }));
  }, [dispatch]);

  useEffect(() => {
    if (subCategories.length > 0 && categoryId) {
      const exists = subCategories.find((c) => c._id === categoryId);
      if (!exists) setCategoryId("");
    }
  }, [subCategories]);

  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getProductById(id)).then((res: any) => {
        if (res.payload) {
          const p = res.payload.data || res.payload;
          setName(p.name || "");
          setDescription(p.description || "");
          setSteps(p.steps || "");
          const catId = p.category_id?._id || p.category_id || "";
          setCategoryId(String(catId));
          setDiscountId(p.discount_id?._id || p.discount_id || null);
          setImages(p.images || []);
          setStatus(p.status === "active");

          if (Array.isArray(p.variants) && p.variants.length > 0) {
            setVariants(
              p.variants.map((v: any) => ({
                _id: v._id,
                brand_id: v.brand_id?._id || "",
                type_id: v.type_id?._id || "",
                price: v.price || "",
                stock_quantity: v.stock_quantity || "0",
                sku: v.sku || "",
                offerprice: v.offerprice || "",
                ProductWeight: v.ProductWeight || "",
                ProductHeight: v.ProductHeight || "",
                ProductWidth: v.ProductWidth || "",
                ProductLength: v.ProductLength || "",
                CountryOrigin: v.CountryOrigin || "",
                Manufactured: v.Manufactured || "",
                Marketed: v.Marketed || "",
                barcode: v.barcode || "",
                status: v.status || "active",
                images: v.images || [],
                labels: Array.isArray(v.labels) ? v.labels : [],
                is_featured: !!v.is_featured,
                is_best_seller: !!v.is_best_seller,
                is_trending: !!v.is_trending,
                steps: v.steps || "",
                description: v.description || "",
              }))
            );
          }
          if (Array.isArray(p.sections) && p.sections.length > 0) {
            setSections(p.sections);
          }
        }
      });
    }
  }, [dispatch, id, isEditMode]);

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    if (field === "stock_quantity" && Number(value) < 0) return;
    updated[index][field] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        brand_id: "",
        type_id: "",
        price: "",
        stock_quantity: "0",
        sku: "",
        offerprice: "",
        ProductWeight: "",
        ProductHeight: "",
        ProductLength: "",
        ProductWidth: "",
        Manufactured: "",
        CountryOrigin: "",
        Marketed: "",
        barcode: "",
        images: [],
        labels: [],
        status: "active",
        is_featured: false,
        is_best_seller: false,
        is_trending: false,
        description: "",
        steps: "",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const addSection = (type: string) => {
    setSections([
      ...sections,
      {
        type,
        data: {
          status: true,
          title: "",
          description: "",
          items: [],
        },
      },
    ]);
    setShowSectionDropdown(false);
  };

  const removeSection = (idx: number) => {
    setSections(sections.filter((_, i) => i !== idx));
  };

  const updateSectionField = (idx: number, field: string, value: any) => {
    const updated = [...sections];
    updated[idx].data[field] = value;
    setSections(updated);
  };

  const addSectionItem = (idx: number) => {
    const updated = [...sections];

    if (!Array.isArray(updated[idx].data.items)) updated[idx].data.items = [];

    const sectionType = updated[idx].type;
    if (sectionType === "use and Others points") {
      updated[idx].data.items.push({ usPoint: "", otherPoint: "" });
    } else {
      updated[idx].data.items.push({ name: "", description: "", image: "" });
    }

    setSections(updated);
  };

  const removeSectionItem = (sectionIdx: number, itemIdx: number) => {
    const updated = [...sections];
    updated[sectionIdx].data.items.splice(itemIdx, 1);
    setSections(updated);
  };


  const updateSectionItem = (sectionIdx: number, itemIdx: number, field: string, value: any) => {
    const updated = [...sections];
    updated[sectionIdx].data.items[itemIdx][field] = value;
    setSections(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Product Name is required");
    if (!categoryId) return toast.error("Category is required");
    if (variants.length === 0) return toast.error("Add at least one variant");

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.brand_id ||
        !v.price ||
        !v.barcode ||
        !v.ProductWidth ||
        !v.ProductWeight ||
        !v.offerprice ||
        !v.ProductHeight ||
        !v.ProductLength ||
        !v.CountryOrigin ||
        !v.Marketed ||
        !v.Manufactured ||
        !v.stock_quantity || !v.sku) {
        return toast.error(`All fields are required for variant ${i + 1}`);
      }
    }

    const payload = {
      name,
      description,
      steps,
      category_id: categoryId,
      images,
      status: status ? "active" : "inactive",
      discount_id: discountId === "none" ? null : discountId,
      variants,
      sections,
    };

    try {
      let result;
      if (isEditMode && id) {
        result = await dispatch(updateProduct({ id, data: payload }));
      } else {
        result = await dispatch(createProduct(payload));
      }

      if (
        createProduct.fulfilled.match(result) ||
        updateProduct.fulfilled.match(result)
      ) {
        toast.success(
          isEditMode ? "Product updated successfully!" : "Product created successfully!"
        );
        navigate(`${basePath}/products`);
      } else {
        toast.error((result.payload as string) || "Something went wrong");
      }
    } catch (err) {
      toast.error("Server Error");
    }
  };

  return (
    <div className="p-6 mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link to={`${basePath}/products`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-gray-500 mt-1">
            {isEditMode ? "Update product details." : "Create a new product."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-md border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Product Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label>Product Name *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">

              <div>
                <Label>Description</Label>
                <TiptapEditor value={description} onChange={(val) => setDescription(val)} />
              </div>
              <div>
                <Label>How To Use Steps</Label>
                <TiptapEditor value={steps} onChange={(val) => setSteps(val)} />
              </div>
            </div>
            <div>
              <Label>SubCategory *</Label>
              <Select value={categoryId} onValueChange={(val) => setCategoryId(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {subCategories
                    .filter((cat) => cat.parent_id !== null && cat.parent_id !== undefined)
                    .map((c) => (
                      <SelectItem key={c._id} value={c._id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Discount</Label>
              <Select value={discountId ?? ""} onValueChange={setDiscountId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select discount" />
                </SelectTrigger>
                <SelectContent>

                  <SelectItem value="none">None</SelectItem>
                  {discounts.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>


            <div>
              <Label>Product Images</Label>
              <ImageUpload
                value={images}
                onChange={(val) => {
                  if (Array.isArray(val)) {
                    setImages(val);
                  } else if (val) {
                    setImages([val]);
                  } else {
                    setImages([]);
                  }
                }}
                multiple
              />
            </div>

            <div className="flex items-center justify-between mt-2">
              <Label htmlFor="status">Active</Label>
              <Switch id="status" checked={status} onCheckedChange={setStatus} />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-200">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Variants</CardTitle>

          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((v, idx) => (
              <div key={idx} className="p-4 border rounded space-y-3 relative">

                <div>
                  <CardTitle className="text-lg font-semibold">Variant ({idx + 1})</CardTitle>

                  <Button
                    type="button"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => removeVariant(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="col-span-2 flex items-center justify-between mt-2">
                  <Label htmlFor={`variant-status-${idx}`}>Status</Label>
                  <Switch
                    id={`variant-status-${idx}`}
                    checked={v.status === "active"}
                    onCheckedChange={(checked) =>
                      handleVariantChange(idx, "status", checked ? "active" : "inactive")
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label>Brand *</Label>
                    <Select
                      value={v.brand_id}
                      onValueChange={(val) => handleVariantChange(idx, "brand_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b._id} value={b._id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Type</Label>
                    <Select
                      value={v.type_id}
                      onValueChange={(val) => handleVariantChange(idx, "type_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {types.map((t) => (
                          <SelectItem key={t._id} value={t._id}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Price *</Label>
                    <Input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleVariantChange(idx, "price", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Stock *</Label>
                    <Input
                      type="number"
                      value={v.stock_quantity}
                      min={0}
                      onChange={(e) => handleVariantChange(idx, "stock_quantity", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>SKU *</Label>
                    <Input
                      value={v.sku}
                      onChange={(e) => handleVariantChange(idx, "sku", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>offer Price *</Label>
                    <Input
                      type="number"
                      value={v.offerprice}
                      onChange={(e) => handleVariantChange(idx, "offerprice", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Bar Code *</Label>
                    <Input
                      type="text"
                      value={v.barcode}
                      onChange={(e) => handleVariantChange(idx, "barcode", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>
                      Manufactured By *</Label>
                    <Input
                      type="text"
                      value={v.Manufactured}
                      onChange={(e) => handleVariantChange(idx, "Manufactured", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Marketed By *</Label>
                    <Input
                      type="text"
                      value={v.Marketed}
                      onChange={(e) => handleVariantChange(idx, "Marketed", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Country Origin *</Label>
                    <Input
                      type="text"
                      value={v.CountryOrigin}
                      onChange={(e) => handleVariantChange(idx, "CountryOrigin", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Product Length (cms) *</Label>
                    <Input
                      type="number"
                      value={v.ProductLength}
                      onChange={(e) => handleVariantChange(idx, "ProductLength", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Product Width (cms) *</Label>
                    <Input
                      type="number"
                      value={v.ProductWidth}
                      onChange={(e) => handleVariantChange(idx, "ProductWidth", e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Product Height (cms) *</Label>
                    <Input
                      type="number"
                      value={v.ProductHeight}
                      onChange={(e) => handleVariantChange(idx, "ProductHeight", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Product Weight (Kg) *</Label>
                    <Input
                      type="number"
                      value={v.ProductWeight}
                      onChange={(e) => handleVariantChange(idx, "ProductWeight", e.target.value)}
                    />
                  </div>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div>
                    <Label>Description (Variant {idx + 1})</Label>
                    <TiptapEditor
                      value={v.description}
                      onChange={(val) => handleVariantChange(idx, "description", val)}
                    />
                  </div>
                  <div>
                    <Label>How To Use Steps  (Variant {idx + 1})</Label>
                    <TiptapEditor value={v.steps} onChange={(val) => handleVariantChange(idx, "steps", val)} />
                  </div>

                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-wrap gap-6 mt-4 col-span-2">
                    <div className="flex items-center gap-2">
                      <Label>Featured</Label>
                      <Switch
                        checked={v.is_featured}
                        onCheckedChange={(val) => handleVariantChange(idx, "is_featured", val)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Best Seller</Label>
                      <Switch
                        checked={v.is_best_seller}
                        onCheckedChange={(val) => handleVariantChange(idx, "is_best_seller", val)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Label>Trending</Label>
                      <Switch
                        checked={v.is_trending}
                        onCheckedChange={(val) => handleVariantChange(idx, "is_trending", val)}
                      />
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label>Variant Images</Label>
                    <ImageUpload
                      value={v.images}
                      onChange={(urls) => handleVariantChange(idx, "images", urls)}
                      multiple
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Variant Labels</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {productLabels.map((label) => (
                        <label
                          key={label._id}
                          className="inline-flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            value={label._id}
                            checked={v.labels.includes(label._id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              const updatedLabels = checked
                                ? [...v.labels, label._id]
                                : v.labels.filter((l: string) => l !== label._id);
                              handleVariantChange(idx, "labels", updatedLabels);
                            }}
                            className="form-checkbox h-4 w-4 text-blue-600"
                          />
                          <span>{label.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-center">
              <Button type="button" onClick={addVariant}>
                Add Variant
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border border-gray-200">
          <CardHeader className="flex flex-col justify-center items-center">
            <CardTitle className="text-lg font-semibold">Page Section Builder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {sections.map((section, idx) => (
              <div key={idx} className="p-4 border rounded-lg space-y-4">

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">⇅</span>
                    <h3 className="font-semibold text-gray-800">
                      {section.type} {idx + 1}
                    </h3>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSection(idx)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <Label>{section.type} Status</Label>

                  <Switch
                    checked={section.data.status !== false}
                    onCheckedChange={(val) => updateSectionField(idx, "status", val)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={section.data.title || ""}
                      placeholder="Enter Title"
                      onChange={(e) => updateSectionField(idx, "title", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input
                      placeholder="Enter Description"
                      value={section.data.description || ""}
                      onChange={(e) => updateSectionField(idx, "description", e.target.value)}
                    />
                  </div>
                </div>


                {ITEM_LIST_SECTIONS.includes(section.type) && (
                  <div className="space-y-3">

                    {(section.data.items || []).map((item: any, itemIdx: number) => (
                      <div key={itemIdx} className="p-3 border rounded-lg bg-white space-y-3">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">⇅</span>
                            <span className="text-sm font-medium text-gray-600">
                              {item.name || `Item ${itemIdx + 1}`}
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSectionItem(idx, itemIdx)}
                          >
                            🗑
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {section.type === "use and Others points" ? (
                            <>
                              <div>
                                <Label>Us (Point)</Label>
                                <Input
                                  value={item.name || ""}
                                  placeholder="Enter Us Point"
                                  onChange={(e) => updateSectionItem(idx, itemIdx, "name", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Others (Point)</Label>
                                <Input
                                  value={item.description || ""}
                                  placeholder="Enter Others Point"
                                  onChange={(e) => updateSectionItem(idx, itemIdx, "description", e.target.value)}
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              <div>
                                <Label>Name</Label>
                                <Input
                                  value={item.name || ""}
                                  placeholder="Enter Name"
                                  onChange={(e) => updateSectionItem(idx, itemIdx, "name", e.target.value)}
                                />
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Input
                                  placeholder="Enter Description"
                                  value={item.description || ""}
                                  onChange={(e) => updateSectionItem(idx, itemIdx, "description", e.target.value)}
                                />
                              </div>
                              {(section.type === "Select your scalp type" ||
                                section.type === "Select your age") && (
                                  <div>
                                    <Label>Link Product</Label>
                                    <Select
                                      value={item.product_id || "none"}
                                      onValueChange={(val) =>
                                        updateSectionItem(idx, itemIdx, "product_id", val === "none" ? null : val)
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select product" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {products
                                          .filter((p) => p._id !== id)
                                          .map((p) => (
                                            <SelectItem key={p._id} value={p._id}>
                                              {p.name}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                    {item.product_id && item.product_id !== "none" && (
                                      <p className="text-xs text-blue-600 mt-1">✓ Product linked</p>
                                    )}
                                  </div>
                                )}
                              <div>
                                <Label>Image</Label>
                                {item.image ? (
                                  <div className="relative mt-1" style={{ width: 128, height: 128 }}>
                                    <img
                                      src={
                                        item.image.startsWith("http")
                                          ? item.image
                                          : `${import.meta.env.VITE_API_URL_IMAGE}${item.image}`
                                      }
                                      alt="item"
                                      className="w-full h-full object-contain rounded border"
                                    />
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute -top-2 -right-2 h-6 w-6"
                                      onClick={() => updateSectionItem(idx, itemIdx, "image", "")}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ) : (
                                  <ImageUpload
                                    value={null}
                                    onChange={(val) => {
                                      const url = typeof val === "string" ? val : Array.isArray(val) ? val[0] : "";
                                      updateSectionItem(idx, itemIdx, "image", url || "");
                                    }}
                                    multiple={false}
                                  />
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex justify-center pt-2">
                      <Button
                        type="button"
                        onClick={() => addSectionItem(idx)}
                      >
                        Add to product Extra List
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <div className="relative flex justify-center">
              <Button
                type="button"
                onClick={() => setShowSectionDropdown(!showSectionDropdown)}
              >
                Add to product Page Section Builder
              </Button>
              {showSectionDropdown && (
                <div
                  className="absolute  mt-12 w-72 bg-white border border-gray-200 rounded shadow-lg z-50 max-h-80 overflow-y-auto">
                  {SECTION_TYPES.map((sType) => (
                    <div
                      key={sType}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => addSection(sType)}
                    >
                      {sType}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
            {isEditMode ? "Update Product" : "Create Product"}
          </Button>
          <Link to={`${basePath}/products`} className="flex-1">
            <Button type="button" variant="outline" className="w-full">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}

