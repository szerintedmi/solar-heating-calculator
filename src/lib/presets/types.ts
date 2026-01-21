/**
 * A preset option with label, value, and optional description
 */
export interface Preset<T = number> {
  label: string;
  value: T;
  description?: string;
  range?: { min: T; max: T };
}

/**
 * Collection of presets for a parameter
 */
export type PresetCollection<T = number> = Preset<T>[];
