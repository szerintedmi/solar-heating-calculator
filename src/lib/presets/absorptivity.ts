import type { PresetCollection } from "./types";

/**
 * Surface absorptivity presets (0-1 scale)
 * Controls how much incoming light turns into heat
 */
export const absorptivityPresets: PresetCollection = [
  {
    label: "Matte black",
    value: 0.95,
    description: "Near-ideal absorber",
    range: { min: 0.9, max: 0.98 },
  },
  {
    label: "Dark surface",
    value: 0.85,
    description: "Dark plastics, dark paints",
    range: { min: 0.75, max: 0.9 },
  },
  {
    label: "Medium colored",
    value: 0.65,
    description: "Red, green, blue surfaces",
    range: { min: 0.5, max: 0.75 },
  },
  {
    label: "Light surface",
    value: 0.4,
    description: "White, beige, light grey",
    range: { min: 0.25, max: 0.55 },
  },
  {
    label: "Shiny / reflective",
    value: 0.15,
    description: "Polished metals, mirrors",
    range: { min: 0.05, max: 0.3 },
  },
];

export const absorptivityHelperText =
  "Controls how much incoming light turns into heat. Dark, matte surfaces absorb most light; shiny surfaces reflect it.";

export const defaultAbsorptivity = 0.85;
