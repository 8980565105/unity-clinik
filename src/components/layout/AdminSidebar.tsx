import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  Shirt,
  Tags,
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


const adminSections = [
  {
    label: "Main",
    items: [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "Catalog",
    items: [
      { title: "Categories", url: "/categories", icon: FolderTree },
      { title: "SubCategories", url: "/subcategories", icon: FolderTree },
      { title: "Brands", url: "/brands", icon: Tag },
      { title: "Types", url: "/types", icon: Shirt },
      { title: "Product Labels", url: "/product-labels", icon: Tags },
      { title: "Products", url: "/products", icon: Package },

    ],
  },
  {
    label: "Promotions",
    items: [
      { title: "Coupons", url: "/coupons", icon: Ticket },
    ],
  },
  {
    label: "Sales",
    items: [
      { title: "Orders", url: "/orders", icon: ShoppingCart },
      { title: "payment", url: "/payments", icon: CreditCard },
      { title: "Warehouse", url: "/warehouse", icon: Warehouse },
    ],
  },
  {
    label: "Customers",
    items: [
      { title: "Users", url: "/users", icon: Users },
      { title: "Customer Reviews", url: "/customer-reviews", icon: Star },
      { title: "Wishlist", url: "/wishlists", icon: Heart },
      { title: "Cart", url: "/carts", icon: ShoppingBasket },
    ],
  },
  {
    label: "sapret page",
    items: [
      // { title: "Faqs", url: "/faqs", icon: Layers },
      { title: "Aboout", url: "/about", icon: Layers },
      { title: "Result", url: "/results", icon: Layers },
      { title: "sliders", url: "/slider", icon: Columns },
    ]
  },

  {
    label: "E-Mail",
    items: [
      { title: "Email", url: "/emails", icon: Navigation }
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
      { title: "System Settings", url: "/system_settings", icon: Settings },

    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);

  const isCollapsed = state === "collapsed";

  const isActive = (url: string) => {
    return (
      location.pathname === url ||
      location.pathname.startsWith(url + "/")
    );
  };

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

  
  const sections = adminSections;
  const panelLabel = "Admin Dashboard";
 
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
                Unity clinic
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


