import { Link, useLocation, useNavigate } from "react-router";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import Logo from "@/assets/logo";

/**
 * Sticky top bar shown only on mobile. Provides the hamburger trigger that
 * opens the navigation sheet (the desktop sidebar is hidden on mobile) and a
 * back button on every page except the dashboard home.
 */
export default function MobileHeader() {
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboardHome = location.pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-1 border-b border-border bg-background/95 px-2 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="size-9"
        aria-label="Open navigation menu"
        onClick={toggleSidebar}>
        <Menu className="size-5" />
      </Button>

      {!isDashboardHome && (
        <Button
          variant="ghost"
          size="icon"
          className="size-9"
          aria-label="Go back"
          onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
      )}

      <Link to="/dashboard" className="ml-1 flex items-center">
        <Logo />
      </Link>
    </header>
  );
}
