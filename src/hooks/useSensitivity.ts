import { useDeferredValue, useMemo, useState } from "react";
import { lhsSample, lhsSampleTransient } from "@/lib/sensitivity/lhs";
import { sweepParam } from "@/lib/sensitivity/sweep";
import type {
  ParamConfig,
  ParamGroup,
  ParamKey,
  SweepResults,
  TransientSamplePoint,
} from "@/lib/sensitivity/types";
import type { ThermalInputs } from "@/lib/thermal";

/** Parameter metadata: label, unit, group, and clamping bounds for ± range. */
const PARAM_META: Record<
  ParamKey,
  { label: string; unit: string; group: ParamGroup; clampMin: number; clampMax: number }
> = {
  irradiance: {
    label: "Incoming irradiance",
    unit: "W/m²",
    group: "equilibrium",
    clampMin: 0,
    clampMax: 100000,
  },
  incidenceAngleDeg: {
    label: "Incidence angle",
    unit: "°",
    group: "equilibrium",
    clampMin: 0,
    clampMax: 85,
  },
  reflectance: {
    label: "Reflectance",
    unit: "%",
    group: "equilibrium",
    clampMin: 1,
    clampMax: 100,
  },
  absorptivity: {
    label: "Absorptivity",
    unit: "0–1",
    group: "equilibrium",
    clampMin: 0.01,
    clampMax: 1,
  },
  emissivity: {
    label: "Emissivity",
    unit: "0–1",
    group: "equilibrium",
    clampMin: 0.01,
    clampMax: 1,
  },
  convectionCoeff: {
    label: "Convection coefficient",
    unit: "W/(m²K)",
    group: "equilibrium",
    clampMin: 0.1,
    clampMax: 200,
  },
  area: {
    label: "Heated face area",
    unit: "cm²",
    group: "transient-only",
    clampMin: 0.1,
    clampMax: 100000,
  },
  thickness: {
    label: "Thickness",
    unit: "mm",
    group: "transient-only",
    clampMin: 0.01,
    clampMax: 10000,
  },
  mass: { label: "Mass", unit: "g", group: "transient-only", clampMin: 0.01, clampMax: 100000 },
  specificHeat: {
    label: "Specific heat",
    unit: "J/(kg·K)",
    group: "transient-only",
    clampMin: 10,
    clampMax: 10000,
  },
};

/** Ordered list of all param keys matching the input panel order. */
const ALL_PARAM_KEYS: ParamKey[] = [
  "irradiance",
  "incidenceAngleDeg",
  "reflectance",
  "absorptivity",
  "emissivity",
  "convectionCoeff",
  "area",
  "thickness",
  "mass",
  "specificHeat",
];

const EMPTY_SWEEP: SweepResults = {};
const EMPTY_TEMPS: number[] = [];
const EMPTY_TRANSIENT: TransientSamplePoint[] = [];

interface UseSensitivityOptions {
  thermalInputs: ThermalInputs;
  /** Irradiance before incidence angle was applied */
  baseIrradiance: number;
  reflectionEnabled: boolean;
  /** Current reflectance percentage */
  currentReflectance: number;
  /** Current incidence angle in degrees */
  currentIncidenceAngleDeg: number;
  /** Current area in cm² */
  currentAreaCm2: number;
  /** Current thickness in mm */
  currentThicknessMm: number;
  /** Current mass in grams */
  currentMassGrams: number;
  /** Raw input irradiance before reflection/angle (W/m²) */
  displayIrradiance: number;
  /** Whether the sensitivity panel is open */
  isOpen: boolean;
}

export function useSensitivity({
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
}: UseSensitivityOptions) {
  const [samples, setSamples] = useState(200);
  const [rangePct, setRangePct] = useState(20);
  const [enabledParams, setEnabledParams] = useState<Record<ParamKey, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const key of ALL_PARAM_KEYS) {
      initial[key] = true;
    }
    return initial as Record<ParamKey, boolean>;
  });

  const toggleParam = (key: ParamKey) => {
    setEnabledParams((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  /** Map from ParamKey to current value (in display units). */
  const currentValues = useMemo<Record<ParamKey, number>>(
    () => ({
      irradiance: displayIrradiance,
      incidenceAngleDeg: currentIncidenceAngleDeg,
      reflectance: currentReflectance,
      absorptivity: thermalInputs.absorptivity,
      emissivity: thermalInputs.emissivity,
      convectionCoeff: thermalInputs.convectionCoeff,
      area: currentAreaCm2,
      thickness: currentThicknessMm,
      mass: currentMassGrams,
      specificHeat: thermalInputs.specificHeat,
    }),
    [
      thermalInputs,
      displayIrradiance,
      currentIncidenceAngleDeg,
      currentReflectance,
      currentAreaCm2,
      currentThicknessMm,
      currentMassGrams,
    ],
  );

  /** Build param configs with auto-computed ranges from ± percentage. */
  const paramConfigs = useMemo<ParamConfig[]>(() => {
    const frac = rangePct / 100;
    return ALL_PARAM_KEYS.map((key) => {
      const meta = PARAM_META[key];
      const cur = currentValues[key];
      const rawMin = cur * (1 - frac);
      const rawMax = cur * (1 + frac);
      return {
        key,
        label: meta.label,
        unit: meta.unit,
        group: meta.group,
        currentValue: cur,
        min: Math.max(meta.clampMin, rawMin),
        max: Math.min(meta.clampMax, rawMax),
        enabled:
          key === "reflectance" ? reflectionEnabled && enabledParams[key] : enabledParams[key],
      };
    });
  }, [rangePct, currentValues, reflectionEnabled, enabledParams]);

  const activeConfigs = useMemo(() => paramConfigs.filter((p) => p.enabled), [paramConfigs]);

  /** Equilibrium-affecting params only (exclude transient-only). */
  const equilibriumConfigs = useMemo(
    () => activeConfigs.filter((p) => p.group === "equilibrium"),
    [activeConfigs],
  );

  // For reflectance sweep, baseIrradiance needs to be divided by current reflectance
  const reflectanceBaseIrradiance = useMemo(() => {
    if (!reflectionEnabled || currentReflectance <= 0) return baseIrradiance;
    return baseIrradiance / (currentReflectance / 100);
  }, [baseIrradiance, currentReflectance, reflectionEnabled]);

  // For irradiance sweep: multiplier that converts raw display irradiance → computed irradiance
  // (accounts for mirrors, angle, concentration already baked into thermalInputs.irradiance)
  const irradianceMultiplier = useMemo(() => {
    if (displayIrradiance <= 0) return 1;
    return thermalInputs.irradiance / displayIrradiance;
  }, [thermalInputs.irradiance, displayIrradiance]);

  // Equilibrium sweeps — only when open, only for equilibrium-affecting params
  const sweepResults = useMemo<SweepResults>(() => {
    if (!isOpen) return EMPTY_SWEEP;
    const sweepSteps = 30;
    const entries = equilibriumConfigs.map((p) => {
      let baseIrr = baseIrradiance;
      if (p.key === "reflectance") baseIrr = reflectanceBaseIrradiance;
      else if (p.key === "irradiance") baseIrr = irradianceMultiplier;
      return [p.key, sweepParam(thermalInputs, p.key, p.min, p.max, sweepSteps, baseIrr)];
    });
    return Object.fromEntries(entries);
  }, [
    isOpen,
    thermalInputs,
    equilibriumConfigs,
    baseIrradiance,
    reflectanceBaseIrradiance,
    irradianceMultiplier,
  ]);

  // LHS distribution — only when open, only equilibrium-affecting params
  const distributionTemps = useMemo<number[]>(() => {
    if (!isOpen) return EMPTY_TEMPS;
    return lhsSample(
      thermalInputs,
      equilibriumConfigs,
      samples,
      baseIrradiance,
      reflectanceBaseIrradiance,
      irradianceMultiplier,
    );
  }, [
    isOpen,
    thermalInputs,
    equilibriumConfigs,
    samples,
    baseIrradiance,
    reflectanceBaseIrradiance,
    irradianceMultiplier,
  ]);

  // Defer inputs for the expensive transient computation so it doesn't block UI
  const deferredThermalInputs = useDeferredValue(thermalInputs);
  const deferredActiveConfigs = useDeferredValue(activeConfigs);
  const deferredSamples = useDeferredValue(samples);
  const deferredBaseIrradiance = useDeferredValue(baseIrradiance);
  const deferredReflectanceBaseIrradiance = useDeferredValue(reflectanceBaseIrradiance);
  const deferredIrradianceMultiplier = useDeferredValue(irradianceMultiplier);

  // Transient LHS samples — deferred, only when open
  const transientSamples = useMemo<TransientSamplePoint[]>(() => {
    if (!isOpen) return EMPTY_TRANSIENT;
    return lhsSampleTransient(
      deferredThermalInputs,
      deferredActiveConfigs,
      deferredSamples,
      deferredBaseIrradiance,
      deferredReflectanceBaseIrradiance,
      deferredIrradianceMultiplier,
    );
  }, [
    isOpen,
    deferredThermalInputs,
    deferredActiveConfigs,
    deferredSamples,
    deferredBaseIrradiance,
    deferredReflectanceBaseIrradiance,
    deferredIrradianceMultiplier,
  ]);

  const isTransientStale =
    deferredThermalInputs !== thermalInputs ||
    deferredActiveConfigs !== activeConfigs ||
    deferredSamples !== samples;

  return {
    samples,
    setSamples,
    rangePct,
    setRangePct,
    paramConfigs,
    activeConfigs,
    equilibriumConfigs,
    enabledParams,
    toggleParam,
    sweepResults,
    distributionTemps,
    transientSamples,
    isTransientStale,
  };
}
