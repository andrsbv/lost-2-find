import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, MapPin, Tag, User, Mail, Phone, ArrowLeft, CheckCircle, AlertCircle, Share2, Flag, DollarSign, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  image_url: string | null;
  reward_amount: number | null;
  contact_info: string | null;
  created_at: string;
  user_id: string;
}

interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
}

const ItemDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [item, setItem] = useState<ItemReport | null>(null);
  const [owner, setOwner] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchItem();
    }
  }, [id]);

  const fetchItem = async () => {
    setIsLoading(true);
    
    const { data: itemData, error: itemError } = await supabase
      .from('item_reports')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (itemError || !itemData) {
      setIsLoading(false);
      return;
    }

    setItem(itemData);

    // Fetch owner profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', itemData.user_id)
      .maybeSingle();

    if (profileData) {
      setOwner(profileData);
    }

    setIsLoading(false);
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

  const getLocationLabel = (location: string) => {
    const labels: Record<string, string> = {
      biblioteca: "Biblioteca Central",
      comedor: "Comedor Universitario",
      canchas: "Canchas Deportivas",
      ing: "Facultad de Ingeniería",
      admin: "Edificio Administrativo",
      lab: "Laboratorios",
      auditorio: "Auditorio",
      estacionamiento: "Estacionamiento",
      otro: "Otro",
    };
    return labels[location] || location;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Hace menos de 1 hora";
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return format(date, "d MMM yyyy", { locale: es });
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión para enviar mensajes");
      navigate("/login");
      return;
    }

    if (!item || !message.trim()) return;

    setIsSendingMessage(true);

    try {
      const { error } = await supabase.from('messages').insert({
        item_report_id: item.id,
        sender_id: user.id,
        receiver_id: item.user_id,
        content: message.trim(),
      });

      if (error) throw error;

      toast.success("¡Mensaje enviado!", {
        description: "El dueño ha sido notificado. Te contactará pronto."
      });
      setMessage("");
      setDialogOpen(false);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error("Error al enviar mensaje", {
        description: error.message || "Intenta nuevamente"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
      </div>
    );
  }

  // If item not found, show error
  if (!item) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">Objeto no encontrado</h1>
          <p className="text-muted-foreground mb-6">El objeto que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    lost: {
      label: "Perdido",
      variant: "warning" as const,
      icon: <AlertCircle className="h-5 w-5" />,
      bgClass: "bg-warning/20",
      textClass: "text-warning",
    },
    found: {
      label: "Encontrado",
      variant: "success" as const,
      icon: <CheckCircle className="h-5 w-5" />,
      bgClass: "bg-success/20",
      textClass: "text-success",
    },
    returned: {
      label: "Entregado",
      variant: "default" as const,
      icon: <CheckCircle className="h-5 w-5" />,
      bgClass: "bg-muted",
      textClass: "text-foreground",
    },
  };

  const currentStatus = statusConfig[item.type as keyof typeof statusConfig] || statusConfig.lost;
  const isOwner = user?.id === item.user_id;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        <Button
          variant="ghost"
          className="mb-6 gap-2"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la búsqueda
        </Button>

        <AnnouncementBanner
          message="Recuerda verificar la identidad del dueño antes de entregar cualquier objeto"
          variant="warning"
          dismissible
        />

        <div className="grid gap-8 lg:grid-cols-3 mt-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {item.image_url && (
              <Card className="overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-full h-[400px] object-cover"
                />
              </Card>
            )}

            {/* Details */}
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h1 className="text-3xl font-bold text-foreground">{item.name}</h1>
                    <Badge variant={currentStatus.variant} className="flex items-center gap-1">
                      {currentStatus.icon}
                      {currentStatus.label}
                    </Badge>
                  </div>
                  
                  {item.reward_amount && item.reward_amount > 0 && (
                    <div className="flex items-center gap-2 text-success font-semibold text-lg">
                      <DollarSign className="h-5 w-5" />
                      Recompensa: ${item.reward_amount}
                    </div>
                  )}
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {item.description || "Sin descripción disponible"}
                  </p>
                </div>

                <Separator />

                {/* Info Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 ${currentStatus.bgClass}`}>
                      <Tag className={`h-5 w-5 ${currentStatus.textClass}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                      <p className="text-base font-semibold text-foreground">{getCategoryLabel(item.category)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-info/20 p-2">
                      <MapPin className="h-5 w-5 text-info" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                      <p className="text-base font-semibold text-foreground">{getLocationLabel(item.location)}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Clock className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                      <p className="text-base font-semibold text-foreground">
                        {format(new Date(item.date), "d MMM yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Reportado por</p>
                      <p className="text-base font-semibold text-foreground">
                        {owner?.full_name || "Usuario"}
                      </p>
                      <p className="text-sm text-muted-foreground">{getTimeAgo(item.created_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline/Status */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Estado del Reporte
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-success p-2">
                        <CheckCircle className="h-4 w-4 text-success-foreground" />
                      </div>
                      <div className="h-full w-0.5 bg-border mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-foreground">Reporte Creado</p>
                      <p className="text-sm text-muted-foreground">{getTimeAgo(item.created_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-warning p-2">
                        <Clock className="h-4 w-4 text-warning-foreground" />
                      </div>
                      <div className="h-full w-0.5 bg-border mt-2"></div>
                    </div>
                    <div className="pb-8">
                      <p className="font-semibold text-foreground">Búsqueda Activa</p>
                      <p className="text-sm text-muted-foreground">
                        Este reporte está activo
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="rounded-full bg-muted p-2">
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-muted-foreground">Pendiente de Entrega</p>
                      <p className="text-sm text-muted-foreground">Esperando coincidencias</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Información de Contacto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${owner?.email}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {owner?.email || "No disponible"}
                        </a>
                      </div>
                    </div>
                    {(owner?.phone || item.contact_info) && (
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                          <a
                            href={`tel:${owner?.phone || item.contact_info}`}
                            className="text-sm text-primary hover:underline"
                          >
                            {owner?.phone || item.contact_info}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  {!isOwner && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" size="lg" onClick={() => {
                          if (!user) {
                            toast.error("Inicia sesión para contactar al dueño");
                            navigate("/login");
                            return;
                          }
                        }}>
                          <MessageCircle className="mr-2 h-4 w-4" />
                          {item.type === "lost" ? "Lo Encontré" : "Es Mío"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {item.type === "lost" ? "¡Encontraste este objeto!" : "Reclamar este objeto"}
                          </DialogTitle>
                          <DialogDescription>
                            {item.type === "lost" 
                              ? `Confirma que encontraste "${item.name}" para notificar al dueño.`
                              : "Describe características únicas del objeto para verificar que eres el dueño."
                            }
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="message">
                              {item.type === "lost" ? "Mensaje para el dueño" : "Descripción detallada"}
                            </Label>
                            <Textarea 
                              id="message"
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder={item.type === "lost"
                                ? "Ej: Lo encontré en la cafetería, puedo entregarlo mañana..."
                                : "Describe marcas, contenido, o detalles que solo el dueño conocería..."
                              }
                              rows={4}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            onClick={handleSendMessage}
                            disabled={isSendingMessage || !message.trim()}
                          >
                            {isSendingMessage ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Enviando...
                              </>
                            ) : (
                              "Enviar Mensaje"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {isOwner && (
                    <Button variant="outline" className="w-full" size="lg" onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      Ver Mis Mensajes
                    </Button>
                  )}
                  
                  <p className="text-xs text-center text-muted-foreground">
                    {item.type === "lost" 
                      ? "Si encontraste este objeto, haz click para notificar al dueño"
                      : "Si este es tu objeto, solicita la devolución"
                    }
                  </p>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Enlace copiado");
                    }}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Compartir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toast.info("Función disponible pronto")}
                  >
                    <Flag className="mr-2 h-4 w-4" />
                    Reportar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;