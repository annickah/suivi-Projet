import { useEffect, useState, type FormEvent } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit2,
  Flag,
  Layers,
  MessageSquare,
  MessageSquarePlus,
  Plus,
  Save,
  Tag,
} from "lucide-react";
import { formatDate, todayISO, type Project } from "../../data";
import { formatDateTime } from "../../history";
import { PHASE_LABELS, fmtDay, type Task, type TaskPriority } from "../../project";
import { useApp } from "../../store";
import { cn } from "../../utils/cn";
import { Avatar, Card, Field, GhostButton, Modal, PrimaryButton, inputClass } from "../../components/ui";

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
}: {
  task: Task;
  mode: "admin" | "client";
  onClose: () => void;
  onToggle: () => void;
  onSave: (patch: Partial<Omit<Task, "id" | "projectId">>) => void;
}) {
  const { taskComments, addTaskComment, clients, projects } = useApp();
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
                  <div className="min-w-0 flex-1 rounded-md bg-surface p-2.5 ring-1 ring-hairline">
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

export function TasksTab({ project, mode }: { project: Project; mode: "admin" | "client" }) {
  const { tasks, toggleTask, addTask, updateTask, users } = useApp();
  const projectTasks = tasks.filter((t) => t.projectId === project.id);
  const [form, setForm] = useState({ label: "", phase: PHASE_LABELS[0], assignee: users[1]?.name ?? "Alice Admin", due: project.due });
  const assigneeListId = `assignee-suggestions-${project.id}`;
  const [openTask, setOpenTask] = useState<Task | null>(null);

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
