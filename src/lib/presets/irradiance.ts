import type { PresetCollection } from "./types";

/**
 * Irradiance presets for direct W/m² input
 * Based on typical clear-sky solar irradiance in London, UK at solar noon
 * Assumes surface facing the sun: DNI + 0.5×DHI
 *
 * Sources:
 * - Europe: https://re.jrc.ec.europa.eu/pvg_tools/en/#MR
 * - London: public/data/london_clearsky_irradiance_weekly.csv
 */
export const irradiancePresets: PresetCollection = [
  {
    label: "London Peak (May)",
    value: 880,
    description: "Clear sky, noon, surface facing sun",
    range: { min: 800, max: 950 },
  },
  {
    label: "London Low (Dec)",
    value: 600,
    description: "Clear sky, noon, surface facing sun",
    range: { min: 550, max: 650 },
  },
];

export const defaultIrradiance = 880;
