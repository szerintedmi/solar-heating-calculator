import type { ThermalInputs } from "@/lib/thermal";
import { CELSIUS_TO_KELVIN, calculateEquilibrium, simulateTransient } from "@/lib/thermal";
import { patchInputs } from "./sweep";
import type { ParamConfig, TransientSamplePoint } from "./types";

/**
 * Fisher-Yates shuffle in place.
 */
function shuffle(arr: number[]): number[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Build stratified LHS columns for the given params.
 */
function buildColumns(params: ParamConfig[], samples: number): number[][] {
  return params.map((p) => {
    const col = Array.from({ length: samples }, (_, i) => {
      const lo = p.min + (p.max - p.min) * (i / samples);
      const hi = p.min + (p.max - p.min) * ((i + 1) / samples);
      return lo + Math.random() * (hi - lo);
    });
    return shuffle(col);
  });
}

/**
 * Get the correct baseIrradiance value for a parameter key.
 */
function getBaseIrr(
  key: string,
  baseIrradiance: number,
  reflectanceBaseIrradiance: number | undefined,
  irradianceMultiplier: number | undefined,
): number {
  if (key === "reflectance" && reflectanceBaseIrradiance != null) return reflectanceBaseIrradiance;
  if (key === "irradiance" && irradianceMultiplier != null) return irradianceMultiplier;
  return baseIrradiance;
}

/**
 * Apply a row of parameter values to a base ThermalInputs.
 */
function applyRow(
  base: ThermalInputs,
  params: ParamConfig[],
  columns: number[][],
  rowIdx: number,
  baseIrradiance: number,
  reflectanceBaseIrradiance: number | undefined,
  irradianceMultiplier: number | undefined,
): ThermalInputs {
  let patched = base;
  for (let pi = 0; pi < params.length; pi++) {
    const irr = getBaseIrr(
      params[pi].key,
      baseIrradiance,
      reflectanceBaseIrradiance,
      irradianceMultiplier,
    );
    patched = patchInputs(patched, params[pi].key, columns[pi][rowIdx], irr);
  }
  return patched;
}

/**
 * Latin Hypercube Sample of equilibrium temperatures.
 *
 * @param base - Current ThermalInputs (baseline)
 * @param params - Active parameters with their ranges
 * @param samples - Number of LHS samples
 * @param baseIrradiance - Pre-angle irradiance for angle patching
 * @param reflectanceBaseIrradiance - Pre-reflectance irradiance for reflectance patching
 * @param irradianceMultiplier - Multiplier from raw display irradiance to computed irradiance
 */
export function lhsSample(
  base: ThermalInputs,
  params: ParamConfig[],
  samples: number,
  baseIrradiance: number,
  reflectanceBaseIrradiance?: number,
  irradianceMultiplier?: number,
): number[] {
  if (params.length === 0) return [];

  const columns = buildColumns(params, samples);

  const temps = Array.from({ length: samples }, (_, i) => {
    const patched = applyRow(
      base,
      params,
      columns,
      i,
      baseIrradiance,
      reflectanceBaseIrradiance,
      irradianceMultiplier,
    );
    return calculateEquilibrium(patched).temperature - CELSIUS_TO_KELVIN;
  });

  return temps.sort((a, b) => a - b);
}

/**
 * Latin Hypercube Sample of transient curves.
 *
 * Samples ALL params (including transient-only ones like mass, specificHeat, area, thickness).
 * For each sample, runs both equilibrium and transient simulation.
 *
 * @returns Array of TransientSamplePoint with time series for each sample
 */
export function lhsSampleTransient(
  base: ThermalInputs,
  params: ParamConfig[],
  samples: number,
  baseIrradiance: number,
  reflectanceBaseIrradiance?: number,
  irradianceMultiplier?: number,
): TransientSamplePoint[] {
  if (params.length === 0) return [];

  const columns = buildColumns(params, samples);

  return Array.from({ length: samples }, (_, i) => {
    const patched = applyRow(
      base,
      params,
      columns,
      i,
      baseIrradiance,
      reflectanceBaseIrradiance,
      irradianceMultiplier,
    );
    const eq = calculateEquilibrium(patched);
    const transient = simulateTransient(patched, eq.temperature);
    return {
      timeSeries: transient.timeSeries,
      label: `Sample ${i + 1}`,
    };
  });
}
