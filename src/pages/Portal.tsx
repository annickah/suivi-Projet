import { Building2, Info, Lock, X } from "lucide-react";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import { Card } from "../components/ui";
import { ProjectWorkspace } from "./project-detail/ProjectWorkspace";

export function PortalPage() {
  const { portal, openPortal, closePortal, clients, projects } = useApp();
  if (!portal) return null;

  const client = clients.find((c) => c.id === portal.clientId);
  if (!client) return null;

  const clientProjects = projects.filter((p) => p.client === client.name);
  const current = clientProjects.find((p) => p.id === portal.projectId) ?? clientProjects[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="animate-page-in flex flex-wrap items-center justify-between gap-5 rounded-lg bg-brand px-6 py-6 text-white shadow-lg shadow-brand/20 sm:px-8">
        <div className="flex items-center gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/10 ring-1 ring-white/20">
            <Building2 className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.14em] text-white/60 uppercase">
              <Lock className="h-3 w-3" />
              Espace client · lecture seule
            </p>
            <h1 className="mt-1 text-lg font-bold tracking-tight">Suivi de projet — {client.name}</h1>
            <p className="mt-1 text-[13px] text-white/70">
              Évolution de vos projets, validations, documents et historique des modifications, mis à jour en
              continu par votre équipe projet.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={closePortal}
          className="inline-flex items-center gap-2 rounded-md bg-surface px-4 py-2 text-[13px] font-medium text-ink transition-all duration-200 hover:bg-slate-100 hover:shadow-md active:scale-[0.98]"
        >
          <X className="h-3.5 w-3.5" />
          Quitter l'espace client
        </button>
      </div>

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
