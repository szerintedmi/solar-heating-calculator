import { useState } from "react";
import { Card } from "@/components/ui";
import { useSensitivity } from "@/hooks/useSensitivity";
import type { ParamConfig } from "@/lib/sensitivity/types";
import type { ThermalInputs } from "@/lib/thermal";
import { DistributionChart } from "./DistributionChart";
import { ParameterSweepChart } from "./ParameterSweepChart";
import { TransientOverlaySection } from "./TransientOverlaySection";

interface SensitivityAnalysisProps {
  thermalInputs: ThermalInputs;
  baseIrradiance: number;
  reflectionEnabled: boolean;
  currentReflectance: number;
  currentIncidenceAngleDeg: number;
  currentAreaCm2: number;
  currentThicknessMm: number;
  currentMassGrams: number;
  /** Raw input irradiance before reflection/angle (for display) */
  displayIrradiance: number;
}

function formatValue(value: number, unit: string): string {
  if (unit === "0–1") return value.toFixed(2);
  if (value >= 100) return value.toFixed(0);
  if (value >= 10) return value.toFixed(1);
  return value.toFixed(2);
}

function ParamRow({
  param,
  onToggle,
  sweepData,
}: {
  param: ParamConfig;
  onToggle: () => void;
  sweepData?: { paramValue: number; tempCelsius: number }[];
}) {
  return (
    <div className="space-y-1">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={param.enabled}
          onChange={onToggle}
          className="accent-yellow-500"
        />
        <span className="text-neutral-200">{param.label}</span>
        <span className="flex-1 border-b border-dotted border-neutral-700" />
        <span className="font-mono text-xs text-neutral-500">
          {formatValue(param.min, param.unit)} –{" "}
          <span className="text-neutral-300">{formatValue(param.currentValue, param.unit)}</span> –{" "}
          {formatValue(param.max, param.unit)}{" "}
          <span className="text-neutral-600">{param.unit}</span>
        </span>
      </label>
      {param.enabled && sweepData && sweepData.length > 0 && (
        <ParameterSweepChart param={param} data={sweepData} currentValue={param.currentValue} />
      )}
    </div>
  );
}

export function SensitivityAnalysis({
  thermalInputs,
  baseIrradiance,
  reflectionEnabled,
  currentReflectance,
  currentIncidenceAngleDeg,
  currentAreaCm2,
  currentThicknessMm,
  currentMassGrams,
  displayIrradiance,
}: SensitivityAnalysisProps) {
  const [isOpen, setIsOpen] = useState(false);

  const sensitivity = useSensitivity({
    thermalInputs,
    baseIrradiance,
    reflectionEnabled,
    currentReflectance,
    currentIncidenceAngleDeg,
    currentAreaCm2,
    currentThicknessMm,
    currentMassGrams,
    displayIrradiance,
    isOpen,
  });

  const equilibriumParams = sensitivity.paramConfigs.filter((p) => p.group === "equilibrium");
  const transientOnlyParams = sensitivity.paramConfigs.filter((p) => p.group === "transient-only");

  // Collapsed state: compact clickable card
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="card hover:border-neutral-700 transition-colors cursor-pointer text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="text-xl text-neutral-500">+</div>
          <div>
            <h2 className="card-title mb-0">Sensitivity Analysis</h2>
            <p className="text-sm text-neutral-500">
              Explore how parameter variations affect equilibrium and transient temperatures
            </p>
          </div>
        </div>
      </button>
    );
  }

  // Expanded state: full Card matching Temperature vs Time layout
  return (
    <Card title="Sensitivity Analysis">
      <div className="space-y-6">
        {/* Global controls */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-300" htmlFor="range-pct">
              ±
            </label>
            <input
              id="range-pct"
              type="range"
              min={5}
              max={80}
              value={sensitivity.rangePct}
              onChange={(e) => sensitivity.setRangePct(Number(e.target.value))}
              className="w-24 accent-yellow-500"
            />
            <span className="text-sm font-mono text-neutral-400 w-8">{sensitivity.rangePct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-neutral-300" htmlFor="samples">
              Samples
            </label>
            <input
              id="samples"
              type="range"
              min={20}
              max={500}
              step={10}
              value={sensitivity.samples}
              onChange={(e) => sensitivity.setSamples(Number(e.target.value))}
              className="w-24 accent-yellow-500"
            />
            <span className="text-sm font-mono text-neutral-400 w-8 text-right">
              {sensitivity.samples}
            </span>
          </div>
        </div>

        {/* Equilibrium parameter sweeps */}
        <div className="space-y-3">
          {equilibriumParams.map((param) => (
            <ParamRow
              key={param.key}
              param={param}
              onToggle={() => sensitivity.toggleParam(param.key)}
              sweepData={sensitivity.sweepResults[param.key]}
            />
          ))}
        </div>

        {/* Transient-only params */}
        <div className="space-y-3">
          <p className="text-xs text-neutral-500">
            These parameters affect heating rate only, not final temperature
          </p>
          {transientOnlyParams.map((param) => (
            <ParamRow
              key={param.key}
              param={param}
              onToggle={() => sensitivity.toggleParam(param.key)}
            />
          ))}
        </div>

        {/* Combined uncertainty distribution */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-neutral-200">
            Combined uncertainty distribution
          </h4>
          <p className="text-xs text-neutral-500">
            {sensitivity.samples} random samples varying all parameters simultaneously (Latin
            Hypercube)
          </p>
          <DistributionChart temps={sensitivity.distributionTemps} />
        </div>

        {/* Transient uncertainty */}
        <TransientOverlaySection
          transientSamples={sensitivity.transientSamples}
          isStale={sensitivity.isTransientStale}
        />

        {/* Collapse button */}
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          ← Collapse
        </button>
      </div>
    </Card>
  );
}
