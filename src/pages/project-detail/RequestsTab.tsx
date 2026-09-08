import { useState, type FormEvent } from "react";
import { CheckCircle2, Clock3, MessageSquarePlus, Plus, XCircle } from "lucide-react";
import type { Project } from "../../data";
import { formatDateTime } from "../../history";
import { useApp } from "../../store";
import { cn } from "../../utils/cn";
import { Card, Field, GhostButton, Modal, PrimaryButton, inputClass } from "../../components/ui";

const REQ_BADGE = {
  "en-attente": { label: "En attente", cls: "bg-amber-50 text-amber-700", icon: Clock3 },
  acceptee: { label: "Acceptée", cls: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  refusee: { label: "Refusée", cls: "bg-red-50 text-red-600", icon: XCircle },
} as const;

export function RequestsTab({ project, mode, clientActor }: { project: Project; mode: "admin" | "client"; clientActor: string }) {
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
        description="Votre demande sera instruite par l'équipe projet ; si elle est acceptée, son intégration au périmètre reste une décision explicite et distincte."
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
