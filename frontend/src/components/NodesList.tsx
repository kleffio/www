import { Activity, Server } from "lucide-react";
import React from "react";
import type { NodeMetric } from "../types/metrics";
import "./NodesList.css";

interface Props {
  nodes: NodeMetric[];
  loading?: boolean;
}

export const NodesList: React.FC<Props> = ({ nodes, loading }) => {
  if (loading) {
    return (
      <div className="nodes-list loading">
        <div className="list-skeleton"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
        return "status-ready";
      case "notready":
        return "status-notready";
      default:
        return "status-unknown";
    }
  };

  // Check if nodes is an array
  if (!Array.isArray(nodes) || nodes.length === 0) {
    return (
      <div className="nodes-list">
        <div className="list-header">
          <Server size={20} />
          <h3>Node Metrics</h3>
        </div>
        <div style={{ padding: "20px", textAlign: "center", color: "#a0a0a0" }}>
          No nodes data available
        </div>
      </div>
    );
  }

  return (
    <div className="nodes-list">
      <div className="list-header">
        <Server size={20} />
        <h3>Node Metrics</h3>
      </div>

      <div className="nodes-grid">
        {nodes.map((node) => (
          <div key={node.name} className="node-card">
            <div className="node-header">
              <div className="node-name">{node.name}</div>
              <div className={`node-status ${getStatusColor(node.status)}`}>{node.status}</div>
            </div>

            <div className="node-metrics">
              <div className="metric-row">
                <span className="metric-label">CPU Usage</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar cpu"
                    style={{ width: `${node.cpuUsagePercent}%` }}
                  ></div>
                  <span className="metric-value">{node.cpuUsagePercent?.toFixed(1) ?? "0.0"}%</span>
                </div>
              </div>

              <div className="metric-row">
                <span className="metric-label">Memory</span>
                <div className="metric-bar-container">
                  <div
                    className="metric-bar memory"
                    style={{ width: `${node.memoryUsagePercent}%` }}
                  ></div>
                  <span className="metric-value">
                    {node.memoryUsagePercent?.toFixed(1) ?? "0.0"}%
                  </span>
                </div>
              </div>

              <div className="metric-row">
                <span className="metric-label">Pods</span>
                <div className="pod-count">
                  <Activity size={14} />
                  <span>{node.podCount}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
