import { Building2, Clock, FileCheck2, FolderOpen, Info, Lock, ShieldCheck, X } from "lucide-react";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import { Card } from "../components/ui";
import { ProjectWorkspace } from "./project-detail/ProjectWorkspace";

export function PortalPage() {
  const { portal, openPortal, closePortal, clients, projects, validations, documents } = useApp();
  if (!portal) return null;

  const client = clients.find((c) => c.id === portal.clientId);
  if (!client) return null;

  const clientProjects = projects.filter((p) => p.client === client.name);
  const current = clientProjects.find((p) => p.id === portal.projectId) ?? clientProjects[0] ?? null;

  const pendingValidations = current
    ? validations.filter((v) => v.projectId === current.id && v.status === "en-attente")
    : [];
  const sharedDocs = current
    ? documents.filter((d) => d.projectId === current.id && d.shared)
    : [];

  return (
    <div className="space-y-6">
      <div className="animate-page-in relative overflow-hidden flex flex-wrap items-center justify-between gap-5 rounded-xl bg-brand px-6 py-6 text-white shadow-xl shadow-brand/25 sm:px-8 border border-white/10">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20 shadow-inner">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">
              <Lock className="h-3 w-3 text-emerald-400" />
              Espace client sécurisé
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight">Suivi de projet — {client.name}</h1>
            <p className="mt-1 text-[13px] text-white/75 max-w-2xl leading-relaxed">
              Consultez l'avancement en direct, validez les livrables clés et accédez aux documents partagés en toute transparence.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={closePortal}
          className="inline-flex items-center gap-2 rounded-lg bg-surface px-4 py-2 text-[13px] font-medium text-ink transition-all duration-200 hover:bg-slate-100 hover:shadow-md active:scale-[0.98]"
        >
          <X className="h-3.5 w-3.5" />
          Quitter l'espace client
        </button>
      </div>

      {current && pendingValidations.length > 0 && (
        <div className="flex items-center justify-between gap-4 rounded-lg border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <Clock className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold">
                {pendingValidations.length} livrable{pendingValidations.length > 1 ? "s" : ""} en attente de votre validation
              </p>
              <p className="text-xs text-amber-700">
                Retrouvez l'onglet « Validations » ci-dessous pour approuver les livrables soumis par l'équipe.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-200/80 px-2.5 py-1 text-xs font-semibold text-amber-900">
            Action requise
          </span>
        </div>
      )}

      {clientProjects.length > 1 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Projets du client">
          {clientProjects.map((p) => {
            const active = current?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => openPortal(client.id, p.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-200 active:scale-[0.98]",
                  active
                    ? "border-ink bg-ink text-white shadow-sm shadow-ink/25"
                    : "border-hairline bg-surface text-gray-600 hover:border-gray-300 hover:text-gray-900",
                )}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {current ? (
        <ProjectWorkspace project={current} mode="client" />
      ) : (
        <Card className="px-6 py-10 text-center text-sm text-gray-500">
          Aucun projet partagé pour le moment. Votre équipe projet vous notifiera dès son ouverture.
        </Card>
      )}

      <p className="flex items-center gap-2 text-xs text-gray-500">
        <Info className="h-3.5 w-3.5 shrink-0" />
        Vous pouvez valider les livrables en attente et soumettre des demandes de modification. Pour toute autre
        question : contact@suiviprojets.fr.
      </p>
    </div>
  );
}
