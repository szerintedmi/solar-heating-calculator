import { Card, NumberInput, PresetDropdown } from "@/components/ui";
import { convectionHelperText, convectionPresets } from "@/lib/presets";

interface EnvironmentInputProps {
  convectionCoeff: number;
  ambientTempCelsius: number;
  onConvectionChange: (value: number) => void;
  onAmbientTempChange: (value: number) => void;
}

export function EnvironmentInput({
  convectionCoeff,
  ambientTempCelsius,
  onConvectionChange,
  onAmbientTempChange,
}: EnvironmentInputProps) {
  return (
    <Card
      title="Environment"
      info="Air movement affects how quickly heat is carried away. Ambient temperature is the surrounding air temperature."
    >
      <div className="space-y-5">
        <PresetDropdown
          label="Air Movement"
          presets={convectionPresets}
          value={convectionCoeff}
          onChange={onConvectionChange}
          unit="W/(m²·K)"
          step={1}
          min={1}
          helpText={convectionHelperText}
        />

        <NumberInput
          label="Ambient Temperature"
          value={ambientTempCelsius}
          onChange={onAmbientTempChange}
          unit="°C"
          step={1}
          helpText="The temperature of the surrounding air. Heat flows from hot to cold."
        />
      </div>
    </Card>
  );
}
