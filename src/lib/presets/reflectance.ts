import type { PresetCollection } from "./types";

/**
 * Mirror reflectance presets (percentage scale 0-100)
 * Values are midpoint of typical ranges, truncated to whole numbers
 */
export const reflectancePresets: PresetCollection = [
  {
    label: "Acrylic (cheap)",
    value: 82,
    description: "Aluminum film on acrylic",
    range: { min: 80, max: 85 },
  },
  {
    label: "Acrylic (good)",
    value: 87,
    description: "Vacuum-deposited Al + protective coat",
    range: { min: 85, max: 90 },
  },
  {
    label: "Glass (standard)",
    value: 87,
    description: "Back-silvered glass",
    range: { min: 85, max: 90 },
  },
  {
    label: "Glass (first-surface)",
    value: 92,
    description: "Al or Ag on front, no glass pass",
    range: { min: 90, max: 95 },
  },
  {
    label: "Enhanced aluminum",
    value: 94,
    description: "Protected Al with SiO₂ coating",
    range: { min: 92, max: 96 },
  },
  {
    label: "Silvered optical",
    value: 96,
    description: "Protected Ag, high-quality optical",
    range: { min: 95, max: 98 },
  },
];

export const reflectanceHelperText =
  "Percentage of light reflected by each mirror. Multiple reflectors multiply effective irradiance.";

export const defaultReflectance = 87;
