import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import type { MetricCard as MetricCardType } from "../types/metrics";
import { Sparkline } from "./Sparkline";

interface Props {
  metric: MetricCardType;
  loading?: boolean;
}

const statusAccents = {
  excellent: "before:bg-gradient-to-b before:from-emerald-500/10 before:to-emerald-500/5",
  good: "before:bg-gradient-to-b before:from-blue-500/10 before:to-blue-500/5",
  warning: "before:bg-gradient-to-b before:from-amber-500/10 before:to-amber-500/5",
  critical: "before:bg-gradient-to-b before:from-red-500/10 before:to-red-500/5"
};

export const MetricCard: React.FC<Props> = ({ metric, loading }) => {
  if (loading) {
    return (
      <div className="relative flex min-h-[140px] items-center justify-center overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-200">
        <div className="h-20 w-full animate-pulse rounded-lg bg-gradient-to-r from-white/[0.015] via-white/[0.025] to-white/[0.015] bg-[length:200%_100%]"></div>
      </div>
    );
  }

  const isPositive = metric.changePercent?.startsWith("+") ?? false;
  const statusClass = metric.status
    ? statusAccents[metric.status as keyof typeof statusAccents]
    : "";

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/[0.08] hover:shadow-[0_6px_18px_rgba(0,0,0,0.45)] ${statusClass} before:pointer-events-none before:absolute before:inset-y-0 before:left-0 before:w-1.5 before:rounded-tl-xl before:rounded-bl-xl after:pointer-events-none after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/[0.02] after:to-transparent after:mix-blend-overlay`}
    >
      <div className="relative z-10">
        <div className="mb-3">
          <h3 className="text-[13px] font-semibold tracking-wider text-neutral-300 uppercase">
            {metric.title}
          </h3>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="mb-2 text-[34px] leading-none font-bold text-white drop-shadow-[0_1px_0_rgba(0,0,0,0.6)]">
              {metric.value}
            </div>

            <div
              className={`inline-flex items-center gap-2 rounded-full bg-white/[0.012] px-2 py-1.5 text-[13px] font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}
            >
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{metric.changePercent}</span>
            </div>
          </div>

          {metric.sparkline && metric.sparkline.length > 0 && (
            <div className="h-14 w-[140px] flex-shrink-0">
              <Sparkline data={metric.sparkline} />
            </div>
          )}
        </div>

        {metric.changeLabel && (
          <div className="mt-3 border-t border-white/[0.04] pt-3">
            <span className="text-xs text-neutral-500">{metric.changeLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
};
