import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Shirt,
  Palette,
  Tags,
  Droplet,
  Ruler,
  Percent,
  Ticket,
  ShoppingCart,
  CreditCard,
  Users,
  Star,
  Heart,
  ShoppingBasket,
  Layers,
  Navigation,
  Columns,
  MessageSquare,
  Settings,
  ChevronDown,
  Warehouse,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RootState } from "@/store";
import { Layer } from "recharts";


const adminSections = [
  {
    label: "Main",
    items: [{ title: "Dashboard", url: "/", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { title: "Categories", url: "/categories", icon: FolderTree },
      { title: "SubCategories", url: "/subcategories", icon: FolderTree },

      { title: "Brands", url: "/brands", icon: Tag },
      { title: "Types", url: "/types", icon: Shirt },
      { title: "Fabrics", url: "/fabrics", icon: Palette },
      { title: "Product Labels", url: "/product-labels", icon: Tags },
      { title: "Colors", url: "/colors", icon: Droplet },
      { title: "Sizes", url: "/sizes", icon: Ruler },
      { title: "Products", url: "/products", icon: Package },
    ],
  },
  {
    label: "Promotions",
    items: [
      { title: "Discounts", url: "/discounts", icon: Percent },
      { title: "Coupons", url: "/coupons", icon: Ticket },

    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/orders", icon: ShoppingCart },
      { title: "Payments", url: "/payments", icon: CreditCard },
      { title: "Warehouse", url: "/warehouse", icon: Warehouse },
    ],
  },
  {
    label: "Customers",
    items: [
      { title: "Store", url: "/stores", icon: Users },
      { title: "Users", url: "/users", icon: Users },
      { title: "Customer Reviews", url: "/customer-reviews", icon: Star },
      { title: "Wishlist", url: "/wishlists", icon: Heart },
      { title: "Cart", url: "/carts", icon: ShoppingBasket },
    ],
  },
  {
    label: "Pages",
    items: [
      { title: "Faqs", url: "/faqs", icon: Columns },
    ]
  },
  {
    label: "System",
    items: [
      { title: "Pages", url: "/pages", icon: Layers },
      { title: "Navbar", url: "/navbar", icon: Navigation },
      { title: "Footer", url: "/footer", icon: Columns },
      { title: "Contact Messages", url: "/contact-messages", icon: MessageSquare },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

const storeOwnerSections = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Categories", url: "/store_owner/categories", icon: FolderTree },
      { title: "SubCategories", url: "/store_owner/subcategories", icon: FolderTree },
      { title: "Brands", url: "/store_owner/brands", icon: Tag },
      { title: "Types", url: "/store_owner/types", icon: Shirt },
      { title: "Fabrics", url: "/store_owner/fabrics", icon: Palette },
      { title: "Product Labels", url: "/store_owner/product-labels", icon: Tags },
      { title: "Colors", url: "/store_owner/colors", icon: Droplet },
      { title: "Sizes", url: "/store_owner/sizes", icon: Ruler },
      { title: "Products", url: "/store_owner/products", icon: Package },

    ],
  },
  {
    label: "Promotions",
    items: [
      { title: "Discounts", url: "/store_owner/discounts", icon: Percent },
      { title: "Coupons", url: "/store_owner/coupons", icon: Ticket },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/store_owner/orders", icon: ShoppingCart },
      { title: "payment", url: "/store_owner/payments", icon: CreditCard },
      { title: "Warehouse", url: "/store_owner/warehouse", icon: Warehouse },
    ],
  },
  {
    label: "Customers",
    items: [
      // { title: "Store", url: "/store_owner/stores", icon: Users },
      { title: "Users", url: "/store_owner/users", icon: Users },
      { title: "Customer Reviews", url: "/store_owner/customer-reviews", icon: Star },
      { title: "Wishlist", url: "/store_owner/wishlists", icon: Heart },
      { title: "Cart", url: "/store_owner/carts", icon: ShoppingBasket },
    ],
  },
  {
    label: "Pages",
    items: [
      { title: "Faqs", url: "/store_owner/faqs", icon: Columns },

    ]
  },
  {
    label: "System",
    items: [
      { title: "Pages", url: "/store_owner/pages", icon: Layers },
      { title: "Navbar", url: "/store_owner/navbar", icon: Navigation },
      { title: "Footer", url: "/store_owner/footer", icon: Columns },
      { title: "Contact Messages", url: "/store_owner/contact-messages", icon: MessageSquare },
      { title: "Settings", url: "/store_owner/settings", icon: Settings },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const isCollapsed = state === "collapsed";

  const isActive = (url: string) =>
    url === "/" || url === "/store_owner"
      ? location.pathname === url
      : location.pathname.startsWith(url);

  const isGroupActive = (items: { url: string }[]) =>
    items.some((item) => isActive(item.url));

  const getNavClass = (url: string) => {
    const active = isActive(url);
    return [
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
      active
        ? "bg-sidebar-active text-sidebar-active-foreground shadow-sm"
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    ].join(" ");
  };

  const sections =
    user?.role === "store_owner" ? storeOwnerSections : adminSections;

  const panelLabel =
    user?.role === "store_owner" ? "Store Dashboard" : "Admin Dashboard";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Layers className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">
                Mycra
              </h2>
              <p className="text-xs text-muted-foreground">{panelLabel}</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {sections.map((section) => (
          <Collapsible
            key={section.label}
            defaultOpen={isGroupActive(section.items)}
          >
            <SidebarGroup>
              {!isCollapsed && (
                <CollapsibleTrigger className="flex w-full items-center justify-between">
                  <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {section.label}
                  </SidebarGroupLabel>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            className={getNavClass(item.url)}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {!isCollapsed && <span>{item.title}</span>}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}