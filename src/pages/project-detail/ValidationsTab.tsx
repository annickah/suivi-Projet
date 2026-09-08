import { useState, type FormEvent } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  MessageSquarePlus,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { formatDate, todayISO, type Project } from "../../data";
import type { Validation, ValidationStatus } from "../../project";
import { useApp } from "../../store";
import { cn } from "../../utils/cn";
import { Card, Field, GhostButton, Modal, PrimaryButton, inputClass } from "../../components/ui";

const VAL_BADGE: Record<Validation["status"], { label: string; cls: string; icon: LucideIcon }> = {
  validee: { label: "Validée", cls: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  "en-attente": { label: "En attente client", cls: "bg-amber-50 text-amber-700", icon: Clock3 },
  "a-venir": { label: "À venir", cls: "bg-slate-100 text-slate-500", icon: Circle },
  refusee: { label: "Modification demandée", cls: "bg-red-50 text-red-600", icon: XCircle },
};

export function ValidationsTab({ project, mode, clientActor }: { project: Project; mode: "admin" | "client"; clientActor: string }) {
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
