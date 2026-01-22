import type { Preset } from "@/lib/presets";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

interface PresetDropdownProps {
  label: string;
  presets: Preset[];
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  helpText?: ReactNode;
  min?: number;
  max?: number;
}

export function PresetDropdown({
  label,
  presets,
  value,
  onChange,
  unit,
  helpText,
  min,
  max,
}: PresetDropdownProps) {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");
  const selectId = `${inputId}-preset`;
  const [inputValue, setInputValue] = useState(String(value));

  // Sync internal state when external value changes
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  // Track selection: preset label or "__custom__" for explicit custom mode
  const [selection, setSelection] = useState<string>(() => {
    // Initialize with first matching preset, or custom if no match
    const match = presets.find((p) => Math.abs(p.value - value) < 0.001);
    return match?.label ?? "__custom__";
  });

  // Determine if we're in custom mode (explicitly selected or value doesn't match selection)
  const isCustom = (() => {
    if (selection === "__custom__") return true;
    // If selection is a preset label, check if value still matches
    const selectedPreset = presets.find((p) => p.label === selection);
    if (selectedPreset && Math.abs(selectedPreset.value - value) < 0.001) {
      return false;
    }
    // Value changed and no longer matches selected preset
    return true;
  })();

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === "__custom__") {
      setSelection("__custom__"); // Switch to custom mode, keep current value
      return;
    }

    const preset = presets.find((p) => p.label === selectedValue);
    if (preset) {
      setSelection(preset.label);
      onChange(preset.value);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  // Format option text: <value> | name - description
  const formatOption = (preset: Preset) => {
    const desc = preset.description ? ` - ${preset.description}` : "";
    const valueStr = unit === "%" ? `${preset.value}%` : `${preset.value}`;
    return `${valueStr} | ${preset.label}${desc}`;
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
        value={isCustom ? "__custom__" : selection}
        onChange={handleSelectChange}
        className="select-field"
      >
        {presets.map((preset) => (
          <option key={preset.label} value={preset.label}>
            {formatOption(preset)}
          </option>
        ))}
        <option value="__custom__">Custom</option>
      </select>

      {/* Direct numeric input - only shown when Custom is selected */}
      <input
        type="text"
        inputMode="decimal"
        id={inputId}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        className={`input-field font-mono ${isCustom ? "" : "hidden"}`}
        aria-label={`${label} custom value`}
      />

      {helpText && <p className="mt-1 text-xs text-neutral-500">{helpText}</p>}
    </div>
  );
}
