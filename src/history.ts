import type { Project } from "./data";

export type ProjectEventType =
  | "creation"
  | "progression"
  | "statut"
  | "document"
  | "commentaire"
  | "jalon"
  | "tache"
  | "validation"
  | "demande"
  | "perimetre";

export interface ProjectEvent {
  id: number;
  projectId: number;
  at: string;
  author: string;
  type: ProjectEventType;
  message: string;
}

export const EVENT_META: Record<ProjectEventType, { label: string }> = {
  creation: { label: "Création" },
  progression: { label: "Progression" },
  statut: { label: "Statut" },
  document: { label: "Document" },
  commentaire: { label: "Commentaire" },
  jalon: { label: "Jalon" },
  tache: { label: "Tâche" },
  validation: { label: "Validation" },
  demande: { label: "Demande" },
  perimetre: { label: "Périmètre" },
};

export const seedEvents: ProjectEvent[] = [
  { id: 1, projectId: 1, at: "2025-10-06T09:15:00", author: "Alice Admin", type: "creation", message: "Projet créé et rattaché au client Maison Verdier." },
  { id: 2, projectId: 1, at: "2025-10-20T10:05:00", author: "Thomas Rivière", type: "statut", message: "Statut passé de « Planifié » à « En cours » après validation du cadrage." },
  { id: 3, projectId: 1, at: "2025-11-12T14:02:00", author: "Thomas Rivière", type: "document", message: "Maquettes v2 des pages produit partagées avec le client." },
  { id: 4, projectId: 1, at: "2026-01-08T11:40:00", author: "Thomas Rivière", type: "progression", message: "Progression mise à jour : 38 % → 54 %." },
  { id: 5, projectId: 1, at: "2026-02-21T16:20:00", author: "Nadia Benali", type: "progression", message: "Progression mise à jour : 54 % → 72 %." },
  { id: 6, projectId: 1, at: "2026-02-24T10:05:00", author: "Claire Verdier (client)", type: "commentaire", message: "Validation du tunnel de commande côté client." },
  { id: 7, projectId: 2, at: "2025-11-03T10:30:00", author: "Alice Admin", type: "creation", message: "Projet créé et rattaché au client Café Luberon." },
  { id: 8, projectId: 2, at: "2025-12-18T17:45:00", author: "Nadia Benali", type: "jalon", message: "Jalon atteint : spécifications fonctionnelles validées." },
  { id: 9, projectId: 2, at: "2026-02-10T09:25:00", author: "Nadia Benali", type: "progression", message: "Progression mise à jour : 30 % → 45 %." },
  { id: 10, projectId: 2, at: "2026-02-19T15:10:00", author: "Thomas Rivière", type: "document", message: "Prototype du parcours de fidélité partagé (lien interactif)." },
  { id: 11, projectId: 3, at: "2025-09-15T08:45:00", author: "Alice Admin", type: "creation", message: "Projet créé et rattaché au client Atelier Blanc." },
  { id: 12, projectId: 3, at: "2025-12-05T13:30:00", author: "Lucas Fontan", type: "progression", message: "Progression mise à jour : 18 % → 30 %." },
  { id: 13, projectId: 3, at: "2026-01-22T09:10:00", author: "Thomas Rivière", type: "statut", message: "Statut passé de « En cours » à « En pause » — attente des extractions client." },
  { id: 14, projectId: 4, at: "2025-08-25T11:00:00", author: "Alice Admin", type: "creation", message: "Projet créé et rattaché au client Groupe Astrée." },
  { id: 15, projectId: 4, at: "2025-11-27T16:00:00", author: "Thomas Rivière", type: "jalon", message: "Jalon atteint : recette de sécurité validée (audit externe)." },
  { id: 16, projectId: 4, at: "2026-02-23T18:05:00", author: "Nadia Benali", type: "progression", message: "Progression mise à jour : 81 % → 88 %." },
  { id: 17, projectId: 4, at: "2026-02-25T09:40:00", author: "Julien Mercier (client)", type: "commentaire", message: "Retours client intégrés sur la page « Mes factures »." },
  { id: 18, projectId: 5, at: "2025-10-01T09:00:00", author: "Alice Admin", type: "creation", message: "Projet créé et rattaché au client Studio Hélios." },
  { id: 19, projectId: 5, at: "2025-12-19T12:00:00", author: "Emma Schlosser", type: "progression", message: "Progression mise à jour : 76 % → 92 %." },
  { id: 20, projectId: 5, at: "2026-01-16T17:30:00", author: "Thomas Rivière", type: "statut", message: "Statut passé de « En cours » à « Terminé »." },
  { id: 21, projectId: 5, at: "2026-01-16T17:35:00", author: "Thomas Rivière", type: "document", message: "Charte graphique finale livrée (PDF, 48 pages)." },
  { id: 22, projectId: 6, at: "2026-02-02T10:15:00", author: "Alice Admin", type: "creation", message: "Projet créé — démarrage prévu après clôture du lot 1." },
  { id: 23, projectId: 7, at: "2025-12-01T09:20:00", author: "Alice Admin", type: "creation", message: "Projet créé et rattaché au client Clinique Saint-Roch." },
  { id: 24, projectId: 7, at: "2026-01-14T11:15:00", author: "Nadia Benali", type: "document", message: "Arborescence documentaire v3 partagée avec le comité de pilotage." },
  { id: 25, projectId: 7, at: "2026-02-17T14:50:00", author: "Nadia Benali", type: "progression", message: "Progression mise à jour : 44 % → 58 %." },
  { id: 26, projectId: 8, at: "2025-10-20T08:30:00", author: "Alice Admin", type: "creation", message: "Projet créé et rattaché au client Café Luberon." },
  { id: 27, projectId: 8, at: "2025-12-12T16:45:00", author: "Thomas Rivière", type: "statut", message: "Statut passé de « En cours » à « Terminé »." },
  { id: 28, projectId: 8, at: "2025-12-12T16:50:00", author: "Thomas Rivière", type: "document", message: "Rapport d'audit et plan d'action remis au client." },
];

export const MILESTONES: { label: string; at: number }[] = [
  { label: "Cadrage & spécifications", at: 15 },
  { label: "Maquettes & design", at: 35 },
  { label: "Développement", at: 70 },
  { label: "Recette & corrections", at: 90 },
  { label: "Mise en ligne", at: 100 },
];

export function progressSeries(
  p: Project,
  events: ProjectEvent[] = [],
): { labels: string[]; values: number[] } {
  const projectEvents = events.filter((e) => e.projectId === p.id);
  const creationEvent = projectEvents.find((e) => e.type === "creation");
  const startTs = creationEvent ? Date.parse(creationEvent.at) : Date.parse(p.due) - 1000 * 60 * 60 * 24 * 60;
  const endTs = Date.parse(p.due);
  const span = Math.max(1, endTs - startTs);

  const startDate = new Date(startTs);
  const endDate = new Date(endTs);
  const monthFmt: Intl.DateTimeFormatOptions = { month: "short" };
  const labels: string[] = [];
  const values: number[] = [];
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

  const progressionEvents = projectEvents
    .filter((e) => e.type === "progression")
    .map((e) => {
      const m = e.message.match(/(\d+)\s*%\s*→\s*(\d+)\s*%/);
      if (m) return { ts: Date.parse(e.at), value: Number(m[2]) };
      const m2 = e.message.match(/(\d+)\s*%/);
      return m2 ? { ts: Date.parse(e.at), value: Number(m2[1]) } : null;
    })
    .filter((v): v is { ts: number; value: number } => v !== null)
    .sort((a, b) => a.ts - b.ts);

  let lastValue = 0;
  const firstTs = Math.min(startTs, progressionEvents[0]?.ts ?? startTs);

  while (cursor.getTime() <= lastMonth.getTime()) {
    const ts = cursor.getTime();
    if (ts >= firstTs) {
      const applicable = progressionEvents.filter((ev) => ev.ts <= ts);
      lastValue = applicable.length > 0 ? applicable[applicable.length - 1].value : 0;
    } else {
      lastValue = 0;
    }
    const ratio = Math.max(0, Math.min(1, (ts - startTs) / span));
    const expected = Math.round(ratio * p.progress);
    const value = lastValue > 0 ? Math.max(lastValue, expected) : expected;
    labels.push(cursor.toLocaleDateString("fr-FR", monthFmt));
    values.push(Math.max(0, Math.min(100, value)));
    cursor.setMonth(cursor.getMonth() + 1);
  }

  if (cursor.getTime() < endTs + 1000 * 60 * 60 * 24) {
    const ts = endTs;
    const applicable = progressionEvents.filter((ev) => ev.ts <= ts);
    lastValue = applicable.length > 0 ? applicable[applicable.length - 1].value : p.progress;
    labels.push(endDate.toLocaleDateString("fr-FR", { month: "short" }));
    values.push(lastValue);
  } else {
    values[values.length - 1] = p.progress;
  }

  return { labels, values };
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${date} à ${time}`;
}

export function sortEventsDesc(events: ProjectEvent[]): ProjectEvent[] {
  return [...events].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
