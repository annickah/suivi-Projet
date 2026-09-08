import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  Edit2,
  FileText,
  Layout,
  Save,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import type { Project } from "../../data";
import type { Perimeter } from "../../project";
import { useApp } from "../../store";
import { cn } from "../../utils/cn";
import { Card, Field, GhostButton, PrimaryButton, inputClass } from "../../components/ui";

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
      <div className="py-12 text-center text-sm text-gray-500">
        <p className="font-medium text-gray-700">Aucune donnée de cadrage de périmètre pour le moment.</p>
        <p className="mt-1 text-xs text-gray-400">
          {mode === "admin" ? "Utilisez le formulaire pour définir les objectifs, inclusions et exclusions." : "L'équipe projet renseignera le périmètre validé."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Description & Objectifs */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-surface p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <FileText className="h-3.5 w-3.5 text-ink" />
            Description générale
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-gray-800 whitespace-pre-line">
            {data.description || <span className="italic text-gray-400">Non renseignée</span>}
          </p>
        </div>

        <div className="rounded-lg border border-hairline bg-surface p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Target className="h-3.5 w-3.5 text-emerald-600" />
            Objectifs clés
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-gray-800 whitespace-pre-line">
            {data.objectives || <span className="italic text-gray-400">Non renseignés</span>}
          </p>
        </div>
      </div>

      {/* Pages prévues & Fonctionnalités */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-hairline bg-surface p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Layout className="h-3.5 w-3.5 text-sky-600" />
            Pages / Écrans prévus
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-gray-800 whitespace-pre-line">
            {data.plannedPages || <span className="italic text-gray-400">Non renseignés</span>}
          </p>
        </div>

        <div className="rounded-lg border border-hairline bg-surface p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            Fonctionnalités prévues
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-gray-800 whitespace-pre-line">
            {data.plannedFeatures || <span className="italic text-gray-400">Non renseignées</span>}
          </p>
        </div>
      </div>

      {/* Inclusions vs Exclusions contractuelles */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/25 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Éléments inclus dans le périmètre
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-gray-800 whitespace-pre-line">
            {data.includedElements || <span className="italic text-gray-400">Aucun élément spécifié</span>}
          </p>
        </div>

        <div className="rounded-lg border border-red-200/80 bg-red-50/25 p-4 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-800">
            <XCircle className="h-4 w-4 text-red-600" />
            Éléments hors périmètre (Exclusions)
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-gray-800 whitespace-pre-line">
            {data.excludedElements || <span className="italic text-gray-400">Aucun élément exclu mentionné</span>}
          </p>
        </div>
      </div>

      {mode === "admin" && onEdit && (
        <div className="flex justify-end pt-2">
          <GhostButton onClick={onEdit}>
            <Edit2 className="h-3.5 w-3.5" />
            Modifier le périmètre
          </GhostButton>
        </div>
      )}
    </div>
  );
}

export function PerimeterTab({ project, mode }: { project: Project; mode: "admin" | "client" }) {
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
