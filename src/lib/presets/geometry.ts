import type { PresetCollection } from "./types";

/**
 * Area presets (m²)
 */
export const areaPresets: PresetCollection = [
  { label: "Phone screen", value: 0.008, description: "~80 cm²" },
  { label: "10×10 cm", value: 0.01, description: "100 cm²" },
  { label: "A4 paper", value: 0.0625, description: "~625 cm²" },
  { label: "1 m²", value: 1, description: "Square meter" },
];

export const defaultArea = 0.01; // 10cm × 10cm

/**
 * Thickness presets (m)
 */
export const thicknessPresets: PresetCollection = [
  { label: "Thin sheet", value: 0.001, description: "1 mm" },
  { label: "Plate", value: 0.005, description: "5 mm" },
  { label: "Standard", value: 0.01, description: "10 mm" },
  { label: "Block", value: 0.05, description: "50 mm" },
];

export const defaultThickness = 0.01; // 1 cm

/**
 * Mass presets (kg)
 */
export const defaultMass = 0.1; // 100g
