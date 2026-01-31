import type { PresetCollection } from "./types";

/**
 * Incidence angle presets for light hitting object surface
 *
 * The incidence angle (φ) is the angle between the incoming light direction
 * and a line perpendicular to the object's heated face (the surface normal).
 *
 * φ = 0° → light hits straight-on (perpendicular), maximum heating
 * φ = 60° → light hits at steep angle, 50% heating (cos 60° = 0.5)
 *
 * The heating reduction follows cos(φ) - the effective collecting area
 * shrinks when light arrives at an angle.
 */
export const incidenceAnglePresets: PresetCollection = [
  {
    label: "Perpendicular (0°)",
    value: 0,
    description: "Maximum heating, light hits straight-on",
  },
  {
    label: "Nearly aligned (15°)",
    value: 15,
    description: "~97% heating",
  },
  {
    label: "Typical setup (30°)",
    value: 30,
    description: "~87% heating",
  },
  {
    label: "Moderate angle (45°)",
    value: 45,
    description: "~71% heating",
  },
  {
    label: "Steep angle (60°)",
    value: 60,
    description: "50% heating",
  },
];

export const defaultIncidenceAngle = 30;
