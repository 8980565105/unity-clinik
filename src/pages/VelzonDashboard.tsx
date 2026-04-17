import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Ticket,
} from "lucide-react";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchDashboard } from "@/features/dashboard/dashboardThunk";
import { useNavigate } from "react-router-dom";
import { useBasePath } from "@/hooks/useBasePath";

const calcMonthlyChange = (
  current: number,
  previous: number
): { change: string; trending: "up" | "down" } => {
  if (previous === 0 && current === 0) {
    return { change: "0%", trending: "up" };
  }
  if (previous === 0) {
    return { change: "+100%", trending: "up" };
  }
  const diff = ((current - previous) / previous) * 100;
  if (diff > 0) {
    return { change: `+${diff.toFixed(1)}%`, trending: "up" };
  } else if (diff < 0) {
    return { change: `${diff.toFixed(1)}%`, trending: "down" };
  } else {
    return { change: "0%", trending: "up" };
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "delivered":
      return <Badge className="badge-solid-success">Delivered</Badge>;
    case "processing":
      return <Badge className="badge-solid-info">Processing</Badge>;
    case "pending":
      return <Badge className="badge-solid-warning">Pending</Badge>;
    case "cancelled":
      return <Badge className="badge-solid-danger">Cancelled</Badge>;
    default:
      return <Badge className="badge-solid-secondary">{status}</Badge>;
  }
};

// ─── Chart Config ─────────────────────────────────────────────────────────────
const chartConfig = {
  sales: { label: "Sales ($)", color: "hsl(var(--primary))" },
  orders: { label: "Orders", color: "hsl(var(--info))" },
};

const CustomBarTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, sales } = payload[0].payload;
    return (
      <div className="grid min-w-[8rem] w-[50%] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        {/* Sales row */}
        <div className="flex w-full items-center gap-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[hsl(var(--primary))]" />
          <div className="flex flex-1 justify-between">
            <span className="text-muted-foreground">Sales ($)</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {sales.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Qty row */}
        <div className="flex w-full items-center gap-2">
          <div className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-[hsl(var(--info))]" />
          <div className="flex flex-1 justify-between">
            <span className="text-muted-foreground">Qty</span>
            <span className="font-mono font-medium tabular-nums text-foreground">
              {sales}
            </span>
          </div>
        </div>

        {/* Product Name */}
        <div className="mt-1 border-t border-border/50 pt-1 font-medium text-foreground truncate">
          {name}
        </div>
      </div>
    );
  }
  return null;
};



// Custom Y-Axis Tick with truncation + title tooltip
const CustomYAxisTick = ({ x, y, payload }: any) => {
  const maxLength = 12;
  const fullName = payload.value;
  const displayName =
    fullName.length > maxLength ? fullName.slice(0, maxLength) + "…" : fullName;

  return (
    <g transform={`translate(${x},${y})`}>
      <title>{fullName}</title>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor="end"
        fill="currentColor"
        fontSize={12}
        className="fill-muted-foreground"
      >
        {displayName}
      </text>
    </g>
  );
};







// ─── Component ────────────────────────────────────────────────────────────────
export default function VelzonDashboard() {
  const navigate = useNavigate();
  const basePath = useBasePath();
  const dispatch = useDispatch<AppDispatch>();

  const {
    totalProducts,
    totalOrders,
    totalUsers,
    totalRevenue,
    activeCoupons,
    ordersByStatus,
    salesOverview,
    recentOrders,
    topSellingProducts,
    monthlyStats,
    loading,
    error,
  } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // ── Compute monthly % changes ─────────────────────────────────────────────
  const productChange = calcMonthlyChange(
    monthlyStats.products.current,
    monthlyStats.products.previous
  );
  const ordersChange = calcMonthlyChange(
    monthlyStats.orders.current,
    monthlyStats.orders.previous
  );
  const usersChange = calcMonthlyChange(
    monthlyStats.users.current,
    monthlyStats.users.previous
  );
  const revenueChange = calcMonthlyChange(
    monthlyStats.revenue.current,
    monthlyStats.revenue.previous
  );
  const couponsChange = calcMonthlyChange(
    monthlyStats.coupons.current,
    monthlyStats.coupons.previous
  );

  // ── Stats Cards ──────────────────────────────────────────────────────────
  const statsCards = [
    {
      title: "Total Products",
      value: totalProducts,
      icon: Package,
      bgClass: "stat-card-primary",
      ...productChange,
    },
    {
      title: "Total Orders",
      value: totalOrders,
      icon: ShoppingCart,
      bgClass: "stat-card-success",
      ...ordersChange,
    },
    {
      title: "Total Users",
      value: totalUsers,
      icon: Users,
      bgClass: "stat-card-info",
      ...usersChange,
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      bgClass: "stat-card-warning",
      ...revenueChange,
    },
    {
      title: "Active Coupons",
      value: activeCoupons,
      icon: Ticket,
      bgClass: "stat-card-secondary",
      ...couponsChange,
    },
  ];

  // ── Chart Data ───────────────────────────────────────────────────────────
  const orderStatusData = ordersByStatus.map((status) => {
    let color = "";
    switch (status._id) {
      case "delivered": color = "hsl(var(--success))"; break;
      case "pending": color = "hsl(var(--warning))"; break;
      case "cancelled": color = "hsl(var(--destructive))"; break;
      case "processing": color = "hsl(var(--info))"; break;
      default: color = "hsl(var(--secondary))"; break;
    }
    const name = status._id.charAt(0).toUpperCase() + status._id.slice(1);
    return { name, value: status.count, color };
  });

  const salesData = salesOverview.map((item) => ({
    month: new Date(item._id).toLocaleString("default", { month: "short" }),
    sales: item.revenue,
    orders: item.orders,
  }));

  const topProductsData = topSellingProducts.map((product) => ({
    name: product.name,
    sales: product.quantity,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening with your store today.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {statsCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className={`${stat.bgClass} border-0`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-2">{stat.value}</p>

                    {/* ── Trending Badge ── */}
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trending === "up" && (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                      {stat.trending === "down" && (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{stat.change}</span>
                    </div>
                  </div>

                  <div className="opacity-20">
                    <IconComponent className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="sales"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--info))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--info))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Top Selling Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <BarChart data={topProductsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={<CustomYAxisTick />} />
                <ChartTooltip content={<CustomBarTooltip />}
                  cursor={false}
                />
                <Bar
                  dataKey="sales"
                  fill="hsl(var(--primary))"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>


        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => navigate(`${basePath}/orders`)}
            >
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => {
                  const productsList = order.items
                    .map(
                      (item) => `${item.product_id?.name} (x${item.quantity})`
                    )
                    .join(", ");

                  return (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 border border-card-border rounded-lg hover:bg-muted/40 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {order.order_number}
                          </span>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {order.user_id?.name} &lt;{order.user_id?.email}&gt;
                        </div>
                        <div className="text-xs text-muted-foreground truncate max-w-[250px]">
                          {productsList}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          ${order.total_price}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent orders found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}