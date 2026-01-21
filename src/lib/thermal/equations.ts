import { STEFAN_BOLTZMANN } from "./constants";
import type { ThermalInputs } from "./types";

/**
 * Calculate the cooling surface area for a cuboid with square cross-section.
 * A_cool = 2A + 4√A × d
 *
 * @param area - Illuminated area in m²
 * @param thickness - Object thickness in m
 * @returns Total cooling surface area in m²
 */
export function calculateCoolingArea(area: number, thickness: number): number {
  const sideLength = Math.sqrt(area);
  return 2 * area + 4 * sideLength * thickness;
}

/**
 * Calculate absorbed power from light.
 * P_abs = E × A × α
 *
 * @param irradiance - Light irradiance in W/m²
 * @param area - Illuminated area in m²
 * @param absorptivity - Surface absorptivity (0-1)
 * @returns Absorbed power in Watts
 */
export function calculateAbsorbedPower(
  irradiance: number,
  area: number,
  absorptivity: number,
): number {
  return irradiance * area * absorptivity;
}

/**
 * Calculate convection heat loss.
 * P_conv = h × A_cool × (T - T_amb)
 *
 * @param convectionCoeff - Convection coefficient in W/(m²·K)
 * @param coolingArea - Total cooling surface area in m²
 * @param temperature - Object temperature in Kelvin
 * @param ambientTemp - Ambient temperature in Kelvin
 * @returns Convection heat loss in Watts
 */
export function calculateConvectionLoss(
  convectionCoeff: number,
  coolingArea: number,
  temperature: number,
  ambientTemp: number,
): number {
  return convectionCoeff * coolingArea * (temperature - ambientTemp);
}

/**
 * Calculate radiation heat loss using Stefan-Boltzmann law.
 * P_rad = ε × σ × A_cool × (T⁴ - T_amb⁴)
 *
 * @param emissivity - Surface emissivity (0-1)
 * @param coolingArea - Total cooling surface area in m²
 * @param temperature - Object temperature in Kelvin
 * @param ambientTemp - Ambient temperature in Kelvin
 * @returns Radiation heat loss in Watts
 */
export function calculateRadiationLoss(
  emissivity: number,
  coolingArea: number,
  temperature: number,
  ambientTemp: number,
): number {
  const t4 = temperature ** 4;
  const tAmb4 = ambientTemp ** 4;
  return emissivity * STEFAN_BOLTZMANN * coolingArea * (t4 - tAmb4);
}

/**
 * Calculate total heat loss (convection + radiation).
 *
 * @param inputs - Thermal calculation inputs
 * @param temperature - Current object temperature in Kelvin
 * @returns Object with convection, radiation, and total heat loss in Watts
 */
export function calculateTotalHeatLoss(
  inputs: ThermalInputs,
  temperature: number,
): { convection: number; radiation: number; total: number } {
  const coolingArea = calculateCoolingArea(inputs.area, inputs.thickness);

  const convection = calculateConvectionLoss(
    inputs.convectionCoeff,
    coolingArea,
    temperature,
    inputs.ambientTemp,
  );

  const radiation = calculateRadiationLoss(
    inputs.emissivity,
    coolingArea,
    temperature,
    inputs.ambientTemp,
  );

  return {
    convection,
    radiation,
    total: convection + radiation,
  };
}

/**
 * Calculate net heat flow (absorbed power minus losses).
 * dQ/dt = P_abs - P_loss
 *
 * @param inputs - Thermal calculation inputs
 * @param temperature - Current object temperature in Kelvin
 * @returns Net heat flow in Watts (positive = heating, negative = cooling)
 */
export function calculateNetHeatFlow(inputs: ThermalInputs, temperature: number): number {
  const absorbedPower = calculateAbsorbedPower(inputs.irradiance, inputs.area, inputs.absorptivity);
  const losses = calculateTotalHeatLoss(inputs, temperature);
  return absorbedPower - losses.total;
}

/**
 * Convert lux to W/m² using K factor.
 * E = L / K
 *
 * @param lux - Illuminance in lux
 * @param kFactor - K factor (lux per W/m²)
 * @returns Irradiance in W/m²
 */
export function luxToIrradiance(lux: number, kFactor: number): number {
  if (kFactor <= 0) {
    return 0;
  }
  return lux / kFactor;
}

/**
 * Calculate total ND filter attenuation.
 * N = N₁ × N₂ × ...
 *
 * @param ndFilters - Array of ND filter factors (e.g., [64, 4] for ND64 + ND4)
 * @returns Total attenuation factor
 */
export function calculateNDAttenuation(ndFilters: number[]): number {
  if (ndFilters.length === 0) {
    return 1;
  }
  return ndFilters.reduce((acc, nd) => acc * nd, 1);
}

/**
 * Convert measured lux (behind ND filter) to actual irradiance.
 * L = L_meas × N
 * E = L / K
 *
 * @param measuredLux - Lux measured behind ND filter
 * @param ndFilters - Array of ND filter factors
 * @param kFactor - K factor (lux per W/m²)
 * @returns Irradiance in W/m²
 */
export function luxWithNDToIrradiance(
  measuredLux: number,
  ndFilters: number[],
  kFactor: number,
): number {
  const ndAttenuation = calculateNDAttenuation(ndFilters);
  const actualLux = measuredLux * ndAttenuation;
  return luxToIrradiance(actualLux, kFactor);
}
