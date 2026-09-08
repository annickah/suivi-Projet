import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";
import { ArrowUpRight, AlertTriangle, Briefcase, Building2, CalendarClock, CheckCircle2, ClipboardList, ListChecks, SearchX, ShieldCheck, TrendingUp, XCircle, type LucideIcon } from "lucide-react";
import {
  ACTIVITY,
  CREATED_PER_MONTH,
  DELIVERED_PER_MONTH,
  MONTHS,
  STATUS_META,
  todayISO,
  todayLong,
  type ProjectStatus,
} from "../data";
import { useApp } from "../store";
import { cn } from "../utils/cn";
import { chartPalette, useIsDarkMode } from "../utils/theme";
import { NotificationGlyph } from "../components/glyph";
import { Card, EmptyState, PageHeader, Progress, Reveal, StatusBadge } from "../components/ui";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler);
ChartJS.defaults.font.family = 'Arial, "Helvetica Neue", Helvetica, "Segoe UI", sans-serif';

function getLineOptions(isDark: boolean): ChartOptions<"line"> {
  const p = chartPalette(isDark);
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "bottom",
        align: "end",
        labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 6, boxHeight: 6, padding: 16, font: { size: 11 }, color: p.tick },
      },
      tooltip: {
        backgroundColor: p.tooltipBg,
        padding: 10,
        cornerRadius: 6,
        displayColors: false,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: { grid: { display: false }, border: { color: p.axisLine }, ticks: { color: p.tick, font: { size: 11 } } },
      y: {
        beginAtZero: true,
        grid: { color: p.grid },
        border: { display: false },
        ticks: { color: p.tick, font: { size: 11 }, precision: 0 },
      },
    },
  };
}

function getDoughnutOptions(isDark: boolean): ChartOptions<"doughnut"> {
  const p = chartPalette(isDark);
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, pointStyle: "circle", boxWidth: 6, boxHeight: 6, padding: 14, font: { size: 11 }, color: p.tick },
      },
      tooltip: { backgroundColor: p.tooltipBg, padding: 10, cornerRadius: 6, titleFont: { size: 12 }, bodyFont: { size: 12 } },
    },
  };
}

type FilterId = "tous" | "en-cours" | "projets-retard" | "taches-a-faire" | "taches-retard" | "taches-bloquees" | "validations-attente";

const FILTER_DEFS: { id: FilterId; label: string; icon: LucideIcon; dot: string }[] = [
  { id: "tous", label: "Tous", icon: ListChecks, dot: "bg-gray-400" },
  { id: "en-cours", label: "Projets en cours", icon: Briefcase, dot: "bg-amber-500" },
  { id: "projets-retard", label: "Projets en retard", icon: AlertTriangle, dot: "bg-red-500" },
  { id: "taches-a-faire", label: "Tâches à faire", icon: ClipboardList, dot: "bg-sky-500" },
  { id: "taches-retard", label: "Tâches en retard", icon: CalendarClock, dot: "bg-red-400" },
  { id: "taches-bloquees", label: "Tâches bloquées", icon: XCircle, dot: "bg-red-600" },
  { id: "validations-attente", label: "Validations en attente", icon: ShieldCheck, dot: "bg-amber-500" },
];

export function DashboardPage() {
  const { projects, clients, tasks, validations, navigate, openProject } = useApp();
  const [filter, setFilter] = useState<FilterId>("tous");
  const isDark = useIsDarkMode();
  const chartAccent = isDark ? "#8fb0dd" : "#0f172a";

  const today = todayISO();
  const dayMs = 1000 * 60 * 60 * 24;

  const projetsEnCours = projects.filter((p) => p.status === "en-cours");
  const projetsEnRetard = projetsEnCours.filter((p) => p.due < today);
  const tachesAFaire = tasks.filter((t) => !t.done);
  const tachesEnRetard = tasks.filter((t) => !t.done && t.due < today);
  const tachesBloquees = tasks.filter((t) => !t.done && Date.parse(t.due) < Date.parse(today) - 14 * dayMs);
  const validationsEnAttente = validations.filter((v) => v.status === "en-attente");

  const filterCounts: Record<FilterId, number> = {
    "tous": projects.length,
    "en-cours": projetsEnCours.length,
    "projets-retard": projetsEnRetard.length,
    "taches-a-faire": tachesAFaire.length,
    "taches-retard": tachesEnRetard.length,
    "taches-bloquees": tachesBloquees.length,
    "validations-attente": validationsEnAttente.length,
  };

  const filteredProjects: typeof projects = (() => {
    switch (filter) {
      case "tous":
        return projects;
      case "en-cours":
        return projetsEnCours;
      case "projets-retard":
        return projetsEnRetard;
      case "taches-a-faire":
        return projetsEnCours.filter((p) => tasks.some((t) => t.projectId === p.id && !t.done));
      case "taches-retard":
        return projetsEnCours.filter((p) => tasks.some((t) => t.projectId === p.id && !t.done && t.due < today));
      case "taches-bloquees":
        return projetsEnCours.filter((p) => tasks.some((t) => t.projectId === p.id && !t.done && Date.parse(t.due) < Date.parse(today) - 14 * dayMs));
      case "validations-attente":
        return projetsEnCours.filter((p) => validations.some((v) => v.projectId === p.id && v.status === "en-attente"));
    }
  })();

  const recentProjects = filteredProjects.slice(0, 5);
  const actifs = projetsEnCours.length;
  const termines = projects.filter((p) => p.status === "termine").length;
  const avancement = Math.round(projects.reduce((s, p) => s + p.progress, 0) / Math.max(1, projects.length));

  const stats = [
    { label: "Projets actifs", value: actifs, delta: "+2 ce mois-ci", icon: Briefcase },
    { label: "Projets terminés", value: termines, delta: "1 livré cette semaine", icon: CheckCircle2 },
    { label: "Clients", value: clients.length, delta: "1 nouveau contrat", icon: Building2 },
    { label: "Avancement moyen", value: `${avancement}%`, delta: "+4 pts vs mois dernier", icon: TrendingUp },
  ];

  const statusKeys = Object.keys(STATUS_META) as ProjectStatus[];
  const statusCounts = statusKeys.map((k) => projects.filter((p) => p.status === k).length);

  const lineData = {
    labels: MONTHS,
    datasets: [
      {
        label: "Projets créés",
        data: CREATED_PER_MONTH,
        borderColor: chartAccent,
        backgroundColor: isDark ? "rgba(143,176,221,0.12)" : "rgba(15,23,42,0.06)",
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: chartAccent,
      },
      {
        label: "Projets livrés",
        data: DELIVERED_PER_MONTH,
        borderColor: "#f59e0b",
        backgroundColor: "transparent",
        fill: false,
        tension: 0.35,
        borderWidth: 2,
        borderDash: [5, 4],
        pointRadius: 0,
        pointHoverRadius: 4,
        pointBackgroundColor: "#f59e0b",
      },
    ],
  };

  const doughnutData = {
    labels: statusKeys.map((k) => STATUS_META[k].label),
    datasets: [
      {
        data: statusCounts,
        backgroundColor: statusKeys.map((k) => STATUS_META[k].chart),
        borderColor: isDark ? "#14171f" : "#ffffff",
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <>
      <PageHeader title="Tableau de bord" subtitle={todayLong()} />

      <Reveal className="mt-6">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Filtrer le tableau de bord">
          {FILTER_DEFS.map((tab) => {
            const active = filter === tab.id;
            const count = filterCounts[tab.id];
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200 active:scale-[0.98]",
                  active
                    ? "border-ink bg-ink text-white shadow-sm shadow-ink/25"
                    : "border-hairline bg-surface text-gray-600 hover:border-gray-300 hover:text-gray-900",
                )}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                    active ? "bg-white/15 text-white" : "bg-slate-100 text-gray-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>

      <Reveal className="mt-8">
        <Card className="grid grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={cn(
                "group p-6 transition-colors duration-200 hover:bg-gray-50/70",
                i > 0 && "border-t border-gray-100 sm:border-t-0",
                i === 1 && "sm:border-l sm:border-gray-100",
                i === 2 && "sm:border-t sm:border-gray-100 lg:border-t-0 lg:border-l",
                i === 3 && "sm:border-l sm:border-gray-100",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[13px] text-gray-500">{s.label}</p>
                  <p className="mt-1.5 text-2xl font-bold tracking-tight text-gray-900 tabular-nums">{s.value}</p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-ink transition-transform duration-200 group-hover:-translate-y-0.5">
                  <s.icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
                <ArrowUpRight className="h-3 w-3" />
                {s.delta}
              </p>
            </div>
          ))}
        </Card>
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Reveal delay={80} className="lg:col-span-2">
          <Card className="h-full p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-bold text-gray-900">Activité mensuelle</h2>
              <span className="text-xs text-gray-500">12 derniers mois</span>
            </div>
            <div className="mt-5 h-64 sm:h-72">
              <Line data={lineData} options={getLineOptions(isDark)} />
            </div>
          </Card>
        </Reveal>

        <Reveal delay={160}>
          <Card className="h-full p-6">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-bold text-gray-900">Répartition par statut</h2>
              <span className="text-xs text-gray-500">{projects.length} projets</span>
            </div>
            <div className="mt-5 h-64 sm:h-72">
              <Doughnut data={doughnutData} options={getDoughnutOptions(isDark)} />
            </div>
          </Card>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Reveal delay={80} className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-hairline px-6 py-4">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  {filter === "tous" ? "Projets récents" : `Projets — ${FILTER_DEFS.find((f) => f.id === filter)?.label ?? ""}`}
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {filteredProjects.length} projet{filteredProjects.length > 1 ? "s" : ""} correspondant au filtre
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("projets")}
                className="text-xs font-medium text-gray-600 transition-colors hover:text-ink hover:underline"
              >
                Voir tout
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <tbody className="divide-y divide-gray-100">
                  {recentProjects.map((p) => (
                    <tr key={p.id} className="cursor-pointer transition-colors duration-150 hover:bg-gray-50/70" onClick={() => openProject(p.id)}>
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-gray-900 transition-colors group-hover:text-ink">
                          {p.name}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">{p.client}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-6 py-3.5">
                        <Progress value={p.progress} className="w-36" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredProjects.length === 0 && (
              <EmptyState icon={SearchX} title="Aucun projet ne correspond à ce filtre" />
            )}
          </Card>
        </Reveal>

        <Reveal delay={160}>
          <Card className="h-full overflow-hidden">
            <div className="border-b border-hairline px-6 py-4">
              <h2 className="text-sm font-bold text-gray-900">Activité récente</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {ACTIVITY.map((a, i) => (
                <li key={i} className="flex items-start gap-3 px-6 py-3.5 transition-colors duration-150 hover:bg-gray-50/70">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-gray-600">
                    <NotificationGlyph kind={a.kind} className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] leading-relaxed text-gray-700">{a.text}</p>
                    <p className="mt-0.5 text-xs text-gray-400">{a.when}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </Reveal>
      </div>
    </>
  );
}
