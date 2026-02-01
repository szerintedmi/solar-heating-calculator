import { Card, NumberInput, PresetDropdown } from "@/components/ui";
import {
  incidenceAnglePresets,
  irradiancePresets,
  kFactorHelperText,
  kFactorPresets,
  ndFilterPresets,
} from "@/lib/presets";

const irradianceHelpText = (
  <>
    Power per unit area on a surface <strong>facing the sun</strong> (perpendicular to sun rays).
    This is NOT Global Horizontal Irradiance (GHI)—for horizontal surfaces, irradiance is lower due
    to sun angle. Varies with atmospheric path, clouds, and air conditions. Historical data:{" "}
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
  incidenceMultiplier: number;
  onChange: (input: Partial<LightInputType>) => void;
}

export function LightInput({
  lightInput,
  computedIrradiance,
  incidenceMultiplier,
  onChange,
}: LightInputProps) {
  const { mode, irradiance, lux, kFactor, ndFilters, incidenceAngleDeg } = lightInput;

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

      {/* Incidence Angle Section */}
      <div className="pt-4 mt-4 border-t border-neutral-800">
        <PresetDropdown
          label="Incidence Angle on Object"
          presets={incidenceAnglePresets}
          value={incidenceAngleDeg}
          onChange={(v) => onChange({ incidenceAngleDeg: v })}
          unit="°"
          min={0}
          max={80}
          helpText="Angle between incoming light direction and a line perpendicular to the surface. 0° = straight-on (maximum heating), 60° = half heating."
        />

        {/* Show cos(φ) multiplier */}
        <div className="mt-3 p-3 bg-neutral-800 rounded-lg">
          <p className="text-sm text-neutral-400">Incidence multiplier:</p>
          <p className="text-lg font-mono text-neutral-100">
            cos({incidenceAngleDeg}°) = {incidenceMultiplier.toFixed(3)}×
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {incidenceAngleDeg === 0
              ? "Maximum heating"
              : `${((1 - incidenceMultiplier) * 100).toFixed(0)}% less heating than perpendicular`}
          </p>
        </div>

        {/* Soft warning at >60° */}
        {incidenceAngleDeg > 60 && incidenceAngleDeg <= 75 && (
          <div className="mt-3 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
            <p className="text-xs text-amber-200/80">
              Results become very sensitive to angle; small pointing errors matter.
            </p>
          </div>
        )}

        {/* Hard warning at >75° */}
        {incidenceAngleDeg > 75 && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-xs text-red-200/80">
              Grazing angles: real spot shape/alignment effects not modeled; expect large
              uncertainty.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
