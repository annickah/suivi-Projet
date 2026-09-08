import { useMemo, useState } from "react";
import {
  CalendarRange,
  FolderOpen,
  History,
  Layers,
  LayoutDashboard,
  ListChecks,
  MessageSquarePlus,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { Project } from "../../data";
import { useApp } from "../../store";
import { cn } from "../../utils/cn";
import { EvolutionChart, GanttChart, InfoCards, Milestones } from "./Overview";
import { TasksTab } from "./TasksTab";
import { ValidationsTab } from "./ValidationsTab";
import { RequestsTab } from "./RequestsTab";
import { DocumentsTab } from "./DocumentsTab";
import { PerimeterTab } from "./PerimeterTab";
import { HistoryTimeline } from "./HistoryTimeline";

type TabId = "apercu" | "chronogramme" | "taches" | "validations" | "demandes" | "documents" | "perimetre" | "historique";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "apercu", label: "Aperçu", icon: LayoutDashboard },
  { id: "chronogramme", label: "Chronogramme", icon: CalendarRange },
  { id: "taches", label: "Tâches", icon: ListChecks },
  { id: "validations", label: "Validations", icon: ShieldCheck },
  { id: "demandes", label: "Demandes", icon: MessageSquarePlus },
  { id: "documents", label: "Documents", icon: FolderOpen },
  { id: "perimetre", label: "Périmètre", icon: Layers },
  { id: "historique", label: "Historique", icon: History },
];

export function ProjectWorkspace({ project, mode }: { project: Project; mode: "admin" | "client" }) {
  const { tasks, validations, requests, documents, events, clients } = useApp();
  const [tab, setTab] = useState<TabId>("apercu");

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const tasksDone = projectTasks.filter((t) => t.done).length;
  const valPending = validations.filter((v) => v.projectId === project.id && v.status === "en-attente").length;
  const reqPending = requests.filter((r) => r.projectId === project.id && r.status === "en-attente").length;
  const docsShared = documents.filter((d) => d.projectId === project.id && d.shared).length;
  const projectEvents = useMemo(() => events.filter((e) => e.projectId === project.id), [events, project.id]);
  const clientActor = `${clients.find((c) => c.name === project.client)?.contact ?? "Client"} (client)`;

  const counts: Partial<Record<TabId, { value: string; alert: boolean }>> = {
    taches: { value: `${tasksDone}/${projectTasks.length}`, alert: false },
    validations: { value: String(valPending), alert: valPending > 0 },
    demandes: { value: String(reqPending), alert: reqPending > 0 },
    documents: { value: String(docsShared), alert: false },
  };

  const synthesis = [
    { tab: "taches" as TabId, icon: ListChecks, value: `${tasksDone}/${projectTasks.length}`, label: "Tâches terminées" },
    { tab: "validations" as TabId, icon: ShieldCheck, value: String(valPending), label: "Validations en attente" },
    { tab: "demandes" as TabId, icon: MessageSquarePlus, value: String(reqPending), label: "Demandes à instruire" },
    { tab: "documents" as TabId, icon: FolderOpen, value: String(docsShared), label: "Documents partagés" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-1 overflow-x-auto border-b border-hairline" role="tablist" aria-label="Sections du projet">
        {TABS.map((t) => {
          const active = tab === t.id;
          const count = counts[t.id];
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-[13px] whitespace-nowrap transition-colors duration-200",
                active
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-800",
              )}
            >
              <t.icon className="h-4 w-4" aria-hidden="true" />
              {t.label}
              {count && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    count.alert ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-gray-500",
                  )}
                >
                  {count.value}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div key={tab} className="animate-page-in space-y-6">
        {tab === "apercu" && (
          <>
            <InfoCards project={project} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {synthesis.map((s) => (
                <button
                  key={s.tab}
                  type="button"
                  onClick={() => setTab(s.tab)}
                  className="group rounded-lg border border-hairline bg-surface p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                >
                  <span className="flex items-center justify-between">
                    <s.icon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-ink" aria-hidden="true" />
                    <span className="text-xl font-bold text-gray-900 tabular-nums">{s.value}</span>
                  </span>
                  <span className="mt-2 block text-xs text-gray-500">{s.label}</span>
                </button>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <EvolutionChart project={project} events={projectEvents} />
              </div>
              <Milestones progress={project.progress} />
            </div>
          </>
        )}

        {tab === "chronogramme" && <GanttChart project={project} />}
        {tab === "taches" && <TasksTab project={project} mode={mode} />}
        {tab === "validations" && <ValidationsTab project={project} mode={mode} clientActor={clientActor} />}
        {tab === "demandes" && <RequestsTab project={project} mode={mode} clientActor={clientActor} />}
        {tab === "documents" && <DocumentsTab project={project} mode={mode} />}
        {tab === "perimetre" && <PerimeterTab project={project} mode={mode} />}
        {tab === "historique" && <HistoryTimeline project={project} events={projectEvents} />}
      </div>
    </div>
  );
}
