import type { PresetCollection } from "./types";

/**
 * K factor presets (lux per W/m²)
 * Bridges lux (photopic-weighted visible light) to irradiance (W/m²)
 *
 * London-specific seasonal values based on:
 * - Sun altitude: 61.9° (June) vs 18.3° (January)
 * - Air mass: ~1.13 (summer) vs ~3.16 (winter)
 * - Higher air mass shifts spectrum redder, lowering K
 */
export const kFactorPresets: PresetCollection = [
  {
    label: "London Peak Summer (late June)",
    value: 115,
    description: "Clear sky, 62° sun altitude, air mass ~1.1",
    range: { min: 105, max: 125 },
  },
  {
    label: "London Low Winter (January)",
    value: 92,
    description: "Clear sky, 18° sun altitude, air mass ~3.2",
    range: { min: 80, max: 105 },
  },
];

export const kFactorHelperText =
  "K factor for London daylight. Summer has bluer spectrum (higher K), winter has redder spectrum (lower K). Expect ±20% uncertainty without calibration.";

export const defaultKFactor = 115;
