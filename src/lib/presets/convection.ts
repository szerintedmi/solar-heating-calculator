import type { PresetCollection } from "./types";

/**
 * Convection coefficient presets (W/(m²·K))
 * Describes airflow conditions affecting convective heat loss
 */
export const convectionPresets: PresetCollection = [
  {
    label: "Still indoor air",
    value: 5,
    description: "Natural convection only",
    range: { min: 3, max: 7 },
  },
  {
    label: "Outdoor, calm",
    value: 8,
    description: "Buoyancy-driven airflow",
    range: { min: 6, max: 10 },
  },
  {
    label: "Light air movement",
    value: 15,
    description: "Walking speed air",
    range: { min: 10, max: 20 },
  },
  {
    label: "Breezy / windy",
    value: 30,
    description: "Wind dramatically increases losses",
    range: { min: 20, max: 50 },
  },
];

export const convectionHelperText =
  "Moving air carries heat away faster and lowers the maximum temperature.";

export const defaultConvection = 10;
