import { SIMULATION } from "./constants";
import {
  calculateAbsorbedPower,
  calculateConvectionLoss,
  calculateCoolingArea,
  calculateNetHeatFlow,
  calculateRadiationLoss,
} from "./equations";
import type { EquilibriumResult, ThermalInputs, TimePoint, TransientResult } from "./types";

/**
 * Find equilibrium temperature using bisection method.
 * At equilibrium: P_abs = P_loss (net heat flow = 0)
 *
 * @param inputs - Thermal calculation inputs
 * @returns Equilibrium temperature in Kelvin
 */
export function solveEquilibriumTemperature(inputs: ThermalInputs): number {
  const { ambientTemp } = inputs;

  // Check if there's no heat input
  const absorbedPower = calculateAbsorbedPower(inputs.irradiance, inputs.area, inputs.absorptivity);
  if (absorbedPower <= 0) {
    return ambientTemp;
  }

  // Bisection method bounds
  let lower = ambientTemp;
  let upper = ambientTemp + 1000; // Reasonable upper bound (1000K above ambient)

  // Ensure upper bound has negative net heat flow
  while (calculateNetHeatFlow(inputs, upper) > 0 && upper < ambientTemp + 5000) {
    upper *= 1.5;
  }

  // Bisection iterations
  for (let i = 0; i < SIMULATION.MAX_ITERATIONS; i++) {
    const mid = (lower + upper) / 2;
    const netFlow = calculateNetHeatFlow(inputs, mid);

    if (Math.abs(netFlow) < SIMULATION.EQUILIBRIUM_TOLERANCE) {
      return mid;
    }

    if (netFlow > 0) {
      // Still heating, equilibrium is higher
      lower = mid;
    } else {
      // Cooling, equilibrium is lower
      upper = mid;
    }
  }

  return (lower + upper) / 2;
}

/**
 * Calculate complete equilibrium results.
 *
 * @param inputs - Thermal calculation inputs
 * @returns Equilibrium calculation results
 */
export function calculateEquilibrium(inputs: ThermalInputs): EquilibriumResult {
  const temperature = solveEquilibriumTemperature(inputs);
  const coolingArea = calculateCoolingArea(inputs.area, inputs.thickness);

  const absorbedPower = calculateAbsorbedPower(inputs.irradiance, inputs.area, inputs.absorptivity);
  const convectionLoss = calculateConvectionLoss(
    inputs.convectionCoeff,
    coolingArea,
    temperature,
    inputs.ambientTemp,
  );
  const radiationLoss = calculateRadiationLoss(
    inputs.emissivity,
    coolingArea,
    temperature,
    inputs.ambientTemp,
  );

  return {
    temperature,
    absorbedPower,
    convectionLoss,
    radiationLoss,
    totalLoss: convectionLoss + radiationLoss,
  };
}

/**
 * Estimate the thermal time constant τ = m·c / (h·A)
 * This determines how long it takes the system to respond to temperature changes.
 *
 * @param inputs - Thermal calculation inputs
 * @returns Estimated time constant in seconds
 */
function estimateTimeConstant(inputs: ThermalInputs): number {
  const { mass, specificHeat, convectionCoeff } = inputs;
  const coolingArea = calculateCoolingArea(inputs.area, inputs.thickness);

  // τ = m·c / (h·A)
  // Note: This is a simplification - actual time constant varies with temperature
  // due to radiation's T^4 dependence, but convection usually dominates
  if (convectionCoeff * coolingArea <= 0) {
    return SIMULATION.MIN_TIME;
  }

  return (mass * specificHeat) / (convectionCoeff * coolingArea);
}

/**
 * Calculate appropriate simulation duration based on thermal properties.
 * Uses the time constant to ensure we simulate long enough to reach equilibrium.
 *
 * @param inputs - Thermal calculation inputs
 * @returns Simulation duration in seconds
 */
function calculateSimulationTime(inputs: ThermalInputs): number {
  const timeConstant = estimateTimeConstant(inputs);

  // Simulate for TIME_CONSTANTS × τ (default 5τ ≈ 99.3% of equilibrium)
  const estimatedTime = SIMULATION.TIME_CONSTANTS * timeConstant;

  // Clamp between minimum and maximum bounds
  return Math.max(SIMULATION.MIN_TIME, Math.min(estimatedTime, SIMULATION.MAX_TIME));
}

/**
 * Calculate adaptive time step based on simulation duration.
 * Uses larger steps for longer simulations to maintain performance.
 *
 * @param simulationTime - Total simulation duration in seconds
 * @returns Time step in seconds
 */
function calculateTimeStep(simulationTime: number): number {
  // Calculate step size to not exceed MAX_STEPS
  const adaptiveStep = simulationTime / SIMULATION.MAX_STEPS;

  // Use at least BASE_TIME_STEP for accuracy, but scale up for long simulations
  return Math.max(SIMULATION.BASE_TIME_STEP, adaptiveStep);
}

/**
 * Simulate temperature evolution over time using explicit Euler method.
 * dT/dt = (P_abs - P_loss) / (m × c)
 *
 * @param inputs - Thermal calculation inputs
 * @param equilibriumTemp - Pre-calculated equilibrium temperature
 * @returns Transient simulation results
 */
export function simulateTransient(inputs: ThermalInputs, equilibriumTemp: number): TransientResult {
  const { mass, specificHeat, ambientTemp } = inputs;
  const thermalCapacity = mass * specificHeat;

  // Avoid division by zero
  if (thermalCapacity <= 0) {
    return {
      timeSeries: [{ time: 0, temperature: ambientTemp }],
      time50: 0,
      time90: 0,
      time95: 0,
      time99: 0,
    };
  }

  // Calculate dynamic simulation time and time step based on thermal properties
  const simulationTime = calculateSimulationTime(inputs);
  const timeStep = calculateTimeStep(simulationTime);

  const temperatureRise = equilibriumTemp - ambientTemp;
  const target50 = ambientTemp + temperatureRise * 0.5;
  const target90 = ambientTemp + temperatureRise * 0.9;
  const target95 = ambientTemp + temperatureRise * 0.95;
  const target99 = ambientTemp + temperatureRise * 0.99;

  const fullTimeSeries: TimePoint[] = [];
  let temperature = ambientTemp;
  let time = 0;
  let time50 = 0;
  let time90 = 0;
  let time95 = 0;
  let time99 = 0;
  let found50 = false;
  let found90 = false;
  let found95 = false;
  let found99 = false;

  // Run simulation
  while (time <= simulationTime) {
    fullTimeSeries.push({ time, temperature });

    // Check for milestone times
    if (!found50 && temperature >= target50) {
      time50 = time;
      found50 = true;
    }
    if (!found90 && temperature >= target90) {
      time90 = time;
      found90 = true;
    }
    if (!found95 && temperature >= target95) {
      time95 = time;
      found95 = true;
    }
    if (!found99 && temperature >= target99) {
      time99 = time;
      found99 = true;
    }

    // Stop early if we've reached equilibrium
    if (found99 && Math.abs(temperature - equilibriumTemp) < 0.01) {
      // Add a few more points at equilibrium for visual completeness
      for (let i = 1; i <= 3; i++) {
        const extraTime = time + (simulationTime - time) * (i / 3);
        fullTimeSeries.push({ time: extraTime, temperature: equilibriumTemp });
      }
      break;
    }

    // Euler step: T_new = T_old + dt × (P_abs - P_loss) / (m × c)
    const netHeatFlow = calculateNetHeatFlow(inputs, temperature);
    const dT = (timeStep * netHeatFlow) / thermalCapacity;
    temperature += dT;
    time += timeStep;
  }

  // Downsample to OUTPUT_POINTS for efficiency
  const timeSeries = downsampleTimeSeries(fullTimeSeries, SIMULATION.OUTPUT_POINTS);

  // If milestones weren't found within simulation time, use simulation time as fallback
  if (!found50) time50 = simulationTime;
  if (!found90) time90 = simulationTime;
  if (!found95) time95 = simulationTime;
  if (!found99) time99 = simulationTime;

  return {
    timeSeries,
    time50,
    time90,
    time95,
    time99,
  };
}

/**
 * Downsample a time series to a target number of points.
 * Preserves first and last points, samples evenly in between.
 */
function downsampleTimeSeries(series: TimePoint[], targetPoints: number): TimePoint[] {
  if (series.length <= targetPoints) {
    return series;
  }

  const result: TimePoint[] = [series[0]];
  const step = (series.length - 1) / (targetPoints - 1);

  for (let i = 1; i < targetPoints - 1; i++) {
    const index = Math.round(i * step);
    result.push(series[index]);
  }

  result.push(series[series.length - 1]);
  return result;
}
