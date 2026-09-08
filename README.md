# Suivi Projets

> Plateforme moderne et collaborative de pilotage de projets clients, conçue pour fluidifier les échanges entre équipes de réalisation (agences, studios, ESN) et donneurs d'ordre.

---

## 📌 Présentation

**Suivi Projets** est une application web conçue pour centraliser le pilotage opérationnel, la gouvernance de périmètre et la relation client. Elle offre une double perspective :
- **Espace Collaboratif Interne** : pilotage du portefeuille de projets, planification d'équipes, découpage des tâches, suivi des livrables et gestion des changements.
- **Portail Client Dédié** : un espace transparent en consultation et validation, permettant aux clients de suivre l'avancement en temps réel, de valider des jalons, de soumettre des demandes et de télécharger leurs documents contractuels et techniques.

L'application est construite avec un rendu pixel-perfect, une ergonomie épurée et des micro-interactions réactives.

---

## ✨ Fonctionnalités Clés

### 1. Tableau de bord stratégique (Dashboard)
- **Indicateurs clés de performance (KPI)** : suivi instantané du volume de projets actifs, du taux d'avancement global et des échéances imminentes.
- **Visualisation de données (Chart.js)** :
  - Courbe comparative des projets créés vs projets livrés mois par mois.
  - Répartition dynamique des projets par statut (Donut interactif).
- **Filtres d'alerte et de focalisation** : accès en 1 clic aux projets en retard, tâches à faire, tâches bloquées et validations en attente.
- **Fil d'activité en continu** : journal d'événements en direct avec horodatage contextuel.

### 2. Gestion du Portefeuille de Projets
- **Vue d'ensemble et recherche instantanée** : filtrage croisé par statut (*En cours*, *Planifié*, *En pause*, *Terminé*) et par mots-clés (titre, client).
- **Création rapide de projet** : intégration directe avec association client et calcul prévisionnel d'équipe.

### 3. Fiche Projet Ultra-Détaillée (Espace de Travail)
Chaque projet dispose d'un espace de travail complet structuré en onglets spécialisés :
- **Synthèse & Avancement** : courbe d'évolution historique de la complétion et barre de jalons clés (Milestones).
- **Planning Gantt visuel** : représentation temporelle par phase de production (Cadrage, Design, Développement, Recette, Déploiement).
- **Gestion des Tâches** :
  - Découpage par phase et assignation aux membres.
  - Priorisation sémantique (*Basse*, *Normale*, *Haute*, *Critique*) et tags personnalisés.
  - Modal d'édition complète et fil de commentaires d'équipe dédié à chaque tâche.
- **Jalons & Validations Clients** : processus d'approbation officiel des livrables (*Validée*, *En attente*, *À venir*, *Refusée*) avec traçabilité de l'approbateur.
- **Demandes de Changement (Change Requests)** : module formel de soumission de modifications de périmètre avec workflow de décision (*En attente*, *Acceptée*, *Refusée*).
- **Gestion Documentaire** : hébergement et partage de fichiers (spécifications PDF, maquettes Figma, feuilles de calcul XLSX, documents Word, archives ZIP) avec contrôle de visibilité client.
- **Cadrage & Périmètre (Scope)** : description fonctionnelle, objectifs chiffrés, liste des pages et fonctionnalités prévues, matrice d'inclusions/exclusions.
- **Journal d'Audit & Historique (Timeline)** : traçabilité complète et chronologique de toutes les actions (mises à jour de statut, ajouts de documents, commentaires, modifications de périmètre).

### 4. Portail Client ("Espace Client")
- Vue sécurisée et simplifiée dédiée aux interlocuteurs externes.
- Sélecteur multi-projets pour les clients ayant plusieurs chantiers en cours.
- Consultation de l'avancement, du calendrier des phases et des documents partagés.
- Possibilité pour le client de valider ou refuser les livrables directement depuis son interface.

### 5. Annuaire Clients & Référents
- Fiches de contact complètes : interlocuteur principal, email, téléphone, localisation géographique et historique de collaboration.
- Raccourci d'accès direct vers le portail client de chaque compte.

### 6. Administration des Utilisateurs & Rôles
- Gestion des membres de l'équipe avec contrôle d'accès basé sur les rôles :
  - **Administrateur**
  - **Chef de projet**
  - **Contributeur**
  - **Lecteur**
- Statut d'activation et suivi de la dernière activité.

### 7. Notifications & Retours Utilisateur
- Centre de notifications avec catégorisation (*Projet*, *Client*, *Utilisateur*, *Système*).
- Gestion de lecture individuelle ou globale.
- Système de notifications toast éphémères pour confirmer chaque action utilisateur.

---

## 🛠️ Stack Technique

- **Framework** : [React 19](https://react.dev/)
- **Langage** : [TypeScript](https://www.typescriptlang.org/) (mode strict)
- **Outil de Build** : [Vite 7](https://vitejs.dev/)
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/)
- **Graphiques** : [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Export Autonome** : `vite-plugin-singlefile` (compilation possible en un unique fichier HTML indépendant)

---

## 📁 Structure du Projet

```text
suivi-Projet/
├── dist/                   # Fichiers de build (dont bundle HTML autonome)
├── public/                 # Assets statiques
├── src/
│   ├── components/         # Composants d'interface partagés
│   │   ├── Sidebar.tsx     # Navigation latérale principale
│   │   ├── Topbar.tsx      # Barre supérieure avec recherche, date et profil
│   │   ├── glyph.tsx       # Glyphes et badges visuels de notification
│   │   └── ui.tsx          # Composants UI atomiques (Card, Button, Modal, Badges, Toasts)
│   ├── pages/              # Pages et vues de l'application
│   │   ├── Dashboard.tsx   # Tableau de bord général et métriques
│   │   ├── Projects.tsx    # Liste et filtres du portefeuille de projets
│   │   ├── ProjectDetail.tsx # Fiche complète projet (Gantt, Tâches, Validations, Périmètre)
│   │   ├── Portal.tsx      # Portail Espace Client dédié
│   │   ├── Clients.tsx     # Répertoire et gestion des clients
│   │   ├── Users.tsx       # Gestion des utilisateurs et de leurs rôles
│   │   ├── Notifications.tsx # Centre d'alertes et de notifications
│   │   └── Login.tsx       # Écran d'authentification
│   ├── utils/              # Fonctions utilitaires
│   │   └── cn.ts           # Concaténation de classes Tailwind (clsx + tailwind-merge)
│   ├── data.ts             # Typages centraux et données initiales (seed)
│   ├── history.ts          # Modèle d'historique et journal d'événements
│   ├── project.ts          # Modèles de données avancés (Gantt, périmètre, validations, documents)
│   ├── store.tsx           # Contexte global React (état, actions, routage et toasts)
│   ├── index.css           # Thème global et styles Tailwind
│   ├── App.tsx             # Composant racine et routage applicatif
│   └── main.tsx            # Point d'entrée de l'application
├── package.json            # Dépendances et scripts npm
├── tsconfig.json           # Configuration TypeScript
├── vite.config.ts          # Configuration de Vite et plugins
└── README.md               # Documentation du projet
```

---

## 🚀 Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- `npm`, `pnpm` ou `yarn`

### Installation

```bash
npm install
```

### Lancement en mode développement

```bash
npm run dev
```
L'application sera accessible sur `http://localhost:5173`.

### Compilation pour la production

```bash
npm run build
```
La commande génère un fichier `dist/index.html` entièrement autonome (embarquant styles et scripts), facilement déployable sur n'importe quel serveur ou CDN, ou directement consultable en local.

### Prévisualisation du build

```bash
npm run preview
```