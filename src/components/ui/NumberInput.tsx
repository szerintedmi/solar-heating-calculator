import type { ChangeEvent } from "react";

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
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
  step = 1,
  id,
  helpText,
}: NumberInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number.parseFloat(e.target.value);
    if (!Number.isNaN(newValue)) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="input-label">
        {label}
        {unit && <span className="input-unit ml-1">({unit})</span>}
      </label>
      <input
        type="number"
        id={inputId}
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="input-field font-mono"
      />
      {helpText && <p className="mt-1 text-xs text-neutral-500">{helpText}</p>}
    </div>
  );
}
