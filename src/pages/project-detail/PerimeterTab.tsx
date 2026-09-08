import { useState, type FormEvent } from "react";
import { CheckCircle2, Edit2, Save } from "lucide-react";
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
      <p className="px-2 py-8 text-center text-sm text-gray-500">
        Aucune donnée de périmètre renseignée pour le moment{mode === "admin" ? ". Utilisez le formulaire pour commencer." : "."}
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
