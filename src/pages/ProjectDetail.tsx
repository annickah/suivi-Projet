import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import {
  ArrowLeft,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  Circle,
  CircleDashed,
  Clock3,
  Download,
  Edit2,
  Eye,
  FileText,
  Flag,
  FolderOpen,
  FolderPlus,
  History,
  Layers,
  LayoutDashboard,
  ListChecks,
  MessageSquare,
  MessageSquarePlus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Tag,
  TrendingUp,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { STATUS_META, formatDate, todayISO, type Project } from "../data";
import {
  EVENT_META,
  MILESTONES,
  formatDateTime,
  progressSeries,
  sortEventsDesc,
  type ProjectEvent,
  type ProjectEventType,
} from "../history";
import {
  PHASE_LABELS,
  fmtDay,
  phasesFor,
  type DocKind,
  type Perimeter,
  type ProjectDoc,
  type Task,
  type TaskPriority,
  type Validation,
  type ValidationStatus,
} from "../project";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import {
  Avatar,
  Card,
  Field,
  GhostButton,
  Modal,
  PrimaryButton,
  StatusBadge,
  inputClass,
} from "../components/ui";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

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

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f172a",
      padding: 10,
      cornerRadius: 6,
      displayColors: false,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      callbacks: { label: (ctx) => `Avancement : ${ctx.parsed.y} %` },
    },
  },
  scales: {
    x: { grid: { display: false }, border: { color: "#e5e7eb" }, ticks: { color: "#9ca3af", font: { size: 11 } } },
    y: {
      min: 0,
      max: 100,
      grid: { color: "#eef0f3" },
      border: { display: false },
      ticks: { color: "#9ca3af", font: { size: 11 }, stepSize: 25, callback: (v) => `${v} %` },
    },
  },
};

/* ---------- Briques partagées ---------- */

function EvolutionChart({ project, events }: { project: Project; events?: ProjectEvent[] }) {
  const series = progressSeries(project, events);
  const data = {
    labels: series.labels,
    datasets: [
      {
        label: "Avancement",
        data: series.values,
        borderColor: "#0f172a",
        backgroundColor: "rgba(15,23,42,0.07)",
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3.5,
        pointHoverRadius: 5,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#0f172a",
        pointBorderWidth: 2,
      },
    ],
  };
  return (
    <Card className="h-full p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-bold text-gray-900">Évolution de l'avancement</h2>
        <span className="text-xs text-gray-500">Du début à l'échéance</span>
      </div>
      <div className="mt-5 h-56 sm:h-64">
        <Line data={data} options={chartOptions} />
      </div>
    </Card>
  );
}

function Milestones({ progress }: { progress: number }) {
  const currentIndex = MILESTONES.findIndex((m) => progress < m.at);
  return (
    <Card className="h-full p-6">
      <h2 className="text-sm font-bold text-gray-900">Jalons clés</h2>
      <ul className="mt-5 space-y-4">
        {MILESTONES.map((m, i) => {
          const done = progress >= m.at;
          const current = i === currentIndex;
          return (
            <li key={m.label} className="flex items-center gap-3">
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
              ) : current ? (
                <CircleDashed className="h-4 w-4 shrink-0 animate-spin text-amber-500 [animation-duration:6s]" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
              )}
              <span
                className={cn(
                  "flex-1 text-[13px]",
                  done ? "font-medium text-gray-800" : current ? "text-gray-700" : "text-gray-400",
                )}
              >
                {m.label}
                {current && <span className="ml-2 text-[11px] font-medium text-amber-600">en cours</span>}
              </span>
              <span className="text-xs text-gray-400 tabular-nums">{m.at} %</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function InfoCards({ project }: { project: Project }) {
  const cells = [
    { label: "Statut", body: <StatusBadge status={project.status} /> },
    {
      label: "Progression",
      body: (
        <span className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">{project.progress}%</span>
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200/80">
            <span className="block h-full rounded-full bg-ink" style={{ width: `${project.progress}%` }} />
          </span>
        </span>
      ),
    },
    {
      label: "Échéance",
      body: (
        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          {formatDate(project.due)}
        </span>
      ),
    },
  ];
  return (
    <Card className="grid grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={cn(
            "p-5 transition-colors duration-200 hover:bg-gray-50/70",
            i > 0 && "border-t border-gray-100 sm:border-t-0",
            i === 1 && "sm:border-l sm:border-gray-100",
            i === 2 && "sm:border-t sm:border-gray-100 lg:border-t-0 lg:border-l",
          )}
        >
          <p className="text-[13px] text-gray-500">{c.label}</p>
          <div className="mt-2">{c.body}</div>
        </div>
      ))}
    </Card>
  );
}

/* ---------- Chronogramme ---------- */

function GanttChart({ project }: { project: Project }) {
  const phases = phasesFor(project);
  const start = Math.min(...phases.map((p) => Date.parse(p.start)));
  const end = Math.max(...phases.map((p) => Date.parse(p.end)));
  const total = Math.max(1, end - start);
  const pos = (iso: string) => Math.max(0, Math.min(100, ((Date.parse(iso + "T00:00:00") - start) / total) * 100));

  const months: { label: string; p: number }[] = [];
  const m = new Date(start);
  m.setDate(1);
  while (m.getTime() <= end) {
    const iso = m.toISOString().slice(0, 10);
    months.push({ label: m.toLocaleDateString("fr-FR", { month: "short" }), p: pos(iso) });
    m.setMonth(m.getMonth() + 1);
  }

  const today = todayISO();
  const todayP = Date.parse(today) >= start && Date.parse(today) <= end ? pos(today) : null;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-900">Chronogramme du projet</h2>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Phase faite</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ink" />En cours</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />À venir</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-px bg-amber-400" />Aujourd'hui</span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="flex">
            <div className="w-32 shrink-0 sm:w-40" />
            <div className="relative h-5 flex-1">
              {months.map((t, i) => (
                <span key={i} className="absolute top-0 text-[10px] font-medium text-gray-400" style={{ left: `${t.p}%` }}>
                  {t.label}
                </span>
              ))}
            </div>
            <div className="w-10 shrink-0" />
          </div>
          <div className="divide-y divide-gray-100">
            {phases.map((ph) => (
              <div key={ph.label} className="flex items-center py-2.5">
                <div className="w-32 shrink-0 pr-3 sm:w-40">
                  <p className="truncate text-[13px] font-medium text-gray-700">{ph.label}</p>
                  <p className="text-[11px] text-gray-400">
                    {fmtDay(ph.start)} → {fmtDay(ph.end)}
                  </p>
                </div>
                <div className="relative h-8 flex-1">
                  {months.map((t, i) => (
                    <span key={i} className="absolute inset-y-0 w-px bg-gray-100" style={{ left: `${t.p}%` }} aria-hidden="true" />
                  ))}
                  {todayP !== null && (
                    <span className="absolute inset-y-0 w-px bg-amber-400/90" style={{ left: `${todayP}%` }} aria-hidden="true" />
                  )}
                  <span
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200/80"
                    style={{ left: `${pos(ph.start)}%`, width: `${Math.max(2, pos(ph.end) - pos(ph.start))}%` }}
                    title={`${ph.label} : ${ph.progress} %`}
                  >
                    <span
                      className={cn("block h-full rounded-full transition-[width] duration-700", ph.progress >= 100 ? "bg-emerald-500" : "bg-ink")}
                      style={{ width: `${ph.progress}%` }}
                    />
                  </span>
                </div>
                <div className="w-10 shrink-0 text-right text-xs tabular-nums text-gray-500">{ph.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ---------- Tâches ---------- */

const PRIORITY_META: Record<TaskPriority, { label: string; cls: string }> = {
  basse: { label: "Basse", cls: "bg-slate-100 text-slate-600" },
  normale: { label: "Normale", cls: "bg-sky-50 text-sky-700" },
  haute: { label: "Haute", cls: "bg-amber-50 text-amber-700" },
  critique: { label: "Critique", cls: "bg-red-50 text-red-700" },
};

function TaskDetailModal({
  task,
  mode,
  onClose,
  onToggle,
  onSave,
  clientActor,
}: {
  task: Task;
  mode: "admin" | "client";
  onClose: () => void;
  onToggle: () => void;
  onSave: (patch: Partial<Omit<Task, "id" | "projectId">>) => void;
  clientActor?: string;
}) {
  const { taskComments, addTaskComment, users, clients, projects } = useApp();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Task>(task);
  const [newComment, setNewComment] = useState("");
  const today = todayISO();
  const late = !task.done && task.due < today;
  const priority = PRIORITY_META[task.priority];

  const comments = taskComments
    .filter((c) => c.taskId === task.id)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  const project = projects.find((p) => p.id === task.projectId);
  const projectClient = clients.find((c) => c.name === project?.client);
  const authorDefault = mode === "admin" ? "Alice Admin" : projectClient ? `${projectClient.contact} (client)` : "Visiteur";
  const authorSuggestions = Array.from(new Set([...users.map((u) => u.name), authorDefault, ...comments.map((c) => c.author)]));

  useEffect(() => {
    setDraft(task);
    setEditing(false);
  }, [task]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      label: draft.label.trim(),
      phase: draft.phase,
      assignee: draft.assignee.trim(),
      due: draft.due,
      description: draft.description.trim(),
      priority: draft.priority,
      tags: draft.tags,
    });
    setEditing(false);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "Modifier la tâche" : task.label}
      description={editing ? undefined : `${task.phase}${late ? " · en retard" : task.done ? " · terminée" : ""}`}
      footer={
        editing ? (
          <>
            <GhostButton onClick={() => { setDraft(task); setEditing(false); }}>Annuler</GhostButton>
            <button
              type="submit"
              form="task-detail-form"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]"
            >
              <Save className="h-3.5 w-3.5" />
              Enregistrer
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onToggle}
              disabled={mode === "client"}
              className={cn(
                "inline-flex items-center gap-2 rounded-md px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:shadow-md active:scale-[0.98]",
                task.done ? "bg-slate-600 hover:bg-slate-700" : "bg-emerald-600 hover:bg-emerald-700",
                mode === "client" && "pointer-events-none opacity-50",
              )}
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              {task.done ? "Marquer non terminée" : "Marquer terminée"}
            </button>
            {mode === "admin" && (
              <GhostButton onClick={() => setEditing(true)}>
                <Edit2 className="h-3.5 w-3.5" />
                Modifier
              </GhostButton>
            )}
          </>
        )
      }
    >
      {editing ? (
        <form id="task-detail-form" onSubmit={submit} className="grid gap-4">
          <Field label="Intitulé">
            <input
              autoFocus
              required
              value={draft.label}
              onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              rows={4}
              className={cn(inputClass, "resize-none")}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Phase">
              <select value={draft.phase} onChange={(e) => setDraft({ ...draft, phase: e.target.value })} className={inputClass}>
                {PHASE_LABELS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Priorité">
              <select value={draft.priority} onChange={(e) => setDraft({ ...draft, priority: e.target.value as TaskPriority })} className={inputClass}>
                {(["basse", "normale", "haute", "critique"] as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>{PRIORITY_META[p].label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Assignée à">
              <input
                value={draft.assignee}
                onChange={(e) => setDraft({ ...draft, assignee: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Échéance">
              <input
                type="date"
                value={draft.due}
                onChange={(e) => setDraft({ ...draft, due: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Tags (séparés par des virgules)">
            <input
              value={draft.tags.join(", ")}
              onChange={(e) =>
                setDraft({ ...draft, tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
              }
              className={inputClass}
              placeholder="Ex. design, urgent"
            />
          </Field>
        </form>
      ) : (
        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", priority.cls)}>
              <Flag className="h-3 w-3" />
              Priorité {priority.label.toLowerCase()}
            </span>
            {task.done ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <CheckCircle2 className="h-3 w-3" />
                Terminée
              </span>
            ) : late ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                <Clock3 className="h-3 w-3" />
                En retard
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                <Clock3 className="h-3 w-3" />
                En cours
              </span>
            )}
          </div>

          {task.description ? (
            <div>
              <p className="mb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Description</p>
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-gray-700">{task.description}</p>
            </div>
          ) : (
            <p className="text-[13px] italic text-gray-400">Aucune description renseignée.</p>
          )}

          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="mb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Assigné à</p>
              <span className="inline-flex items-center gap-2 text-[13px] text-gray-800">
                <Avatar name={task.assignee} size="sm" />
                {task.assignee}
              </span>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Échéance</p>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-800">
                <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                {formatDate(task.due)}
              </span>
            </div>
            <div>
              <p className="mb-1 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Phase</p>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-gray-800">
                <Layers className="h-3.5 w-3.5 text-gray-400" />
                {task.phase}
              </span>
            </div>
          </div>

          {task.tags.length > 0 && (
            <div>
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-hairline bg-gray-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                <MessageSquare className="h-3 w-3" />
                Commentaires ({comments.length})
              </p>
            </div>

            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="text-[13px] italic text-gray-400">Aucun commentaire pour le moment.</p>
              )}
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.author} size="sm" />
                  <div className="min-w-0 flex-1 rounded-md bg-white p-2.5 ring-1 ring-hairline">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[12px] font-semibold text-gray-900">{c.author}</p>
                      <p className="text-[11px] text-gray-400">{formatDateTime(c.at)}</p>
                    </div>
                    <p className="mt-1 whitespace-pre-line text-[13px] leading-relaxed text-gray-700">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newComment.trim()) return;
                addTaskComment(task.id, newComment, authorDefault);
                setNewComment("");
              }}
              className="mt-3 flex flex-col gap-2"
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={2}
                placeholder={`Écrire un commentaire en tant que ${authorDefault}…`}
                className={cn(inputClass, "resize-none text-[13px]")}
              />
              <div className="flex items-center justify-end gap-2">
                <span className="mr-auto text-[11px] text-gray-500">Posté en tant que {authorDefault}</span>
                <PrimaryButton type="submit" disabled={!newComment.trim()} className="px-3 py-1.5 text-[12px]">
                  <MessageSquarePlus className="h-3.5 w-3.5" />
                  Publier
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </Modal>
  );
}

function TasksTab({ project, mode }: { project: Project; mode: "admin" | "client" }) {
  const { tasks, toggleTask, addTask, updateTask, deleteTask, users, taskComments, deleteTaskComment } = useApp();
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const [form, setForm] = useState({ label: "", phase: PHASE_LABELS[0], assignee: users[1]?.name ?? "Alice Admin", due: project.due });
  const assigneeListId = `assignee-suggestions-${project.id}`;
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Task | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) return;
    addTask(project.id, { ...form, label: form.label.trim(), assignee: form.assignee.trim() });
    setForm({ ...form, label: "" });
  };

  const done = projectTasks.filter((t) => t.done).length;
  const today = todayISO();

  return (
    <div className="space-y-4">
      {mode === "admin" && (
        <Card className="p-4">
          <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto] sm:items-end">
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Nouvelle tâche</span>
              <input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Ex. Préparer la démonstration client"
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Phase</span>
              <select value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })} className={cn(inputClass, "w-auto")}>
                {PHASE_LABELS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Assignée à</span>
              <input
                list={assigneeListId}
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                placeholder="Choisir ou saisir un nom…"
                className={cn(inputClass, "w-auto min-w-[180px]")}
              />
              <datalist id={assigneeListId}>
                {users.map((u) => (
                  <option key={u.id} value={u.name} />
                ))}
                {projectTasks
                  .map((t) => t.assignee)
                  .filter((name, i, arr) => name && arr.indexOf(name) === i && !users.some((u) => u.name === name))
                  .map((name) => (
                    <option key={name} value={name} />
                  ))}
              </datalist>
            </label>
            <label className="block">
              <span className="mb-1 block text-[11px] font-medium text-gray-500">Échéance</span>
              <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className={cn(inputClass, "w-auto")} />
            </label>
            <PrimaryButton type="submit">
              <Plus className="h-3.5 w-3.5" />
              Ajouter
            </PrimaryButton>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="text-sm font-bold text-gray-900">Tâches du projet</h2>
          <span className="text-xs text-gray-500">
            {done}/{projectTasks.length} terminées
          </span>
        </div>
        <div className="divide-y divide-gray-100">
          {PHASE_LABELS.map((phase) => {
            const rows = projectTasks.filter((t) => t.phase === phase);
            if (rows.length === 0) return null;
            return (
              <div key={phase}>
                <div className="bg-gray-50/80 px-6 py-2 text-[11px] font-semibold tracking-wide text-gray-400 uppercase">
                  {phase}
                </div>
                <ul className="divide-y divide-gray-100">
                  {rows.map((t) => {
                    const late = !t.done && t.due < today;
                    return (
                      <li
                        key={t.id}
                        onClick={() => setOpenTask(t)}
                        className="flex cursor-pointer items-center gap-3 px-6 py-3 transition-colors duration-150 hover:bg-gray-50/70"
                      >
                        <input
                          type="checkbox"
                          checked={t.done}
                          disabled={mode === "client"}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleTask(t.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Tâche : ${t.label}`}
                          className="h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-ink disabled:cursor-not-allowed"
                        />
                        <span className={cn("min-w-0 flex-1 text-[13px]", t.done ? "text-gray-400 line-through" : "text-gray-800")}>
                          {t.label}
                        </span>
                        {t.priority && (t.priority === "haute" || t.priority === "critique") && (
                          <span
                            className={cn(
                              "hidden h-1.5 w-1.5 shrink-0 rounded-full sm:inline-block",
                              t.priority === "critique" ? "bg-red-500" : "bg-amber-500",
                            )}
                            aria-hidden="true"
                            title={`Priorité ${PRIORITY_META[t.priority].label}`}
                          />
                        )}
                        <span className="hidden items-center gap-1.5 sm:flex">
                          <Avatar name={t.assignee} size="sm" />
                          <span className="text-xs text-gray-500">{t.assignee}</span>
                        </span>
                        <span
                          className={cn(
                            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            t.done
                              ? "bg-emerald-50 text-emerald-700"
                              : late
                                ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-gray-500",
                          )}
                        >
                          <CalendarDays className="h-3 w-3" />
                          {t.done ? "Fait" : late ? `Retard · ${fmtDay(t.due)}` : fmtDay(t.due)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </Card>

      {openTask && (
        <TaskDetailModal
          task={openTask}
          mode={mode}
          onClose={() => setOpenTask(null)}
          onToggle={() => {
            toggleTask(openTask.id);
            const updated = tasks.find((x) => x.id === openTask.id);
            if (updated) {
              setOpenTask({ ...updated, done: !updated.done });
            } else {
              setOpenTask(null);
            }
          }}
          onSave={(patch) => {
            updateTask(openTask.id, patch);
            setOpenTask({ ...openTask, ...patch });
          }}
        />
      )}
    </div>
  );
}

/* ---------- Validations ---------- */

const VAL_BADGE: Record<Validation["status"], { label: string; cls: string; icon: LucideIcon }> = {
  validee: { label: "Validée", cls: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  "en-attente": { label: "En attente client", cls: "bg-amber-50 text-amber-700", icon: Clock3 },
  "a-venir": { label: "À venir", cls: "bg-slate-100 text-slate-500", icon: Circle },
  refusee: { label: "Modification demandée", cls: "bg-red-50 text-red-600", icon: XCircle },
};

function ValidationsTab({ project, mode, clientActor }: { project: Project; mode: "admin" | "client"; clientActor: string }) {
  const { validations, decideValidation, setValidationStatus, addRequest, addValidation } = useApp();
  const rows = validations.filter((v) => v.projectId === project.id);
  const [askFor, setAskFor] = useState<Validation | null>(null);
  const [ask, setAsk] = useState({ title: "", description: "" });
  const [refuseFor, setRefuseFor] = useState<Validation | null>(null);
  const [refuse, setRefuse] = useState({ title: "", description: "" });
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ label: "", approver: "", date: todayISO() });
  const approverListId = `approver-suggestions-${project.id}`;

  const openAsk = (v: Validation) => {
    setAskFor(v);
    setAsk({ title: `Modification demandée — ${v.label}`, description: "" });
  };

  const submitAsk = (e: FormEvent) => {
    e.preventDefault();
    if (!askFor || !ask.title.trim()) return;
    decideValidation(askFor.id, "refusee", clientActor);
    addRequest(project.id, { title: ask.title.trim(), description: ask.description.trim() || "Demande de modification sur le livrable.", author: clientActor });
    setAskFor(null);
  };

  const openRefuse = (v: Validation) => {
    setRefuseFor(v);
    setRefuse({ title: `Refus du livrable — ${v.label}`, description: "" });
  };

  const submitRefuse = (e: FormEvent) => {
    e.preventDefault();
    if (!refuseFor || !refuse.title.trim()) return;
    decideValidation(refuseFor.id, "refusee", clientActor);
    addRequest(project.id, {
      title: refuse.title.trim(),
      description: refuse.description.trim() || "Le client refuse le livrable proposé.",
      author: clientActor,
    });
    setRefuseFor(null);
  };

  const submitAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!addForm.label.trim() || !addForm.approver.trim()) return;
    addValidation(project.id, {
      label: addForm.label.trim(),
      approver: addForm.approver.trim(),
      date: addForm.date,
    });
    setAddForm({ label: "", approver: "", date: todayISO() });
    setAddOpen(false);
  };

  const approverSuggestions = Array.from(
    new Set([
      ...rows.map((r) => r.approver).filter(Boolean),
      clientActor.replace(" (client)", "").trim(),
    ]),
  );

  const ADMIN_ACTIONS: { status: ValidationStatus; label: string; cls: string; icon: LucideIcon }[] = [
    { status: "a-venir", label: "Remettre à venir", cls: "text-gray-600", icon: Circle },
    { status: "en-attente", label: "Remettre en attente", cls: "text-amber-700", icon: Clock3 },
    { status: "validee", label: "Marquer comme validée", cls: "text-emerald-700", icon: CheckCircle2 },
    { status: "refusee", label: "Marquer comme refusée", cls: "text-red-600", icon: XCircle },
  ];

  return (
    <>
      <Card className="divide-y divide-gray-100 overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Validations attendues</h2>
            <p className="mt-0.5 text-[12px] text-gray-500">
              {mode === "client" ? "Vous pouvez valider ou refuser le livrable proposé." : "Suivez l'avancement des validations et ajustez leur statut si besoin."}
            </p>
          </div>
          {mode === "admin" && (
            <PrimaryButton onClick={() => setAddOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Nouvelle validation
            </PrimaryButton>
          )}
        </div>
        {rows.map((v) => {
          const meta = VAL_BADGE[v.status];
          const Icon = meta.icon;
          const currentAction = ADMIN_ACTIONS.filter((a) => a.status !== v.status);
          return (
            <div key={v.id} className="relative flex flex-wrap items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-gray-50/70">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-gray-600">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-gray-900">{v.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Approbateur : {v.approver} · échéance {formatDate(v.date)}
                </p>
              </div>
              <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", meta.cls)}>
                <Icon className="h-3.5 w-3.5" />
                {meta.label}
              </span>
              {mode === "client" && v.status === "en-attente" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => decideValidation(v.id, "validee", clientActor)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Valider
                  </button>
                  <GhostButton onClick={() => openAsk(v)} className="px-3 py-1.5 text-xs">
                    Demander une modification
                  </GhostButton>
                  <GhostButton onClick={() => openRefuse(v)} className="px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-600">
                    <XCircle className="h-3.5 w-3.5" />
                    Refuser
                  </GhostButton>
                </div>
              )}
              {mode === "client" && v.status === "a-venir" && (
                <span className="text-[12px] text-gray-500 italic">En attente d'ouverture côté équipe projet.</span>
              )}
              {mode === "admin" && (
                <div className="relative">
                  <GhostButton
                    onClick={() => setOpenMenu(openMenu === v.id ? null : v.id)}
                    aria-haspopup="menu"
                    aria-expanded={openMenu === v.id}
                    className="px-2.5 py-1.5 text-xs"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                    Changer le statut
                    <ChevronDown className="h-3 w-3" />
                  </GhostButton>
                  {openMenu === v.id && (
                    <>
                      <button
                        type="button"
                        aria-label="Fermer le menu"
                        className="fixed inset-0 z-30 cursor-default"
                        onClick={() => setOpenMenu(null)}
                      />
                      <div
                        role="menu"
                        className="absolute right-0 z-40 mt-2 w-60 overflow-hidden rounded-md border border-hairline bg-white py-1 shadow-lg"
                      >
                        <p className="px-3 py-1.5 text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                          Définir le statut
                        </p>
                        {currentAction.map((a) => {
                          const AIcon = a.icon;
                          return (
                            <button
                              key={a.status}
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setValidationStatus(v.id, a.status, "Alice Admin");
                                setOpenMenu(null);
                              }}
                              className={cn(
                                "flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-gray-50",
                                a.cls,
                              )}
                            >
                              <AIcon className="h-3.5 w-3.5" />
                              {a.label}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Card>

      <Modal
        open={askFor !== null}
        onClose={() => setAskFor(null)}
        title="Demander une modification"
        description={askFor ? `Livrable concerné : ${askFor.label}.` : undefined}
        footer={
          <>
            <GhostButton onClick={() => setAskFor(null)}>Annuler</GhostButton>
            <button
              type="submit"
              form="ask-change-form"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Envoyer la demande
            </button>
          </>
        }
      >
        <form id="ask-change-form" onSubmit={submitAsk} className="grid gap-4">
          <Field label="Intitulé de la demande">
            <input value={ask.title} onChange={(e) => setAsk({ ...ask, title: e.target.value })} required className={inputClass} />
          </Field>
          <Field label="Précisions" hint="Décrivez ce que vous souhaitez voir modifié.">
            <textarea
              value={ask.description}
              onChange={(e) => setAsk({ ...ask, description: e.target.value })}
              rows={4}
              className={cn(inputClass, "resize-none")}
              placeholder="Ex. revoir la hiérarchie visuelle du bandeau principal…"
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Nouvelle validation attendue"
        description="Planifiez un livrable à faire valider par le client."
        footer={
          <>
            <GhostButton onClick={() => setAddOpen(false)}>Annuler</GhostButton>
            <button
              type="submit"
              form="new-validation-form"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Créer la validation
            </button>
          </>
        }
      >
        <form id="new-validation-form" onSubmit={submitAdd} className="grid gap-4">
          <Field label="Intitulé du livrable" hint="Ex. Spécifications fonctionnelles, Maquettes UI, PV de recette…">
            <input
              autoFocus
              required
              value={addForm.label}
              onChange={(e) => setAddForm({ ...addForm, label: e.target.value })}
              placeholder="Ex. Validation des maquettes UI du tunnel d'achat"
              className={inputClass}
            />
          </Field>
          <Field label="Approbateur" hint="Choisissez une suggestion ou saisissez un nouveau nom.">
            <>
              <input
                list={approverListId}
                required
                value={addForm.approver}
                onChange={(e) => setAddForm({ ...addForm, approver: e.target.value })}
                placeholder="Ex. Claire Verdier"
                className={inputClass}
              />
              <datalist id={approverListId}>
                {approverSuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </>
          </Field>
          <Field label="Échéance">
            <input
              type="date"
              required
              value={addForm.date}
              onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
              className={inputClass}
            />
          </Field>
        </form>
      </Modal>

      <Modal
        open={refuseFor !== null}
        onClose={() => setRefuseFor(null)}
        title="Refuser la validation"
        description={refuseFor ? `Livrable concerné : ${refuseFor.label}.` : undefined}
        footer={
          <>
            <GhostButton onClick={() => setRefuseFor(null)}>Annuler</GhostButton>
            <button
              type="submit"
              form="refuse-validation-form"
              className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-red-700 hover:shadow-md active:scale-[0.98]"
            >
              <XCircle className="h-3.5 w-3.5" />
              Confirmer le refus
            </button>
          </>
        }
      >
        <form id="refuse-validation-form" onSubmit={submitRefuse} className="grid gap-4">
          <Field label="Motif du refus" hint="Expliquez brièvement la raison du refus pour aider l'équipe projet.">
            <input
              autoFocus
              required
              value={refuse.title}
              onChange={(e) => setRefuse({ ...refuse, title: e.target.value })}
              placeholder="Ex. Le livrable ne correspond pas au périmètre convenu"
              className={inputClass}
            />
          </Field>
          <Field label="Précisions (optionnel)">
            <textarea
              value={refuse.description}
              onChange={(e) => setRefuse({ ...refuse, description: e.target.value })}
              rows={4}
              className={cn(inputClass, "resize-none")}
              placeholder="Ajoutez des détails si nécessaire…"
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}

/* ---------- Demandes de modification ---------- */

const REQ_BADGE = {
  "en-attente": { label: "En attente", cls: "bg-amber-50 text-amber-700", icon: Clock3 },
  acceptee: { label: "Acceptée", cls: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  refusee: { label: "Refusée", cls: "bg-red-50 text-red-600", icon: XCircle },
} as const;

function RequestsTab({ project, mode, clientActor }: { project: Project; mode: "admin" | "client"; clientActor: string }) {
  const { requests, decideRequest, addRequest } = useApp();
  const rows = requests.filter((r) => r.projectId === project.id);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "" });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addRequest(project.id, { title: form.title.trim(), description: form.description.trim(), author: clientActor });
    setForm({ title: "", description: "" });
    setOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[13px] text-gray-500">
          {rows.length} demande{rows.length > 1 ? "s" : ""} · {rows.filter((r) => r.status === "en-attente").length} en attente
          d'instruction
        </p>
        {mode === "client" && (
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Nouvelle demande
          </PrimaryButton>
        )}
      </div>

      <Card className="divide-y divide-gray-100 overflow-hidden">
        {rows.map((r) => {
          const meta = REQ_BADGE[r.status];
          const Icon = meta.icon;
          return (
            <div key={r.id} className="px-6 py-4 transition-colors duration-150 hover:bg-gray-50/70">
              <div className="flex flex-wrap items-center gap-3">
                <p className="min-w-0 flex-1 text-[13px] font-medium text-gray-900">{r.title}</p>
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium", meta.cls)}>
                  <Icon className="h-3.5 w-3.5" />
                  {meta.label}
                </span>
              </div>
              {r.description && <p className="mt-1 text-[13px] leading-relaxed text-gray-600">{r.description}</p>}
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-400">
                  {r.author} · {formatDateTime(r.at)}
                </p>
                {mode === "admin" && r.status === "en-attente" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => decideRequest(r.id, "acceptee")}
                      className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Accepter
                    </button>
                    <GhostButton onClick={() => decideRequest(r.id, "refusee")} className="px-3 py-1.5 text-xs hover:bg-red-50 hover:text-red-600">
                      <XCircle className="h-3.5 w-3.5" />
                      Refuser
                    </GhostButton>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="px-6 py-10 text-center text-sm text-gray-500">
            Aucune demande de modification sur ce projet.
          </p>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouvelle demande de modification"
        description="Votre demande sera instruite par l'équipe projet ; le périmètre sera ajusté si elle est acceptée."
        footer={
          <>
            <GhostButton onClick={() => setOpen(false)}>Annuler</GhostButton>
            <button
              type="submit"
              form="new-request-form"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Soumettre la demande
            </button>
          </>
        }
      >
        <form id="new-request-form" onSubmit={submit} className="grid gap-4">
          <Field label="Intitulé">
            <input
              autoFocus
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex. Ajouter une page « Nos engagements »"
              className={inputClass}
            />
          </Field>
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className={cn(inputClass, "resize-none")}
              placeholder="Contexte, besoin, priorité souhaitée…"
            />
          </Field>
        </form>
      </Modal>
    </>
  );
}

/* ---------- Documents ---------- */

function DocumentsTab({ project, mode }: { project: Project; mode: "admin" | "client" }) {
  const { documents, addDocument, pushToast } = useApp();
  const rows = documents.filter((d) => d.projectId === project.id && (mode === "admin" || d.shared));
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; kind: DocKind; size: string; shared: boolean }>({
    name: "",
    kind: "PDF",
    size: "1,0 Mo",
    shared: true,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addDocument(project.id, { ...form, name: form.name.trim() });
    setForm({ name: "", kind: "PDF", size: "1,0 Mo", shared: true });
    setOpen(false);
  };

  const download = (d: ProjectDoc) => {
    const content = [
      "Suivi Projets — espace documentaire",
      `Projet : ${project.name}`,
      `Document : ${d.name}`,
      `Format : ${d.kind} · ${d.size}`,
      `Ajouté par ${d.by} le ${formatDate(d.at)}`,
      "",
      "(Fichier de démonstration généré par l'application.)",
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    pushToast(`Téléchargement de « ${d.name} » démarré`);
  };

  return (
    <>
      {mode === "admin" && (
        <div className="flex justify-end">
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Ajouter un document
          </PrimaryButton>
        </div>
      )}

      <Card className="divide-y divide-gray-100 overflow-hidden">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <h2 className="text-sm font-bold text-gray-900">Documents du projet</h2>
          <span className="text-xs text-gray-500">
            {mode === "client" ? `${rows.length} document${rows.length > 1 ? "s" : ""} partagé${rows.length > 1 ? "s" : ""}` : `${rows.length} fichiers`}
          </span>
        </div>
        {rows.map((d) => (
          <div key={d.id} className="flex flex-wrap items-center gap-4 px-6 py-4 transition-colors duration-150 hover:bg-gray-50/70">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold text-gray-600">
              {d.kind}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-gray-900">{d.name}</p>
              <p className="mt-0.5 text-xs text-gray-500">
                {d.size} · ajouté par {d.by} le {formatDate(d.at)}
              </p>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                d.shared ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500",
              )}
            >
              <Eye className="h-3.5 w-3.5" />
              {d.shared ? "Partagé avec le client" : "Interne"}
            </span>
            <GhostButton onClick={() => download(d)} className="px-3 py-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Télécharger
            </GhostButton>
          </div>
        ))}
        {rows.length === 0 && <p className="px-6 py-10 text-center text-sm text-gray-500">Aucun document partagé pour le moment.</p>}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Ajouter un document"
        description="Les documents partagés sont visibles dans l'espace client."
        footer={
          <>
            <GhostButton onClick={() => setOpen(false)}>Annuler</GhostButton>
            <button
              type="submit"
              form="new-doc-form"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]"
            >
              <FolderOpen className="h-3.5 w-3.5" />
              Ajouter
            </button>
          </>
        }
      >
        <form id="new-doc-form" onSubmit={submit} className="grid gap-4">
          <Field label="Nom du document">
            <input
              autoFocus
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Compte rendu de recette v1"
              className={inputClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Format">
              <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value as DocKind })} className={inputClass}>
                {(["PDF", "FIGMA", "XLSX", "DOCX", "ZIP"] as DocKind[]).map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="Taille">
              <input value={form.size} onChange={(e) => setForm({ ...form, size: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-gray-700 select-none">
            <input
              type="checkbox"
              checked={form.shared}
              onChange={(e) => setForm({ ...form, shared: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 accent-ink"
            />
            Partager avec le client dans son espace
          </label>
        </form>
      </Modal>
    </>
  );
}

/* ---------- Périmètre ---------- */

const PERIMETER_ROWS: { key: keyof Omit<Perimeter, "projectId">; label: string; placeholder: string }[] = [
  { key: "description", label: "Description", placeholder: "Décrivez l'objectif général du périmètre de projet…" },
  { key: "objectives", label: "Objectifs", placeholder: "Objectifs SMART du périmètre (ex. +25 % de conversion)…" },
  { key: "plannedPages", label: "Pages / écrans prévus", placeholder: "Listez les pages ou écrans inclus dans le périmètre…" },
  { key: "plannedFeatures", label: "Fonctionnalités prévues", placeholder: "Fonctionnalités détaillées prévues dans le périmètre…" },
  { key: "includedElements", label: "Éléments inclus", placeholder: "Livrables, ateliers, prestations inclus…" },
  { key: "excludedElements", label: "Éléments hors périmètre", placeholder: "Éléments expressément exclus du périmètre…" },
];

const EMPTY_PERIMETER = (projectId: number): Perimeter => ({
  projectId,
  description: "",
  objectives: "",
  plannedPages: "",
  plannedFeatures: "",
  includedElements: "",
  excludedElements: "",
});

function PerimeterTable({ data, onEdit, mode }: { data: Perimeter; onEdit?: () => void; mode: "admin" | "client" }) {
  const allEmpty = PERIMETER_ROWS.every((r) => !data[r.key].trim());
  if (allEmpty) {
    return (
      <p className="px-2 py-8 text-center text-sm text-gray-500">
        Aucune donnée de périmètre renseignée pour le moment{mode === "admin" ? ". Utilisez leformulaire pour commencer." : "."}
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[13px]">
          <tbody>
            {PERIMETER_ROWS.map((r) => (
              <tr key={r.key} className="border-b border-gray-100 last:border-0">
                <td className="w-1/3 min-w-[180px] align-top py-4 pr-6 text-[12px] font-medium text-gray-500 uppercase">
                  {r.label}
                </td>
                <td className="align-top py-4 pl-0 text-gray-800">
                  {data[r.key] ? (
                    <pre className="whitespace-pre-wrap leading-relaxed text-gray-700">{data[r.key]}</pre>
                  ) : (
                    <span className="text-gray-400 italic">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mode === "admin" && onEdit && (
        <div className="mt-5 flex justify-end border-t border-hairline pt-4">
          <GhostButton onClick={onEdit}>
            <Edit2 className="h-3.5 w-3.5" />
            Modifier
          </GhostButton>
        </div>
      )}
    </>
  );
}

function PerimeterTab({ project, mode }: { project: Project; mode: "admin" | "client" }) {
  const { perimeter, updatePerimeter } = useApp();
  const saved = perimeter[project.id] ?? EMPTY_PERIMETER(project.id);
  const [form, setForm] = useState<Perimeter>(saved);
  const [viewing, setViewing] = useState<"form" | "table">("form");
  const [justSaved, setJustSaved] = useState(false);

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  const save = (e: FormEvent) => {
    e.preventDefault();
    updatePerimeter(project.id, {
      description: form.description,
      objectives: form.objectives,
      plannedPages: form.plannedPages,
      plannedFeatures: form.plannedFeatures,
      includedElements: form.includedElements,
      excludedElements: form.excludedElements,
    });
    setViewing("table");
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2600);
  };

  const resetForm = () => {
    setForm(perimeter[project.id] ?? EMPTY_PERIMETER(project.id));
    setViewing("form");
  };

  if (mode === "client") {
    return (
      <Card className="overflow-hidden">
        <div className="border-b border-hairline px-6 py-4">
          <h2 className="text-sm font-bold text-gray-900">Périmètre du projet</h2>
          <p className="mt-0.5 text-[12px] text-gray-500">Définition validée par votre équipe projet.</p>
        </div>
        <div className="p-6">
          <PerimeterTable data={saved} mode={mode} />
        </div>
      </Card>
    );
  }

  if (viewing === "table") {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Périmètre du projet</h2>
            <p className="mt-0.5 text-[12px] text-gray-500">Contenu enregistré et partagé avec l'espace client.</p>
          </div>
          {justSaved && (
            <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Enregistré
            </span>
          )}
        </div>
        <div className="p-6">
          <PerimeterTable data={perimeter[project.id] ?? EMPTY_PERIMETER(project.id)} mode={mode} onEdit={resetForm} />
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={save} className="space-y-5">
      {PERIMETER_ROWS.map((f) => (
        <Field key={f.key} label={f.label}>
          <textarea
            value={form[f.key]}
            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
            rows={4}
            className={cn(inputClass, "resize-y min-h-[96px]")}
            placeholder={f.placeholder}
            spellCheck="true"
          />
        </Field>
      ))}

      <div className="flex items-center justify-end gap-3 border-t border-hairline pt-5">
        <GhostButton type="button" onClick={resetForm}>
          Annuler
        </GhostButton>
        <PrimaryButton type="submit" disabled={!dirty}>
          <Save className="h-3.5 w-3.5" />
          Enregistrer
        </PrimaryButton>
      </div>
    </form>
  );
}

/* ---------- Historique ---------- */

function HistoryTimeline({ project, events }: { project: Project; events: ProjectEvent[] }) {
  const { pushToast } = useApp();
  const sorted = useMemo(() => sortEventsDesc(events), [events]);

  const exportCsv = () => {
    const rows = [
      ["Date", "Auteur", "Type", "Modification"],
      ...sorted.map((e) => [formatDateTime(e.at), e.author, EVENT_META[e.type].label, e.message]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
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
      <ol className="relative px-6 py-6 before:absolute before:top-10 before:bottom-10 before:left-[39px] before:w-px before:bg-gray-200">
        {sorted.map((e) => {
          const Icon = EVENT_ICONS[e.type];
          return (
            <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
              <span
                className={cn(
                  "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
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
        {sorted.length === 0 && <li className="px-1 py-4 text-sm text-gray-500">Aucune modification enregistrée pour le moment.</li>}
      </ol>
    </Card>
  );
}

/* ---------- Espace de travail à onglets ---------- */

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
                  className="group rounded-lg border border-hairline bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
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

/* ---------- Page admin ---------- */

export function ProjectDetailPage() {
  const { projects, tasks, clients, projectView, closeProject, openPortal, updateProject, pushToast } = useApp();
  const project = projects.find((p) => p.id === projectView);
  const [draftStatus, setDraftStatus] = useState<Project["status"] | null>(null);

  if (!project) return null;

  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const tasksDone = projectTasks.filter((t) => t.done).length;
  const progress = projectTasks.length === 0 ? 0 : Math.round((tasksDone / projectTasks.length) * 100);
  const status = draftStatus ?? project.status;
  const dirty = status !== project.status;
  const client = clients.find((c) => c.name === project.client);

  const save = () => {
    if (!dirty) return;
    updateProject(project.id, { status }, {
      type: "statut",
      message: `Statut passé de « ${STATUS_META[project.status].label} » à « ${STATUS_META[status].label} ».`,
    });
    setDraftStatus(null);
    pushToast("Suivi enregistré — historique et espace client actualisés");
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={closeProject}
        className="inline-flex items-center gap-1.5 text-[13px] text-gray-600 transition-colors hover:text-ink hover:underline"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Retour aux projets
      </button>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-gray-500">
            <span>{project.client}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {project.members} membres
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5">
              <ListChecks className="h-3.5 w-3.5" />
              {tasksDone}/{projectTasks.length} tâches terminées
            </span>
          </p>
        </div>
        {client && (
          <GhostButton onClick={() => openPortal(client.id, project.id)}>
            <Eye className="h-3.5 w-3.5" />
            Vue espace client
          </GhostButton>
        )}
      </div>

      {project.description && (
        <Card className="p-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-gray-600">
              <FileText className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-bold text-gray-900">Description du projet</h2>
          </div>
          <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-gray-700">
            {project.description}
          </p>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Mettre à jour le suivi</h2>
            <p className="mt-0.5 text-xs text-gray-500">
              La progression est calculée automatiquement à partir des tâches terminées ({progress} %).
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-[13px] font-medium text-gray-700">
              <span>Progression</span>
              <span className="font-bold text-ink tabular-nums">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200/80">
              <div
                className="h-full rounded-full bg-ink transition-[width] duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <div>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-gray-700">Statut</span>
              <select
                value={status}
                onChange={(e) => setDraftStatus(e.target.value as Project["status"])}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-shadow focus:border-ink focus:ring-2 focus:ring-ink/15 focus:outline-none lg:w-44"
              >
                {(Object.keys(STATUS_META) as Project["status"][]).map((k) => (
                  <option key={k} value={k}>
                    {STATUS_META[k].label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <GhostButton onClick={save} className={cn(!dirty && "pointer-events-none opacity-40")}>
            <Save className="h-3.5 w-3.5" />
            Enregistrer
          </GhostButton>
        </div>
      </Card>

      <ProjectWorkspace project={project} mode="admin" />
    </div>
  );
}
