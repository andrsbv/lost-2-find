import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Upload, Calendar as CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ReportItem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [date, setDate] = useState<Date>();
  const [reportType, setReportType] = useState<string>("lost");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para reportar un objeto",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!itemName || !category || !location || !date) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('item_reports').insert({
        user_id: user.id,
        name: itemName,
        description: description || null,
        category,
        location,
        date: format(date, 'yyyy-MM-dd'),
        type: reportType,
        contact_info: contactInfo || null,
        status: 'active',
      });

      if (error) throw error;

      toast({
        title: "Reporte creado",
        description: `Tu reporte de objeto ${reportType === 'lost' ? 'perdido' : 'encontrado'} ha sido registrado exitosamente`,
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el reporte. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-12">
        <div className="mx-auto max-w-3xl">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Reportar Objeto</CardTitle>
              <CardDescription>
                Completa el formulario para reportar un objeto perdido o encontrado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Report Type */}
                <div className="space-y-3">
                  <Label>Tipo de Reporte</Label>
                  <RadioGroup value={reportType} onValueChange={setReportType} className="grid grid-cols-2 gap-4">
                    <div>
                      <RadioGroupItem value="lost" id="lost" className="peer sr-only" />
                      <Label
                        htmlFor="lost"
                        className={cn(
                          "flex cursor-pointer flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground",
                          reportType === "lost" && "border-warning bg-warning/10"
                        )}
                      >
                        <span className="text-lg font-semibold">Perdí un Objeto</span>
                        <span className="text-sm text-muted-foreground">Reportar pérdida</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="found" id="found" className="peer sr-only" />
                      <Label
                        htmlFor="found"
                        className={cn(
                          "flex cursor-pointer flex-col items-center justify-between rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground",
                          reportType === "found" && "border-success bg-success/10"
                        )}
                      >
                        <span className="text-lg font-semibold">Encontré un Objeto</span>
                        <span className="text-sm text-muted-foreground">Reportar hallazgo</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Item Name */}
                <div className="space-y-2">
                  <Label htmlFor="itemName">Nombre del Objeto *</Label>
                  <Input 
                    id="itemName" 
                    placeholder="Ej: iPhone 13 Pro, Mochila Nike, Calculadora Casio"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Detallada</Label>
                  <Textarea 
                    id="description"
                    placeholder="Describe el objeto con el mayor detalle posible: color, marca, modelo, características distintivas, contenido, etc."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Una descripción detallada aumenta las posibilidades de recuperación
                  </p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electronics">Electrónicos</SelectItem>
                      <SelectItem value="accessories">Accesorios (mochilas, bolsos)</SelectItem>
                      <SelectItem value="documents">Documentos/Llaves</SelectItem>
                      <SelectItem value="supplies">Útiles Escolares</SelectItem>
                      <SelectItem value="clothing">Ropa/Calzado</SelectItem>
                      <SelectItem value="sports">Artículos Deportivos</SelectItem>
                      <SelectItem value="other">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Ubicación *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Select value={location} onValueChange={setLocation} required>
                        <SelectTrigger id="location" className="pl-10">
                          <SelectValue placeholder="¿Dónde?" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="biblioteca">Biblioteca Central</SelectItem>
                          <SelectItem value="comedor">Comedor Universitario</SelectItem>
                          <SelectItem value="canchas">Canchas Deportivas</SelectItem>
                          <SelectItem value="ing">Facultad de Ingeniería</SelectItem>
                          <SelectItem value="admin">Edificio Administrativo</SelectItem>
                          <SelectItem value="lab">Laboratorios</SelectItem>
                          <SelectItem value="auditorio">Auditorio</SelectItem>
                          <SelectItem value="estacionamiento">Estacionamiento</SelectItem>
                          <SelectItem value="otro">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="space-y-2">
                    <Label>Fecha *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label htmlFor="image">Foto del Objeto (Opcional)</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground">
                          <span className="font-semibold">Click para subir</span> o arrastra una imagen
                        </p>
                        <p className="text-xs text-muted-foreground">PNG, JPG o WEBP (MAX. 5MB)</p>
                      </div>
                      <input id="image" type="file" className="hidden" accept="image/*" />
                    </label>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <Label htmlFor="contact">Información de Contacto (Opcional)</Label>
                  <Input 
                    id="contact"
                    placeholder="Teléfono o correo alternativo"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Tu correo institucional se usará por defecto para las notificaciones
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button type="submit" className="flex-1" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      reportType === "lost" ? "Reportar Pérdida" : "Reportar Hallazgo"
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  * Campos obligatorios
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportItem;
