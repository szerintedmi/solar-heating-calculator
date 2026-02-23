import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DistributionChartProps {
  temps: number[];
}

interface Bin {
  midpoint: number;
  count: number;
  label: string;
}

export function DistributionChart({ temps }: DistributionChartProps) {
  const { bins, mean, stdDev, minTemp, maxTemp } = useMemo(() => {
    if (temps.length === 0)
      return { bins: [] as Bin[], mean: 0, stdDev: 0, minTemp: 0, maxTemp: 0 };

    const min = temps[0];
    const max = temps[temps.length - 1];
    const binCount = 20;
    const binWidth = (max - min) / binCount || 1;
    const counts = new Array(binCount).fill(0);

    for (const t of temps) {
      const idx = Math.min(Math.floor((t - min) / binWidth), binCount - 1);
      counts[idx]++;
    }

    const bins: Bin[] = counts.map((count: number, i: number) => ({
      midpoint: min + binWidth * (i + 0.5),
      count,
      label: `${(min + binWidth * i).toFixed(1)}–${(min + binWidth * (i + 1)).toFixed(1)}°C`,
    }));

    const sum = temps.reduce((a, b) => a + b, 0);
    const mean = sum / temps.length;
    const variance = temps.reduce((a, t) => a + (t - mean) ** 2, 0) / temps.length;
    const stdDev = Math.sqrt(variance);

    return { bins, mean, stdDev, minTemp: min, maxTemp: max };
  }, [temps]);

  if (bins.length === 0) return null;

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={bins} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="midpoint"
              stroke="#9CA3AF"
              fontSize={11}
              tickFormatter={(v: number) => `${v.toFixed(0)}°`}
            />
            <YAxis stroke="#9CA3AF" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f23",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => (typeof value === "number" ? [value, "Count"] : ["", ""])}
              labelFormatter={(_label, payload) =>
                (payload[0]?.payload as Bin | undefined)?.label ?? ""
              }
            />
            <Bar dataKey="count" fill="#f97316" radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-neutral-400 font-mono text-center">
        Range: {minTemp.toFixed(1)}°C – {maxTemp.toFixed(1)}°C | Mean: {mean.toFixed(1)}°C | Std
        dev: {stdDev.toFixed(1)}°C
      </div>
    </div>
  );
}
