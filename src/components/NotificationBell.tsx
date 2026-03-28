import { useState } from "react";
import { Bell, Check, CheckCheck, AlertTriangle, Lock, Brain, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotifications, useUnreadCount, useMarkNotificationRead, useMarkAllRead, Notification } from "@/hooks/use-notifications";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    case "capsule": return <Lock className="w-4 h-4 text-primary" />;
    case "recall": return <Brain className="w-4 h-4 text-green-500" />;
    default: return <Info className="w-4 h-4 text-blue-500" />;
  }
};

const formatTime = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const unreadCount = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const handleMarkRead = (n: Notification) => {
    if (!n.is_read) markRead.mutate(n.id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-[10px] bg-destructive text-destructive-foreground border-0 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="w-3 h-3" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={`w-full text-left p-3 hover:bg-muted/50 transition-colors flex gap-3 ${
                    !n.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="shrink-0 mt-0.5">{getNotificationIcon(n.type)}</div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${!n.is_read ? "font-medium" : ""}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.created_at)}</p>
                  </div>
                  {!n.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
