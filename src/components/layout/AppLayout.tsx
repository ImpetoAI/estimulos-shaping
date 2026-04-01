import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import GlobalSearch from "./GlobalSearch";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <main className="ml-[260px] transition-all duration-300">
        {/* Top bar with global search */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/40 px-6 py-3 flex items-center justify-between">
          <GlobalSearch />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="px-2 py-1 rounded-md bg-success/10 text-success font-semibold">14 casos ativos</span>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
