import {
  LayoutDashboard, Link2, Star, BarChart3, Shield, Target,
  LogOut, Share2, Settings, History
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
    { title: "Favorites", url: "/favorites", icon: Star },
    { title: "Insights", url: "/insights", icon: BarChart3 },
    { title: "Shared", url: "/shared", icon: Share2 },
    { title: "Target", url: "/target", icon: Target },
    { title: "Target History", url: "/target-history", icon: History },
    { title: "Settings", url: "/settings", icon: Settings },
  ];
  if (isAdmin) navItems.push({ title: "Admin", url: "/admin", icon: Shield });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    queryClient.clear();
    navigate("/", { replace: true });
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/30 bg-sidebar/80 backdrop-blur-2xl">
      <SidebarHeader className="p-4 border-b border-border/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0 shadow-lg shadow-primary/10">
            <img src="/logo.png" alt="Info Trunk" width={28} height={28} className="rounded-lg" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-serif-display text-lg leading-none tracking-tight">Info Trunk</h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-[0.3em] mt-1">Knowledge Vault</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map(item => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.url)}
                      isActive={isActive}
                      tooltip={item.title}
                      className={`relative transition-all duration-300 rounded-xl ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium border border-primary/20 shadow-[0_0_20px_-8px_hsl(var(--primary))]"
                          : "border border-transparent hover:bg-muted/40 text-muted-foreground hover:text-foreground hover:translate-x-0.5"
                      }`}
                    >
                      {isActive && !collapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-full bg-primary" />
                      )}
                      <item.icon className="w-[18px] h-[18px]" />
                      <span className="tracking-wide">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive rounded-xl">
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
