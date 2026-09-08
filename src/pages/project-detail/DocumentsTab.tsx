import { useState, type FormEvent } from "react";
import { Download, Eye, FolderOpen, Plus } from "lucide-react";
import { formatDate, type Project } from "../../data";
import type { DocKind, ProjectDoc } from "../../project";
import { useApp } from "../../store";
import { cn } from "../../utils/cn";
import { Card, Field, GhostButton, Modal, PrimaryButton, inputClass } from "../../components/ui";

export function DocumentsTab({ project, mode }: { project: Project; mode: "admin" | "client" }) {
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
