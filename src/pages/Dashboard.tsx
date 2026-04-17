import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const statsCards = [
  {
    title: "Total Products",
    value: "2,847",
    change: "+12.5%",
    trending: "up",
    icon: Package,
    description: "Active products in catalog",
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    trending: "up",
    icon: ShoppingCart,
    description: "Orders this month",
  },
  {
    title: "Total Users",
    value: "8,945",
    change: "+15.3%",
    trending: "up",
    icon: Users,
    description: "Registered customers",
  },
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "-2.4%",
    trending: "down",
    icon: DollarSign,
    description: "Revenue this month",
  },
];

const recentOrders = [
  { id: "#1234", customer: "John Doe", amount: "$85.00", status: "completed" },
  { id: "#1235", customer: "Jane Smith", amount: "$120.50", status: "processing" },
  { id: "#1236", customer: "Mike Johnson", amount: "$67.99", status: "shipped" },
  { id: "#1237", customer: "Sarah Wilson", amount: "$199.99", status: "pending" },
];

const topProducts = [
  { name: "Blue Denim Jacket", sales: 245, revenue: "$12,250" },
  { name: "White Cotton T-Shirt", sales: 189, revenue: "$3,780" },
  { name: "Black Leather Boots", sales: 156, revenue: "$15,600" },
  { name: "Red Summer Dress", sales: 134, revenue: "$8,040" },
];

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "completed":
      return "default";
    case "processing":
      return "secondary";
    case "shipped":
      return "outline";
    case "pending":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function Dashboard() {
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
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Quick Actions
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <IconComponent className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-2 text-sm">
                  {stat.trending === "up" ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span
                    className={
                      stat.trending === "up" ? "text-success" : "text-destructive"
                    }
                  >
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-card-border pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <div className="font-medium">{order.id}</div>
                    <div className="text-sm text-muted-foreground">{order.customer}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{order.amount}</div>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="mt-1">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Top Selling Products</CardTitle>
            <Button variant="ghost" size="sm" className="gap-2">
              <Eye className="h-4 w-4" />
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between border-b border-card-border pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.sales} sales</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{product.revenue}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}