import type { PresetCollection } from "./types";

/**
 * Surface emissivity presets (0-1 scale)
 * Controls efficiency of thermal radiation emission
 */
export const emissivityPresets: PresetCollection = [
  {
    label: "Matte black",
    value: 0.95,
    description: "Near-ideal thermal radiator",
    range: { min: 0.9, max: 0.98 },
  },
  {
    label: "Painted / oxidized",
    value: 0.85,
    description: "Most real-world surfaces",
    range: { min: 0.75, max: 0.9 },
  },
  {
    label: "Bare metal (oxidized)",
    value: 0.6,
    description: "Depends on oxidation level",
    range: { min: 0.4, max: 0.75 },
  },
  {
    label: "Polished metal",
    value: 0.1,
    description: "Very poor radiator",
    range: { min: 0.03, max: 0.2 },
  },
];

export const emissivityHelperText =
  "Controls how efficiently the surface radiates heat away. Shiny metals are poor radiators; matte or painted surfaces radiate well. Radiation dominates heat loss at high temperatures.";

export const defaultEmissivity = 0.85;
