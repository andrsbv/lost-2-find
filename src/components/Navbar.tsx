import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Navbar = () => {
  const { user, profile, signOut, isLoading } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
            <span className="text-sm font-bold text-primary-foreground">L2F</span>
          </div>
          <span className="text-xl font-bold text-foreground">lost2find</span>
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
          
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted"></div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {profile?.full_name ? getInitials(profile.full_name) : user.email?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline max-w-[120px] truncate">
                    {profile?.full_name || user.email}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name || 'Usuario'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="cursor-pointer">
                    <Search className="mr-2 h-4 w-4" />
                    Mis reportes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Iniciar Sesión</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};