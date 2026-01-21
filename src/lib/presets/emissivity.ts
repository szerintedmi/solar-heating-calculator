import type { PresetCollection } from "./types";

/**
 * Surface emissivity presets (0-1 scale)
 * Controls efficiency of thermal radiation emission
 *
 * Note: Thermal emissivity (longwave IR, ~5–50 μm) differs from solar absorptivity.
 * Most matte/painted non-metal surfaces have high ε (~0.9), but metals vary dramatically.
 */
export const emissivityPresets: PresetCollection = [
  {
    label: "Matte / painted surface (any color)",
    value: 0.9,
    description: "Most paints and matte coatings radiate well regardless of visible color",
    range: { min: 0.85, max: 0.95 },
  },
  {
    label: "Wood (unfinished)",
    value: 0.9,
    description: "Most wood surfaces are good IR emitters; finish matters more than species",
    range: { min: 0.85, max: 0.95 },
  },
  {
    label: "Plastic (most, matte)",
    value: 0.9,
    description: "Many polymers have high longwave emissivity; varies with additives/finish",
    range: { min: 0.85, max: 0.95 },
  },
  {
    label: "Rubber / silicone",
    value: 0.94,
    description: "Common elastomers are typically very high-ε surfaces",
    range: { min: 0.9, max: 0.97 },
  },
  {
    label: "Paper / fabric",
    value: 0.93,
    description: "Fibrous/matte surfaces tend to be excellent radiators",
    range: { min: 0.9, max: 0.97 },
  },
  {
    label: "Glass / ceramic",
    value: 0.92,
    description: "Typical non-metal solids have high longwave emissivity",
    range: { min: 0.85, max: 0.95 },
  },
  {
    label: "Concrete / brick / stone",
    value: 0.93,
    description: "Common building materials are typically high-ε in the longwave IR",
    range: { min: 0.9, max: 0.97 },
  },
  {
    label: "Metal, oxidized / anodized",
    value: 0.8,
    description: "Oxide layers and anodizing raise ε substantially",
    range: { min: 0.6, max: 0.9 },
  },
  {
    label: "Metal, bare / brushed (clean)",
    value: 0.2,
    description: "Bare metals are moderate-to-poor radiators when not oxidized",
    range: { min: 0.1, max: 0.4 },
  },
  {
    label: "Metal, polished / mirror-like",
    value: 0.05,
    description: "Very poor radiator (radiation losses can be dramatically lower)",
    range: { min: 0.02, max: 0.1 },
  },
];

export const emissivityHelperText =
  "Controls how efficiently the surface radiates heat away. Shiny metals are poor radiators; matte or painted surfaces radiate well. Radiation dominates heat loss at high temperatures.";

export const defaultEmissivity = 0.9;
