import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";
import type { MetricCard as MetricCardType } from "../types/metrics";
import "./MetricCard.css";
import { Sparkline } from "./Sparkline";

interface Props {
  metric: MetricCardType;
  loading?: boolean;
}

export const MetricCard: React.FC<Props> = ({ metric, loading }) => {
  if (loading) {
    return (
      <div className="metric-card loading">
        <div className="metric-skeleton"></div>
      </div>
    );
  }

  const isPositive = metric.changePercent?.startsWith("+") ?? false;

  return (
    <div className={`metric-card ${metric.status}`}>
      <div className="metric-header">
        <h3 className="metric-title">{metric.title}</h3>
      </div>

      <div className="metric-content">
        <div className="metric-value-section">
          <div className="metric-value">{metric.value}</div>

          <div className={`metric-change ${isPositive ? "positive" : "negative"}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{metric.changePercent}</span>
          </div>
        </div>

        {metric.sparkline && metric.sparkline.length > 0 && (
          <div className="metric-sparkline">
            <Sparkline data={metric.sparkline} />
          </div>
        )}
      </div>

      {metric.changeLabel && (
        <div className="metric-footer">
          <span className="metric-label">{metric.changeLabel}</span>
        </div>
      )}
    </div>
  );
};
