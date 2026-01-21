import { Card } from "@/components/ui";
import { CELSIUS_TO_KELVIN, type TimePoint } from "@/lib/thermal";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TemperatureChartProps {
  timeSeries: TimePoint[];
  equilibriumTemp: number;
  ambientTemp: number;
}

interface ChartDataPoint {
  time: number;
  timeLabel: string;
  temperature: number;
}

function formatTimeLabel(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(0)}s`;
  }
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)}m`;
  }
  const hours = minutes / 60;
  return `${hours.toFixed(1)}h`;
}

export function TemperatureChart({
  timeSeries,
  equilibriumTemp,
  ambientTemp,
}: TemperatureChartProps) {
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return timeSeries.map((point) => ({
      time: point.time,
      timeLabel: formatTimeLabel(point.time),
      temperature: point.temperature - CELSIUS_TO_KELVIN,
    }));
  }, [timeSeries]);

  const equilibriumCelsius = equilibriumTemp - CELSIUS_TO_KELVIN;
  const ambientCelsius = ambientTemp - CELSIUS_TO_KELVIN;

  // Calculate Y-axis domain with padding
  const minTemp = Math.min(ambientCelsius, ...chartData.map((d) => d.temperature));
  const maxTemp = Math.max(equilibriumCelsius, ...chartData.map((d) => d.temperature));
  const tempRange = maxTemp - minTemp;
  const yMin = Math.floor(minTemp - tempRange * 0.1);
  const yMax = Math.ceil(maxTemp + tempRange * 0.1);

  // Calculate X-axis domain
  const maxTime = chartData.length > 0 ? chartData[chartData.length - 1].time : 0;

  return (
    <Card title="Temperature vs Time">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="time"
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatTimeLabel}
              domain={[0, maxTime]}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              domain={[yMin, yMax]}
              tickFormatter={(v: number) => `${v}°`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f1f23",
                border: "1px solid #374151",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelFormatter={(value: number) => formatTimeLabel(value)}
              formatter={(value: number) => [`${value.toFixed(1)}°C`, "Temperature"]}
            />

            {/* Equilibrium reference line */}
            <ReferenceLine
              y={equilibriumCelsius}
              stroke="#f97316"
              strokeDasharray="5 5"
              strokeWidth={1}
            />

            {/* Ambient reference line */}
            <ReferenceLine
              y={ambientCelsius}
              stroke="#3b82f6"
              strokeDasharray="5 5"
              strokeWidth={1}
            />

            {/* Temperature curve */}
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#f97316"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-3 text-xs text-neutral-400">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0.5 bg-orange-500 rounded" />
          Temperature
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0 border-t-2 border-dashed border-orange-500" />
          Equilibrium ({equilibriumCelsius.toFixed(1)}°C)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-0 border-t-2 border-dashed border-blue-500" />
          Ambient ({ambientCelsius.toFixed(1)}°C)
        </span>
      </div>
    </Card>
  );
}
