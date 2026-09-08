import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, X } from "lucide-react";
import { STATUS_META, initials, type ProjectStatus, type UserRole } from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";

export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "is-visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-[13px] text-gray-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-hairline bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        meta.badge,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} aria-hidden="true" />
      {meta.label}
    </span>
  );
}

const ROLE_BADGE: Record<UserRole, string> = {
  Administrateur: "bg-ink text-white ring-ink/20",
  "Chef de projet": "bg-sky-50 text-sky-700 ring-sky-600/20",
  Contributeur: "bg-amber-50 text-amber-700 ring-amber-600/20",
  Lecteur: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        ROLE_BADGE[role],
      )}
    >
      {role}
    </span>
  );
}

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-bold text-white",
        size === "md" ? "h-9 w-9 text-xs" : "h-7 w-7 text-[10px]",
      )}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-1.5 w-full min-w-16 overflow-hidden rounded-full bg-gray-200/80">
        <div
          className="animate-bar-grow h-full rounded-full bg-ink transition-[width] duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-xs tabular-nums text-gray-500">{value}%</span>
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  type = "button",
  className,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white",
        "transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  onClick,
  type = "button",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-hairline bg-white px-4 py-2 text-[13px] font-medium text-gray-600",
        "transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900 active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-gray-700">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
    </label>
  );
}

export const inputClass =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-shadow duration-200 focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/15";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="animate-veil-in absolute inset-0 bg-ink/45" onClick={onClose} />
      <div className="animate-modal-in relative w-full max-w-lg rounded-lg border border-hairline bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            {description ? <p className="mt-0.5 text-[13px] text-gray-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="flex justify-end gap-2 rounded-b-lg border-t border-hairline bg-gray-50/70 px-6 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function Toasts() {
  const { toasts } = useApp();
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[80] flex w-[calc(100vw-3rem)] max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in pointer-events-auto flex items-center gap-3 rounded-lg bg-ink px-4 py-3 text-[13px] font-medium text-white shadow-xl shadow-ink/20"
          role="status"
        >
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="min-w-0 truncate">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
