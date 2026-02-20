import { Plane, LogOut, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const navLink = (path: string, label: string) => (
    <Link
      to={path}
      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        location.pathname === path
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-primary">
            <Plane className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-xl font-bold text-foreground">
            FinPilot<span className="text-primary">.ai</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          {navLink("/", "Home")}
          {user && (
            <>
              {navLink("/analyze", "Analyze")}
              {navLink("/dashboard", "Dashboard")}
              {navLink("/history", "History")}
            </>
          )}
          {user ? (
            <div className="ml-3 flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground truncate max-w-[120px]">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5 text-muted-foreground hover:text-foreground">
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="ml-3 gap-1.5">
                <User className="h-3.5 w-3.5" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
