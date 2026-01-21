import type { PresetCollection } from "./types";

/**
 * Material specific heat capacity presets (J/(kg·K))
 * For transient (time-based) calculations
 */
export const materialPresets: PresetCollection = [
  {
    label: "Metal (steel)",
    value: 500,
    description: "Steel, iron",
    range: { min: 450, max: 550 },
  },
  {
    label: "Metal (aluminum)",
    value: 900,
    description: "Aluminum, zinc",
    range: { min: 850, max: 950 },
  },
  {
    label: "Glass / ceramic",
    value: 800,
    description: "Glass, ceramics, stone",
    range: { min: 700, max: 900 },
  },
  {
    label: "Plastic",
    value: 1500,
    description: "Various plastics",
    range: { min: 1200, max: 2000 },
  },
  {
    label: "Wood",
    value: 2000,
    description: "Various woods",
    range: { min: 1500, max: 2500 },
  },
];

export const materialHelperText = "Materials with higher heat capacity take longer to heat up.";

export const defaultSpecificHeat = 500;
