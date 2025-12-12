import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  User, Mail, Phone, MapPin, Calendar, MessageCircle, 
  Package, Search, CheckCircle, Clock, Loader2, ArrowRight,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

interface ItemReport {
  id: string;
  name: string;
  description: string | null;
  category: string;
  location: string;
  date: string;
  type: string;
  status: string;
  reward_amount: number | null;
  created_at: string;
}

interface Message {
  id: string;
  item_report_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  item_reports?: {
    name: string;
    type: string;
  };
  sender?: {
    full_name: string;
    email: string;
  };
}

const Profile = () => {
  const { user, profile, isLoading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [myReports, setMyReports] = useState<ItemReport[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("reports");

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    
    if (user) {
      fetchData();
      subscribeToMessages();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);

    // Fetch user's reports
    const { data: reports } = await supabase
      .from('item_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (reports) {
      setMyReports(reports);
    }

    // Fetch messages (received and sent)
    const { data: msgs } = await supabase
      .from('messages')
      .select(`
        *,
        item_reports (name, type)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false });

    if (msgs) {
      // Fetch sender profiles for each message
      const messagesWithProfiles = await Promise.all(
        msgs.map(async (msg) => {
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', msg.sender_id)
            .maybeSingle();
          
          return {
            ...msg,
            sender: senderProfile
          };
        })
      );
      setMessages(messagesWithProfiles);
    }

    setIsLoading(false);
  };

  const subscribeToMessages = () => {
    if (!user) return;

    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (messageId: string) => {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
    
    fetchData();
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      electronics: "Electrónicos",
      accessories: "Accesorios",
      documents: "Documentos/Llaves",
      supplies: "Útiles Escolares",
      clothing: "Ropa/Calzado",
      sports: "Deportivos",
      other: "Otros",
    };
    return labels[category] || category;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Hace menos de 1 hora";
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return format(date, "d MMM", { locale: es });
  };

  const unreadCount = messages.filter(m => m.receiver_id === user?.id && !m.is_read).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold text-foreground">{profile?.full_name || "Usuario"}</h2>
                <p className="text-sm text-muted-foreground mb-4">{profile?.email}</p>
                
                <Separator className="my-4" />
                
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{profile?.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Package className="h-4 w-4" />
                    <span>{myReports.length} reportes</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <Button variant="outline" className="w-full" onClick={() => signOut()}>
                  Cerrar Sesión
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <AnnouncementBanner
              message="Desde aquí puedes gestionar tus reportes y mensajes. ¡No olvides marcar como recuperado cuando encuentres tu objeto!"
              variant="info"
              dismissible
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="reports" className="gap-2">
                  <Package className="h-4 w-4" />
                  Mis Reportes ({myReports.length})
                </TabsTrigger>
                <TabsTrigger value="messages" className="gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Mensajes
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="reports" className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : myReports.length > 0 ? (
                  <div className="grid gap-4">
                    {myReports.map((report) => (
                      <Card 
                        key={report.id} 
                        className="cursor-pointer hover:border-primary transition-colors"
                        onClick={() => navigate(`/item/${report.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-foreground">{report.name}</h3>
                                <Badge variant={report.type === "lost" ? "warning" : "success"}>
                                  {report.type === "lost" ? "Perdido" : "Encontrado"}
                                </Badge>
                                <Badge variant="outline">
                                  {report.status === "active" ? "Activo" : "Recuperado"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(report.date), "d MMM yyyy", { locale: es })}
                                </span>
                                <span>{getCategoryLabel(report.category)}</span>
                                {report.reward_amount && report.reward_amount > 0 && (
                                  <span className="text-success font-medium">
                                    ${report.reward_amount} recompensa
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No tienes reportes</h3>
                      <p className="text-muted-foreground mb-4">
                        Cuando reportes un objeto perdido o encontrado, aparecerá aquí
                      </p>
                      <Button onClick={() => navigate("/report")}>
                        Crear Reporte
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="messages" className="mt-6">
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="grid gap-4">
                    {messages.map((msg) => {
                      const isReceived = msg.receiver_id === user?.id;
                      return (
                        <Card 
                          key={msg.id} 
                          className={`cursor-pointer transition-colors ${!msg.is_read && isReceived ? 'border-primary bg-primary/5' : 'hover:border-primary'}`}
                          onClick={() => {
                            if (isReceived && !msg.is_read) {
                              markAsRead(msg.id);
                            }
                            navigate(`/item/${msg.item_report_id}`);
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant={isReceived ? "default" : "outline"}>
                                    {isReceived ? "Recibido" : "Enviado"}
                                  </Badge>
                                  {!msg.is_read && isReceived && (
                                    <Badge variant="destructive" className="text-xs">Nuevo</Badge>
                                  )}
                                  <span className="text-xs text-muted-foreground">
                                    {getTimeAgo(msg.created_at)}
                                  </span>
                                </div>
                                <div className="text-sm">
                                  <span className="text-muted-foreground">
                                    {isReceived ? "De: " : "Para: "}
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {isReceived ? msg.sender?.full_name || msg.sender?.email : "Usuario"}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {msg.content}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Package className="h-3 w-3" />
                                  Re: {msg.item_reports?.name}
                                  <Badge variant="outline" className="ml-1 text-xs">
                                    {msg.item_reports?.type === "lost" ? "Perdido" : "Encontrado"}
                                  </Badge>
                                </div>
                              </div>
                              <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No tienes mensajes</h3>
                      <p className="text-muted-foreground">
                        Cuando alguien encuentre tu objeto o reclame uno que encontraste, recibirás mensajes aquí
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;