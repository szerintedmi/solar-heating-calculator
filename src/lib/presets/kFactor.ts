import type { PresetCollection } from "./types";

/**
 * K factor presets (lux per W/m²)
 * Bridges lux (photopic-weighted visible light) to irradiance (W/m²)
 */
export const kFactorPresets: PresetCollection = [
  {
    label: "Clear sky, high sun",
    value: 115,
    description: "Summer noon, short air mass",
    range: { min: 105, max: 125 },
  },
  {
    label: "Clear sky, mid sun",
    value: 100,
    description: "Spring/autumn noon, moderate air mass",
    range: { min: 90, max: 110 },
  },
  {
    label: "Clear sky, low sun",
    value: 90,
    description: "Winter noon or morning/evening",
    range: { min: 80, max: 100 },
  },
  {
    label: "Bright overcast",
    value: 105,
    description: "Diffuse daylight, cloudy sky",
    range: { min: 95, max: 120 },
  },
  {
    label: "Indoor artificial",
    value: 60,
    description: "LED or fluorescent lighting",
    range: { min: 40, max: 80 },
  },
];

export const kFactorHelperText =
  "Typical outdoor daylight K is often around ~100 lux per W/m², but varies with sky and sun angle. Expect ±20–40% uncertainty if you don't calibrate.";

export const defaultKFactor = 100;
