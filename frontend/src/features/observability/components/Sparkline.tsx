import React from "react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { TimeSeriesDataPoint } from "../types/metrics";

interface Props {
  data: TimeSeriesDataPoint[];
  color?: string;
}

export const Sparkline: React.FC<Props> = ({ data, color = "#fbbf24" }) => {
  const chartData = data.map((point) => ({
    value: point.value
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
