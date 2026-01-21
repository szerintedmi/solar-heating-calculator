import type { PresetCollection } from "./types";

/**
 * ND filter presets (attenuation factor)
 * For measuring bright light sources with a lux meter
 */
export const ndFilterPresets: PresetCollection = [
  { label: "ND2", value: 2, description: "1 stop" },
  { label: "ND4", value: 4, description: "2 stops" },
  { label: "ND8", value: 8, description: "3 stops" },
  { label: "ND16", value: 16, description: "4 stops" },
  { label: "ND32", value: 32, description: "5 stops" },
  { label: "ND64", value: 64, description: "6 stops" },
  { label: "ND100", value: 100, description: "~6.6 stops" },
  { label: "ND400", value: 400, description: "~8.6 stops" },
  { label: "ND1000", value: 1000, description: "10 stops" },
];
