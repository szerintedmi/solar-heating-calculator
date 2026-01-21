import { Card } from "@/components/ui";
import type { CalculationResult } from "@/lib/thermal";
import { CELSIUS_TO_KELVIN } from "@/lib/thermal";

interface ResultsDisplayProps {
  results: CalculationResult;
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }
  const minutes = seconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(1)} min`;
  }
  const hours = minutes / 60;
  return `${hours.toFixed(1)} hr`;
}

function formatPower(watts: number): string {
  if (watts < 0.01) {
    return `${(watts * 1000).toFixed(2)} mW`;
  }
  if (watts < 1) {
    return `${(watts * 1000).toFixed(1)} mW`;
  }
  return `${watts.toFixed(2)} W`;
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  const { equilibrium, transient } = results;

  const tempCelsius = equilibrium.temperature - CELSIUS_TO_KELVIN;
  const convectionPct =
    equilibrium.totalLoss > 0
      ? ((equilibrium.convectionLoss / equilibrium.totalLoss) * 100).toFixed(0)
      : "0";
  const radiationPct =
    equilibrium.totalLoss > 0
      ? ((equilibrium.radiationLoss / equilibrium.totalLoss) * 100).toFixed(0)
      : "0";

  // Determine temperature regime
  let regime = "low";
  let regimeLabel = "Convection dominates";
  if (tempCelsius > 300) {
    regime = "high";
    regimeLabel = "Radiation dominates (T⁴)";
  } else if (tempCelsius > 100) {
    regime = "medium";
    regimeLabel = "Both mechanisms contribute";
  }

  return (
    <Card title="Results">
      <div className="space-y-4">
        {/* Equilibrium temperature - main result */}
        <div className="p-4 bg-neutral-800 rounded-lg text-center">
          <p className="text-sm text-neutral-400 mb-1">Equilibrium Temperature</p>
          <p className="text-4xl font-mono font-semibold text-neutral-100">
            {tempCelsius.toFixed(1)}°C
          </p>
          <p className="text-xs text-neutral-500 mt-1">{equilibrium.temperature.toFixed(1)} K</p>
        </div>

        {/* Power breakdown */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-500">Absorbed Power</p>
            <p className="text-lg font-mono text-neutral-100">
              {formatPower(equilibrium.absorbedPower)}
            </p>
          </div>
          <div className="p-3 bg-neutral-800 rounded-lg">
            <p className="text-xs text-neutral-500">Total Loss</p>
            <p className="text-lg font-mono text-neutral-100">
              {formatPower(equilibrium.totalLoss)}
            </p>
          </div>
        </div>

        {/* Loss mechanism breakdown */}
        <div className="p-3 bg-neutral-800 rounded-lg">
          <p className="text-xs text-neutral-500 mb-2">Heat Loss Breakdown</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-300">Convection (air)</span>
              <span className="font-mono text-neutral-100">
                {formatPower(equilibrium.convectionLoss)}{" "}
                <span className="text-neutral-500">({convectionPct}%)</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-300">Radiation</span>
              <span className="font-mono text-neutral-100">
                {formatPower(equilibrium.radiationLoss)}{" "}
                <span className="text-neutral-500">({radiationPct}%)</span>
              </span>
            </div>
          </div>

          {/* Visual bar */}
          <div className="mt-3 h-2 bg-neutral-700 rounded-full overflow-hidden flex">
            <div
              className="bg-blue-500 h-full"
              style={{ width: `${convectionPct}%` }}
              title={`Convection: ${convectionPct}%`}
            />
            <div
              className="bg-orange-500 h-full"
              style={{ width: `${radiationPct}%` }}
              title={`Radiation: ${radiationPct}%`}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              Convection
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              Radiation
            </span>
          </div>
        </div>

        {/* Temperature regime hint */}
        <div
          className={`p-3 rounded-lg text-sm ${
            regime === "high"
              ? "bg-orange-900/20 text-orange-200/80"
              : regime === "medium"
                ? "bg-yellow-900/20 text-yellow-200/80"
                : "bg-blue-900/20 text-blue-200/80"
          }`}
        >
          <p className="font-medium">{regimeLabel}</p>
          <p className="text-xs mt-1 opacity-80">
            {regime === "high" &&
              "Radiation grows with T⁴, so it caps how hot the surface can get."}
            {regime === "medium" && "Both convection and radiation contribute to heat loss."}
            {regime === "low" &&
              "At lower temperatures, convection (air movement) is the main cooling mechanism."}
          </p>
        </div>

        {/* Time milestones */}
        <div className="p-3 bg-neutral-800 rounded-lg">
          <p className="text-xs text-neutral-500 mb-2">Time to Reach Temperature</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-xs text-neutral-500">50%</p>
              <p className="font-mono text-neutral-100">{formatTime(transient.time50)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">90%</p>
              <p className="font-mono text-neutral-100">{formatTime(transient.time90)}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500">95%</p>
              <p className="font-mono text-neutral-100">{formatTime(transient.time95)}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
