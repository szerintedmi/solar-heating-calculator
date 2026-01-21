import type { PresetCollection } from "./types";

/**
 * Irradiance presets for direct W/m² input
 * Based on typical clear-sky solar irradiance in London, UK at solar noon
 *
 * Values based on:
 * - Sun altitude: 61.9° (June) vs 18.3° (January)
 * - Air mass: ~1.13 (summer) vs ~3.16 (winter)
 * - Horizontal surface orientation
 */
export const irradiancePresets: PresetCollection = [
  {
    label: "London Peak Summer",
    value: 950,
    description: "Late June, clear sky, noon (horizontal surface)",
    range: { min: 850, max: 1050 },
  },
  {
    label: "London Low Winter",
    value: 400,
    description: "January, clear sky, noon (horizontal surface)",
    range: { min: 300, max: 500 },
  },
];

export const irradianceHelperText =
  "Seasonal sunlight intensity in London at noon. Actual values depend on time of day, clouds, and surface angle.";

export const defaultIrradiance = 1000;
