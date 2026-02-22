import { useState } from "react";
import type { CalculationResult, LightInput, SpotGeometry, ThermalInputs } from "@/lib/thermal";
import { STEFAN_BOLTZMANN } from "@/lib/thermal/constants";
import { calculateCoolingArea } from "@/lib/thermal/equations";

interface FormulasProps {
  thermalInputs: ThermalInputs;
  results: CalculationResult;
  light: LightInput;
  spotGeometry: SpotGeometry | null;
  incidenceMultiplier: number;
  displayIrradiance: number;
}

function fmt(value: number, sigFigs = 3): string {
  if (!Number.isFinite(value)) return "—";
  if (value === 0) return "0";
  const abs = Math.abs(value);
  if (abs >= 0.01 && abs < 10000) {
    return Number(value.toPrecision(sigFigs)).toString();
  }
  return value.toExponential(sigFigs - 1);
}

const valuesLineClass =
  "font-mono text-xs text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-b border-l-2 border-yellow-600 -mt-0.5";

function ValuesLine({ children }: { children: React.ReactNode }) {
  return <div className={valuesLineClass}>{children}</div>;
}

function ResultValue({ children }: { children: React.ReactNode }) {
  return <span className="text-yellow-400">{children}</span>;
}

export function Formulas({
  thermalInputs,
  results,
  light,
  spotGeometry,
  incidenceMultiplier,
  displayIrradiance,
}: FormulasProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showValues, setShowValues] = useState(false);

  const coolingArea = calculateCoolingArea(thermalInputs.area, thermalInputs.thickness);
  const eqTemp = results.equilibrium.temperature;
  const ambientTemp = thermalInputs.ambientTemp;
  const illuminatedArea = thermalInputs.illuminatedArea ?? thermalInputs.area;
  const ndTotalFactor = light.ndFilters.reduce((acc, n) => acc * n, 1);
  const mirrorSideM = (light.reflection.mirrorSizeMm ?? 0) / 1000;
  const timeConstant =
    thermalInputs.convectionCoeff * coolingArea > 0
      ? (thermalInputs.mass * thermalInputs.specificHeat) /
        (thermalInputs.convectionCoeff * coolingArea)
      : 0;

  const showLux = light.mode === "lux" || light.mode === "lux-nd";
  const showNd = light.mode === "lux-nd";
  const showReflection = light.reflection.enabled;

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          Formulas
        </button>

        {isOpen && (
          <label className="flex items-center gap-1.5 text-xs text-neutral-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showValues}
              onChange={(e) => setShowValues(e.target.checked)}
              className="accent-yellow-500"
            />
            Show values
          </label>
        )}
      </div>

      {isOpen && (
        <div className="mt-4 p-5 bg-neutral-850 border border-neutral-800 rounded-xl text-sm space-y-6">
          {/* Energy Balance */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Energy Balance</h3>
            <p className="text-neutral-400 text-xs mb-2">
              At equilibrium, absorbed power equals total heat loss:
            </p>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              P<sub>abs</sub> = P<sub>loss</sub>
            </div>
            {showValues && (
              <ValuesLine>
                <ResultValue>
                  {fmt(results.equilibrium.absorbedPower)} W = {fmt(results.equilibrium.totalLoss)}{" "}
                  W
                </ResultValue>
              </ValuesLine>
            )}
          </section>

          {/* Lux Conversion */}
          {showLux && (
            <section>
              <h3 className="text-neutral-200 font-medium mb-2">Lux to Irradiance</h3>
              <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
                E = L / K
              </div>
              {showValues && (
                <ValuesLine>
                  = {fmt(showNd ? light.lux * ndTotalFactor : light.lux)} lux / {fmt(light.kFactor)}{" "}
                  lux/(W/m²)
                  <br />= <ResultValue>{fmt(displayIrradiance)} W/m²</ResultValue>
                </ValuesLine>
              )}
              <ul className="mt-2 text-xs text-neutral-500 space-y-1">
                <li>L = illuminance (lux)</li>
                <li>K = luminous efficacy factor (lux per W/m²)</li>
              </ul>
            </section>
          )}

          {/* ND Filter */}
          {showNd && (
            <section>
              <h3 className="text-neutral-200 font-medium mb-2">ND Filter Attenuation</h3>
              <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
                L<sub>actual</sub> = L<sub>measured</sub> × N<sub>1</sub> × N<sub>2</sub> × ...
              </div>
              {showValues && (
                <ValuesLine>
                  = {fmt(light.lux)} lux ×{" "}
                  {light.ndFilters.length > 0
                    ? light.ndFilters.map((n) => fmt(n)).join(" × ")
                    : "1"}
                  <br />= <ResultValue>{fmt(light.lux * ndTotalFactor)} lux</ResultValue>
                </ValuesLine>
              )}
              <p className="mt-2 text-xs text-neutral-500">
                Where N is the filter factor (e.g., ND8 → N = 8)
              </p>
            </section>
          )}

          {/* Absorbed Power (Direct) */}
          {!showReflection && (
            <section>
              <h3 className="text-neutral-200 font-medium mb-2">Absorbed Power (Direct)</h3>
              <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
                P<sub>abs</sub> = E × A × α × cos(φ)
              </div>
              {showValues && (
                <ValuesLine>
                  = {fmt(displayIrradiance)} W/m² × {fmt(illuminatedArea)} m² ×{" "}
                  {fmt(thermalInputs.absorptivity)} × {fmt(incidenceMultiplier, 4)}
                  <br />= <ResultValue>{fmt(results.equilibrium.absorbedPower)} W</ResultValue>
                </ValuesLine>
              )}
              <ul className="mt-2 text-xs text-neutral-500 space-y-1">
                <li>E = irradiance (W/m²)</li>
                <li>A = illuminated area (m²)</li>
                <li>α = absorptivity (0–1)</li>
                <li>φ = incidence angle (degrees from perpendicular)</li>
              </ul>
              <p className="mt-2 text-xs text-neutral-500">
                If light arrives at an angle, the effective collecting area shrinks by cos(φ), so
                heating drops accordingly.
              </p>
            </section>
          )}

          {/* Reflected Light Sections */}
          {showReflection && (
            <>
              <section>
                <h3 className="text-neutral-200 font-medium mb-2">
                  Spot Geometry (Reflected Light)
                </h3>
                <p className="text-neutral-400 text-xs mb-2">
                  Due to the Sun's angular size (~0.5°), a flat mirror produces a spot larger than
                  itself:
                </p>
                <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
                  s<sub>spot</sub> = s + 2L × tan(θ<sub>sun</sub>)
                </div>
                {showValues && spotGeometry && (
                  <ValuesLine>
                    = {fmt(mirrorSideM)} m + 2 × {fmt(light.reflection.distanceM ?? 0)} m × tan(4.65
                    mrad)
                    <br />= <ResultValue>{fmt(spotGeometry.sideLength)} m</ResultValue>
                  </ValuesLine>
                )}
                <ul className="mt-2 text-xs text-neutral-500 space-y-1">
                  <li>s = mirror side length (m)</li>
                  <li>L = distance from mirror to target (m)</li>
                  <li>
                    θ<sub>sun</sub> ≈ 4.65 mrad (Sun half-angle)
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-neutral-200 font-medium mb-2">Concentration Factor</h3>
                <p className="text-neutral-400 text-xs mb-2">
                  Ratio of mirror area to spot area (always ≤1 for flat mirrors):
                </p>
                <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
                  C = s² / s<sub>spot</sub>²
                </div>
                {showValues && spotGeometry && (
                  <ValuesLine>
                    = ({fmt(mirrorSideM)} m)² / ({fmt(spotGeometry.sideLength)} m)²
                    <br />= <ResultValue>{fmt(spotGeometry.concentrationFactor)}</ResultValue>
                  </ValuesLine>
                )}
              </section>

              <section>
                <h3 className="text-neutral-200 font-medium mb-2">Absorbed Power (Reflected)</h3>
                <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
                  P<sub>abs</sub> = E × R × C × n × A<sub>eff</sub> × α × cos(φ)
                </div>
                {showValues && (
                  <ValuesLine>
                    = {fmt(displayIrradiance)} W/m² × {fmt(light.reflection.reflectance / 100)}
                    {spotGeometry && <> × {fmt(spotGeometry.concentrationFactor)}</>} ×{" "}
                    {fmt(light.reflection.numReflectors)} × {fmt(illuminatedArea)} m² ×{" "}
                    {fmt(thermalInputs.absorptivity)} × {fmt(incidenceMultiplier, 4)}
                    <br />= <ResultValue>{fmt(results.equilibrium.absorbedPower)} W</ResultValue>
                  </ValuesLine>
                )}
                <ul className="mt-2 text-xs text-neutral-500 space-y-1">
                  <li>R = mirror reflectance (0–1)</li>
                  <li>C = concentration factor</li>
                  <li>n = number of mirrors</li>
                  <li>
                    A<sub>eff</sub> = min(A, A<sub>spot</sub>) — effective illuminated area
                  </li>
                  <li>φ = incidence angle (degrees from perpendicular)</li>
                </ul>
                <p className="mt-2 text-xs text-neutral-500">
                  When object ≥ spot: all reflected power is absorbed (P independent of distance).
                  <br />
                  When object {"<"} spot: only a fraction is captured (P decreases with distance).
                </p>
              </section>
            </>
          )}

          {/* Cooling Area */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Cooling Area (Cuboid)</h3>
            <p className="text-neutral-400 text-xs mb-2">For a cuboid with square cross-section:</p>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              A<sub>cool</sub> = 2A + 4√A × d
            </div>
            {showValues && (
              <ValuesLine>
                = 2 × {fmt(thermalInputs.area)} m² + 4 × √({fmt(thermalInputs.area)} m²) ×{" "}
                {fmt(thermalInputs.thickness)} m
                <br />= <ResultValue>{fmt(coolingArea)} m²</ResultValue>
              </ValuesLine>
            )}
            <ul className="mt-2 text-xs text-neutral-500 space-y-1">
              <li>A = object face area (m²)</li>
              <li>d = thickness (m)</li>
            </ul>
            <p className="mt-2 text-xs text-neutral-500">
              Note: Cooling area is always based on full object geometry, not the illuminated
              portion. The entire object surface loses heat.
            </p>
          </section>

          {/* Heat Loss */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Total Heat Loss</h3>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              P<sub>loss</sub> = P<sub>conv</sub> + P<sub>rad</sub>
            </div>
            {showValues && (
              <ValuesLine>
                = {fmt(results.equilibrium.convectionLoss)} W +{" "}
                {fmt(results.equilibrium.radiationLoss)} W
                <br />= <ResultValue>{fmt(results.equilibrium.totalLoss)} W</ResultValue>
              </ValuesLine>
            )}
            <p className="mt-2 text-xs text-neutral-500">
              Conduction (P<sub>cond</sub>) is neglected — object is assumed suspended in air, and
              air's thermal conductivity is negligible for this estimate.
            </p>
          </section>

          {/* Convection */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Convection Loss</h3>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              P<sub>conv</sub> = h × A<sub>cool</sub> × (T − T<sub>amb</sub>)
            </div>
            {showValues && (
              <ValuesLine>
                = {fmt(thermalInputs.convectionCoeff)} W/(m²·K) × {fmt(coolingArea)} m² × (
                {fmt(eqTemp)} K − {fmt(ambientTemp)} K)
                <br />= <ResultValue>{fmt(results.equilibrium.convectionLoss)} W</ResultValue>
              </ValuesLine>
            )}
            <ul className="mt-2 text-xs text-neutral-500 space-y-1">
              <li>h = convection coefficient (W/(m²·K))</li>
              <li>
                A<sub>cool</sub> = cooling surface area (m²)
              </li>
              <li>T = object temperature (K)</li>
              <li>
                T<sub>amb</sub> = ambient temperature (K)
              </li>
            </ul>
          </section>

          {/* Radiation */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Radiation Loss (Stefan-Boltzmann)</h3>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              P<sub>rad</sub> = ε × σ × A<sub>cool</sub> × (T⁴ − T<sub>amb</sub>⁴)
            </div>
            {showValues && (
              <ValuesLine>
                = {fmt(thermalInputs.emissivity)} × {STEFAN_BOLTZMANN.toExponential(2)} W/(m²·K⁴) ×{" "}
                {fmt(coolingArea)} m² × ({fmt(eqTemp ** 4, 4)} − {fmt(ambientTemp ** 4, 4)}) K⁴
                <br />= <ResultValue>{fmt(results.equilibrium.radiationLoss)} W</ResultValue>
              </ValuesLine>
            )}
            <ul className="mt-2 text-xs text-neutral-500 space-y-1">
              <li>ε = emissivity (0–1)</li>
              <li>σ = Stefan-Boltzmann constant = 5.67 × 10⁻⁸ W/(m²·K⁴)</li>
            </ul>
          </section>

          {/* Transient */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Temperature Evolution</h3>
            <p className="text-neutral-400 text-xs mb-2">Rate of temperature change:</p>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              dT/dt = (P<sub>abs</sub> − P<sub>loss</sub>) / (m × c)
            </div>
            {showValues && (
              <ValuesLine>
                = ({fmt(results.equilibrium.absorbedPower)} W − {fmt(results.equilibrium.totalLoss)}{" "}
                W) / ({fmt(thermalInputs.mass)} kg × {fmt(thermalInputs.specificHeat)} J/(kg·K))
                <br />= <ResultValue>0 K/s (at equilibrium)</ResultValue>
              </ValuesLine>
            )}
            <ul className="mt-2 text-xs text-neutral-500 space-y-1">
              <li>m = mass (kg)</li>
              <li>c = specific heat capacity (J/(kg·K))</li>
            </ul>
          </section>

          {/* Time Constant */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Thermal Time Constant</h3>
            <p className="text-neutral-400 text-xs mb-2">
              Approximate time to reach 63% of equilibrium:
            </p>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              τ ≈ (m × c) / (h × A<sub>cool</sub>)
            </div>
            {showValues && (
              <ValuesLine>
                ≈ ({fmt(thermalInputs.mass)} kg × {fmt(thermalInputs.specificHeat)} J/(kg·K)) / (
                {fmt(thermalInputs.convectionCoeff)} W/(m²·K) × {fmt(coolingArea)} m²)
                <br />≈ <ResultValue>{fmt(timeConstant)} s</ResultValue>
              </ValuesLine>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
