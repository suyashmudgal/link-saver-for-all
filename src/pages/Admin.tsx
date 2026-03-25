import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Users, Link2, TrendingUp, Trash2, Eye, Ban, UserCheck, Loader2, ArrowLeft, Crown, UserMinus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useIsAdmin } from "@/hooks/use-auth";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";

interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  full_name: string | null;
  is_blocked: boolean;
  last_active_at: string | null;
  item_count: number;
  roles: string[];
}

interface AdminItem {
  id: string;
  title: string;
  type: string;
  content: string;
  created_at: string;
  is_favorite: boolean;
  tags: string[];
}

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const isAdmin = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userItems, setUserItems] = useState<AdminItem[]>([]);
  const [userItemsLoading, setUserItemsLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ type: "user" | "item"; id: string; label: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const adminCall = async (action: string, params: any = {}) => {
    const { data, error } = await supabase.functions.invoke("admin", {
      body: { action, ...params },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAdmin) {
      navigate("/dashboard");
      return;
    }
    loadData();
  }, [isAdmin, authLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminCall("list_users"),
        adminCall("platform_stats"),
      ]);
      setUsers(usersRes.users || []);
      setPlatformStats(statsRes);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const loadUserItems = async (userId: string) => {
    setUserItemsLoading(true);
    try {
      const data = await adminCall("get_user_items", { userId });
      setUserItems(data.items || []);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUserItemsLoading(false);
    }
  };

  const handleViewUser = (u: AdminUser) => {
    setSelectedUser(u);
    loadUserItems(u.id);
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog || deleteDialog.type !== "user") return;
    setActionLoading(true);
    try {
      await adminCall("delete_user", { userId: deleteDialog.id });
      toast({ title: "Deleted", description: "User has been deleted." });
      setUsers(prev => prev.filter(u => u.id !== deleteDialog.id));
      setSelectedUser(null);
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setDeleteDialog(null);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteDialog || deleteDialog.type !== "item") return;
    setActionLoading(true);
    try {
      await adminCall("delete_item", { itemId: deleteDialog.id });
      toast({ title: "Deleted", description: "Item has been deleted." });
      setUserItems(prev => prev.filter(i => i.id !== deleteDialog.id));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setActionLoading(false);
      setDeleteDialog(null);
    }
  };

  const handleBlockUser = async (userId: string, block: boolean) => {
    try {
      await adminCall("block_user", { userId, blocked: block });
      toast({ title: block ? "Blocked" : "Unblocked", description: `User has been ${block ? "blocked" : "unblocked"}.` });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_blocked: block } : u));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handlePromoteUser = async (userId: string) => {
    try {
      await adminCall("promote_user", { userId, role: "admin" });
      toast({ title: "Promoted", description: "User has been promoted to admin." });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: [...u.roles, "admin"] } : u));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDemoteUser = async (userId: string) => {
    try {
      await adminCall("demote_user", { userId, role: "admin" });
      toast({ title: "Demoted", description: "Admin privileges removed." });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, roles: u.roles.filter(r => r !== "admin") } : u));
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q);
  });

  if (authLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) return null;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-sm text-muted-foreground">Platform management & user oversight</p>
          </div>
        </div>

        {/* Platform Stats */}
        {platformStats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Users", value: platformStats.totalUsers, icon: Users, color: "text-primary" },
              { label: "Total Items", value: platformStats.totalItems, icon: Link2, color: "text-blue-500" },
              { label: "Active Users (7d)", value: platformStats.activeUsers, icon: TrendingUp, color: "text-green-500" },
              { label: "Total Favorites", value: platformStats.totalFavorites, icon: TrendingUp, color: "text-amber-500" },
            ].map(stat => (
              <Card key={stat.label} className="p-5 bg-card border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
              </Card>
            ))}
          </div>
        )}

        {/* User Management */}
        <Card className="bg-card border-border/50">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">User Management</h2>
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="max-w-xs h-9"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-center">Role</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(u => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-center">{u.item_count}</TableCell>
                    <TableCell className="text-center">
                      {u.roles.includes("admin") ? (
                        <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Admin</Badge>
                      ) : (
                        <Badge variant="secondary">User</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {u.is_blocked ? (
                        <Badge variant="destructive">Blocked</Badge>
                      ) : (
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewUser(u)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        {u.id !== user?.id && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleBlockUser(u.id, !u.is_blocked)}>
                              {u.is_blocked ? <UserCheck className="w-4 h-4 text-green-500" /> : <Ban className="w-4 h-4 text-amber-500" />}
                            </Button>
                            {u.roles.includes("admin") ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDemoteUser(u.id)}>
                                <UserMinus className="w-4 h-4 text-muted-foreground" />
                              </Button>
                            ) : (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handlePromoteUser(u.id)}>
                                <Crown className="w-4 h-4 text-amber-500" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteDialog({ type: "user", id: u.id, label: u.email || "" })}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => setSelectedUser(null)} />
              {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium truncate">{selectedUser?.email}</p>
              </Card>
              <Card className="p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground">Total Items</p>
                <p className="text-sm font-medium">{selectedUser?.item_count}</p>
              </Card>
              <Card className="p-4 bg-muted/30">
                <p className="text-xs text-muted-foreground">Last Active</p>
                <p className="text-sm font-medium">
                  {selectedUser?.last_active_at ? new Date(selectedUser.last_active_at).toLocaleDateString() : "—"}
                </p>
              </Card>
            </div>

            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Saved Items</h3>
            {userItemsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : userItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium truncate max-w-[200px]">{item.title}</TableCell>
                      <TableCell><Badge variant="outline" className="capitalize text-xs">{item.type}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => setDeleteDialog({ type: "item", id: item.id, label: item.title })}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">No items saved by this user.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog?.type === "user" ? "User" : "Item"}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteDialog?.type === "user" ? "this user and all their data" : `"${deleteDialog?.label}"`}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              disabled={actionLoading}
              onClick={() => {
                if (deleteDialog?.type === "user") handleDeleteUser();
                else handleDeleteItem();
              }}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default Admin;
