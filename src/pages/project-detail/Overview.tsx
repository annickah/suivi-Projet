import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { CalendarDays, CheckCircle2, Circle, CircleDashed } from "lucide-react";
import { formatDate, todayISO, type Project } from "../../data";
import { MILESTONES, progressSeries, type ProjectEvent } from "../../history";
import { phasesFor, fmtDay } from "../../project";
import { cn } from "../../utils/cn";
import { Card, StatusBadge } from "../../components/ui";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const chartOptions: ChartOptions<"line"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#0f172a",
      padding: 10,
      cornerRadius: 6,
      displayColors: false,
      titleFont: { size: 12 },
      bodyFont: { size: 12 },
      callbacks: { label: (ctx) => `Avancement : ${ctx.parsed.y} %` },
    },
  },
  scales: {
    x: { grid: { display: false }, border: { color: "#e5e7eb" }, ticks: { color: "#9ca3af", font: { size: 11 } } },
    y: {
      min: 0,
      max: 100,
      grid: { color: "#eef0f3" },
      border: { display: false },
      ticks: { color: "#9ca3af", font: { size: 11 }, stepSize: 25, callback: (v) => `${v} %` },
    },
  },
};

/* ---------- Briques partagées de l'onglet Aperçu ---------- */

export function EvolutionChart({ project, events }: { project: Project; events?: ProjectEvent[] }) {
  const series = progressSeries(project, events);
  const data = {
    labels: series.labels,
    datasets: [
      {
        label: "Avancement",
        data: series.values,
        borderColor: "#0f172a",
        backgroundColor: "rgba(15,23,42,0.07)",
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3.5,
        pointHoverRadius: 5,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#0f172a",
        pointBorderWidth: 2,
      },
    ],
  };
  return (
    <Card className="h-full p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-bold text-gray-900">Évolution de l'avancement</h2>
        <span className="text-xs text-gray-500">Du début à l'échéance</span>
      </div>
      <div className="mt-5 h-56 sm:h-64">
        <Line data={data} options={chartOptions} />
      </div>
    </Card>
  );
}

export function Milestones({ progress }: { progress: number }) {
  const currentIndex = MILESTONES.findIndex((m) => progress < m.at);
  return (
    <Card className="h-full p-6">
      <h2 className="text-sm font-bold text-gray-900">Jalons clés</h2>
      <ul className="mt-5 space-y-4">
        {MILESTONES.map((m, i) => {
          const done = progress >= m.at;
          const current = i === currentIndex;
          return (
            <li key={m.label} className="flex items-center gap-3">
              {done ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
              ) : current ? (
                <CircleDashed className="h-4 w-4 shrink-0 animate-spin text-amber-500 [animation-duration:6s]" aria-hidden="true" />
              ) : (
                <Circle className="h-4 w-4 shrink-0 text-gray-300" aria-hidden="true" />
              )}
              <span
                className={cn(
                  "flex-1 text-[13px]",
                  done ? "font-medium text-gray-800" : current ? "text-gray-700" : "text-gray-400",
                )}
              >
                {m.label}
                {current && <span className="ml-2 text-[11px] font-medium text-amber-600">en cours</span>}
              </span>
              <span className="text-xs text-gray-400 tabular-nums">{m.at} %</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

export function InfoCards({ project }: { project: Project }) {
  const cells = [
    { label: "Statut", body: <StatusBadge status={project.status} /> },
    {
      label: "Progression",
      body: (
        <span className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight text-gray-900 tabular-nums">{project.progress}%</span>
          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-gray-200/80">
            <span className="block h-full rounded-full bg-ink" style={{ width: `${project.progress}%` }} />
          </span>
        </span>
      ),
    },
    {
      label: "Échéance",
      body: (
        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          {formatDate(project.due)}
        </span>
      ),
    },
  ];
  return (
    <Card className="grid grid-cols-1 overflow-hidden sm:grid-cols-2 lg:grid-cols-3">
      {cells.map((c, i) => (
        <div
          key={c.label}
          className={cn(
            "p-5 transition-colors duration-200 hover:bg-gray-50/70",
            i > 0 && "border-t border-gray-100 sm:border-t-0",
            i === 1 && "sm:border-l sm:border-gray-100",
            i === 2 && "sm:border-t sm:border-gray-100 lg:border-t-0 lg:border-l",
          )}
        >
          <p className="text-[13px] text-gray-500">{c.label}</p>
          <div className="mt-2">{c.body}</div>
        </div>
      ))}
    </Card>
  );
}

/* ---------- Chronogramme ---------- */

export function GanttChart({ project }: { project: Project }) {
  const phases = phasesFor(project);
  const start = Math.min(...phases.map((p) => Date.parse(p.start)));
  const end = Math.max(...phases.map((p) => Date.parse(p.end)));
  const total = Math.max(1, end - start);
  const pos = (iso: string) => Math.max(0, Math.min(100, ((Date.parse(iso + "T00:00:00") - start) / total) * 100));

  const months: { label: string; p: number }[] = [];
  const m = new Date(start);
  m.setDate(1);
  while (m.getTime() <= end) {
    const iso = m.toISOString().slice(0, 10);
    months.push({ label: m.toLocaleDateString("fr-FR", { month: "short" }), p: pos(iso) });
    m.setMonth(m.getMonth() + 1);
  }

  const today = todayISO();
  const todayP = Date.parse(today) >= start && Date.parse(today) <= end ? pos(today) : null;

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-gray-900">Chronogramme du projet</h2>
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Phase faite</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ink" />En cours</span>
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-300" />À venir</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-px bg-amber-400" />Aujourd'hui</span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="flex">
            <div className="w-32 shrink-0 sm:w-40" />
            <div className="relative h-5 flex-1">
              {months.map((t, i) => (
                <span key={i} className="absolute top-0 text-[10px] font-medium text-gray-400" style={{ left: `${t.p}%` }}>
                  {t.label}
                </span>
              ))}
            </div>
            <div className="w-10 shrink-0" />
          </div>
          <div className="divide-y divide-gray-100">
            {phases.map((ph) => (
              <div key={ph.label} className="flex items-center py-2.5">
                <div className="w-32 shrink-0 pr-3 sm:w-40">
                  <p className="truncate text-[13px] font-medium text-gray-700">{ph.label}</p>
                  <p className="text-[11px] text-gray-400">
                    {fmtDay(ph.start)} → {fmtDay(ph.end)}
                  </p>
                </div>
                <div className="relative h-8 flex-1">
                  {months.map((t, i) => (
                    <span key={i} className="absolute inset-y-0 w-px bg-gray-100" style={{ left: `${t.p}%` }} aria-hidden="true" />
                  ))}
                  {todayP !== null && (
                    <span className="absolute inset-y-0 w-px bg-amber-400/90" style={{ left: `${todayP}%` }} aria-hidden="true" />
                  )}
                  <span
                    className="absolute top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-slate-200/80"
                    style={{ left: `${pos(ph.start)}%`, width: `${Math.max(2, pos(ph.end) - pos(ph.start))}%` }}
                    title={`${ph.label} : ${ph.progress} %`}
                  >
                    <span
                      className={cn("block h-full rounded-full transition-[width] duration-700", ph.progress >= 100 ? "bg-emerald-500" : "bg-ink")}
                      style={{ width: `${ph.progress}%` }}
                    />
                  </span>
                </div>
                <div className="w-10 shrink-0 text-right text-xs tabular-nums text-gray-500">{ph.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
