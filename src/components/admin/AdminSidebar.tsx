import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Settings, 
  FileText, 
  Users, 
  ShoppingCart,
  Component,
  Image,
  MessageSquare,
  Filter
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

const mainNavItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
];

const productNavItems = [
  { title: 'All Products', url: '/admin/products', icon: Package },
  { title: 'Categories', url: '/admin/categories', icon: Filter },
  { title: 'Components', url: '/admin/components', icon: Component },
];

const contentNavItems = [
  { title: 'News Articles', url: '/admin/news', icon: FileText },
  { title: 'Media Library', url: '/admin/media', icon: Image },
];

const crmNavItems = [
  { title: 'Customer Inquiries', url: '/admin/inquiries', icon: MessageSquare },
];

const settingsNavItems = [
  { title: 'Settings', url: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === 'collapsed';

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === path;
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-accent hover:text-accent-foreground";

  const NavSection = ({ 
    title, 
    items 
  }: { 
    title: string; 
    items: typeof mainNavItems; 
  }) => (
    <SidebarGroup>
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink 
                  to={item.url} 
                  className={getNavCls(item.url)}
                  end={item.url === '/admin'}
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-foreground">
            Admin Panel
          </h2>
        )}
        <SidebarTrigger />
      </div>

      <SidebarContent className="p-2">
        <NavSection title="Main" items={mainNavItems} />
        <NavSection title="Products" items={productNavItems} />
        <NavSection title="Content" items={contentNavItems} />
        <NavSection title="CRM" items={crmNavItems} />
        <NavSection title="System" items={settingsNavItems} />
      </SidebarContent>
    </Sidebar>
  );
}