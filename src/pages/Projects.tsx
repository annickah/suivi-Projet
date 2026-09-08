import { useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, CalendarDays, FolderPlus, Plus, Search, SearchX, Users } from "lucide-react";
import { STATUS_META, formatDate, type ProjectStatus } from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import {
  Card,
  EmptyState,
  Field,
  GhostButton,
  Modal,
  PageHeader,
  PrimaryButton,
  Progress,
  Reveal,
  StatusBadge,
  inputClass,
} from "../components/ui";

const emptyForm = { name: "", description: "", client: "", status: "en-cours" as ProjectStatus, due: "2026-06-30" };

export function ProjectsPage() {
  const { projects, clients, addProject, openProject } = useApp();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"tous" | ProjectStatus>("tous");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter(
      (p) =>
        (status === "tous" || p.status === status) &&
        (q === "" || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q)),
    );
  }, [projects, query, status]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    addProject({
      name: form.name.trim(),
      description: form.description.trim(),
      client: form.client || clients[0]?.name || "Interne",
      status: form.status,
      due: form.due,
    });
    setForm(emptyForm);
    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="Projets"
        subtitle={`${projects.length} projets au portefeuille · ${projects.filter((p) => p.status === "en-cours").length} en cours`}
        actions={
          <PrimaryButton onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" />
            Nouveau projet
          </PrimaryButton>
        }
      />

      <Reveal className="mt-8">
        <Card className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un projet ou un client…"
              aria-label="Rechercher un projet"
              className={cn(inputClass, "pl-9")}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "tous" | ProjectStatus)}
            aria-label="Filtrer par statut"
            className={cn(inputClass, "w-auto min-w-40")}
          >
            <option value="tous">Tous les statuts</option>
            {(Object.keys(STATUS_META) as ProjectStatus[]).map((k) => (
              <option key={k} value={k}>
                {STATUS_META[k].label}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            {filtered.length} résultat{filtered.length > 1 ? "s" : ""}
          </span>
        </Card>
      </Reveal>

      <Reveal delay={90} className="mt-6">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-hairline bg-gray-50/80 text-xs font-semibold text-gray-500">
                  <th className="px-6 py-3 font-semibold">Projet</th>
                  <th className="px-6 py-3 font-semibold">Client</th>
                  <th className="px-6 py-3 font-semibold">Statut</th>
                  <th className="px-6 py-3 font-semibold">Progression</th>
                  <th className="px-6 py-3 font-semibold">Échéance</th>
                  <th className="px-6 py-3">
                    <span className="sr-only">Suivi du projet</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => openProject(p.id)}
                    className="group cursor-pointer transition-colors duration-150 hover:bg-gray-50/70"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 transition-colors group-hover:text-ink">
                        {p.name}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        {p.members} membres
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{p.client}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4">
                      <Progress value={p.progress} className="w-40" />
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                        {formatDate(p.due)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        title="Voir l'évolution et l'historique"
                        aria-label={`Voir le suivi du projet ${p.name}`}
                        className="inline-flex rounded-md p-1.5 text-gray-300 opacity-0 transition-all duration-150 group-hover:text-ink"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={SearchX}
                        title="Aucun projet ne correspond à votre recherche"
                        hint="Essayez un autre nom, un autre client, ou changez le filtre de statut."
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouveau projet"
        description="Le projet sera ajouté au portefeuille et l'équipe sera notifiée."
        footer={
          <>
            <GhostButton onClick={() => setOpen(false)}>Annuler</GhostButton>
            <button
              type="submit"
              form="new-project-form"
              className="inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-ink-soft hover:shadow-md active:scale-[0.98]"
            >
              <FolderPlus className="h-3.5 w-3.5" />
              Créer le projet
            </button>
          </>
        }
      >
        <form id="new-project-form" onSubmit={submit} className="grid gap-4">
          <Field label="Nom du projet">
            <input
              autoFocus
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex. Refonte du portail client"
              className={inputClass}
            />
          </Field>
          <Field label="Description" hint="Résumez le contexte, les enjeux et le périmètre du projet.">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className={cn(inputClass, "resize-none")}
              placeholder="Ex. Moderniser l'expérience client et améliorer les taux de conversion."
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client">
              <select value={form.client} onChange={(e) => setForm({ ...form, client: e.target.value })} className={inputClass}>
                <option value="">— Sélectionner —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Statut">
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}
                className={inputClass}
              >
                {(Object.keys(STATUS_META) as ProjectStatus[]).map((k) => (
                  <option key={k} value={k}>
                    {STATUS_META[k].label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Échéance">
              <input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} className={inputClass} />
            </Field>
          </div>
          <p className="text-xs text-gray-500">
            La progression sera calculée automatiquement à partir des tâches terminées.
          </p>
        </form>
      </Modal>
    </>
  );
}
