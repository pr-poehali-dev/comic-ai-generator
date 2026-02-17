import { Link, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { path: "/", label: "Главная", icon: "Home" },
  { path: "/editor", label: "Редактор", icon: "PenTool" },
  { path: "/characters", label: "Персонажи", icon: "Users" },
  { path: "/templates", label: "Шаблоны", icon: "LayoutGrid" },
  { path: "/history", label: "История", icon: "Clock" },
  { path: "/profile", label: "Профиль", icon: "User" },
];

const Navbar = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center glow-purple">
            <Icon name="Zap" size={20} className="text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-gradient hidden sm:block">
            КомиксАрт
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`gap-2 ${isActive ? "glow-purple" : "hover:bg-accent"}`}
                >
                  <Icon name={item.icon} size={16} />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            <Icon name={theme === "dark" ? "Sun" : "Moon"} size={18} />
          </Button>
          <Link to="/profile">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Icon name="LogIn" size={16} />
              Войти
            </Button>
          </Link>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-border/50 px-2 py-1 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg text-xs transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon name={item.icon} size={20} />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;