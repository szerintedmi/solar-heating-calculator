import { useState } from "react";

export function Formulas() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
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
          </section>

          {/* Absorbed Power */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Absorbed Power</h3>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              P<sub>abs</sub> = E × A × α
            </div>
            <ul className="mt-2 text-xs text-neutral-500 space-y-1">
              <li>E = irradiance (W/m²)</li>
              <li>A = illuminated area (m²)</li>
              <li>α = absorptivity (0–1)</li>
            </ul>
          </section>

          {/* Heat Loss */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Total Heat Loss</h3>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              P<sub>loss</sub> = P<sub>conv</sub> + P<sub>rad</sub>
            </div>
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
            <ul className="mt-2 text-xs text-neutral-500 space-y-1">
              <li>ε = emissivity (0–1)</li>
              <li>σ = Stefan-Boltzmann constant = 5.67 × 10⁻⁸ W/(m²·K⁴)</li>
            </ul>
          </section>

          {/* Cooling Area */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Cooling Area (Cuboid)</h3>
            <p className="text-neutral-400 text-xs mb-2">For a cuboid with square cross-section:</p>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              A<sub>cool</sub> = 2A + 4√A × d
            </div>
            <ul className="mt-2 text-xs text-neutral-500 space-y-1">
              <li>A = illuminated face area (m²)</li>
              <li>d = thickness (m)</li>
            </ul>
          </section>

          {/* Transient */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Temperature Evolution</h3>
            <p className="text-neutral-400 text-xs mb-2">Rate of temperature change:</p>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              dT/dt = (P<sub>abs</sub> − P<sub>loss</sub>) / (m × c)
            </div>
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
          </section>

          {/* Lux Conversion */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">Lux to Irradiance</h3>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              E = L / K
            </div>
            <ul className="mt-2 text-xs text-neutral-500 space-y-1">
              <li>L = illuminance (lux)</li>
              <li>K = luminous efficacy factor (lux per W/m²)</li>
            </ul>
          </section>

          {/* ND Filter */}
          <section>
            <h3 className="text-neutral-200 font-medium mb-2">ND Filter Attenuation</h3>
            <div className="font-mono text-neutral-300 bg-neutral-800 px-3 py-2 rounded">
              L<sub>actual</sub> = L<sub>measured</sub> × N<sub>1</sub> × N<sub>2</sub> × ...
            </div>
            <p className="mt-2 text-xs text-neutral-500">
              Where N is the filter factor (e.g., ND8 → N = 8)
            </p>
          </section>
        </div>
      )}
    </div>
  );
}
