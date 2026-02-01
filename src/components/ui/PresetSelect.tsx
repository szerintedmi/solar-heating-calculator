import { useEffect, useState } from "react";
import type { Preset } from "@/lib/presets";

interface PresetSelectProps {
  label: string;
  presets: Preset[];
  value: number;
  onChange: (value: number) => void;
  unit?: string;
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
  helpText,
  min,
  max,
}: PresetSelectProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");
  const [inputValue, setInputValue] = useState(String(value));

  // Sync internal state when external value changes
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  // Find matching preset (if any)
  const activePreset = presets.find((p) => Math.abs(p.value - value) < 0.001);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    const parsed = Number.parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.target.value);
    if (Number.isNaN(parsed)) {
      setInputValue(String(value));
    } else {
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped);
      setInputValue(String(clamped));
    }
  };

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
        type="text"
        inputMode="decimal"
        id={inputId}
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className="input-field font-mono"
      />

      {helpText && <p className="mt-1 text-xs text-neutral-500">{helpText}</p>}
    </div>
  );
}
