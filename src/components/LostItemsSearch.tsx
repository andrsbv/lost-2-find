import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, CheckCircle, MapPin, Calendar, DollarSign, LogIn } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LostItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  location: string;
  date: string;
  reward_amount: number | null;
}

interface LostItemsSearchProps {
  onSelectItem: (itemId: string) => void;
  onSkip: () => void;
}

export const LostItemsSearch = ({ onSelectItem, onSkip }: LostItemsSearchProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLostItems();
  }, []);

  const fetchLostItems = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('item_reports')
      .select('id, name, description, category, location, date, reward_amount')
      .eq('type', 'lost')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error && data) {
      setLostItems(data);
    }
    setIsLoading(false);
  };

  const filteredItems = lostItems.filter(item => {
    const query = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.description?.toLowerCase().includes(query) || false) ||
      item.category.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
  });

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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">¿Has encontrado alguno de estos objetos?</h2>
        <p className="text-muted-foreground">
          Antes de reportar, revisa si el objeto que encontraste coincide con algún reporte de pérdida
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, descripción o ubicación..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-4 max-h-[400px] overflow-y-auto pr-2">
          {filteredItems.map((item) => (
            <Card key={item.id} className="cursor-pointer hover:border-primary transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getCategoryLabel(item.category)}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {getLocationLabel(item.location)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.date), "d MMM yyyy", { locale: es })}
                      </span>
                      {item.reward_amount && item.reward_amount > 0 && (
                        <span className="flex items-center gap-1 text-success font-medium">
                          <DollarSign className="h-3 w-3" />
                          Recompensa: ${item.reward_amount}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!user) {
                        toast.error("Debes iniciar sesión para continuar");
                        navigate("/login");
                        return;
                      }
                      onSelectItem(item.id);
                    }}
                    className="flex-shrink-0"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Es este
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No se encontraron objetos perdidos</p>
        </div>
      )}

      <div className="flex justify-center pt-4 border-t border-border">
        <Button variant="outline" onClick={onSkip}>
          Ninguno es el objeto que encontré - Continuar con reporte
        </Button>
      </div>
    </div>
  );
};
