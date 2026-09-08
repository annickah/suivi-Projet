import { useEffect, useRef, useState } from "react";
import { Check, Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useApp, type ThemeMode } from "../store";
import { cn } from "../utils/cn";

const THEME_OPTIONS: { id: ThemeMode; label: string; icon: LucideIcon }[] = [
  { id: "system", label: "Système", icon: Monitor },
  { id: "light", label: "Clair", icon: Sun },
  { id: "dark", label: "Sombre", icon: Moon },
];

/**
 * Sélecteur de thème (Système / Clair / Sombre). Partagé entre la barre du
 * haut (une fois connecté) et l'écran de connexion, pour que le thème reste
 * accessible et cohérent avant même l'authentification.
 */
export function ThemeMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useApp();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = THEME_OPTIONS.find((o) => o.id === theme) ?? THEME_OPTIONS[0];
  const CurrentIcon = current.icon;

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
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Thème : ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
        title={`Thème : ${current.label}`}
        className={cn(
          "rounded-md p-2 transition-colors duration-200",
          open ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
        )}
      >
        <CurrentIcon className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Choisir le thème"
          className="animate-drop-in absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-lg border border-hairline bg-surface py-1 shadow-xl shadow-ink/10"
        >
          {THEME_OPTIONS.map((o) => {
            const OIcon = o.icon;
            const active = o.id === theme;
            return (
              <button
                key={o.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(o.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-gray-50",
                  active ? "font-medium text-ink" : "text-gray-600",
                )}
              >
                <OIcon className="h-4 w-4" aria-hidden="true" />
                {o.label}
                {active && <Check className="ml-auto h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
