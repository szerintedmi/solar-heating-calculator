import type { Preset } from "@/lib/presets";

interface PresetSelectProps {
  label: string;
  presets: Preset[];
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  helpText?: string;
  min?: number;
  max?: number;
}

export function PresetSelect({
  label,
  presets,
  value,
  onChange,
  unit,
  step = 0.01,
  helpText,
  min,
  max,
}: PresetSelectProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  // Find matching preset (if any)
  const activePreset = presets.find((p) => Math.abs(p.value - value) < 0.001);

  return (
    <div className="space-y-2">
      <label htmlFor={inputId} className="input-label">
        {label}
        {unit && <span className="input-unit ml-1">({unit})</span>}
      </label>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onChange(preset.value)}
            className={`preset-button ${activePreset?.label === preset.label ? "active" : ""}`}
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Direct input */}
      <input
        type="number"
        id={inputId}
        value={value}
        onChange={(e) => {
          const v = Number.parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        min={min}
        max={max}
        step={step}
        className="input-field font-mono"
      />

      {helpText && <p className="mt-1 text-xs text-neutral-500">{helpText}</p>}
    </div>
  );
}
