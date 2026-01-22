import type { PresetCollection } from "./types";

/**
 * Irradiance presets for direct W/m² input
 * Based on typical clear-sky solar irradiance in London, UK at solar noon
 * Assumes surface facing the sun (direct normal irradiance)
 *
 * Values based on:
 * - Sun altitude: 61.9° (June) vs 18.3° (January)
 * - Air mass: ~1.13 (summer) vs ~3.16 (winter)
 */
export const irradiancePresets: PresetCollection = [
  {
    label: "London Peak Summer",
    value: 950,
    description: "Late June, clear sky, noon, surface facing sun",
    range: { min: 850, max: 1050 },
  },
  {
    label: "London Low Winter",
    value: 400,
    description: "January, clear sky, noon, surface facing sun",
    range: { min: 300, max: 500 },
  },
];

export const irradianceHelperText =
  "Power hitting the surface (assumes surface faces the sun). Varies with sun angle (location, season, time of day), clouds, and air conditions.";

export const defaultIrradiance = 950;
