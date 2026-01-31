/**
 * Physical constants used in thermal calculations
 */

/** Stefan-Boltzmann constant in W/(m²·K⁴) */
export const STEFAN_BOLTZMANN = 5.67e-8;

/** Conversion from Celsius to Kelvin */
export const CELSIUS_TO_KELVIN = 273.15;

/** Sun angular half-angle in radians (≈0.267° or 4.65 mrad) */
export const SUN_HALF_ANGLE_RAD = 4.65e-3;

/** Default simulation parameters */
export const SIMULATION = {
  /** Minimum simulation time in seconds (30 minutes) */
  MIN_TIME: 1800,
  /** Maximum simulation time in seconds (24 hours) - safety cap */
  MAX_TIME: 86400,
  /** Base time step for Euler integration in seconds (used for short simulations) */
  BASE_TIME_STEP: 0.1,
  /** Maximum number of simulation steps to maintain performance */
  MAX_STEPS: 20000,
  /** Number of points to include in output (downsampled from simulation) */
  OUTPUT_POINTS: 200,
  /** Tolerance for equilibrium solver */
  EQUILIBRIUM_TOLERANCE: 0.001,
  /** Maximum iterations for equilibrium solver */
  MAX_ITERATIONS: 100,
  /** Number of time constants to simulate (5τ ≈ 99.3% of equilibrium) */
  TIME_CONSTANTS: 5,
} as const;
