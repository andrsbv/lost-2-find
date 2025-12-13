import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, Image as ImageIcon, DollarSign, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EditReportDialogProps {
  report: {
    id: string;
    name: string;
    description: string | null;
    category: string;
    location: string;
    type: string;
    reward_amount: number | null;
    image_url: string | null;
    created_at: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const EDIT_TIME_LIMIT_HOURS = 24;

export const EditReportDialog = ({ report, open, onOpenChange, onSuccess }: EditReportDialogProps) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [itemName, setItemName] = useState(report.name);
  const [description, setDescription] = useState(report.description || "");
  const [category, setCategory] = useState(report.category);
  const [location, setLocation] = useState(report.location);
  const [rewardAmount, setRewardAmount] = useState(report.reward_amount?.toString() || "");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(report.image_url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);

  // Calculate time remaining to edit
  const createdAt = new Date(report.created_at);
  const now = new Date();
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  const hoursRemaining = Math.max(0, EDIT_TIME_LIMIT_HOURS - hoursSinceCreation);
  const canEdit = hoursRemaining > 0;

  useEffect(() => {
    if (open) {
      setItemName(report.name);
      setDescription(report.description || "");
      setCategory(report.category);
      setLocation(report.location);
      setRewardAmount(report.reward_amount?.toString() || "");
      setImagePreview(report.image_url);
      setSelectedImage(null);
      setRemoveCurrentImage(false);
    }
  }, [open, report]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen debe ser menor a 10MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    setRemoveCurrentImage(false);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveCurrentImage(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (userId: string): Promise<string | null> => {
    if (!selectedImage) return null;

    setIsUploadingImage(true);
    try {
      const fileExt = selectedImage.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, selectedImage, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error al subir imagen",
        description: error.message || "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!canEdit) {
      toast({
        title: "Tiempo de edición expirado",
        description: "Solo puedes editar reportes dentro de las primeras 24 horas",
        variant: "destructive",
      });
      return;
    }

    if (!itemName || !category || !location) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // Handle image
      let newImageUrl: string | null = report.image_url;
      
      if (selectedImage) {
        newImageUrl = await uploadImage(user.id);
      } else if (removeCurrentImage) {
        newImageUrl = null;
      }

      const { error } = await supabase
        .from('item_reports')
        .update({
          name: itemName,
          description: description || null,
          category,
          location,
          reward_amount: report.type === 'lost' && rewardAmount ? parseFloat(rewardAmount) : null,
          image_url: newImageUrl,
        })
        .eq('id', report.id);

      if (error) throw error;

      toast({
        title: "Reporte actualizado",
        description: "Los cambios se han guardado exitosamente",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el reporte",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeRemaining = () => {
    if (hoursRemaining >= 1) {
      return `${Math.floor(hoursRemaining)} hora${Math.floor(hoursRemaining) !== 1 ? 's' : ''}`;
    }
    const minutes = Math.floor(hoursRemaining * 60);
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Reporte</DialogTitle>
          <DialogDescription>
            {canEdit 
              ? `Tienes ${formatTimeRemaining()} restantes para editar este reporte.`
              : "El tiempo de edición ha expirado."
            }
          </DialogDescription>
        </DialogHeader>

        {!canEdit ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Solo puedes editar reportes dentro de las primeras 24 horas después de crearlos.
              Esto es para evitar cambios fraudulentos en datos como la recompensa.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4 py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Por seguridad, solo puedes editar reportes dentro de las primeras 24 horas.
                Te quedan {formatTimeRemaining()}.
              </AlertDescription>
            </Alert>

            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nombre del Objeto *</Label>
              <Input 
                id="edit-name" 
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descripción</Label>
              <Textarea 
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoría *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="edit-category">
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

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="edit-location">Ubicación *</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="edit-location">
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

            {/* Reward - Only for lost items */}
            {report.type === "lost" && (
              <div className="space-y-2">
                <Label htmlFor="edit-reward">Recompensa (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="edit-reward"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-10"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Image */}
            <div className="space-y-2">
              <Label>Foto del Objeto</Label>
              {imagePreview ? (
                <div className="relative w-full">
                  <img 
                    src={imagePreview} 
                    alt="Vista previa" 
                    className="w-full h-40 object-cover rounded-lg border border-border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="edit-image"
                    className="flex flex-col items-center justify-center w-full h-24 border-2 border-border border-dashed rounded-lg cursor-pointer bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      <ImageIcon className="w-6 h-6 mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Click para subir imagen</p>
                    </div>
                    <input 
                      ref={fileInputRef}
                      id="edit-image" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          {canEdit && (
            <Button onClick={handleSubmit} disabled={isSubmitting || isUploadingImage}>
              {isSubmitting || isUploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploadingImage ? "Subiendo..." : "Guardando..."}
                </>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
