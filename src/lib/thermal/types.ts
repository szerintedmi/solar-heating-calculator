/**
 * Input parameters for thermal calculations
 */
export interface ThermalInputs {
  /** Irradiance in W/m² */
  irradiance: number;
  /** Object face area in m² (used for cooling area calculation) */
  area: number;
  /** Illuminated area in m² (used for absorbed power, defaults to area if not set) */
  illuminatedArea?: number;
  /** Object thickness in m */
  thickness: number;
  /** Object mass in kg */
  mass: number;
  /** Surface absorptivity (0-1) */
  absorptivity: number;
  /** Surface emissivity (0-1) */
  emissivity: number;
  /** Convection coefficient in W/(m²·K) */
  convectionCoeff: number;
  /** Specific heat capacity in J/(kg·K) */
  specificHeat: number;
  /** Ambient temperature in Kelvin */
  ambientTemp: number;
}

/**
 * Results from thermal equilibrium calculation
 */
export interface EquilibriumResult {
  /** Equilibrium temperature in Kelvin */
  temperature: number;
  /** Absorbed power in Watts */
  absorbedPower: number;
  /** Convection heat loss in Watts */
  convectionLoss: number;
  /** Radiation heat loss in Watts */
  radiationLoss: number;
  /** Total heat loss in Watts */
  totalLoss: number;
}

/**
 * A single point in the temperature time series
 */
export interface TimePoint {
  /** Time in seconds */
  time: number;
  /** Temperature in Kelvin */
  temperature: number;
}

/**
 * Results from transient (time-based) calculation
 */
export interface TransientResult {
  /** Temperature vs time data points */
  timeSeries: TimePoint[];
  /** Time to reach 50% of temperature rise in seconds */
  time50: number;
  /** Time to reach 90% of temperature rise in seconds */
  time90: number;
  /** Time to reach 95% of temperature rise in seconds */
  time95: number;
  /** Time to reach 99% of temperature rise in seconds */
  time99: number;
}

/**
 * Complete calculation results
 */
export interface CalculationResult {
  equilibrium: EquilibriumResult;
  transient: TransientResult;
}

/**
 * Light input mode
 */
export type LightInputMode = "direct" | "lux" | "lux-nd";

/**
 * Calculated spot geometry from sun angular spread on a flat mirror
 */
export interface SpotGeometry {
  /** Spot side length in meters */
  sideLength: number;
  /** Spot area in m² */
  area: number;
  /** Concentration factor (mirror area / spot area, always ≤1 for flat mirrors) */
  concentrationFactor: number;
}

/**
 * Reflection input for mirrors/reflectors
 */
export interface ReflectionInput {
  /** Whether reflection is enabled */
  enabled: boolean;
  /** Reflectance percentage (0-100) */
  reflectance: number;
  /** Number of reflectors */
  numReflectors: number;
  /** Mirror side length in mm (for angular spread calculation) */
  mirrorSizeMm?: number;
  /** Distance from mirror to target in meters */
  distanceM?: number;
}

/**
 * Light input state based on mode
 */
export interface LightInput {
  mode: LightInputMode;
  /** Direct irradiance input (W/m²) */
  irradiance: number;
  /** Lux input */
  lux: number;
  /** K factor (lux per W/m²) */
  kFactor: number;
  /** ND filter attenuation factors */
  ndFilters: number[];
  /** Optional reflection from mirrors */
  reflection: ReflectionInput;
  /** Incidence angle in degrees (0° = perpendicular, default 30°) */
  incidenceAngleDeg: number;
}
