import { Card, NumberInput, PresetDropdown } from "@/components/ui";
import {
  irradiancePresets,
  kFactorHelperText,
  kFactorPresets,
  ndFilterPresets,
  reflectanceHelperText,
  reflectancePresets,
} from "@/lib/presets";

const irradianceHelpText = (
  <>
    Power hitting the surface (assumes surface faces the sun). Varies with sun angle (lower sun =
    longer atmospheric path), clouds, and air conditions. Historical data:{" "}
    <a
      href="https://re.jrc.ec.europa.eu/pvg_tools/en/#MR"
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-neutral-300"
    >
      Europe
    </a>
    ,{" "}
    <a
      href={`${import.meta.env.BASE_URL}data/london_clearsky_irradiance_weekly.csv`}
      target="_blank"
      rel="noopener noreferrer"
      className="underline hover:text-neutral-300"
    >
      London
    </a>
  </>
);
import type { LightInputMode, LightInput as LightInputType } from "@/lib/thermal";

interface LightInputProps {
  lightInput: LightInputType;
  computedIrradiance: number;
  onChange: (input: Partial<LightInputType>) => void;
}

export function LightInput({ lightInput, computedIrradiance, onChange }: LightInputProps) {
  const { mode, irradiance, lux, kFactor, ndFilters, reflection } = lightInput;

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
      <div className="flex gap-1 p-1 bg-neutral-800 rounded-lg mb-2">
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
      {mode === "lux" && (
        <p className="text-xs text-neutral-500 mb-4">
          Estimate solar power when you only have a lux meter
        </p>
      )}
      {mode === "lux-nd" && (
        <p className="text-xs text-neutral-500 mb-4">
          For concentrated sunlight (e.g., multiple mirrors), use ND filters to stay within your lux
          meter's range
        </p>
      )}
      {mode === "direct" && <div className="mb-2" />}

      {/* Mode-specific inputs */}
      {mode === "direct" && (
        <PresetDropdown
          label="Irradiance"
          presets={irradiancePresets}
          value={irradiance}
          onChange={(v) => onChange({ irradiance: v })}
          unit="W/m²"
          min={0}
          helpText={irradianceHelpText}
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
          />

          <PresetDropdown
            label="K Factor"
            presets={kFactorPresets}
            value={kFactor}
            onChange={(v) => onChange({ kFactor: v })}
            unit="lux per W/m²"
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

      {/* Reflected light section */}
      <div className="mt-4 pt-4 border-t border-neutral-700">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={reflection.enabled}
            onChange={(e) =>
              onChange({
                reflection: {
                  ...reflection,
                  enabled: e.target.checked,
                },
              })
            }
            className="w-4 h-4 rounded bg-neutral-800 border-neutral-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
          />
          <span className="input-label mb-0">Use reflected light</span>
        </label>

        {reflection.enabled && (
          <div className="mt-4 space-y-4 pl-6 border-l-2 border-neutral-700">
            <PresetDropdown
              label="Reflectance"
              presets={reflectancePresets}
              value={reflection.reflectance}
              onChange={(v) =>
                onChange({
                  reflection: {
                    ...reflection,
                    reflectance: v,
                  },
                })
              }
              unit="%"
              min={0}
              max={100}
              helpText={reflectanceHelperText}
            />

            <NumberInput
              label="Number of reflectors focusing to the same point"
              value={reflection.numReflectors}
              onChange={(v) =>
                onChange({
                  reflection: {
                    ...reflection,
                    numReflectors: v,
                  },
                })
              }
              min={1}
            />

            {/* Reflection multiplier display */}
            <div className="p-3 bg-neutral-800 rounded-lg">
              <p className="text-sm text-neutral-400">Reflection multiplier:</p>
              <p className="text-lg font-mono text-neutral-100">
                {((reflection.reflectance / 100) * reflection.numReflectors).toFixed(2)}×
              </p>
              {reflection.numReflectors > 1 && (
                <p className="text-xs text-neutral-500 mt-1">
                  {reflection.numReflectors} mirrors × {reflection.reflectance}% each
                </p>
              )}
            </div>
          </div>
        )}
      </div>

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
