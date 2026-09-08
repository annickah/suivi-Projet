import { X } from "lucide-react";
import { ROUTES } from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";

export function Sidebar() {
  const { route, navigate, menuOpen, setMenuOpen, projectView, portal } = useApp();
  const activeRoute = portal ? "clients" : projectView ? "projets" : route;

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink/45 transition-opacity duration-300 lg:hidden",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-hairline bg-white",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <span className="text-base font-bold tracking-tight text-gray-900">Suivi Projets</span>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 pt-5 pb-6">
          {ROUTES.map((r) => {
            const active = activeRoute === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate(r.id)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block w-full rounded-md px-4 py-2 text-left text-sm transition-all duration-200",
                  active
                    ? "bg-ink font-normal text-white shadow-sm shadow-ink/25"
                    : "text-gray-600 hover:translate-x-0.5 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                {r.label}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
