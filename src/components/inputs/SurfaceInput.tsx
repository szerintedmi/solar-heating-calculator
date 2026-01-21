import { Card, PresetSelect } from "@/components/ui";
import {
  absorptivityHelperText,
  absorptivityPresets,
  emissivityHelperText,
  emissivityPresets,
} from "@/lib/presets";

interface SurfaceInputProps {
  absorptivity: number;
  emissivity: number;
  onAbsorptivityChange: (value: number) => void;
  onEmissivityChange: (value: number) => void;
}

export function SurfaceInput({
  absorptivity,
  emissivity,
  onAbsorptivityChange,
  onEmissivityChange,
}: SurfaceInputProps) {
  return (
    <Card
      title="Surface Properties"
      info="Absorptivity controls heat gain from light. Emissivity controls heat loss by radiation. They can differ for specialized coatings."
    >
      <div className="space-y-5">
        <PresetSelect
          label="Absorptivity (α)"
          presets={absorptivityPresets}
          value={absorptivity}
          onChange={onAbsorptivityChange}
          step={0.01}
          min={0}
          max={1}
          helpText={absorptivityHelperText}
        />

        <PresetSelect
          label="Emissivity (ε)"
          presets={emissivityPresets}
          value={emissivity}
          onChange={onEmissivityChange}
          step={0.01}
          min={0}
          max={1}
          helpText={emissivityHelperText}
        />
      </div>
    </Card>
  );
}
