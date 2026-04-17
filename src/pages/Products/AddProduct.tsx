import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ChevronDown, X } from "lucide-react";
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
import { fetchCategories } from "@/features/categories/categoriesThunk";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";
import { fetchDiscounts } from "@/features/discounts/discountsThunk";
import { fetchBrands } from "@/features/brands/brandsThunk";
import { fetchTypes } from "@/features/types/typesThunk";
import { fetchFabrics } from "@/features/fabrics/fabricsThunk";
import { useBasePath } from "@/hooks/useBasePath";
import { fetchProductLabels } from "@/features/productLabels/productLabelsThunk";
import {
  createProduct,
  getProductById,
  updateProduct,
} from "@/features/products/productsThunk";
import { fetchColors } from "@/features/colors/colorsThunk";
import { fetchSizes } from "@/features/sizes/sizesThunk";

export default function ProductFormPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const basePath = useBasePath();

  const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
  const { brands } = useSelector((state: RootState) => state.brands);
  const { types } = useSelector((state: RootState) => state.types);
  const { fabrics } = useSelector((state: RootState) => state.fabrics);
  const { colors } = useSelector((state: RootState) => state.colors);
  const { sizes } = useSelector((state: RootState) => state.sizes);
  const { discounts } = useSelector((state: RootState) => state.discounts);

  const { labels: productLabels } = useSelector(
    (state: RootState) => state.productLabels
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState(true);
  // const [discountId, setDiscountId] = useState<string | null>(null);
  const [discountId, setDiscountId] = useState<string>("none");

  const [variants, setVariants] = useState<any[]>([
    {
      brand_id: "",
      fabric_id: "",
      type_id: "",
      color_id: "",
      size_id: "",
      price: "",
      stock_quantity: "0",
      sku: "",
      images: [],
      labels: [],
      status: "active",
      is_featured: false,
      is_best_seller: false,
      is_trending: false,
      description: "",
    },
  ]);

  useEffect(() => {
    dispatch(fetchsubCategories({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchDiscounts({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchBrands({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchTypes({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchFabrics({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchColors({ page: 1, limit: 100, status: "active" }));
    dispatch(fetchSizes({ page: 1, limit: 100, status: "active" }));
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
                fabric_id: v.fabric_id?._id || "",
                type_id: v.type_id?._id || "",
                color_id: v.color_id?._id || "",
                size_id: v.size_id?._id || "",
                price: v.price || "",
                stock_quantity: v.stock_quantity || "0",
                sku: v.sku || "",
                status: v.status || "active",
                images: v.images || [],
                labels: Array.isArray(v.labels) ? v.labels : [],
                is_featured: !!v.is_featured,
                is_best_seller: !!v.is_best_seller,
                is_trending: !!v.is_trending,
                description: v.description || "",
              }))
            );
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
        fabric_id: "",
        type_id: "",
        color_id: "",
        size_id: "",
        price: "",
        stock_quantity: "0",
        sku: "",
        images: [],
        labels: [],
        status: "active",
        is_featured: false,
        is_best_seller: false,
        is_trending: false,
        description: "",
      },
    ]);
  };

  const removeVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return toast.error("Product Name is required");
    if (!categoryId) return toast.error("Category is required");
    if (variants.length === 0) return toast.error("Add at least one variant");

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.brand_id || !v.fabric_id || !v.color_id || !v.size_id || !v.price || !v.stock_quantity || !v.sku) {
        return toast.error(`All fields are required for variant ${i + 1}`);
      }
    }

    const payload = {
      name,
      description,
      category_id: categoryId,
      images,
      status: status ? "active" : "inactive",
      // discount_id: discountId,
      discount_id: discountId === "none" ? null : discountId,
      variants,
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

            <div>
              <Label>Description</Label>
              <TiptapEditor value={description} onChange={(val) => setDescription(val)} />
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

        {/* ─── Variants ─── */}
        <Card className="shadow-md border border-gray-200">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">Variants</CardTitle>
            <Button type="button" onClick={addVariant}>
              Add Variant
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {variants.map((v, idx) => (
              <div key={idx} className="p-4 border rounded space-y-3 relative">
                <Button
                  type="button"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => removeVariant(idx)}
                >
                  Remove
                </Button>

                <div className="grid grid-cols-2 gap-3">
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
                    <Label>Fabric *</Label>
                    <Select
                      value={v.fabric_id}
                      onValueChange={(val) => handleVariantChange(idx, "fabric_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fabric" />
                      </SelectTrigger>
                      <SelectContent>
                        {fabrics.map((f) => (
                          <SelectItem key={f._id} value={f._id}>{f.name}</SelectItem>
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
                    <Label>Color *</Label>
                    <Select
                      value={v.color_id}
                      onValueChange={(val) => handleVariantChange(idx, "color_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map((c) => (
                          <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Size *</Label>
                    <Select
                      value={v.size_id}
                      onValueChange={(val) => handleVariantChange(idx, "size_id", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {sizes.map((s) => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
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
                </div>

                <div>
                  <Label>Description (Variant {idx + 1})</Label>
                  <TiptapEditor
                    value={v.description}
                    onChange={(val) => handleVariantChange(idx, "description", val)}
                  />
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