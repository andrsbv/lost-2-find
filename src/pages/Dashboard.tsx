import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { ItemCard } from "@/components/ItemCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, SlidersHorizontal } from "lucide-react";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");

  // Mock data - in real app this would come from backend
  const mockItems = [
    {
      id: "1",
      title: "iPhone 13 Pro",
      description: "iPhone color azul con funda negra. Última vez visto en la biblioteca",
      category: "Electrónicos",
      location: "Biblioteca Central - Piso 2",
      date: "Hace 2 horas",
      status: "lost" as const,
      image: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400&h=300&fit=crop"
    },
    {
      id: "2",
      title: "Mochila Deportiva Nike",
      description: "Mochila negra con el logo de Nike, contiene cuadernos y calculadora",
      category: "Accesorios",
      location: "Canchas Deportivas",
      date: "Hace 5 horas",
      status: "found" as const,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop"
    },
    {
      id: "3",
      title: "Calculadora Casio FX-991",
      description: "Calculadora científica con nombre escrito en la parte posterior",
      category: "Útiles",
      location: "Facultad de Ingeniería - Aula 3B",
      date: "Hace 1 día",
      status: "found" as const,
    },
    {
      id: "4",
      title: "Llaves con llavero de Pokemon",
      description: "Juego de 3 llaves con llavero de Pikachu",
      category: "Documentos/Llaves",
      location: "Comedor Universitario",
      date: "Hace 3 horas",
      status: "lost" as const,
    },
    {
      id: "5",
      title: "Audífonos Sony WH-1000XM4",
      description: "Audífonos inalámbricos color negro con estuche",
      category: "Electrónicos",
      location: "Laboratorio de Computación",
      date: "Hace 6 horas",
      status: "returned" as const,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=300&fit=crop"
    },
    {
      id: "6",
      title: "Cartera de Cuero",
      description: "Cartera marrón de cuero con documentos de identificación",
      category: "Documentos/Llaves",
      location: "Edificio Administrativo",
      date: "Hace 4 horas",
      status: "found" as const,
    },
  ];

  // Filter items based on search, category, and tab
  const filteredItems = useMemo(() => {
    return mockItems.filter((item) => {
      // Search filter - checks title, description, location, and category
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = searchQuery === "" || 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower) ||
        item.category.toLowerCase().includes(searchLower);

      // Category filter
      const matchesCategory = categoryFilter === "all" || (() => {
        switch (categoryFilter) {
          case "electronics":
            return item.category === "Electrónicos";
          case "accessories":
            return item.category === "Accesorios";
          case "documents":
            return item.category === "Documentos/Llaves";
          case "supplies":
            return item.category === "Útiles";
          default:
            return true;
        }
      })();

      // Tab filter (status)
      const matchesTab = activeTab === "all" || 
        (activeTab === "lost" && item.status === "lost") ||
        (activeTab === "found" && item.status === "found");

      return matchesSearch && matchesCategory && matchesTab;
    });
  }, [searchQuery, categoryFilter, activeTab, mockItems]);

  // Count items per category for display
  const counts = useMemo(() => ({
    all: mockItems.length,
    lost: mockItems.filter(i => i.status === "lost").length,
    found: mockItems.filter(i => i.status === "found").length,
  }), [mockItems]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Objetos Perdidos y Encontrados</h1>
            <p className="text-muted-foreground">
              Busca entre {mockItems.length} reportes activos o reporta un objeto
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por nombre, descripción o ubicación..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  <SelectItem value="electronics">Electrónicos</SelectItem>
                  <SelectItem value="accessories">Accesorios</SelectItem>
                  <SelectItem value="documents">Documentos/Llaves</SelectItem>
                  <SelectItem value="supplies">Útiles</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="all">Todos ({counts.all})</TabsTrigger>
            <TabsTrigger value="lost">Perdidos ({counts.lost})</TabsTrigger>
            <TabsTrigger value="found">Encontrados ({counts.found})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-6">
            {filteredItems.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredItems.map((item) => (
                  <ItemCard key={item.id} {...item} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">No se encontraron resultados</h3>
                <p className="text-muted-foreground mt-2">
                  Intenta con otros términos de búsqueda o cambia los filtros
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;