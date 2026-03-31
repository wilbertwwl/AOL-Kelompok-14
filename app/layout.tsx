import { Outlet, Link, useLocation } from "react-router";
import { Home, User, Utensils, Activity } from "lucide-react";

export function Layout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-primary">🩺 Health Tracker</h1>
          <p className="text-sm text-muted-foreground">Jaga kesehatan Anda dengan mudah</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center py-2">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-xs">Beranda</span>
            </Link>

            <Link
              to="/food-log"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/food-log") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Utensils className="w-5 h-5" />
              <span className="text-xs">Makanan</span>
            </Link>

            <Link
              to="/activity"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/activity") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs">Aktivitas</span>
            </Link>

            <Link
              to="/profile"
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                isActive("/profile") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-primary"
              }`}
            >
              <User className="w-5 h-5" />
              <span className="text-xs">Profil</span>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
