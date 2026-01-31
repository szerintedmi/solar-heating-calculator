import { Card, NumberInput, PresetDropdown } from "@/components/ui";
import {
  defaultMirrorDistance,
  defaultMirrorSize,
  reflectanceHelperText,
  reflectancePresets,
} from "@/lib/presets";
import type { ReflectionInput as ReflectionInputType, SpotGeometry } from "@/lib/thermal";

interface ReflectionInputProps {
  reflection: ReflectionInputType;
  spotGeometry: SpotGeometry | null;
  onChange: (reflection: ReflectionInputType) => void;
}

export function ReflectionInput({ reflection, spotGeometry, onChange }: ReflectionInputProps) {
  // Collapsed state: compact button card
  if (!reflection.enabled) {
    return (
      <button
        type="button"
        onClick={() =>
          onChange({
            ...reflection,
            enabled: true,
            mirrorSizeMm: defaultMirrorSize,
            distanceM: defaultMirrorDistance,
          })
        }
        className="card hover:border-neutral-700 transition-colors cursor-pointer text-left w-full"
      >
        <div className="flex items-center gap-3">
          <div className="text-xl text-neutral-500">+</div>
          <div>
            <h2 className="card-title mb-0">Use Reflected Light</h2>
            <p className="text-sm text-neutral-500">
              For mirrors or reflective surfaces focusing light onto the object
            </p>
          </div>
        </div>
      </button>
    );
  }

  // Expanded state: full configuration card
  const reflectionMultiplier = (reflection.reflectance / 100) * reflection.numReflectors;

  // Convert spot size to user-friendly units
  const spotSizeMm = spotGeometry ? spotGeometry.sideLength * 1000 : null;
  const spotAreaCm2 = spotGeometry ? spotGeometry.area * 10000 : null;

  return (
    <Card
      title="Reflection"
      info="Mirrors or reflective surfaces redirect light to the target. Each reflector adds light proportional to its reflectance."
    >
      <div className="space-y-5">
        <PresetDropdown
          label="Reflectance"
          presets={reflectancePresets}
          value={reflection.reflectance}
          onChange={(v) => onChange({ ...reflection, reflectance: v })}
          unit="%"
          min={0}
          max={100}
          helpText={reflectanceHelperText}
        />

        <NumberInput
          label="Number of reflectors focusing to the same point"
          value={reflection.numReflectors}
          onChange={(v) => onChange({ ...reflection, numReflectors: v })}
          min={1}
        />

        {/* Reflection multiplier display */}
        <div className="p-3 bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">Reflection multiplier:</p>
          <p className="text-lg font-mono text-neutral-100">{reflectionMultiplier.toFixed(2)}×</p>
          {reflection.numReflectors > 1 && (
            <p className="text-xs text-neutral-500 mt-1">
              {reflection.numReflectors} mirrors × {reflection.reflectance}% each
            </p>
          )}
        </div>

        {/* Mirror geometry - always shown */}
        <div className="space-y-4 pt-2 border-t border-neutral-800">
          <p className="text-sm text-neutral-400">Mirror Geometry</p>

          <div className="grid grid-cols-2 gap-4">
            <NumberInput
              label="Mirror Size"
              value={reflection.mirrorSizeMm ?? defaultMirrorSize}
              onChange={(v) => onChange({ ...reflection, mirrorSizeMm: v })}
              unit="mm"
              min={1}
              helpText="Side length of square mirror"
            />

            <NumberInput
              label="Distance"
              value={reflection.distanceM ?? defaultMirrorDistance}
              onChange={(v) => onChange({ ...reflection, distanceM: v })}
              unit="m"
              min={0.1}
              max={50}
              helpText="Mirror to object"
            />
          </div>

          {/* Spot size and concentration display */}
          {spotGeometry && spotSizeMm !== null && spotAreaCm2 !== null && (
            <div className="p-3 bg-neutral-800 rounded-lg">
              <p className="text-sm text-neutral-400">Spot size at target:</p>
              <p className="text-lg font-mono text-neutral-100">
                {spotSizeMm.toFixed(1)} mm ({spotAreaCm2.toFixed(1)} cm²)
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Spot area is {(1 / spotGeometry.concentrationFactor).toFixed(1)}× mirror size
              </p>
              <p className="text-xs text-neutral-500 mt-1">
                Sun's 0.5° angular width causes flat mirrors to spread light
              </p>
            </div>
          )}
        </div>

        {/* Disable button */}
        <button
          type="button"
          onClick={() => onChange({ ...reflection, enabled: false })}
          className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          ← Use direct light only
        </button>
      </div>
    </Card>
  );
}
