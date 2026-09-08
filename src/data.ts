export type RouteId =
  | "tableau-de-bord"
  | "projets"
  | "clients"
  | "utilisateurs"
  | "notifications";

export const ROUTES: { id: RouteId; label: string }[] = [
  { id: "tableau-de-bord", label: "Tableau de bord" },
  { id: "projets", label: "Projets" },
  { id: "clients", label: "Clients" },
  { id: "utilisateurs", label: "Utilisateurs" },
  { id: "notifications", label: "Notifications" },
];

export type ProjectStatus = "en-cours" | "termine" | "en-pause" | "planifie";

export const STATUS_META: Record<
  ProjectStatus,
  { label: string; badge: string; dot: string; chart: string }
> = {
  "en-cours": {
    label: "En cours",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
    dot: "bg-amber-500",
    chart: "#f59e0b",
  },
  termine: {
    label: "Terminé",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    dot: "bg-emerald-500",
    chart: "#10b981",
  },
  "en-pause": {
    label: "En pause",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
    dot: "bg-slate-400",
    chart: "#94a3b8",
  },
  planifie: {
    label: "Planifié",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20",
    dot: "bg-sky-500",
    chart: "#0ea5e9",
  },
};

export interface Project {
  id: number;
  name: string;
  client: string;
  status: ProjectStatus;
  progress: number;
  due: string;
  members: number;
  description: string;
}

export interface Client {
  id: number;
  name: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  since: string;
}

export type UserRole = "Administrateur" | "Chef de projet" | "Contributeur" | "Lecteur";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  lastActive: string;
}

export type NotificationKind = "projet" | "client" | "utilisateur" | "systeme";

export interface AppNotification {
  id: number;
  kind: NotificationKind;
  title: string;
  message: string;
  at: number;
  read: boolean;
}

export interface Toast {
  id: number;
  message: string;
}

export const seedProjects: Project[] = [
  {
    id: 1,
    name: "Refonte du site e-commerce",
    client: "Maison Verdier",
    status: "en-cours",
    progress: 72,
    due: "2026-03-14",
    members: 5,
    description:
      "Refonte complète du site e-commerce de Maison Verdier (mode, décoration, objets d'extérieur). Moderniser l'expérience client, améliorer les taux de conversion et offrir un parcours mobile-first. Cadrage fonctionnel et design system validés avec l'équipe design interne.",
  },
  {
    id: 2,
    name: "Application mobile fidélité",
    client: "Café Luberon",
    status: "en-cours",
    progress: 45,
    due: "2026-04-02",
    members: 4,
    description:
      "Application mobile native iOS/Android de fidélité pour Café Luberon. Application dédiée aux fidélisateurs : consultation du solde, scan de carte, accès aux offres et au programme de parrainage.",
  },
  {
    id: 3,
    name: "Migration CRM & facturation",
    client: "Atelier Blanc",
    status: "en-pause",
    progress: 30,
    due: "2026-05-19",
    members: 3,
    description:
      "Migration du CRM et du module de facturation vers une solution SaaS sécurisée. Transfert des historiques clients et factures existants, avec continuité de service garantie.",
  },
  {
    id: 4,
    name: "Portail client sécurisé",
    client: "Groupe Astrée",
    status: "en-cours",
    progress: 88,
    due: "2026-02-27",
    members: 6,
    description:
      "Développement d'un portail client sécurisé pour le Groupe Astrée (BTP public). Accès privé par SSO, espace de téléchargement de documents contractuels et suivi des chantiers.",
  },
  {
    id: 5,
    name: "Identité visuelle & charte",
    client: "Studio Hélios",
    status: "termine",
    progress: 100,
    due: "2026-01-16",
    members: 2,
    description:
      "Refonte de l'identité visuelle et création d'une charte graphique complète pour Studio Hélios. Livrables : charte, déclinaisons, assets, et kit de diffusion.",
  },
  {
    id: 6,
    name: "Refonte e-commerce — lot 2",
    client: "Maison Verdier",
    status: "planifie",
    progress: 0,
    due: "2026-06-08",
    members: 4,
    description:
      "Lot 2 de la refonte e-commerce Maison Verdier : refonte du tunnel de conversion et du compte client. Complète le site livré dans le lot 1.",
  },
  {
    id: 7,
    name: "Intranet documentaire",
    client: "Clinique Saint-Roch",
    status: "en-cours",
    progress: 58,
    due: "2026-03-30",
    members: 3,
    description:
      "Déploiement d'un intranet documentaire pour la Clinique Saint-Roch. Espace sécurisé d'hébergement, de recherche et de partage de comptes-rendus d'imagerie (IRM, scanner, etc.).",
  },
  {
    id: 8,
    name: "Audit SEO & performance",
    client: "Café Luberon",
    status: "termine",
    progress: 100,
    due: "2025-12-12",
    members: 2,
    description:
      "Audit SEO & performance du site vitrine de Café Luberon. Analyse complète, plan d'action priorisé et recommandations techniques & éditoriales.",
  },
];

export const seedClients: Client[] = [
  { id: 1, name: "Maison Verdier", contact: "Claire Verdier", email: "c.verdier@maisonverdier.fr", phone: "04 72 18 32 10", city: "Lyon", since: "2023-09-01" },
  { id: 2, name: "Café Luberon", contact: "Marc Ottavi", email: "m.ottavi@cafeluberon.fr", phone: "04 90 71 55 08", city: "Aix-en-Provence", since: "2024-02-15" },
  { id: 3, name: "Atelier Blanc", contact: "Sofia Ricci", email: "s.ricci@atelierblanc.eu", phone: "01 44 61 27 90", city: "Paris", since: "2024-06-03" },
  { id: 4, name: "Groupe Astrée", contact: "Julien Mercier", email: "j.mercier@groupe-astree.fr", phone: "05 56 46 12 77", city: "Bordeaux", since: "2022-11-21" },
  { id: 5, name: "Studio Hélios", contact: "Anna Keller", email: "anna@studiohelios.fr", phone: "03 88 35 40 62", city: "Strasbourg", since: "2025-01-13" },
  { id: 6, name: "Clinique Saint-Roch", contact: "Dr Paul Vanel", email: "p.vanel@csaintroch.fr", phone: "04 67 22 81 45", city: "Montpellier", since: "2024-10-07" },
];

export const seedUsers: User[] = [
  { id: 1, name: "Alice Admin", email: "alice@suiviprojets.fr", role: "Administrateur", active: true, lastActive: "Connectée maintenant" },
  { id: 2, name: "Thomas Rivière", email: "thomas@suiviprojets.fr", role: "Chef de projet", active: true, lastActive: "Il y a 25 min" },
  { id: 3, name: "Nadia Benali", email: "nadia@suiviprojets.fr", role: "Chef de projet", active: true, lastActive: "Il y a 2 h" },
  { id: 4, name: "Lucas Fontan", email: "lucas@suiviprojets.fr", role: "Contributeur", active: false, lastActive: "Il y a 12 j" },
  { id: 5, name: "Emma Schlosser", email: "emma@suiviprojets.fr", role: "Lecteur", active: true, lastActive: "Hier, 18:42" },
];

export const ACTIVITY: { kind: NotificationKind; text: string; when: string }[] = [
  { kind: "projet", text: "Thomas Rivière a fait passer « Portail client sécurisé » à 88 %.", when: "Il y a 40 min" },
  { kind: "client", text: "Nouveau contrat signé avec Clinique Saint-Roch.", when: "Il y a 3 h" },
  { kind: "utilisateur", text: "Emma Schlosser a rejoint l'espace de travail en lecture seule.", when: "Hier, 18:42" },
  { kind: "projet", text: "« Audit SEO & performance » a été marqué terminé.", when: "Hier, 11:05" },
  { kind: "systeme", text: "Sauvegarde hebdomadaire du portefeuille effectuée.", when: "Lun., 02:00" },
];

export const MONTHS = ["Oct.", "Nov.", "Déc.", "Janv.", "Févr.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept."];
export const CREATED_PER_MONTH = [2, 4, 3, 5, 4, 6, 5, 7, 6, 8, 7, 9];
export const DELIVERED_PER_MONTH = [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7];

export function timeAgo(ts: number, now: number = Date.now()): string {
  const s = Math.max(0, Math.floor((now - ts) / 1000));
  if (s < 10) return "à l'instant";
  if (s < 60) return `il y a ${s} s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "hier";
  return `il y a ${d} j`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

export function todayLong(): string {
  const s = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
