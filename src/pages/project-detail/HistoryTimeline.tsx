import { useMemo } from "react";
import {
  Download,
  FileText,
  Flag,
  FolderPlus,
  History,
  Layers,
  ListChecks,
  MessageSquare,
  MessageSquarePlus,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { Project } from "../../data";
import {
  EVENT_META,
  formatDateTime,
  sortEventsDesc,
  type ProjectEvent,
  type ProjectEventType,
} from "../../history";
import { useApp } from "../../store";
import { cn } from "../../utils/cn";
import { Card, EmptyState, GhostButton } from "../../components/ui";

const EVENT_ICONS: Record<ProjectEventType, LucideIcon> = {
  creation: FolderPlus,
  progression: TrendingUp,
  statut: RefreshCw,
  document: FileText,
  commentaire: MessageSquare,
  jalon: Flag,
  tache: ListChecks,
  validation: ShieldCheck,
  demande: MessageSquarePlus,
  perimetre: Layers,
};

export function HistoryTimeline({ project, events }: { project: Project; events: ProjectEvent[] }) {
  const { pushToast } = useApp();
  const sorted = useMemo(() => sortEventsDesc(events), [events]);

  const exportCsv = () => {
    const rows = [
      ["Date", "Auteur", "Type", "Modification"],
      ...sorted.map((e) => [formatDateTime(e.at), e.author, EVENT_META[e.type].label, e.message]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historique-${project.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushToast("Historique exporté au format CSV");
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-6 py-4">
        <div>
          <h2 className="text-sm font-bold text-gray-900">Historique des modifications</h2>
          <p className="mt-0.5 text-xs text-gray-500">
            {sorted.length} entrée{sorted.length > 1 ? "s" : ""} — journal horodaté, visible par le client.
          </p>
        </div>
        <GhostButton onClick={exportCsv}>
          <Download className="h-3.5 w-3.5" />
          Exporter (CSV)
        </GhostButton>
      </div>
      <ol
        className={cn(
          "relative",
          sorted.length > 0
            ? "px-6 py-6 before:absolute before:top-10 before:bottom-10 before:left-[39px] before:w-px before:bg-gray-200"
            : undefined,
        )}
      >
        {sorted.map((e) => {
          const Icon = EVENT_ICONS[e.type];
          return (
            <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
              <span
                className={cn(
                  "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-surface",
                  e.type === "creation" ? "bg-ink text-white" : "bg-slate-100 text-gray-600",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <p className="text-[13px] leading-relaxed text-gray-800">{e.message}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                  <span className="font-medium text-gray-600">{e.author}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatDateTime(e.at)}</span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-gray-500 uppercase">
                    {EVENT_META[e.type].label}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
        {sorted.length === 0 && (
          <li>
            <EmptyState icon={History} title="Aucune modification enregistrée pour le moment" />
          </li>
        )}
      </ol>
    </Card>
  );
}
