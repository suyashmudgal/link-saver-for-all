import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Mail, Bell, Shield, Save, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100, "Name too long"),
  avatarUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [fullName, setFullName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [digestOptOut, setDigestOptOut] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, digest_opt_out")
        .eq("id", user.id)
        .single();
      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
        setDigestOptOut(data.digest_opt_out || false);
      }
      setLoadingProfile(false);
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const validation = profileSchema.safeParse({
      fullName,
      avatarUrl: avatarUrl || undefined,
    });
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error.errors[0].message, variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim(),
        avatar_url: avatarUrl.trim() || null,
        digest_opt_out: digestOptOut,
      })
      .eq("id", user.id);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
    } else {
      toast({ title: "Profile Updated", description: "Your settings have been saved." });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
    setSaving(false);
  };

  if (authLoading || loadingProfile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  const initials = fullName
    ? fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground mb-8">Manage your profile and preferences</p>

          {/* Profile Section */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Profile</h2>
            </div>

            <div className="flex items-center gap-5 mb-6">
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-border"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{fullName || "No name set"}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your name"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">Avatar URL</Label>
                <Input
                  id="avatarUrl"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                <p className="text-xs text-muted-foreground">Paste a direct image link for your profile picture</p>
              </div>
            </div>
          </Card>

          {/* Preferences Section */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Preferences</h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Weekly Digest Email</p>
                <p className="text-xs text-muted-foreground">
                  Receive AI-powered summaries of your unread links every Monday
                </p>
              </div>
              <Switch
                checked={!digestOptOut}
                onCheckedChange={(checked) => setDigestOptOut(!checked)}
              />
            </div>
          </Card>

          {/* Account Section */}
          <Card className="p-6 mb-8">
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Account</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Email</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Account Created</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
