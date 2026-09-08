import { useEffect, useRef, useState } from "react";
import { ArrowRight, Bell, CheckCheck, LogOut, Menu } from "lucide-react";
import { timeAgo } from "../data";
import { useApp, useNow } from "../store";
import { cn } from "../utils/cn";
import { NotificationGlyph } from "./glyph";
import { ThemeMenu } from "./ThemeMenu";
import { GhostButton, Modal, PrimaryButton } from "./ui";

function BellMenu() {
  const { notifications, unreadCount, markAllRead, markRead, navigate } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const now = useNow();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} non lues)` : ""}`}
        aria-expanded={open}
        className={cn(
          "relative rounded-md p-2 transition-colors duration-200",
          open ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        )}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping-dot absolute inline-flex h-full w-full rounded-full bg-ink" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-ink ring-2 ring-surface" />
          </span>
        )}
      </button>

      {open && (
        <div className="animate-drop-in absolute right-0 z-40 mt-2 w-[min(21rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-hairline bg-surface shadow-xl shadow-ink/10">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <span className="text-sm font-bold text-gray-900">Notifications</span>
            <span className="text-xs text-gray-500">
              {notifications.length === 0
                ? "vide"
                : `${notifications.length} · ${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`}
            </span>
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-gray-500">Aucune notification.</p>
          ) : (
            <ul className="max-h-72 divide-y divide-gray-100 overflow-y-auto">
              {notifications.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50",
                      !n.read && "bg-slate-50/80",
                    )}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                      <NotificationGlyph kind={n.kind} className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[13px] font-medium text-gray-900">{n.title}</span>
                        {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden="true" />}
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500">{n.message}</span>
                      <span className="mt-1 block text-[11px] text-gray-400">{timeAgo(n.at, now)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-2 divide-x divide-gray-100 border-t border-hairline">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Tout marquer lu
            </button>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate("notifications");
              }}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900"
            >
              Voir tout
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function Topbar() {
  const { setMenuOpen, signOut } = useApp();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-surface">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-base font-bold tracking-tight text-gray-900 lg:hidden">Suivi Projets</span>

        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <div className="flex items-center gap-1">
            <ThemeMenu />
            <BellMenu />
          </div>
          <span className="hidden h-8 w-px bg-gray-200 sm:block" aria-hidden="true" />
          <div className="hidden leading-tight sm:block">
            <p className="text-[13px] font-semibold text-gray-900">Alice Admin</p>
            <p className="text-xs text-gray-500">Administrateur</p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="text-[13px] text-gray-600 transition-colors duration-200 hover:text-gray-900 hover:underline"
          >
            Déconnexion
          </button>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Déconnexion"
        description="Vous fermez la session de Alice Admin (Administrateur)."
        footer={
          <>
            <GhostButton onClick={() => setConfirmOpen(false)}>Annuler</GhostButton>
            <PrimaryButton
              onClick={() => {
                setConfirmOpen(false);
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
    </header>
  );
}
