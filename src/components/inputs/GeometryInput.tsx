import { Card, NumberInput, PresetDropdown } from "@/components/ui";
import { materialHelperText, materialPresets } from "@/lib/presets";
import { calculateCoolingArea } from "@/lib/thermal";

interface GeometryInputProps {
  areaCm2: number;
  thicknessMm: number;
  massGrams: number;
  specificHeat: number;
  onAreaChange: (value: number) => void;
  onThicknessChange: (value: number) => void;
  onMassChange: (value: number) => void;
  onSpecificHeatChange: (value: number) => void;
}

export function GeometryInput({
  areaCm2,
  thicknessMm,
  massGrams,
  specificHeat,
  onAreaChange,
  onThicknessChange,
  onMassChange,
  onSpecificHeatChange,
}: GeometryInputProps) {
  // Convert for display calculations
  const areaM2 = areaCm2 / 10000;
  const thicknessM = thicknessMm / 1000;
  const coolingArea = calculateCoolingArea(areaM2, thicknessM);
  const coolingAreaCm2 = coolingArea * 10000;

  return (
    <Card
      title="Object Properties"
      info="The object is modeled as a cuboid (box shape) illuminated on one face. Heat is lost from all faces."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Illuminated Area"
            value={areaCm2}
            onChange={onAreaChange}
            unit="cm²"
            min={0.1}
            step={1}
          />

          <NumberInput
            label="Thickness"
            value={thicknessMm}
            onChange={onThicknessChange}
            unit="mm"
            min={0.1}
            step={1}
          />
        </div>

        <NumberInput
          label="Mass"
          value={massGrams}
          onChange={onMassChange}
          unit="g"
          min={0.1}
          step={1}
          helpText="Heavier objects take longer to heat up but also hold more heat."
        />

        <PresetDropdown
          label="Specific Heat Capacity"
          presets={materialPresets}
          value={specificHeat}
          onChange={onSpecificHeatChange}
          unit="J/(kg·K)"
          step={10}
          min={100}
          helpText={materialHelperText}
        />

        {/* Calculated cooling area */}
        <div className="p-3 bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">Calculated cooling area:</p>
          <p className="text-lg font-mono text-neutral-100">{coolingAreaCm2.toFixed(1)} cm²</p>
          <p className="text-xs text-neutral-500 mt-1">
            2 × {areaCm2.toFixed(1)} + 4 × √{areaCm2.toFixed(1)} × {thicknessMm.toFixed(1)}/10
          </p>
        </div>
      </div>
    </Card>
  );
}
