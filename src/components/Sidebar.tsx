import { useState } from "react";
import {
  Bell,
  Building2,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { ROUTES, type RouteId } from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import { Avatar, GhostButton, Modal, PrimaryButton } from "./ui";

const ROUTE_ICONS: Record<RouteId, LucideIcon> = {
  "tableau-de-bord": LayoutDashboard,
  projets: FolderKanban,
  clients: Building2,
  utilisateurs: Users,
  notifications: Bell,
};

export function Sidebar() {
  const { route, navigate, menuOpen, setMenuOpen, projectView, portal, unreadCount, signOut } = useApp();
  const [logoutOpen, setLogoutOpen] = useState(false);
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
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-hairline bg-surface",
          "transition-transform duration-300 ease-out lg:translate-x-0",
          menuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        )}
        aria-label="Navigation principale"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-hairline px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-xs font-bold text-white shadow-sm shadow-ink/20">
              SP
            </span>
            <div>
              <span className="block text-sm font-bold tracking-tight text-gray-900 leading-none">Suivi Projets</span>
              <span className="block text-[10px] font-medium tracking-wide text-gray-500 uppercase mt-0.5">Espace Studio</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 pt-5 pb-6">
          {ROUTES.map((r) => {
            const active = activeRoute === r.id;
            const Icon = ROUTE_ICONS[r.id];
            const hasUnread = r.id === "notifications" && unreadCount > 0;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  navigate(r.id);
                  setMenuOpen(false);
                }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] font-medium transition-all duration-200",
                  active
                    ? "bg-ink text-white shadow-sm shadow-ink/25"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    active ? "text-white" : "text-gray-400 group-hover:text-gray-700",
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{r.label}</span>
                {hasUnread && (
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                      active ? "bg-white/20 text-white" : "bg-amber-100 text-amber-800",
                    )}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-hairline p-3">
          <div className="flex items-center gap-3 rounded-lg border border-hairline/60 bg-gray-50/60 p-2.5 transition-colors hover:bg-gray-100/60">
            <Avatar name="Alice Admin" size="sm" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-xs font-semibold text-gray-900">Alice Admin</p>
              <p className="truncate text-[11px] text-gray-500">Administrateur</p>
            </div>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              title="Déconnexion"
              aria-label="Déconnexion"
              className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Déconnexion"
        description="Vous fermez la session de Alice Admin (Administrateur)."
        footer={
          <>
            <GhostButton onClick={() => setLogoutOpen(false)}>Annuler</GhostButton>
            <PrimaryButton
              onClick={() => {
                setLogoutOpen(false);
                signOut();
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Se déconnecter
            </PrimaryButton>
          </>
        }
      >
        <p className="text-sm leading-relaxed text-gray-600">
          Vos projets, clients et notifications restent enregistrés sur l'espace de travail. Vous pourrez
          reprendre là où vous vous étiez arrêté·e lors de votre prochaine connexion.
        </p>
      </Modal>
    </>
  );
}
