import { CELSIUS_TO_KELVIN, calculateEquilibrium, type ThermalInputs } from "@/lib/thermal";
import type { ParamKey, SweepPoint } from "./types";

/**
 * Create a modified ThermalInputs by patching one parameter.
 *
 * For direct ThermalInputs fields (absorptivity, emissivity, convectionCoeff, irradiance,
 * area, thickness, mass, specificHeat), simply overrides the value.
 * For UI-level params (incidenceAngleDeg, reflectance), modifies irradiance accordingly
 * using the provided baseIrradiance.
 *
 * @param base - Current ThermalInputs
 * @param key - Parameter to patch
 * @param value - New value for the parameter
 * @param baseIrradiance - Irradiance before incidence angle (computedIrradiance / cos(currentAngle))
 */
export function patchInputs(
  base: ThermalInputs,
  key: ParamKey,
  value: number,
  baseIrradiance: number,
): ThermalInputs {
  switch (key) {
    case "absorptivity":
    case "emissivity":
    case "convectionCoeff":
    case "specificHeat":
      return { ...base, [key]: value };

    case "area":
      // value is in cm², convert to m²
      return { ...base, area: value / 10000, illuminatedArea: value / 10000 };

    case "thickness":
      // value is in mm, convert to m
      return { ...base, thickness: value / 1000 };

    case "mass":
      // value is in grams, convert to kg
      return { ...base, mass: value / 1000 };

    case "irradiance":
      // baseIrradiance is the multiplier (thermalInputs.irradiance / displayIrradiance)
      // so swept raw value gets scaled by mirrors/angle/concentration
      return { ...base, irradiance: value * baseIrradiance };

    case "incidenceAngleDeg": {
      const angleRad = (value * Math.PI) / 180;
      return { ...base, irradiance: baseIrradiance * Math.cos(angleRad) };
    }

    case "reflectance": {
      return { ...base, irradiance: baseIrradiance * (value / 100) };
    }

    default:
      return base;
  }
}

/**
 * Generate evenly spaced values between min and max (inclusive).
 */
export function linspace(min: number, max: number, steps: number): number[] {
  if (steps <= 1) return [min];
  return Array.from({ length: steps }, (_, i) => min + (max - min) * (i / (steps - 1)));
}

/**
 * Sweep one parameter across [min, max] and compute equilibrium temperature for each.
 */
export function sweepParam(
  base: ThermalInputs,
  key: ParamKey,
  min: number,
  max: number,
  steps: number,
  baseIrradiance: number,
): SweepPoint[] {
  return linspace(min, max, steps).map((value) => {
    const patched = patchInputs(base, key, value, baseIrradiance);
    const eq = calculateEquilibrium(patched);
    return {
      paramValue: value,
      tempCelsius: eq.temperature - CELSIUS_TO_KELVIN,
    };
  });
}
