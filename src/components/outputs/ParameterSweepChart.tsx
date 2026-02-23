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
import type { ParamConfig, SweepPoint } from "@/lib/sensitivity/types";

interface ParameterSweepChartProps {
  param: ParamConfig;
  data: SweepPoint[];
  currentValue: number;
}

/** Choose decimal places so ticks don't collide. */
function smartFormat(value: number, range: number): string {
  if (range === 0) return value.toFixed(2);
  // Need enough decimals so that values spanning `range` look distinct
  if (range < 0.1) return value.toFixed(3);
  if (range < 1) return value.toFixed(2);
  if (range < 10) return value.toFixed(1);
  return value.toFixed(0);
}

export function ParameterSweepChart({ param, data, currentValue }: ParameterSweepChartProps) {
  const yDomain = useMemo(() => {
    if (data.length === 0) return [0, 100];
    const temps = data.map((d) => d.tempCelsius);
    const min = Math.min(...temps);
    const max = Math.max(...temps);
    const range = max - min || 1;
    return [Math.floor(min - range * 0.1), Math.ceil(max + range * 0.1)];
  }, [data]);

  const xRange = useMemo(() => {
    if (data.length < 2) return 1;
    return data[data.length - 1].paramValue - data[0].paramValue;
  }, [data]);

  if (data.length === 0) return null;

  const formatXTick = (v: number) => {
    const formatted = smartFormat(v, xRange);
    if (param.unit === "%" || param.unit === "°") return `${formatted}${param.unit}`;
    return formatted;
  };

  return (
    <div className="h-32">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="paramValue"
            stroke="#9CA3AF"
            fontSize={11}
            tickCount={5}
            tickFormatter={formatXTick}
            domain={["dataMin", "dataMax"]}
            type="number"
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={11}
            domain={yDomain}
            tickFormatter={(v: number) => `${v}°`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f1f23",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value) =>
              typeof value === "number" ? [`${value.toFixed(1)}°C`, "Eq. temp"] : ["", ""]
            }
            labelFormatter={(label) =>
              `${param.label}: ${smartFormat(Number(label), xRange)} ${param.unit}`
            }
          />

          {/* Current value reference line */}
          <ReferenceLine x={currentValue} stroke="#f97316" strokeDasharray="5 5" strokeWidth={1} />

          <Line
            type="monotone"
            dataKey="tempCelsius"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
