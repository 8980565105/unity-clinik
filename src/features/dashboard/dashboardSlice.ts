// import { createSlice } from "@reduxjs/toolkit";
// import { fetchDashboard } from "./dashboardThunk";

// // Interfaces
// export interface SalesOverviewItem {
//   _id: string; // date string "YYYY-MM-DD"
//   revenue: number;
//   orders: number;
// }

// export interface OrdersByStatusItem {
//   _id: string; // "pending", "completed", etc.
//   count: number;
// }

// export interface TopSellingProduct {
//   name: string;
//   quantity: number;
// }

// export interface RecentOrderItem {
//   _id: string;
//   order_number: string;
//   total_price: number;
//   status: string;
//   createdAt: string;
//   user_id: { name: string; email: string };
//   items: Array<{
//     _id: string;
//     product_id: { name: string };
//     variant_id: { sku: string; price: number };
//     quantity: number;
//     price_at_order: number;
//   }>;
// }

// export interface DashboardData {
//   totalProducts: number;
//   totalOrders: number;
//   totalUsers: number;
//   totalRevenue: number;
//   activeCoupons: number;
//   salesOverview: SalesOverviewItem[];
//   ordersByStatus: OrdersByStatusItem[];
//   topSellingProducts: TopSellingProduct[];
//   recentOrders: RecentOrderItem[];
// }

// export interface DashboardState extends DashboardData {
//   loading: boolean;
//   error: string | null;
// }

// // **Initial State**
// const initialState: DashboardState = {
//   totalProducts: 0,
//   totalOrders: 0,
//   totalUsers: 0,
//   totalRevenue: 0,
//   activeCoupons: 0,
//   salesOverview: [],
//   ordersByStatus: [],
//   topSellingProducts: [],
//   recentOrders: [],
//   loading: false,
//   error: null,
// };

// // Slice
// const dashboardSlice = createSlice({
//   name: "dashboard",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchDashboard.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchDashboard.fulfilled, (state, action) => {
//         state.loading = false;
//         state.totalProducts = action.payload.totalProducts;
//         state.totalOrders = action.payload.totalOrders;
//         state.totalUsers = action.payload.totalUsers;
//         state.totalRevenue = action.payload.totalRevenue;
//         state.activeCoupons = action.payload.activeCoupons;
//         state.salesOverview = action.payload.salesOverview;
//         state.ordersByStatus = action.payload.ordersByStatus;
//         state.topSellingProducts = action.payload.topSellingProducts;
//         state.recentOrders = action.payload.recentOrders;
//       })
//       .addCase(fetchDashboard.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       });
//   },
// });

// export default dashboardSlice.reducer;



import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboard } from "./dashboardThunk";

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface SalesOverviewItem {
  _id: string;
  revenue: number;
  orders: number;
}

export interface OrdersByStatusItem {
  _id: string;
  count: number;
}

export interface TopSellingProduct {
  name: string;
  quantity: number;
}

export interface RecentOrderItem {
  _id: string;
  order_number: string;
  total_price: number;
  status: string;
  createdAt: string;
  user_id: { name: string; email: string };
  items: Array<{
    _id: string;
    product_id: { name: string };
    variant_id: { sku: string; price: number };
    quantity: number;
    price_at_order: number;
  }>;
}

export interface MonthlyStatItem {
  current: number;
  previous: number;
}

export interface MonthlyStats {
  products: MonthlyStatItem;
  orders: MonthlyStatItem;
  users: MonthlyStatItem;
  revenue: MonthlyStatItem;
  coupons: MonthlyStatItem;
}

export interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  activeCoupons: number;
  salesOverview: SalesOverviewItem[];
  ordersByStatus: OrdersByStatusItem[];
  topSellingProducts: TopSellingProduct[];
  recentOrders: RecentOrderItem[];
  monthlyStats: MonthlyStats;
}

export interface DashboardState extends DashboardData {
  loading: boolean;
  error: string | null;
}

// ─── Initial State ─────────────────────────────────────────────────────────────

const defaultMonthlyStats: MonthlyStats = {
  products: { current: 0, previous: 0 },
  orders: { current: 0, previous: 0 },
  users: { current: 0, previous: 0 },
  revenue: { current: 0, previous: 0 },
  coupons: { current: 0, previous: 0 },
};

const initialState: DashboardState = {
  totalProducts: 0,
  totalOrders: 0,
  totalUsers: 0,
  totalRevenue: 0,
  activeCoupons: 0,
  salesOverview: [],
  ordersByStatus: [],
  topSellingProducts: [],
  recentOrders: [],
  monthlyStats: defaultMonthlyStats,
  loading: false,
  error: null,
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.totalProducts = action.payload.totalProducts;
        state.totalOrders = action.payload.totalOrders;
        state.totalUsers = action.payload.totalUsers;
        state.totalRevenue = action.payload.totalRevenue;
        state.activeCoupons = action.payload.activeCoupons;
        state.salesOverview = action.payload.salesOverview;
        state.ordersByStatus = action.payload.ordersByStatus;
        state.topSellingProducts = action.payload.topSellingProducts;
        state.recentOrders = action.payload.recentOrders;
        state.monthlyStats = action.payload.monthlyStats ?? defaultMonthlyStats;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;