import * as React from "react";
import { Search, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { logout } from "@/features/auth/authSlice";


const getBreadcrumbs = (pathname: string) => {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [{ label: "Dashboard", href: "/" }];

  const routeMap: Record<string, string> = {
    products: "Products",
    categories: "Categories",
    brands: "Brands",
    types: "Product Types",
    fabrics: "Fabrics",
    "product-labels": "Product Labels",
    discounts: "Discounts",
    coupons: "Coupons",
    orders: "Orders",
    payments: "Payments",
    users: "Users",
    "customer-reviews": "Customer Reviews",
    "contact-messages": "Contact Messages",
    settings: "Settings",
    add: "Add New",
    edit: "Edit",
  };

  let currentPath = "";
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: routeMap[segment] || segment,
      href: currentPath,
    });
  });

  return breadcrumbs;
};

export function AdminHeader() {
  const location = useLocation();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <div className="border-b border-header-border bg-header">
      {/* Top Header */}
      <header className="flex h-16 items-center gap-4 px-6">
        <SidebarTrigger />

        <div className="flex-1 flex items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products, orders, customers..."
              className="pl-10 bg-input border-input-border"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="/placeholder-avatar.jpg" alt={user?.name || "Admin"} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name || "Admin User"}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || "admin@example.com"}</p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem className="gap-2 text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Breadcrumbs */}
      <div className="px-6 py-3 bg-muted">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
}
