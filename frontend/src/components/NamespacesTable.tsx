import { Package } from "lucide-react";
import React from "react";
import type { NamespaceMetric } from "../types/metrics";
import "./NamespacesTable.css";

interface Props {
  namespaces: NamespaceMetric[];
  loading?: boolean;
}

export const NamespacesTable: React.FC<Props> = ({ namespaces, loading }) => {
  if (loading) {
    return (
      <div className="namespaces-table loading">
        <div className="table-skeleton"></div>
      </div>
    );
  }

  // Check if namespaces is an array
  if (!Array.isArray(namespaces) || namespaces.length === 0) {
    return (
      <div className="namespaces-table">
        <div className="table-header">
          <Package size={20} />
          <h3>Namespace Metrics</h3>
        </div>
        <div style={{ padding: "20px", textAlign: "center", color: "#a0a0a0" }}>
          No namespace data available
        </div>
      </div>
    );
  }

  return (
    <div className="namespaces-table">
      <div className="table-header">
        <Package size={20} />
        <h3>Namespace Metrics</h3>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Namespace</th>
              <th>Pods</th>
              <th>CPU Usage</th>
              <th>Memory Usage</th>
            </tr>
          </thead>
          <tbody>
            {namespaces.map((ns) => (
              <tr key={ns.name}>
                <td className="namespace-name">{ns.name}</td>
                <td className="pod-count">{ns.podCount}</td>
                <td className="cpu-usage">{ns.cpuUsage?.toFixed(2) ?? "0.00"} cores</td>
                <td className="memory-usage">
                  {((ns.memoryUsage || 0) / 1024 / 1024).toFixed(0)} Mi
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
