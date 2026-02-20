import { Plane } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

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
          <Link
            to="/"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              location.pathname === "/"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Input
          </Link>
          <Link
            to="/dashboard"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              location.pathname === "/dashboard"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
