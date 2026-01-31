import { Card, NumberInput, PresetDropdown } from "@/components/ui";
import { materialHelperText, materialPresets } from "@/lib/presets";
import { type SpotGeometry, calculateCoolingArea } from "@/lib/thermal";

interface GeometryInputProps {
  areaCm2: number;
  thicknessMm: number;
  massGrams: number;
  specificHeat: number;
  spotGeometry: SpotGeometry | null;
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
  spotGeometry,
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

  // Spot geometry calculations
  const spotAreaCm2 = spotGeometry ? spotGeometry.area * 10000 : null;
  const spotSizeMm = spotGeometry ? spotGeometry.sideLength * 1000 : null;
  const isObjectLargerThanSpot = spotGeometry && areaCm2 > spotGeometry.area * 10000;

  return (
    <Card
      title="Object Properties"
      info="The object is modeled as a cuboid (box shape) illuminated on one face. Heat is lost from all faces."
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput
            label="Heated Face Area"
            value={areaCm2}
            onChange={onAreaChange}
            unit="cm²"
            min={0.1}
          />

          {spotGeometry && spotAreaCm2 !== null && spotSizeMm !== null ? (
            <div>
              <p className="input-label">Spot Area</p>
              <div className="p-2.5 bg-neutral-800 rounded-lg border border-neutral-700">
                <p className="text-sm font-mono text-neutral-100">{spotAreaCm2.toFixed(1)} cm²</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {spotSizeMm.toFixed(1)} × {spotSizeMm.toFixed(1)} mm
                </p>
              </div>
            </div>
          ) : (
            <NumberInput
              label="Thickness"
              value={thicknessMm}
              onChange={onThicknessChange}
              unit="mm"
              min={0.1}
            />
          )}
        </div>

        {/* Move thickness below when spot is shown */}
        {spotGeometry && (
          <NumberInput
            label="Thickness"
            value={thicknessMm}
            onChange={onThicknessChange}
            unit="mm"
            min={0.1}
          />
        )}

        {/* Warning when object area > spot area */}
        {isObjectLargerThanSpot && spotAreaCm2 !== null && (
          <div className="p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
            <p className="text-xs text-amber-200/80">
              Object area ({areaCm2.toFixed(1)} cm²) exceeds spot size ({spotAreaCm2.toFixed(1)}{" "}
              cm²). Only the illuminated spot area absorbs light. The rest of the object acts as a
              heat sink, which creates a thermal gradient — the uniform temperature approximation
              becomes less accurate.
            </p>
          </div>
        )}

        <NumberInput
          label="Mass"
          value={massGrams}
          onChange={onMassChange}
          unit="g"
          min={0.1}
          helpText="Heavier objects take longer to heat up but also hold more heat."
        />

        <PresetDropdown
          label="Specific Heat Capacity"
          presets={materialPresets}
          value={specificHeat}
          onChange={onSpecificHeatChange}
          unit="J/(kg·K)"
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
