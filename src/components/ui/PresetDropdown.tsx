import type { Preset } from "@/lib/presets";
import { useState } from "react";

interface PresetDropdownProps {
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

export function PresetDropdown({
  label,
  presets,
  value,
  onChange,
  unit,
  step = 0.01,
  helpText,
  min,
  max,
}: PresetDropdownProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");
  const selectId = `${inputId}-preset`;

  // Track selected preset by label (handles duplicate values)
  const [selectedLabel, setSelectedLabel] = useState<string | null>(() => {
    // Initialize with first matching preset
    const match = presets.find((p) => Math.abs(p.value - value) < 0.001);
    return match?.label ?? null;
  });

  // Find active preset: prefer selected label if value still matches, else find by value
  const activePreset = (() => {
    if (selectedLabel) {
      const byLabel = presets.find((p) => p.label === selectedLabel);
      if (byLabel && Math.abs(byLabel.value - value) < 0.001) {
        return byLabel;
      }
    }
    return presets.find((p) => Math.abs(p.value - value) < 0.001) ?? null;
  })();

  const isCustom = !activePreset;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const label = e.target.value;
    if (label === "") return; // Custom option selected, do nothing

    const preset = presets.find((p) => p.label === label);
    if (preset) {
      setSelectedLabel(preset.label);
      onChange(preset.value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number.parseFloat(e.target.value);
    if (!Number.isNaN(v)) {
      // Clear selected label when manually entering value
      setSelectedLabel(null);
      onChange(v);
    }
  };

  // Format option text with value and description
  const formatOption = (preset: Preset) => {
    const desc = preset.description ? ` — ${preset.description}` : "";
    const unitSuffix = unit ? unit : "";
    return `${preset.label} (${preset.value}${unitSuffix})${desc}`;
  };

  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="input-label">
        {label}
        {unit && <span className="input-unit ml-1">({unit})</span>}
      </label>

      {/* Preset dropdown */}
      <select
        id={selectId}
        value={activePreset?.label ?? ""}
        onChange={handleSelectChange}
        className="select-field"
      >
        {isCustom && (
          <option value="" disabled>
            Custom ({value}
            {unit ?? ""})
          </option>
        )}
        {presets.map((preset) => (
          <option key={preset.label} value={preset.label}>
            {formatOption(preset)}
          </option>
        ))}
      </select>

      {/* Direct numeric input */}
      <input
        type="number"
        id={inputId}
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        className="input-field font-mono"
        aria-label={`${label} custom value`}
      />

      {helpText && <p className="mt-1 text-xs text-neutral-500">{helpText}</p>}
    </div>
  );
}
