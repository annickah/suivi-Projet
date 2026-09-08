import { useState } from "react";
import { ArrowLeft, Eye, FileText, ListChecks, Save, Users } from "lucide-react";
import { STATUS_META, type Project } from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import { Card, GhostButton, StatusBadge } from "../components/ui";
import { ProjectWorkspace } from "./project-detail/ProjectWorkspace";

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
                className="w-full rounded-md border border-gray-300 bg-surface px-3 py-2 text-sm text-gray-900 transition-shadow focus:border-ink focus:ring-2 focus:ring-ink/15 focus:outline-none lg:w-44"
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
