import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  Library,
  FileBarChart,
  FileText,
  UserRound,
  Shield,
  ChevronLeft,
  ChevronRight,
  Factory,
} from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo-estimulos.png";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/supabase";

const navSections = [
  {
    label: "Gestão",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/" },
      { label: "Pacientes", icon: Users, path: "/pacientes" },
      { label: "Pendências", icon: ClipboardList, path: "/pendencias" },
    ],
  },
  {
    label: "Base Pedagógica",
    items: [
      { label: "Banco de Currículos", icon: BookOpen, path: "/banco-curriculos" },
      { label: "Banco de Atividades", icon: Library, path: "/banco-atividades" },
    ],
  },
  {
    label: "Admin",
    items: [
      { label: "Permissões", icon: Shield, path: "/permissoes" },
    ],
  },
];

export default function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    db.from("pendencies")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending")
      .then(({ count }) => {
        if (count != null) setPendingCount(count);
      });
  }, []);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-all duration-300 ${
        collapsed ? "w-[72px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <img src={logo} alt="Estímulos" className="h-10 w-auto flex-shrink-0" />
        {!collapsed && (
          <span className="text-sm font-semibold text-sidebar-foreground opacity-80 leading-tight">
            Sistema de Automação
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {navSections.map((section, si) => (
          <div key={section.label}>
            {si > 0 && <Separator className="my-2 bg-sidebar-border" />}
            {!collapsed && (
              <p className="text-[10px] font-bold text-sidebar-foreground/40 uppercase tracking-wider px-3 pt-2 pb-1">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const active =
                item.path === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  }`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={18} className="flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.path === "/pendencias" && pendingCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </span>
                      )}
                    </>
                  )}
                  {collapsed && item.path === "/pendencias" && pendingCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-sidebar-border text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>
    </aside>
  );
}
