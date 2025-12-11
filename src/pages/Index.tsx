import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { Link } from "react-router-dom";
import { Search, Shield, Bell, TrendingUp, CheckCircle, AlertCircle, MapPin, Users } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import lostIcon from "@/assets/lost-items-icon.png";
import foundIcon from "@/assets/found-items-icon.png";
import { useStats } from "@/hooks/useStats";

const Index = () => {
  const { activeReports, recoveredReports, totalUsers, isLoading: statsLoading } = useStats();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container relative py-20 md:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Encuentra lo que <span className="text-primary">Perdiste</span>
                </h1>
                <p className="text-lg text-muted-foreground md:text-xl">
                  Plataforma institucional para estudiantes, padres de familia y personal educativo. 
                  Reporta y recupera objetos perdidos de forma rápida, confiable y gratuita.
                </p>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link to="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar Objetos
                  </Button>
                </Link>
                <Link to="/report">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Reportar Pérdida/Hallazgo
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Plataforma oficial respaldada por tu institución educativa</span>
              </div>
            </div>
            <div className="relative lg:h-[500px]">
              <img 
                src={heroImage} 
                alt="Estudiantes universitarios en campus" 
                className="h-full w-full rounded-2xl object-cover shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30 py-12">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              title="Objetos Recuperados"
              value={statsLoading ? "..." : recoveredReports}
              icon={<CheckCircle className="h-6 w-6" />}
              description="Total histórico"
              variant="success"
            />
            <StatCard
              title="Reportes Activos"
              value={statsLoading ? "..." : activeReports}
              icon={<AlertCircle className="h-6 w-6" />}
              description="Esperando ser reclamados"
              variant="warning"
            />
            <StatCard
              title="Usuarios Registrados"
              value={statsLoading ? "..." : totalUsers}
              icon={<Users className="h-6 w-6" />}
              description="Estudiantes, padres y personal"
              variant="info"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              ¿Cómo Funciona?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Simple, rápido y efectivo en tres pasos
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <img src={lostIcon} alt="Reportar" className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">1. Reporta</h3>
              <p className="text-muted-foreground">
                Ingresa con tu correo institucional y reporta el objeto perdido o encontrado con una descripción y foto
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Search className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">2. Busca</h3>
              <p className="text-muted-foreground">
                Utiliza filtros inteligentes para encontrar coincidencias. Recibe notificaciones automáticas por email
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <img src={foundIcon} alt="Recuperar" className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">3. Recupera</h3>
              <p className="text-muted-foreground">
                Verifica tu propiedad y coordina la entrega. Haz seguimiento del estado en tiempo real
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Center Section */}
      <section id="centro-acopio" className="border-t border-border bg-gradient-subtle py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <MapPin className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              Centro de Acopio Institucional
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Punto de recolección oficial donde se almacenan y custodian todos los objetos encontrados. 
              Aquí podrás reclamar presencialmente tus pertenencias tras verificar tu identidad.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground">Horario</h4>
                <p className="mt-2 text-sm text-muted-foreground">Lunes a Viernes<br/>8:00 AM - 5:00 PM</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground">Requisitos</h4>
                <p className="mt-2 text-sm text-muted-foreground">Identificación oficial<br/>Comprobante de reporte</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <h4 className="font-semibold text-foreground">Ubicación</h4>
                <p className="mt-2 text-sm text-muted-foreground">FEPOL - ESPOL<br/>Guayaquil, Ecuador</p>
              </div>
            </div>
            
            {/* Google Maps Embed */}
            <div className="mt-8 overflow-hidden rounded-xl border border-border shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.0051289449!2d-79.96843492538128!3d-2.145619997847898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x902d6d5e1c4c8b59%3A0x1c8c94d9ed6e1a0!2sFEPOL%20-%20ESPOL!5e0!3m2!1ses!2sec!4v1699999999999!5m2!1ses!2sec"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación del Centro de Acopio - FEPOL ESPOL"
                className="w-full"
              />
            </div>
            
            <div className="mt-6">
              <a 
                href="https://www.google.com/maps/search/FEPOL+ESPOL+Guayaquil+Ecuador" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" className="gap-2">
                  <MapPin className="h-5 w-5" />
                  Abrir en Google Maps
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-border bg-muted/30 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-foreground md:text-4xl">
              ¿Por Qué Usar lost2find?
            </h2>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-start space-y-2 rounded-lg border border-border bg-card p-6">
              <div className="rounded-lg bg-success/10 p-3">
                <Shield className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold text-foreground">Respaldo Institucional</h3>
              <p className="text-sm text-muted-foreground">
                Plataforma oficial respaldada por tu institución educativa con soporte completo
              </p>
            </div>
            
            <div className="flex flex-col items-start space-y-2 rounded-lg border border-border bg-card p-6">
              <div className="rounded-lg bg-info/10 p-3">
                <Bell className="h-6 w-6 text-info" />
              </div>
              <h3 className="font-semibold text-foreground">Notificaciones Instantáneas</h3>
              <p className="text-sm text-muted-foreground">
                Recibe alertas automáticas cuando haya coincidencias con tu reporte
              </p>
            </div>
            
            <div className="flex flex-col items-start space-y-2 rounded-lg border border-border bg-card p-6">
              <div className="rounded-lg bg-primary/10 p-3">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">Para Toda la Comunidad</h3>
              <p className="text-sm text-muted-foreground">
                Acceso para estudiantes, padres de familia y personal educativo
              </p>
            </div>
            
            <div className="flex flex-col items-start space-y-2 rounded-lg border border-border bg-card p-6">
              <div className="rounded-lg bg-warning/10 p-3">
                <CheckCircle className="h-6 w-6 text-warning" />
              </div>
              <h3 className="font-semibold text-foreground">Seguimiento en Tiempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Monitorea el estado de tu reporte desde pendiente hasta entregado
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="rounded-2xl bg-gradient-hero p-12 text-center shadow-xl">
            <h2 className="text-3xl font-bold text-primary-foreground md:text-4xl">
              ¿Listo para Empezar?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/90">
              Únete a miles de estudiantes y familias que ya recuperaron sus objetos perdidos
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link to="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Iniciar Sesión Institucional
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-primary hover:bg-white/90">
                  Explorar Objetos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-8">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 lost2find. Todos los derechos reservados.</p>
          <p className="mt-2">Plataforma institucional de objetos perdidos y encontrados</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
