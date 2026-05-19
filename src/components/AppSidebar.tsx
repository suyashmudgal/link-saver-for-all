import {
  LayoutDashboard, Link2, Star, BarChart3, Shield, Target,
  LogOut, Share2, BookOpen, Settings, History
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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <img src="/logo.png" alt="Info Trunk" width={28} height={28} className="rounded-lg" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-base font-bold tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>Info Trunk</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Knowledge Vault</p>
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
                      className={`transition-all duration-200 rounded-xl ${
                        isActive
                          ? "bg-primary/10 text-primary font-medium shadow-sm"
                          : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-[18px] h-[18px]" />
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
        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive rounded-xl">
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
