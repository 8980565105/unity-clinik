import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

// export const fetchProducts = createAsyncThunk(
//   "products/fetchProducts",
//   async (
//     params: {
//       page?: number;
//       limit?: number;
//       search?: string;
//       isDownload?: boolean;
//       status?: "active" | "inactive";
//       sort?: "asc" | "desc";
//     } = {},
//     { rejectWithValue },
//   ) => {
//     try {
//       const { isDownload = false, ...query } = params;
//       const res = await api.get(ROUTES.products.getAll, {
//         params: { ...query, isDownload },
//       });
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to fetch products");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: "active" | "inactive";
      sort?: "asc" | "desc";
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { isDownload = false, ...query } = params;

      const res = await api.get(ROUTES.products.getAll, {
        params: {
          ...query,
          isDownload,
        },
      });

      if (res.data.success) {
        return res.data.data;
      }

      return rejectWithValue(res.data.message);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
export const getProductById = createAsyncThunk(
  "products/getProductById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.products.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Product not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.products.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create product");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.products.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update product");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Update product status
export const updateProductStatus = createAsyncThunk(
  "products/updateProductStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.products.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.products.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete product");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Bulk delete products
export const bulkDeleteProducts = createAsyncThunk(
  "products/bulkDeleteProducts",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.products.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete products");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// duplicateProduct
export const duplicateProduct = createAsyncThunk(
  "products/duplicateProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      // Step 1: Original product fetch karo
      const res = await api.get(ROUTES.products.getById(id));
      if (!res.data.success) {
        return rejectWithValue(res.data.message || "Product not found");
      }

      const p = res.data.data;

      // Step 2: Payload banavo — _id remove karo, name ma "Copy of" lagado
      const payload = {
        name: `Copy of ${p.name}`,
        description: p.description || "",
        steps: p.steps || "",
        category_id: p.category_id?._id || p.category_id || "",
        images: p.images || [],
        status: "inactive", // duplicate hamesha inactive rakhiye initially
        discount_id: p.discount_id?._id || p.discount_id || null,
        sections: Array.isArray(p.sections) ? p.sections : [],
        variants: Array.isArray(p.variants)
          ? p.variants.map((v: any) => ({
              // _id nahi moklo — new variant banshe
              brand_id: v.brand_id?._id || v.brand_id || "",
              type_id: v.type_id?._id || v.type_id || "",
              price: v.price || "",
              stock_quantity: v.stock_quantity || "0",
              sku: `${v.sku}-copy-${Date.now()}`, // unique SKU
              offerprice: v.offerprice || "",
              ProductWeight: v.ProductWeight || "",
              ProductHeight: v.ProductHeight || "",
              ProductWidth: v.ProductWidth || "",
              ProductLength: v.ProductLength || "",
              Manufactured: v.Manufactured || "",
              CountryOrigin: v.CountryOrigin || "",
              Marketed: v.Marketed || "",
              barcode: `${v.barcode}-copy`, // unique barcode
              images: v.images || [],
              labels: Array.isArray(v.labels)
                ? v.labels.map((l: any) => l._id || l)
                : [],
              status: "inactive",
              is_featured: !!v.is_featured,
              is_best_seller: !!v.is_best_seller,
              is_trending: !!v.is_trending,
              description: v.description || "",
              steps: v.steps || "",
            }))
          : [],
      };

      // Step 3: New product create karo
      const createRes = await api.post(ROUTES.products.create, payload);
      if (createRes.data.success) return createRes.data.data;
      return rejectWithValue(
        createRes.data.message || "Failed to duplicate product",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
