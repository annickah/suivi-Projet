import type { Project } from "./data";

export interface Phase {
  label: string;
  start: string;
  end: string;
  progress: number;
}

export type TaskPriority = "basse" | "normale" | "haute" | "critique";

export interface TaskComment {
  id: number;
  taskId: number;
  author: string;
  text: string;
  at: string;
}

export interface Task {
  id: number;
  projectId: number;
  label: string;
  phase: string;
  assignee: string;
  due: string;
  done: boolean;
  description: string;
  priority: TaskPriority;
  tags: string[];
  status?: "a-faire" | "en-cours" | "termine";
}

export type ValidationStatus = "validee" | "en-attente" | "a-venir" | "refusee";

export interface Validation {
  id: number;
  projectId: number;
  label: string;
  status: ValidationStatus;
  date: string;
  approver: string;
}

export type RequestStatus = "en-attente" | "acceptee" | "refusee";

export interface ChangeRequest {
  id: number;
  projectId: number;
  title: string;
  description: string;
  author: string;
  at: string;
  status: RequestStatus;
}

export type DocKind = "PDF" | "FIGMA" | "XLSX" | "DOCX" | "ZIP";

export interface ProjectDoc {
  id: number;
  projectId: number;
  name: string;
  kind: DocKind;
  size: string;
  shared: boolean;
  by: string;
  at: string;
}

export type ScopeStatus = "inclus" | "ajoute" | "hors";

export interface ScopeItem {
  id: number;
  projectId: number;
  label: string;
  status: ScopeStatus;
}

export interface Perimeter {
  projectId: number;
  description: string;
  objectives: string;
  plannedPages: string;
  plannedFeatures: string;
  includedElements: string;
  excludedElements: string;
}

const PERIMETER_SEED: Record<number, Omit<Perimeter, "projectId">> = {
  1: {
    description:
      "Refonte complète du site e-commerce de Maison Verdier (mode, décoration, objets d’extérieur). Objectif : moderniser l’expérience client, améliorer les taux de conversion et offrir un parcours mobile-first.\n\nCadrage fonctionnel et design system validés avec l’équipe design interne.",
    objectives:
      "Moderniser l’expérience utilisateur (mobile-first)\nAméliorer le taux de conversion (objectif : +25 %)\nOptimiser les temps de chargement (objectif : < 2s Web Vitals)\nIntégrer un moteur de recherche produit performant\nRéduire le taux de rebond",
    plannedPages:
      "Accueil\nCatalogue / liste de produits\nFiche produit\nPanier\nCheckout (1 page)\nConfirmation commande\nEspace client (compte, historique, suivi)\nMentions légales & CGV\nÀ propos / notre histoire",
    plannedFeatures:
      "Recherche produit avancée (facettes, autocomplétion)\nTri et filtrage\nSystème d’étoiles et avis clients\nGestion du panier persisté\nAuthentification client (email/magic link)\nNewsletter & popups\nPaiement en 1 ou plusieurs fois\nMulti-devise (EUR, avec décimales)",
    includedElements:
      "Ateliers de cadrage & spécifications fonctionnelles\nDesign UI complet (homepage + templates clés)\nDéveloppement front React + back e-commerce\nIntégration responsive (mobile, tablette, desktop)\nTests cross-navigateurs & recette client\nMise en ligne & formation équipe\nDocumentation technique légère",
    excludedElements:
      "Maintenance évolutive post-lancement (contrat séparé)\nDéveloppement d’une version iOS native\nRefonte du back-office comptable / ERP\nHébergement & infrastructure (géré en interne)",
  },
  2: {
    description:
      "Application mobile native iOS/Android de fidélité pour Café Luberon. Application dédiée aux fidélisateurs : consultation du solde, scan de carte, accès aux offres et au programme de parrainage.",
    objectives:
      "Lancer l’app mobile fidélité d’ici fin Q2\nAtteindre 1 000 utilisateurs actifs mensuels\nAugmenter le taux de fidélité client de 15 %\nPermettre un parcours d’onboarding fluide",
    plannedPages:
      "Splash / Chargement\nOnboarding (3 étapes)\nConnexion / Création compte\nAccueil (solde, offres)\nCarte digitale (scan)\nCatalogue d’offres\nMon profil & paramètres\nHistorique des transactions",
    plannedFeatures:
      "Scan de code-barres / QR code pour la carte\nGéolocalisation des cafés participants\nNotifications push personnalisées\nProgramme de parrainage (parrain / filleul)\nHistorique des achats & reçus numériques\nPass encastré (Wallet)" ,
    includedElements:
      "Ateliers de cadrage & spécifications\nDesign UI (maquettes Figma interactives)\nDéveloppement natif React Native (iOS + Android)\nIntégration au backend e-commerce existant\nTests fonctionnels & beta test terrain\nPublication sur App Store & Play Store\nFormation équipe support",
    excludedElements:
      "Développement d’une version web du programme fidélité\nRemplacement du système de points par du cashback\nFonctionnalités réservées aux salariésinternes (gestion stocks)",
  },
  3: {
    description:
      "Migration du CRM et du module de facturation vers une solution SaaS sécurisée. Transfert des historiques clients et factures existants, avec continuité de service garantie.",
    objectives:
      "Migrer 100 % des données clients sans perte\nGarder la disponibilité du CRM pendant 48h\nRéduire les coûts d’exploitation de 20 %\nGarantir la conformité RGPD sur les nouvelles tables",
    plannedPages:
      "Tableau de bord direction\nGestion des prospects & clients\nCatalogue de factures\nFiches client détaillées\nRapports & export CSV\nParamètres utilisateurs & droits",
    plannedFeatures:
      "Import automatisé CRM → SaaS\nSynchronisation bidirectionnelle factures\nAudit de conformité RGPD intégré\nGestion fine des droits (profil / entité)\nRecherche globale full-text\nExport CSV / PDF des rapports",
    includedElements:
      "Audit & mapping des champs existants\nMigration planifiée en 2 fenêtres de maintenance\nTests de recette sur jeux de données anonymisés\nDocumentation API & plan de bascule\nFormation utilisateurs clés (1 journée)",
    excludedElements:
      "Reprise des données antérieures à 2018\nPersonnalisation avancée du SaaS au-delà des paramétrages natifs\nHébergement des bases historiques (archivage externe)",
  },
  4: {
    description:
      "Développement d’un portail client sécurisé pour le Groupe Astrée (BTP public). Accès privé par SSO, espace de téléchargement de documents contractuels et suivi des chantiers.",
    objectives:
      "Déployer le portail à 120 comptes clients d’ici mi-février\nAssurer un niveau de sécurité exigé par la DINSIC\nPermettre l’envoi / réception sécurisée de pièces\nRéduire les échanges par email de 60 %",
    plannedPages:
      "Connexion SSO (FranceConnect / retours visuels)\nTableau de bord projet\nMes chantiers (liste & détail)\nDocuments contractuels (upload / download)\nMessagerie sécurisée\nEspace paramètres & déconnexion",
    plannedFeatures:
      "Authentification forte (MFA) optionnelle\nGestion granulaire des droits par dossier\nNotifications email & within app\nSignature électronique des PV\nAudit trail complet des accès\nTéléchargement en lot (ZIP)",
    includedElements:
      "Spécifications fonctionnelles détaillées\nDesign UI & prototypage interactif\nDéveloppement full-stack (React + Node)\nIntégration SSO via API groupe\nTests sécurité & pénétest interne\nMise en production & bascule graduelle",
    excludedElements:
      "Application mobile native du portail\nDéclinaison print & signalétique\nFonctionnalités réservées aux salariés du groupe (gestion planning interne)",
  },
  5: {
    description:
      "Refonte de l’identité visuelle et création d’une charte graphique complète pour Studio Hélios. Livrables : charte, déclinaisons, assets, et kit de diffusion.",
    objectives:
      "Livrer une charte graphique unifiée sous 3 semaines\nValider 100 % des déclinaisons couleur & typographie\nProduire les assets print & numériques\nObtenir l’aval du comité de direction",
    plannedPages:
      "Style guide en ligne (Figma)\nPalette de couleurs & nuancing\nTypographie & hiérarchie\nLogo & emblématiques\ndéclinaisons (papier, web, réseaux)\nTemplates Powerpoint & supports de présentation",
    plannedFeatures:
      "Composants UI réutilisables (boutons, cards, inputs)\nSystème d’icônes propriétaire\nPalette d’accompagnement (gris neutre & couleurs d’accent)\nMode sombre optionnel\nExport SVG & PNG optimisés",
    includedElements:
      "Atelier de co-création avec le comité directeur\nCharte graphique définitive (PDF + Figma)\nDéclinaisons & assets (ZIP)\nKit de diffusion (templates PPTX, Word)\nLivraison des fichiers sources",
    excludedElements:
      "Déclinaison print & signalétique (prestataire externe)\nIntégration au site web existant\nRédaction de contenus éditoriaux",
  },
  6: {
    description:
      "Lot 2 de la refonte e-commerce Maison Verdier : refonte du tunnel de conversion et du compte client. Complète le site livré dans le lot 1.",
    objectives:
      "Améliorer le tunnel de conversion (+12 % taux finalisation)\nModerniser l’espace client\nUnifier la UX avec le lot 1\nCompatibilité cross-navigateurs",
    plannedPages:
      "Page de catégorie & filtres avancés\nFiche produit enrichie (zoom, 360°)\nTunnel de commande en 1 page\nPage de confirmation & suivi\nEspace client (mes commandes, avis)\nPage compte utilisateur & préférences",
    plannedFeatures:
      "Gestion des variantes produit couleur/taille\nAvis clients & photos produits\nEstimation de livraison en temps réel\nRecommandations produits personnalisées\nWishlist & partage social",
    includedElements:
      "Ateliers de cadrage & spécifications détaillées\nDesign UI des nouveaux templates\nDéveloppement React & intégration\nTests cross-navigateurs & mobile-first\nMise en ligne progressive (blue/green)",
    excludedElements:
      "Refonte du back-office (lot distinct)\nMaintenance évolutive post-lancement (contrat séparé)\nDéveloppement d’une version native iOS",
  },
  7: {
    description:
      "Déploiement d’un intranet documentaire pour la Clinique Saint-Roch. Espace sécurisé d’hébergement, de recherche et de partage de comptes-rendus d’imagerie (IRM, scanner, etc.).",
    objectives:
      "Indexer 100 000 comptes-rendus d’ici 3 mois\nGarantir un accès role-based (médecins, radiologues)\nPermettre la recherche plein texte & par mots-clés\nAssurer un backup quotidien & chiffrement des données",
    plannedPages:
      "Accueil (statistiques & raccourcis)\nRecherche avancée (filtres patients, examens)\nRésultats & visualiseur DICOM léger\nFiches patient\ndossiers privés par service\nAdministration des droits & utilisateurs",
    plannedFeatures:
      "Recherche plein-texte & filtres avancés\nVisualiseur d’images médicales intégré\nGestion des droits RBAC granulaire\nTéléchargement par lot (DICOM / PDF)\nAudit trail & journalisation des accès\nIntégration LDAP/Active Directory",
    includedElements:
      "Arborescence documentaire v3 définie\nMaquettes UI (lecteur d’image & recherche)\nDéveloppement full-stack & intégration\nTests de charge & sécurité\nFormation utilisateurs (2 sessions)\nMise en production & monitoring",
    excludedElements:
      "Numérisation des archives papier (externe)\nDéclinaison print & signalétique\nRédaction de contenus éditoriaux",
  },
  8: {
    description:
      "Audit SEO & performance du site vitrine de Café Luberon. Analyse complète, plan d’action priorisé et recommandations techniques & éditoriales.",
    objectives:
      "Diagnostiquer les freins SEO (technique & contenu)\nÉtablir un plan d’action priorisé (Quick wins vs projets)\nRecommander une architecture & un netlinking\nProposer un plan de suivi mensuel des indicateurs",
    plannedPages:
      "Rapport d’audit technique (30+ points de contrôle)\nAnalyse SEO on-site (balises, sitemap, robots)\nAudit contentuel (duplicate, mots-clés ciblés)\nBenchmark concurrentiel & mots-clés\nRecommandations Core Web Vitals\nPlan d’action prioritaire (court / moyen / long terme)",
    plannedFeatures:
      "Dashboard Lighthouse & Core Web Vitals\nAudit mobile-first & accessibilité (RGAA)\nClustering de mots-clés & silos thématiques\nRecommandations de netlinking\nBrief rédaction web SEO-friendly\nMonitoring & alertes position moteurs",
    includedElements:
      "Rapport d’audit complet (PDF, 25 pages)\nPlan d’action priorisé (feuille de route)\nRecommandations techniques détaillées\nDashboard en accès lecture",
    excludedElements:
      "Déclinaison print & signalétique\nRédaction de contenus éditoriaux\nRefonte complète du site (prestataire dédié)",
  },
};

export const seedPerimeters: Perimeter[] = [];
for (const pid of Object.keys(PERIMETER_SEED)) {
  const projectId = Number(pid);
  const base = PERIMETER_SEED[projectId];
  if (!base) continue;
  seedPerimeters.push({
    projectId,
    description: base.description,
    objectives: base.objectives,
    plannedPages: base.plannedPages,
    plannedFeatures: base.plannedFeatures,
    includedElements: base.includedElements,
    excludedElements: base.excludedElements,
  });
}

const COMMENT_SEED: { taskOffset: number; projectId: number; author: string; text: string; daysAgo: number }[] = [
  { taskOffset: 0, projectId: 1, author: "Thomas Rivière", text: "Atelier très productif, on a pu valider les 3 lots fonctionnels en une seule séance.", daysAgo: 12 },
  { taskOffset: 0, projectId: 1, author: "Claire Verdier (client)", text: "Merci pour la préparation, tout était clair côté client.", daysAgo: 10 },
  { taskOffset: 1, projectId: 1, author: "Thomas Rivière", text: "Spécifications relues et partagées, j'attends le retour de la cliente sous 48h.", daysAgo: 6 },
  { taskOffset: 2, projectId: 1, author: "Nadia Benali", text: "Première vague de maquettes livrée, on enchaîne sur les gabarits responsive.", daysAgo: 4 },
  { taskOffset: 3, projectId: 1, author: "Nadia Benali", text: "Composants principaux finalisés, il reste les modales et les états vides.", daysAgo: 2 },
  { taskOffset: 0, projectId: 2, author: "Nadia Benali", text: "Atelier de cadrage prévu mardi 10h, j'envoie l'invitation dans la journée.", daysAgo: 8 },
  { taskOffset: 4, projectId: 4, author: "Thomas Rivière", text: "Audit sécurité externe reçu, aucun blocage critique. On peut continuer.", daysAgo: 14 },
  { taskOffset: 5, projectId: 4, author: "Nadia Benali", text: "Intégration de la page « Mes factures » en cours, à 70 %.", daysAgo: 3 },
];

export const seedTaskComments: TaskComment[] = [];
COMMENT_SEED.forEach((c, i) => {
  const date = new Date();
  date.setDate(date.getDate() - c.daysAgo);
  const taskId = 9000 + c.projectId * 10 + c.taskOffset;
  seedTaskComments.push({
    // Index-based : deux commentaires peuvent partager le même
    // (taskOffset, projectId) quand plusieurs personnes commentent la même
    // tâche — la formule précédente (8000 + taskOffset*100 + projectId)
    // produisait alors le même id pour les deux (ex. les deux premiers
    // commentaires du projet 1), causant des clés React dupliquées.
    id: 8001 + i,
    taskId,
    author: c.author,
    text: c.text,
    at: date.toISOString(),
  });
});

export const PHASE_LABELS = ["Cadrage", "Design", "Développement", "Recette", "Mise en ligne"];

export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function fmtDay(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

const ANCHORS: Record<number, string> = {
  1: "2025-10-06",
  2: "2025-11-03",
  3: "2025-09-15",
  4: "2025-08-25",
  5: "2025-10-01",
  6: "2026-03-10",
  7: "2025-12-01",
  8: "2025-10-20",
};

export function anchorFor(projectId: number): string {
  return ANCHORS[projectId] ?? "2026-01-05";
}

const PHASE_DEFS: { label: string; from: number; to: number; pFrom: number; pTo: number }[] = [
  { label: "Cadrage", from: 0, to: 20, pFrom: 0, pTo: 15 },
  { label: "Design", from: 15, to: 45, pFrom: 15, pTo: 35 },
  { label: "Développement", from: 40, to: 110, pFrom: 35, pTo: 70 },
  { label: "Recette", from: 105, to: 135, pFrom: 70, pTo: 90 },
  { label: "Mise en ligne", from: 130, to: 145, pFrom: 90, pTo: 100 },
];

export function phasesFor(p: Project): Phase[] {
  const anchor = anchorFor(p.id);
  return PHASE_DEFS.map((d) => {
    const ratio = Math.max(0, Math.min(1, (p.progress - d.pFrom) / (d.pTo - d.pFrom)));
    return {
      label: d.label,
      start: addDays(anchor, d.from),
      end: addDays(anchor, d.to),
      progress: Math.round(ratio * 100),
    };
  });
}

const ASSIGNEES = ["Thomas Rivière", "Nadia Benali", "Lucas Fontan", "Emma Schlosser"];

const TASK_DEFS: { label: string; phase: string; off: number; th: number; description: string; priority: TaskPriority; tags: string[] }[] = [
  { label: "Atelier de lancement & cadrage", phase: "Cadrage", off: 8, th: 10, description: "Session de travail avec le client pour valider le périmètre, identifier les parties prenantes et lister les contraintes techniques et fonctionnelles.", priority: "haute", tags: ["cadrage", "atelier"] },
  { label: "Spécifications fonctionnelles rédigées", phase: "Cadrage", off: 18, th: 15, description: "Rédaction du document de spécifications fonctionnelles, incluant les user stories, les critères d'acceptation et les parcours utilisateurs.", priority: "haute", tags: ["specs"] },
  { label: "Maquettes UI des écrans clés", phase: "Design", off: 30, th: 25, description: "Création des maquettes haute-fidélité des écrans principaux (homepage, listing, fiche produit, tunnel de conversion).", priority: "normale", tags: ["design", "UI"] },
  { label: "Design system & composants", phase: "Design", off: 44, th: 35, description: "Constitution du design system, mise en place des composants réutilisables et de la bibliothèque d'icônes.", priority: "normale", tags: ["design", "système"] },
  { label: "Développement du back-office", phase: "Développement", off: 70, th: 50, description: "Développement des écrans d'administration, des API REST et de la couche d'authentification.", priority: "haute", tags: ["dev", "back"] },
  { label: "Intégration front & responsive", phase: "Développement", off: 100, th: 65, description: "Intégration HTML/CSS des écrans sur la base des maquettes, avec adaptation responsive mobile/tablette.", priority: "haute", tags: ["dev", "front"] },
  { label: "Campagne de recette & corrections", phase: "Recette", off: 125, th: 85, description: "Phase de tests fonctionnels, remontée des anomalies, corrections et validation finale par le client.", priority: "critique", tags: ["recette", "QA"] },
  { label: "Mise en production & transfert", phase: "Mise en ligne", off: 142, th: 100, description: "Déploiement en production, configuration DNS/HTTPS, transfert de compétences aux équipes internes.", priority: "critique", tags: ["prod", "lancement"] },
];

const PROGRESS_BY_ID: Record<number, number> = { 1: 72, 2: 45, 3: 30, 4: 88, 5: 100, 6: 0, 7: 58, 8: 100 };

export const seedTasks: Task[] = [];
for (const pid of Object.keys(PROGRESS_BY_ID)) {
  const id = Number(pid);
  const progress = PROGRESS_BY_ID[id];
  const anchor = anchorFor(id);
  TASK_DEFS.forEach((t, i) => {
    seedTasks.push({
      id: 9000 + id * 10 + i,
      projectId: id,
      label: t.label,
      phase: t.phase,
      assignee: ASSIGNEES[(id + i) % ASSIGNEES.length],
      due: addDays(anchor, t.off),
      done: progress >= t.th,
      description: t.description,
      priority: t.priority,
      tags: t.tags,
    });
  });
}

const VAL_DEFS: { label: string; off: number; th: number }[] = [
  { label: "Spécifications fonctionnelles", off: 20, th: 15 },
  { label: "Maquettes UI & parcours", off: 46, th: 35 },
  { label: "PV de recette", off: 136, th: 90 },
];

const APPROVERS: Record<number, string> = {
  1: "Claire Verdier",
  2: "Marc Ottavi",
  3: "Sofia Ricci",
  4: "Julien Mercier",
  5: "Anna Keller",
  6: "Claire Verdier",
  7: "Dr Paul Vanel",
  8: "Marc Ottavi",
};

export const seedValidations: Validation[] = [];
for (const pid of Object.keys(PROGRESS_BY_ID)) {
  const id = Number(pid);
  const progress = PROGRESS_BY_ID[id];
  const anchor = anchorFor(id);
  let pendingUsed = false;
  VAL_DEFS.forEach((v, i) => {
    let status: ValidationStatus;
    if (progress >= v.th) status = "validee";
    else if (!pendingUsed) {
      status = "en-attente";
      pendingUsed = true;
    } else status = "a-venir";
    seedValidations.push({
      id: 9100 + id * 10 + i,
      projectId: id,
      label: v.label,
      status,
      date: addDays(anchor, v.off),
      approver: APPROVERS[id] ?? "Contact client",
    });
  });
}

export const seedRequests: ChangeRequest[] = [
  {
    id: 9201,
    projectId: 1,
    title: "Module cartes cadeaux",
    description: "Ajout d'un module d'achat et de gestion de cartes cadeaux dans le tunnel de commande.",
    author: "Claire Verdier (client)",
    at: "2026-01-15T10:20:00",
    status: "acceptee",
  },
  {
    id: 9202,
    projectId: 2,
    title: "Remplacer les points par du cashback",
    description: "Le système de points serait remplacé par une cagnotte en euros utilisable en caisse.",
    author: "Marc Ottavi (client)",
    at: "2026-01-28T15:02:00",
    status: "refusee",
  },
  {
    id: 9203,
    projectId: 4,
    title: "Accès mobile pour les administrateurs",
    description: "Rendre le portail utilisable sur tablette et smartphone pour les administrateurs du Groupe Astrée.",
    author: "Julien Mercier (client)",
    at: "2026-02-20T09:12:00",
    status: "en-attente",
  },
  {
    id: 9204,
    projectId: 7,
    title: "Connecteur GED pour le service imagerie",
    description: "Déposer automatiquement les comptes rendus d'imagerie dans l'intranet documentaire.",
    author: "Dr Paul Vanel (client)",
    at: "2026-02-18T17:40:00",
    status: "en-attente",
  },
];

export const seedDocuments: ProjectDoc[] = [
  { id: 9301, projectId: 1, name: "Cahier des charges v1.2", kind: "PDF", size: "1,4 Mo", shared: true, by: "Thomas Rivière", at: "2025-10-10" },
  { id: 9302, projectId: 1, name: "Maquettes UI — lot 1", kind: "FIGMA", size: "86 Mo", shared: true, by: "Thomas Rivière", at: "2025-11-12" },
  { id: 9303, projectId: 1, name: "Budget & marge prévisionnels", kind: "XLSX", size: "240 Ko", shared: false, by: "Alice Admin", at: "2025-10-08" },
  { id: 9304, projectId: 2, name: "Spécifications fonctionnelles", kind: "DOCX", size: "620 Ko", shared: true, by: "Nadia Benali", at: "2025-12-18" },
  { id: 9305, projectId: 2, name: "Prototype interactif fidélité", kind: "FIGMA", size: "54 Mo", shared: true, by: "Nadia Benali", at: "2026-02-19" },
  { id: 9306, projectId: 3, name: "Plan de migration CRM", kind: "PDF", size: "980 Ko", shared: true, by: "Lucas Fontan", at: "2025-10-02" },
  { id: 9307, projectId: 3, name: "Extractions attendues du client", kind: "XLSX", size: "1,1 Mo", shared: false, by: "Lucas Fontan", at: "2026-01-20" },
  { id: 9308, projectId: 4, name: "Rapport d'audit sécurité", kind: "PDF", size: "2,2 Mo", shared: true, by: "Thomas Rivière", at: "2025-11-27" },
  { id: 9309, projectId: 4, name: "Spécifications portail v3", kind: "DOCX", size: "740 Ko", shared: true, by: "Nadia Benali", at: "2025-09-05" },
  { id: 9310, projectId: 5, name: "Charte graphique finale", kind: "PDF", size: "48 Mo", shared: true, by: "Emma Schlosser", at: "2026-01-16" },
  { id: 9311, projectId: 5, name: "Déclinaisons & assets", kind: "ZIP", size: "310 Mo", shared: true, by: "Emma Schlosser", at: "2026-01-16" },
  { id: 9312, projectId: 6, name: "Note de cadrage lot 2", kind: "PDF", size: "320 Ko", shared: true, by: "Alice Admin", at: "2026-02-02" },
  { id: 9313, projectId: 7, name: "Arborescence documentaire v3", kind: "PDF", size: "1,8 Mo", shared: true, by: "Nadia Benali", at: "2026-01-14" },
  { id: 9314, projectId: 7, name: "Matrice des droits", kind: "XLSX", size: "210 Ko", shared: false, by: "Nadia Benali", at: "2025-12-10" },
  { id: 9315, projectId: 8, name: "Rapport d'audit SEO", kind: "PDF", size: "3,6 Mo", shared: true, by: "Thomas Rivière", at: "2025-12-12" },
  { id: 9316, projectId: 8, name: "Plan d'action priorisé", kind: "XLSX", size: "180 Ko", shared: true, by: "Thomas Rivière", at: "2025-12-12" },
];

const BASE_SCOPE = [
  "Ateliers de cadrage & spécifications",
  "Design UI complet des écrans convenus",
  "Développement front & back-office",
  "Recette, corrections & tests cross-navigateurs",
  "Mise en ligne, formation & transfert de compétences",
];

const HORS_SCOPE: Record<number, string> = {
  1: "Maintenance évolutive post-lancement (contrat séparé)",
  2: "Développement d'une version iOS native",
  3: "Reprise des données antérieures à 2018",
  4: "Application mobile native du portail",
  5: "Déclinaison print & signalétique",
  6: "Refonte du back-office (lot distinct)",
  7: "Numérisation des archives papier",
  8: "Rédaction de contenus éditoriaux",
};

export const seedScope: ScopeItem[] = [];
for (let pid = 1; pid <= 8; pid++) {
  BASE_SCOPE.forEach((label, i) => {
    seedScope.push({ id: 9400 + pid * 10 + i, projectId: pid, label, status: "inclus" });
  });
  seedScope.push({ id: 9400 + pid * 10 + 5, projectId: pid, label: HORS_SCOPE[pid] ?? "Prestations hors contrat", status: "hors" });
}
seedScope.push({ id: 9419, projectId: 1, label: "Module cartes cadeaux (demande client acceptée)", status: "ajoute" });
