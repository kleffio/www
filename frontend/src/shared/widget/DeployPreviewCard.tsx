import { useEffect, useRef, useState } from "react";
import { KleffDot } from "@shared/ui/KleffDot";
import { cn } from "@shared/lib/utils";

import en from "@app/locales/en.json";
type PreviewTranslation = typeof en.landing.preview;

interface DeployPreviewCardProps {
  preview: PreviewTranslation;
  className?: string;
}

type DeployPhase = "hidden" | "queued" | "starting" | "building" | "done" | "failed";
type RowKind = "push" | "container" | "runtime";

interface RowState {
  id: string;
  label: string;
  kind: RowKind;
  phase: DeployPhase;
  ticksRemaining: number;
}

type Stage = "push" | "containers" | "runtime" | "completed";

interface DeployState {
  stage: Stage;
  rows: RowState[];
  metrics: {
    latencyMs: number;
    errorRate: number;
    regions: number;
    totalDeploys: number;
    failedDeploys: number;
  };
}

const FAILURE_CHANCE = 0.002;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function useIsCompact() {
  const [isCompact, setIsCompact] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const handler = () => setIsCompact(window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return isCompact;
}

function createInitialState(
  t: PreviewTranslation,
  metricsOverride?: DeployState["metrics"]
): DeployState {
  return {
    stage: "push",
    rows: [
      {
        id: "git-push",
        label: t.git_push,
        kind: "push",
        phase: "starting",
        ticksRemaining: 0
      },
      {
        id: "container-api",
        label: "api-service",
        kind: "container",
        phase: "hidden",
        ticksRemaining: 0
      },
      {
        id: "container-worker",
        label: "worker-service",
        kind: "container",
        phase: "hidden",
        ticksRemaining: 0
      },
      {
        id: "container-dashboard",
        label: "dashboard",
        kind: "container",
        phase: "hidden",
        ticksRemaining: 0
      },
      {
        id: "runtime-update",
        label: "Update runtime",
        kind: "runtime",
        phase: "hidden",
        ticksRemaining: 0
      }
    ],
    metrics: metricsOverride ?? {
      latencyMs: 132,
      errorRate: 0.04,
      regions: 3,
      totalDeploys: 0,
      failedDeploys: 0
    }
  };
}

function registerSuccess(metrics: DeployState["metrics"]): DeployState["metrics"] {
  const totalDeploys = metrics.totalDeploys + 1;
  const failedDeploys = metrics.failedDeploys;
  const errorRate = Math.min((failedDeploys / totalDeploys) * 100, 5);

  const latencyMs = clamp(metrics.latencyMs + randomInt(-8, 8), 80, 220);

  return {
    ...metrics,
    totalDeploys,
    errorRate,
    latencyMs
  };
}

function registerFailure(metrics: DeployState["metrics"]): DeployState["metrics"] {
  const totalDeploys = metrics.totalDeploys + 1;
  const failedDeploys = metrics.failedDeploys + 1;
  const errorRate = (failedDeploys / totalDeploys) * 100;

  const latencyMs = clamp(metrics.latencyMs + randomInt(5, 18), 80, 260);

  return {
    ...metrics,
    totalDeploys,
    failedDeploys,
    errorRate,
    latencyMs
  };
}

export function DeployPreviewCard({ preview: t, className }: DeployPreviewCardProps) {
  const [state, setState] = useState<DeployState>(() => createInitialState(t));
  const isCompact = useIsCompact();

  const previewRef = useRef(t);
  useEffect(() => {
    previewRef.current = t;
  }, [t]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;

      setState((prev) => advanceState(prev, previewRef.current));
    }, 800);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const statuses = t.statuses;
  const allDone = state.stage === "completed";

  const rowsToRender = isCompact
    ? state.rows
    : state.rows.filter((row) => row.phase !== "hidden");

  const { metrics } = state;
  const latencyLabel = `${metrics.latencyMs.toFixed(0)}ms`;
  const errorRateLabel = `${metrics.errorRate.toFixed(2)}%`;
  const regionsLabel = `${metrics.regions}`;

  function getStatusForPhase(
    phase: DeployPhase,
    compact: boolean
  ): { label: string; colorClass: string } {
    switch (phase) {
      case "queued":
        return { label: statuses.queued, colorClass: "text-neutral-400" };
      case "starting":
        return { label: statuses.started, colorClass: "text-sky-300" };
      case "building":
        return { label: statuses.building, colorClass: "text-amber-300" };
      case "failed":
        return { label: statuses.failed, colorClass: "text-red-400" };
      case "done":
        return { label: "Done", colorClass: "text-emerald-400" };
      case "hidden":
      default:
        if (compact) {
          return { label: statuses.queued, colorClass: "text-neutral-400" };
        }
        return { label: "", colorClass: "text-neutral-400" };
    }
  }

  return (
    <div
      className={cn(
        "glass-panel relative mx-auto max-w-3xl overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,0.04)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_55px_rgba(0,0,0,0.85)]",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/40" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span>{t.domain}</span>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-neutral-300">
          <KleffDot size={16} />
          <span>{t.preview_label}</span>
        </div>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-5">
        <div className="space-y-3 sm:col-span-3">
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span className="font-medium text-neutral-200">{t.recent_deploys}</span>
            <div className="flex items-center gap-2">
              {allDone && (
                <span className="inline-flex animate-pulse items-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                  Deployed
                </span>
              )}
              <span>{t.branch_info}</span>
            </div>
          </div>

          <div className="space-y-2 font-mono text-[11px] text-neutral-300">
            {rowsToRender.map((row) => {
              const { label, colorClass } = getStatusForPhase(row.phase, isCompact);
              const isActive =
                (row.kind === "push" && state.stage === "push") ||
                (row.kind === "container" &&
                  state.stage === "containers" &&
                  row.phase !== "done") ||
                (row.kind === "runtime" &&
                  (state.stage === "runtime" || state.stage === "completed"));

              const isFailed = row.phase === "failed";
              const isHighlighted = isActive && !isFailed;

              return (
                <div
                  key={row.id}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 transition-all duration-500",
                    isHighlighted
                      ? "border border-white/12 bg-linear-to-r from-white/12 via-white/6 to-transparent shadow-[0_0_25px_rgba(0,0,0,0.7)]"
                      : "bg-black/40"
                  )}
                >
                  <span className={isHighlighted ? "text-neutral-50" : "text-neutral-300"}>
                    {row.label}
                  </span>
                  <span className={cn(colorClass, isHighlighted && "animate-pulse")}>
                    ● {label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-start space-x-6 text-[10px] whitespace-nowrap text-neutral-400">
            <div className="flex items-center space-x-1">
              <span className="font-semibold text-neutral-100">{latencyLabel}</span>
              <span>{t.metrics.latency}</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="font-semibold text-neutral-100">{errorRateLabel}</span>
              <span>{t.metrics.error_rate}</span>
            </div>

            <div className="flex items-center space-x-1">
              <span className="font-semibold text-neutral-100">{regionsLabel}</span>
              <span>{t.metrics.regions}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 sm:col-span-2">
          <div className="rounded-xl border border-white/10 bg-black/50 p-3 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-200">{t.regions_card.title}</span>
              <span className="animate-pulse rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300 shadow-[0_0_0_1px_rgba(16,185,129,0.45)]">
                {t.regions_card.healthy}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-neutral-300">
              <div className="flex items-center justify-between">
                <span>{t.regions_card.us_east}</span>
                <span className="text-emerald-400">●</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.regions_card.eu_central}</span>
                <span className="text-emerald-400">●</span>
              </div>
              <div className="flex items-center justify-between">
                <span>{t.regions_card.ca_east}</span>
                <span className="text-emerald-400">●</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-[11px] text-amber-100">
            <div className="pointer-events-none absolute inset-0 animate-pulse bg-linear-to-r from-transparent via-amber-200/18 to-transparent opacity-0" />
            <div className="relative flex items-center justify-between">
              <span className="font-medium">{t.deploy_preview.title}</span>
              <span className="text-[10px] text-amber-200">#241</span>
            </div>
            <p className="relative mt-2 text-[10px] text-amber-100/90">
              {t.deploy_preview.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function advanceState(prev: DeployState, t: PreviewTranslation): DeployState {
  const { stage, rows, metrics } = prev;

  const reset = (metricsOverride?: DeployState["metrics"]) =>
    createInitialState(t, metricsOverride ?? metrics);

  switch (stage) {
    case "push": {
      const pushIndex = rows.findIndex((r) => r.kind === "push");
      const pushRow = rows[pushIndex];

      if (pushRow.phase === "failed") {
        return reset(metrics);
      }

      if (pushRow.phase === "starting") {
        const newRows = [...rows];
        newRows[pushIndex] = { ...pushRow, phase: "building" };
        return { ...prev, rows: newRows };
      }

      if (pushRow.phase === "building") {
        if (Math.random() < FAILURE_CHANCE) {
          const newRows = [...rows];
          newRows[pushIndex] = { ...pushRow, phase: "failed" };
          return { ...prev, rows: newRows, metrics: registerFailure(metrics) };
        }

        const newRows: RowState[] = rows.map((row): RowState => {
          if (row.id === pushRow.id) {
            return { ...row, phase: "done" };
          }
          if (row.kind === "container") {
            return {
              ...row,
              phase: "starting",
              ticksRemaining: randomInt(3, 7)
            };
          }
          return row;
        });

        return { stage: "containers", rows: newRows, metrics };
      }

      return prev;
    }

    case "containers": {
      let allDone = true;
      const newRows: RowState[] = rows.map((row): RowState => {
        if (row.kind !== "container") {
          return row;
        }

        if (row.phase === "done") {
          return row;
        }

        let phase: DeployPhase = row.phase;
        let ticks = row.ticksRemaining;

        if (phase === "starting" && ticks <= 0) {
          ticks = randomInt(3, 7);
        }

        if (ticks > 0) {
          ticks -= 1;
        }

        if ((phase === "building" || phase === "starting") && Math.random() < FAILURE_CHANCE) {
          phase = "failed";
          allDone = false;
        } else if (ticks > 2) {
          phase = "starting";
          allDone = false;
        } else if (ticks > 0) {
          phase = "building";
          allDone = false;
        } else {
          phase = "done";
        }

        return {
          ...row,
          phase,
          ticksRemaining: ticks
        };
      });

      // any container failed → reset + register failure
      if (newRows.some((r) => r.kind === "container" && r.phase === "failed")) {
        return reset(registerFailure(metrics));
      }

      if (allDone) {
        const runtimeIndex = newRows.findIndex((r) => r.kind === "runtime");
        const runtimeRow = newRows[runtimeIndex];
        const rowsWithRuntime: RowState[] = [...newRows];
        rowsWithRuntime[runtimeIndex] = {
          ...runtimeRow,
          phase: "starting",
          ticksRemaining: 0
        };
        return { stage: "runtime", rows: rowsWithRuntime, metrics };
      }

      return { ...prev, rows: newRows };
    }

    case "runtime": {
      const runtimeIndex = rows.findIndex((r) => r.kind === "runtime");
      const runtimeRow = rows[runtimeIndex];

      if (runtimeRow.phase === "failed") {
        return reset(metrics);
      }

      if (runtimeRow.phase === "starting") {
        const newRows: RowState[] = [...rows];
        newRows[runtimeIndex] = { ...runtimeRow, phase: "building" };
        return { ...prev, rows: newRows };
      }

      if (runtimeRow.phase === "building") {
        if (Math.random() < FAILURE_CHANCE) {
          const newRows: RowState[] = [...rows];
          newRows[runtimeIndex] = { ...runtimeRow, phase: "failed" };
          return { ...prev, rows: newRows, metrics: registerFailure(metrics) };
        }

        const newRows: RowState[] = [...rows];
        newRows[runtimeIndex] = { ...runtimeRow, phase: "done" };
        const newMetrics = registerSuccess(metrics);
        return { stage: "completed", rows: newRows, metrics: newMetrics };
      }

      return prev;
    }

    case "completed":
      return reset();

    default:
      return prev;
  }
}
