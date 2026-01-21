import { Card, NumberInput, PresetSelect } from "@/components/ui";
import {
  irradianceHelperText,
  irradiancePresets,
  kFactorHelperText,
  kFactorPresets,
  ndFilterPresets,
} from "@/lib/presets";
import type { LightInputMode, LightInput as LightInputType } from "@/lib/thermal";

interface LightInputProps {
  lightInput: LightInputType;
  computedIrradiance: number;
  onChange: (input: Partial<LightInputType>) => void;
}

export function LightInput({ lightInput, computedIrradiance, onChange }: LightInputProps) {
  const { mode, irradiance, lux, kFactor, ndFilters } = lightInput;

  const totalND = ndFilters.reduce((acc, nd) => acc * nd, 1);

  const setMode = (newMode: LightInputMode) => onChange({ mode: newMode });

  const toggleNDFilter = (ndValue: number) => {
    const isActive = ndFilters.includes(ndValue);
    const newFilters = isActive ? ndFilters.filter((v) => v !== ndValue) : [...ndFilters, ndValue];
    onChange({ ndFilters: newFilters });
  };

  return (
    <Card title="Light Input">
      {/* Mode selector */}
      <div className="flex gap-1 p-1 bg-neutral-800 rounded-lg mb-4">
        <button
          type="button"
          className={`mode-tab flex-1 ${mode === "direct" ? "active" : ""}`}
          onClick={() => setMode("direct")}
        >
          Direct (W/m²)
        </button>
        <button
          type="button"
          className={`mode-tab flex-1 ${mode === "lux" ? "active" : ""}`}
          onClick={() => setMode("lux")}
        >
          Lux
        </button>
        <button
          type="button"
          className={`mode-tab flex-1 ${mode === "lux-nd" ? "active" : ""}`}
          onClick={() => setMode("lux-nd")}
        >
          Lux + ND
        </button>
      </div>

      {/* Mode-specific inputs */}
      {mode === "direct" && (
        <PresetSelect
          label="Irradiance"
          presets={irradiancePresets}
          value={irradiance}
          onChange={(v) => onChange({ irradiance: v })}
          unit="W/m²"
          step={10}
          min={0}
          helpText={irradianceHelperText}
        />
      )}

      {(mode === "lux" || mode === "lux-nd") && (
        <div className="space-y-4">
          {mode === "lux-nd" && (
            <fieldset className="border-0 p-0 m-0">
              <legend className="input-label">ND Filters (click to toggle)</legend>
              <div className="flex flex-wrap gap-1.5">
                {ndFilterPresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => toggleNDFilter(preset.value)}
                    className={`preset-button ${ndFilters.includes(preset.value) ? "active" : ""}`}
                    title={preset.description}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              {ndFilters.length > 0 && (
                <p className="mt-2 text-sm text-neutral-400">
                  Total attenuation: <span className="font-mono">{totalND}×</span>
                </p>
              )}
            </fieldset>
          )}

          <NumberInput
            label={mode === "lux-nd" ? "Measured Lux (behind filter)" : "Illuminance"}
            value={lux}
            onChange={(v) => onChange({ lux: v })}
            unit="lux"
            min={0}
            step={100}
          />

          <PresetSelect
            label="K Factor"
            presets={kFactorPresets}
            value={kFactor}
            onChange={(v) => onChange({ kFactor: v })}
            unit="lux per W/m²"
            step={1}
            min={1}
            helpText={kFactorHelperText}
          />

          {/* Conversion result */}
          <div className="p-3 bg-neutral-800 rounded-lg">
            <p className="text-sm text-neutral-400">Computed irradiance:</p>
            <p className="text-lg font-mono text-neutral-100">
              {computedIrradiance.toFixed(1)} W/m²
            </p>
            {mode === "lux-nd" && totalND > 1 && (
              <p className="text-xs text-neutral-500 mt-1">
                Actual lux: {(lux * totalND).toLocaleString()} lux
              </p>
            )}
          </div>

          {/* Warning banner for lux mode */}
          <div className="p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
            <p className="text-xs text-amber-200/80">
              Lux→W/m² conversion uses K and may be off by ±20–40% depending on spectrum and sky.
            </p>
          </div>
        </div>
      )}

      {/* Sanity check warnings */}
      {computedIrradiance > 2000 && (
        <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
          <p className="text-xs text-amber-200/80">
            Above typical horizontal clear-sky solar irradiance; may be concentration or input
            mismatch.
          </p>
        </div>
      )}
    </Card>
  );
}
