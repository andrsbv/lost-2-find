import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface NotificationMessage {
  id: string;
  item_report_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  item_reports?: {
    name: string;
  };
  sender?: {
    full_name: string;
    email: string;
  };
}

export const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState<NotificationMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadMessages();
      subscribeToMessages();
    }
  }, [user]);

  const fetchUnreadMessages = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("messages")
      .select(`
        id,
        item_report_id,
        sender_id,
        content,
        created_at,
        is_read,
        item_reports (name)
      `)
      .eq("receiver_id", user.id)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(10);

    if (data) {
      // Fetch sender profiles
      const messagesWithSenders = await Promise.all(
        data.map(async (msg) => {
          const { data: senderData } = await supabase
            .from("profiles")
            .select("full_name, email")
            .eq("id", msg.sender_id)
            .maybeSingle();

          return {
            ...msg,
            sender: senderData,
          };
        })
      );
      setUnreadMessages(messagesWithSenders);
    }
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel("notifications-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadMessages();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${user.id}`,
        },
        () => {
          fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleNotificationClick = async (msg: NotificationMessage) => {
    // Mark as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("id", msg.id);

    setIsOpen(false);
    navigate("/profile", { state: { activeTab: "messages" } });
  };

  const markAllAsRead = async () => {
    if (!user || unreadMessages.length === 0) return;

    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("receiver_id", user.id)
      .eq("is_read", false);

    setUnreadMessages([]);
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return format(date, "d MMM", { locale: es });
  };

  if (!user) return null;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadMessages.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadMessages.length > 9 ? "9+" : unreadMessages.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notificaciones</h4>
          {unreadMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={markAllAsRead}
            >
              Marcar todo como leído
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[300px]">
          {unreadMessages.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No tienes mensajes nuevos
            </div>
          ) : (
            <div className="divide-y">
              {unreadMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleNotificationClick(msg)}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {msg.sender?.full_name || msg.sender?.email || "Usuario"}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {getTimeAgo(msg.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {msg.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Re: {msg.item_reports?.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {unreadMessages.length > 0 && (
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm"
              onClick={() => {
                setIsOpen(false);
                navigate("/profile", { state: { activeTab: "messages" } });
              }}
            >
              Ver todos los mensajes
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
