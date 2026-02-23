import { useCallback, useEffect, useMemo, useRef } from "react";
import type { TransientSamplePoint } from "@/lib/sensitivity/types";
import { CELSIUS_TO_KELVIN } from "@/lib/thermal";

interface TransientOverlaySectionProps {
  transientSamples: TransientSamplePoint[];
  isStale?: boolean;
}

function formatTimeLabel(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(0)}s`;
  const minutes = seconds / 60;
  if (minutes < 60) return `${minutes.toFixed(1)}m`;
  return `${(minutes / 60).toFixed(1)}h`;
}

/** Nice tick values for an axis. */
function niceTicksFor(min: number, max: number, targetCount: number): number[] {
  const range = max - min || 1;
  const rough = range / targetCount;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const nice = [1, 2, 5, 10].map((m) => m * mag);
  const step = nice.find((n) => n >= rough) ?? rough;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.001; v += step) {
    ticks.push(v);
  }
  return ticks;
}

const PADDING = { top: 10, right: 20, bottom: 28, left: 50 };

export function TransientOverlaySection({
  transientSamples,
  isStale,
}: TransientOverlaySectionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { series, meanSeries, stats, timeDomain, tempDomain } = useMemo(() => {
    if (transientSamples.length === 0) {
      return { series: [], meanSeries: [], stats: null, timeDomain: [0, 1], tempDomain: [0, 1] };
    }

    // Convert all series to Celsius arrays
    const fullSeries = transientSamples.map((s) =>
      s.timeSeries.map((p) => ({
        time: p.time,
        temp: p.temperature - CELSIUS_TO_KELVIN,
      })),
    );

    // Find time cutoff at 99% of temperature rise for each sample, take the max
    let cutoffTime = 0;
    for (const pts of fullSeries) {
      if (pts.length < 2) continue;
      const startTemp = pts[0].temp;
      const endTemp = pts[pts.length - 1].temp;
      const target99 = startTemp + (endTemp - startTemp) * 0.99;
      for (const pt of pts) {
        if (pt.temp >= target99) {
          if (pt.time > cutoffTime) cutoffTime = pt.time;
          break;
        }
      }
    }
    // Add 5% buffer beyond the last 99% time
    cutoffTime *= 1.05;

    // Clip series to cutoff time
    const series = fullSeries.map((pts) => pts.filter((p) => p.time <= cutoffTime));

    // Find domains from clipped data
    let tMin = Number.POSITIVE_INFINITY;
    let tMax = Number.NEGATIVE_INFINITY;
    let maxTime = 0;
    for (const pts of series) {
      for (const p of pts) {
        if (p.temp < tMin) tMin = p.temp;
        if (p.temp > tMax) tMax = p.temp;
        if (p.time > maxTime) maxTime = p.time;
      }
    }

    // Compute mean series from the longest clipped reference
    const maxLen = Math.max(...series.map((s) => s.length));
    const refIdx = series.findIndex((s) => s.length === maxLen);
    const ref = series[refIdx];
    const meanSeries = ref.map((pt, idx) => {
      let sum = 0;
      for (const s of series) {
        sum += idx < s.length ? s[idx].temp : s[s.length - 1].temp;
      }
      return { time: pt.time, temp: sum / series.length };
    });

    // Final temp stats (from unclipped data)
    const finalTemps = fullSeries.map((s) => s[s.length - 1].temp);
    const minFinal = Math.min(...finalTemps);
    const maxFinal = Math.max(...finalTemps);

    // Add padding to temp domain
    const tRange = tMax - tMin || 1;
    const tempDomain = [tMin - tRange * 0.05, tMax + tRange * 0.05];

    return {
      series,
      meanSeries,
      stats: { minFinal, maxFinal },
      timeDomain: [0, maxTime],
      tempDomain,
    };
  }, [transientSamples]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || series.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Plot area
    const plotLeft = PADDING.left;
    const plotTop = PADDING.top;
    const plotWidth = w - PADDING.left - PADDING.right;
    const plotHeight = h - PADDING.top - PADDING.bottom;

    const [timeMin, timeMax] = timeDomain;
    const [tempMin, tempMax] = tempDomain;

    const xScale = (time: number) =>
      plotLeft + ((time - timeMin) / (timeMax - timeMin)) * plotWidth;
    const yScale = (temp: number) =>
      plotTop + plotHeight - ((temp - tempMin) / (tempMax - tempMin)) * plotHeight;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);

    const yTicks = niceTicksFor(tempMin, tempMax, 5);
    for (const v of yTicks) {
      const y = Math.round(yScale(v)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(plotLeft, y);
      ctx.lineTo(plotLeft + plotWidth, y);
      ctx.stroke();
    }

    const xTicks = niceTicksFor(timeMin, timeMax, 6);
    for (const v of xTicks) {
      const x = Math.round(xScale(v)) + 0.5;
      ctx.beginPath();
      ctx.moveTo(x, plotTop);
      ctx.lineTo(x, plotTop + plotHeight);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Axis labels
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "11px ui-monospace, monospace";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (const v of yTicks) {
      ctx.fillText(`${v.toFixed(0)}°`, plotLeft - 6, yScale(v));
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (const v of xTicks) {
      ctx.fillText(formatTimeLabel(v), xScale(v), plotTop + plotHeight + 6);
    }

    // Sample curves
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.15;

    for (const s of series) {
      ctx.beginPath();
      for (let i = 0; i < s.length; i++) {
        const x = xScale(s[i].time);
        const y = yScale(s[i].temp);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Mean curve
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#fbbf24";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < meanSeries.length; i++) {
      const x = xScale(meanSeries[i].time);
      const y = yScale(meanSeries[i].temp);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [series, meanSeries, timeDomain, tempDomain]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  if (series.length === 0) return null;

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-neutral-200">
        Transient uncertainty ({transientSamples.length} LHS samples)
        {isStale && <span className="ml-2 text-xs text-neutral-500">(updating…)</span>}
      </h4>
      <div ref={containerRef} className="h-56 relative">
        <canvas ref={canvasRef} className={`w-full h-full ${isStale ? "opacity-50" : ""}`} />
      </div>
      {stats && (
        <div className="text-xs text-neutral-400 font-mono text-center">
          Final temp range: {stats.minFinal.toFixed(1)}°C – {stats.maxFinal.toFixed(1)}°C
        </div>
      )}
    </div>
  );
}
