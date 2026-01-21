import { type ChangeEvent, type FocusEvent, useEffect, useState } from "react";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  id?: string;
  helpText?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  unit,
  min,
  max,
  id,
  helpText,
}: NumberInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");
  const [inputValue, setInputValue] = useState(String(value));

  // Sync internal state when external value changes
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);

    // Update parent if valid number
    const parsed = Number.parseFloat(raw);
    if (!Number.isNaN(parsed)) {
      onChange(parsed);
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const parsed = Number.parseFloat(e.target.value);
    if (Number.isNaN(parsed)) {
      // Reset to last valid value
      setInputValue(String(value));
    } else {
      // Clamp to min/max and format
      let clamped = parsed;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      onChange(clamped);
      setInputValue(String(clamped));
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="input-label">
        {label}
        {unit && <span className="input-unit ml-1">({unit})</span>}
      </label>
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
