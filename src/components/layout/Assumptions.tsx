import { useState } from "react";

export function Assumptions() {
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
        Assumptions & Limitations
      </button>

      {isOpen && (
        <div className="mt-4 p-5 bg-neutral-850 border border-neutral-800 rounded-xl text-sm">
          <ul className="space-y-3 text-neutral-400">
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Object suspended in air</strong> — No heat loss
                to a backing surface or mount; only convection and radiation are modeled.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Uniform temperature</strong> — The entire
                object is treated as one temperature (lumped model). Most valid for thin,
                high-conductivity objects; less accurate for thick/insulating materials or partial
                illumination (e.g., small reflected spots).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Cuboid geometry</strong> — The object is
                modeled as a box with square cross-section; cooling area is calculated from the full
                object face area and thickness (A<sub>cool</sub> = 2A + 4√A × d).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Ambient = radiative environment</strong> — The
                same temperature is used for air and radiative surroundings. May underestimate
                radiative loss outdoors where sky is colder than air.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Constant convection coefficient</strong> —
                Treated as constant; in reality it varies with geometry, orientation, and
                temperature difference.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Small-spot heating creates hot spots</strong> —
                If only part of the surface is illuminated (especially with mirrors), real objects
                develop temperature gradients; the model is best interpreted as an average
                temperature.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Incidence angle simplified</strong> — The
                cos(φ) model approximates geometric projection effects. It does not model spot
                stretching, reflectance angle dependence, or detailed optics at grazing angles
                (φ&gt;75°).
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Mirror optics simplified</strong> — Ignores
                mirror-angle cosine/projection loss (tilted mirrors intercept less power), aiming
                error, and incomplete spot overlap when using multiple mirrors. The incidence angle
                φ is a single approximation for geometry/alignment effects.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">No phase changes</strong> — No melting,
                burning, or chemical reactions modeled.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-neutral-500">•</span>
              <span>
                <strong className="text-neutral-300">Approximate lux ↔ W/m² conversion</strong> —
                The K factor is spectrum-dependent. Expect ±20–40% uncertainty.
              </span>
            </li>
          </ul>

          <div className="mt-4 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
            <p className="text-xs text-amber-200/80">
              <strong>Results are estimates, not guarantees.</strong> Use for understanding and
              intuition, not for safety-critical decisions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
