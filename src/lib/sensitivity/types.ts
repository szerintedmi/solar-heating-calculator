import type { TimePoint } from "@/lib/thermal";

export type ParamKey =
  | "irradiance"
  | "incidenceAngleDeg"
  | "reflectance"
  | "absorptivity"
  | "emissivity"
  | "convectionCoeff"
  | "area"
  | "thickness"
  | "mass"
  | "specificHeat";

export type ParamGroup = "equilibrium" | "transient-only";

export interface ParamConfig {
  key: ParamKey;
  label: string;
  unit: string;
  min: number;
  max: number;
  currentValue: number;
  enabled: boolean;
  group: ParamGroup;
}

export interface SweepPoint {
  paramValue: number;
  tempCelsius: number;
}

export interface TransientSamplePoint {
  timeSeries: TimePoint[];
  label: string;
}

export type SweepResults = Partial<Record<ParamKey, SweepPoint[]>>;
