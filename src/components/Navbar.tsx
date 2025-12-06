import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, Plus } from "lucide-react";

export const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="text-xl font-bold text-primary-foreground">F!</span>
          </div>
          <span className="text-xl font-bold text-foreground">Found It</span>
        </Link>
        
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Buscar</span>
            </Button>
          </Link>
          <a 
            href="#centro-acopio"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById("centro-acopio");
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
              } else {
                window.location.href = "/#centro-acopio";
              }
            }}
          >
            <Button variant="ghost" size="sm" className="gap-2">
              <span className="hidden sm:inline">Centro de Acopio</span>
              <span className="sm:hidden">Acopio</span>
            </Button>
          </a>
          <Link to="/report">
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Reportar</span>
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};
