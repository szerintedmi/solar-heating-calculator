/**
 * Physical constants used in thermal calculations
 */

/** Stefan-Boltzmann constant in W/(m²·K⁴) */
export const STEFAN_BOLTZMANN = 5.67e-8;

/** Conversion from Celsius to Kelvin */
export const CELSIUS_TO_KELVIN = 273.15;

/** Default simulation parameters */
export const SIMULATION = {
  /** Maximum simulation time in seconds (30 minutes) */
  MAX_TIME: 1800,
  /** Time step for Euler integration in seconds */
  TIME_STEP: 0.1,
  /** Number of points to include in output (downsampled from simulation) */
  OUTPUT_POINTS: 200,
  /** Tolerance for equilibrium solver */
  EQUILIBRIUM_TOLERANCE: 0.001,
  /** Maximum iterations for equilibrium solver */
  MAX_ITERATIONS: 100,
} as const;
