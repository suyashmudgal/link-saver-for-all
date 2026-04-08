import {
  LayoutDashboard, Link2, Star, BarChart3, Shield, Target,
  LogOut, ChevronLeft, Share2, BookOpen, Settings
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";

interface AppSidebarProps { userId?: string; }

const AppSidebar = ({ userId }: AppSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const isAdmin = useIsAdmin(userId);
  const queryClient = useQueryClient();

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "All Links", url: "/links", icon: Link2 },
    { title: "Read Queue", url: "/read-queue", icon: BookOpen },
    { title: "Favorites", url: "/favorites", icon: Star },
    { title: "Insights", url: "/insights", icon: BarChart3 },
    { title: "Shared", url: "/shared", icon: Share2 },
    { title: "Target", url: "/target", icon: Target },
    { title: "Settings", url: "/settings", icon: Settings },
  ];
  if (isAdmin) navItems.push({ title: "Admin", url: "/admin", icon: Shield });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/40 bg-sidebar-background/70 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Info Trunk" width={36} height={36} className="rounded-xl shrink-0" />
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Info Trunk</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Link Vault</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map(item => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={isActive}
                      tooltip={item.title}
                      className={`transition-all duration-200 ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                          : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground">
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
