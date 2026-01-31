import { Card, NumberInput, PresetDropdown } from "@/components/ui";
import { reflectanceHelperText, reflectancePresets } from "@/lib/presets";
import type { ReflectionInput as ReflectionInputType } from "@/lib/thermal";

interface ReflectionInputProps {
  reflection: ReflectionInputType;
  onChange: (reflection: ReflectionInputType) => void;
}

export function ReflectionInput({ reflection, onChange }: ReflectionInputProps) {
  // Collapsed state: compact button card
  if (!reflection.enabled) {
    return (
      <button
        type="button"
        onClick={() => onChange({ ...reflection, enabled: true })}
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
