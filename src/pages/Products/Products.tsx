import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { toast } from "sonner";
import {
  bulkDeleteProducts,
  deleteProduct,
  fetchProducts,
  updateProductStatus,
} from "@/features/products/productsThunk";
import { Switch } from "@/components/ui/switch";
import { fetchCategories } from "@/features/categories/categoriesThunk";
import { fetchBrands } from "@/features/brands/brandsThunk";
import { fetchTypes } from "@/features/types/typesThunk";
import { fetchFabrics } from "@/features/fabrics/fabricsThunk";
import { fetchColors } from "@/features/colors/colorsThunk";
import { fetchSizes } from "@/features/sizes/sizesThunk";
import { fetchProductLabels } from "@/features/productLabels/productLabelsThunk";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBasePath } from "@/hooks/useBasePath";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchsubCategories } from "@/features/subcategories/subcategoriesThunk";

export default function Products() {
  const dispatch = useDispatch<AppDispatch>();
  const { products, total, loading } = useSelector(
    (state: RootState) => state.products
  );

  const { categories: subCategories } = useSelector((state: RootState) => state.subcategori);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 5;
  const basePath = useBasePath();
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | "">(
    ""
  );
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [brandFilter, setBrandFilter] = useState<string[]>([]);
  const [sizeFilter, setSizeFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [fabricFilter, setFabricFilter] = useState<string[]>([]);
  const [colorFilter, setColorFilter] = useState<string[]>([]);
  const [priceFilter, setPriceFilter] = useState<{
    min?: number;
    max?: number;
  }>({});
  const [productLabelsFilter, setProductLabelsFilter] = useState<string[]>([]);
  const { categories } = useSelector((state: RootState) => state.categories);
  const { brands } = useSelector((state: RootState) => state.brands);
  const { types } = useSelector((state: RootState) => state.types);
  const { fabrics } = useSelector((state: RootState) => state.fabrics);
  const { colors } = useSelector((state: RootState) => state.colors);
  const { sizes } = useSelector((state: RootState) => state.sizes);
  const { labels: productLabels } = useSelector(
    (state: RootState) => state.productLabels
  );

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const buildQuery = () => ({
    page,
    limit,
    search: debouncedQuery,
    status: statusFilter || undefined,
    categories: categoryFilter.length ? categoryFilter.join(",") : undefined,
    brands: brandFilter.length ? brandFilter.join(",") : undefined,
    sizes: sizeFilter.length ? sizeFilter.join(",") : undefined,
    types: typeFilter.length ? typeFilter.join(",") : undefined,
    fabrics: fabricFilter.length ? fabricFilter.join(",") : undefined,
    colors: colorFilter.length ? colorFilter.join(",") : undefined,
    productLabels: productLabelsFilter.length
      ? productLabelsFilter.join(",")
      : undefined,
    minPrice: priceFilter.min,
    maxPrice: priceFilter.max,
  });

  useEffect(() => {
    dispatch(fetchProducts(buildQuery()));
  }, [
    debouncedQuery,
    page,
    statusFilter,
    categoryFilter,
    brandFilter,
    sizeFilter,
    typeFilter,
    fabricFilter,
    colorFilter,
    priceFilter,
    productLabelsFilter,
    dispatch,
  ]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted successfully.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete product.");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await dispatch(bulkDeleteProducts(selectedIds)).unwrap();
      toast.success(`${selectedIds.length} products deleted successfully.`);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete products.");
    }
  };

  const handleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleStatusToggle = async (product: any) => {
    try {
      const newStatus = product.status === "active" ? "inactive" : "active";
      await dispatch(
        updateProductStatus({ id: product._id, status: newStatus })
      ).unwrap();
      toast.success(`Product status updated successfully.`);
      dispatch(fetchProducts(buildQuery()));
    } catch (err: any) {
      toast.error(err?.message || "Failed to update product status.");
      console.error(err);
    }
  };

  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    dispatch(fetchCategories({ page: 1, limit: 100 }));
    dispatch(fetchBrands({ page: 1, limit: 100 }));
    dispatch(fetchTypes({ page: 1, limit: 100 }));
    dispatch(fetchFabrics({ page: 1, limit: 100 }));
    dispatch(fetchColors({ page: 1, limit: 100 }));
    dispatch(fetchSizes({ page: 1, limit: 100 }));
    dispatch(fetchProductLabels({ page: 1, limit: 100 }));
    dispatch(fetchsubCategories({ page: 1, limit: 100, status: "active" }));
  }, [dispatch]);


  const MultiSelectPopover = ({
    label,
    options,
    selected,
    setSelected,
  }: {
    label: string;
    options: { value: string; label: string }[];
    selected: string[];
    setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  }) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="w-full text-left">
          {selected.length
            ? selected
              .map((s) => options.find((o) => o.value === s)?.label)
              .join(", ")
            : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        {options.map((o) => (
          <div key={o.value} className="flex items-center space-x-2 py-1">
            <Checkbox
              checked={selected.includes(o.value)}
              onCheckedChange={(checked) => {
                if (checked) setSelected([...selected, o.value]);
                else setSelected(selected.filter((s) => s !== o.value));
              }}
            />
            <span>{o.label}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );

  const AdvancedFilters = ({ onApply }: { onApply: () => void }) => {
    const [localCategory, setLocalCategory] = useState(categoryFilter);
    const [localBrand, setLocalBrand] = useState(brandFilter);
    const [localSize, setLocalSize] = useState(sizeFilter);
    const [localType, setLocalType] = useState(typeFilter);
    const [localFabric, setLocalFabric] = useState(fabricFilter);
    const [localColor, setLocalColor] = useState(colorFilter);
    const [localPrice, setLocalPrice] = useState(priceFilter);
    const [localLabels, setLocalLabels] = useState(productLabelsFilter);

    const handleClearAll = () => {
      setLocalCategory([]);
      setLocalBrand([]);
      setLocalSize([]);
      setLocalType([]);
      setLocalFabric([]);
      setLocalColor([]);
      setLocalPrice({});
      setLocalLabels([]);
    };

    const handleSearchClick = () => {
      setCategoryFilter(localCategory);
      setBrandFilter(localBrand);
      setSizeFilter(localSize);
      setTypeFilter(localType);
      setFabricFilter(localFabric);
      setColorFilter(localColor);
      setPriceFilter(localPrice);
      setProductLabelsFilter(localLabels);
      onApply();
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between">
          <h4 className="font-semibold text-gray-700">Filter by Category</h4>
          <button onClick={handleClearAll} className="text-red-600">
            clear All
          </button>
        </div>
        <MultiSelectPopover
          label="Select Categories"
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
          selected={localCategory}
          setSelected={setLocalCategory}
        />

        <h4 className="font-semibold text-gray-700">Filter by Brand</h4>
        <MultiSelectPopover
          label="Select Brands"
          options={brands.map((b) => ({ value: b._id, label: b.name }))}
          selected={localBrand}
          setSelected={setLocalBrand}
        />

        <h4 className="font-semibold text-gray-700">Filter by Size</h4>
        <MultiSelectPopover
          label="Select Sizes"
          options={sizes.map((s) => ({ value: s._id, label: s.name }))}
          selected={localSize}
          setSelected={setLocalSize}
        />

        <h4 className="font-semibold text-gray-700">Other Filters</h4>
        <div className="grid grid-cols-2 gap-2">
          <MultiSelectPopover
            label="Types"
            options={types.map((t) => ({ value: t._id, label: t.name }))}
            selected={localType}
            setSelected={setLocalType}
          />
          <MultiSelectPopover
            label="Fabrics"
            options={fabrics.map((f) => ({ value: f._id, label: f.name }))}
            selected={localFabric}
            setSelected={setLocalFabric}
          />
          <MultiSelectPopover
            label="Colors"
            options={colors.map((c) => ({ value: c._id, label: c.name }))}
            selected={localColor}
            setSelected={setLocalColor}
          />
          <MultiSelectPopover
            label="Product Labels"
            options={productLabels.map((p) => ({
              value: p._id,
              label: p.name,
            }))}
            selected={localLabels}
            setSelected={setLocalLabels}
          />
        </div>

        <div className="flex gap-2 mt-2">
          <Input
            type="number"
            placeholder="Min Price"
            value={localPrice.min || ""}
            onChange={(e) =>
              setLocalPrice((prev) => ({
                ...prev,
                min: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
          <Input
            type="number"
            placeholder="Max Price"
            value={localPrice.max || ""}
            onChange={(e) =>
              setLocalPrice((prev) => ({
                ...prev,
                max: e.target.value ? Number(e.target.value) : undefined,
              }))
            }
          />
        </div>

        <Button className="w-full mt-2" onClick={handleSearchClick}>
          Apply Filters
        </Button>
      </div>
    );
  };

  return (
    <>
      <div className="space-y-6 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500">
              Manage all your products and their variants.
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`${basePath}/products/add`}>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </Link>
          </div>
        </div>

        <Card className="shadow-sm border border-gray-200">
          <CardContent className="space-y-4 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 flex-wrap">
              <div className="relative w-full md:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                value={statusFilter || "all"}
                onValueChange={(value) =>
                  setStatusFilter(
                    (value === "all" ? "" : value) as "" | "active" | "inactive"
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full md:w-auto">
                    Advanced Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full md:w-96 p-4 space-y-4">
                  <AdvancedFilters onApply={() => { }} />
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>

          {selectedIds.length > 0 && (
            <div className="p-4 border-t flex justify-end">
              <ConfirmDialog
                title="Delete Selected Products"
                description={`This will delete ${selectedIds.length} selected products.`}
                confirmText="Delete All"
                onConfirm={handleBulkDelete}
                danger
              >
                <Button
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete Selected
                </Button>
              </ConfirmDialog>
            </div>
          )}
        </Card>

        <Card className="shadow-sm border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">
              Products
              {/* {" "} */}
              {/* <span className="text-gray-400 font-normal">({total})</span> */}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm table-fixed border-separate border-spacing-0">
                <thead className="bg-gray-50 text-gray-700 text-sm font-medium">
                  <tr>
                    <th className="p-3 w-10">
                      <Checkbox
                        checked={
                          selectedIds.length === products?.length &&
                          products?.length > 0
                        }
                        onCheckedChange={(checked) =>
                          setSelectedIds(
                            checked ? products?.map((p) => p._id) : []
                          )
                        }
                      />
                    </th>
                    <th className="p-3 text-left">Product</th>
                    <th className="p-3 text-left">SubCategory</th>
                    <th className="p-3 text-left">Discount</th>
                    <th className="p-3 text-left">Price / Stock</th>
                    <th className="p-3 w-32 text-left">Status</th>
                    <th className="p-3 w-32 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-gray-500"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-5 w-5 text-gray-400"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                          Loading products...
                        </div>
                      </td>
                    </tr>
                  ) : products?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-gray-400"
                      >
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    products?.map((product) => {
                      const variants = product?.variants || [];
                      const minPrice = variants.length
                        ? Math.min(...variants.map((v) => v.price))
                        : 0;
                      const maxPrice = variants.length
                        ? Math.max(...variants.map((v) => v.price))
                        : 0;
                      const totalStock = variants.reduce(
                        (sum, v) => sum + v.stock_quantity,
                        0
                      );

                      return (
                        <React.Fragment key={product._id}>
                          <tr className="hover:bg-gray-50 transition-colors">
                            <td className="p-3">
                              <Checkbox
                                checked={selectedIds.includes(product._id)}
                                onCheckedChange={() =>
                                  handleSelect(product._id)
                                }
                              />
                            </td>
                            <td className="p-3 flex items-center gap-2">


                              {Array.isArray(product.images) && product.images.length > 0 && (
                                <img
                                  src={`${import.meta.env.VITE_API_URL_IMAGE}${product.images[0]}`}
                                  alt={product.name}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}

                              <span className="truncate">{product.name}</span>
                            </td>
                            <td className="p-3 text-gray-500 truncate">

                              {typeof product.category_id === "object"
                                ? product.category_id?.name
                                : subCategories.find((c) => c._id === product.category_id)?.name || "-"}
                            </td>

                            <td className="p-3">
                              {product?.discount?.name || "-"}
                            </td>

                            <td className="p-3">
                              $
                              {minPrice === maxPrice
                                ? minPrice
                                : `${minPrice} - ${maxPrice}`}{" "}
                              / Stock: {totalStock}
                            </td>

                            <td className="p-3">
                              <Switch
                                checked={product.status === "active"}
                                onCheckedChange={() =>
                                  handleStatusToggle(product)
                                }
                              />
                            </td>

                            <td className="p-3 text-right flex gap-2 justify-end items-center">
                              <Link
                                to={`${basePath}/products/${product._id}/edit`}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-md"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Link>
                              <ConfirmDialog
                                title="Delete Product"
                                description={`This will permanently delete product "${product.name}".`}
                                confirmText="Delete"
                                onConfirm={() => handleDelete(product._id)}
                                danger
                              >
                                <Button className="p-1 bg-transparant text-red-600 hover:bg-red-50 rounded-md">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </ConfirmDialog>
                            </td>
                          </tr>

                          {product?.variants?.length > 0 && (
                            <tr >
                              <td colSpan={6} className="p-0">
                                <details>
                                  <summary className="p-2 pl-5 cursor-pointer text-gray-600">
                                    {product?.variants?.length} Variants
                                  </summary>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="text-gray-700">
                                          <th className="p-2 text-left">
                                            SKU
                                          </th>
                                          <th className="p-2 text-left">
                                            Brand
                                          </th>
                                          <th className="p-2 text-left">
                                            Type
                                          </th>
                                          <th className="p-2 text-left">
                                            Fabric
                                          </th>
                                          <th className="p-2 text-left">
                                            Color / Size
                                          </th>
                                          <th className="p-2 text-left">
                                            Price / Stock
                                          </th>
                                          <th className="p-2 text-left">
                                            Labels
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {product?.variants?.map((v) => (
                                          <tr
                                            key={v?._id}
                                            className="text-gray-600"
                                          >
                                            <td className="p-2">{v.sku}</td>
                                            <td className="p-2">
                                              {v?.brand?.[0]?.name || "-"}
                                            </td>
                                            <td className="p-2">
                                              {v?.type?.[0]?.name || "-"}
                                            </td>
                                            <td className="p-2">
                                              {v?.fabric?.[0]?.name || "-"}
                                            </td>
                                            <td className="p-2">
                                              {v?.color?.[0]?.name || "-"} /{" "}
                                              {v?.size?.[0]?.name || "-"}
                                            </td>
                                            <td className="p-2">
                                              ${v?.price} / {v?.stock_quantity}
                                            </td>
                                            <td className="p-2 flex gap-1 flex-wrap">
                                              {v?.is_featured && (
                                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                                                  Featured
                                                </span>
                                              )}
                                              {v?.is_best_seller && (
                                                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                                                  Best Seller
                                                </span>
                                              )}
                                              {v?.is_trending && (
                                                <span className="bg-pink-100 text-pink-800 px-2 py-0.5 rounded text-xs">
                                                  Trending
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </details>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                >
                  Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`px-3 py-1 rounded-md text-sm ${page === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}