import { useState } from "react";

export function CalculationExplainer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6">
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
        How this is calculated
      </button>

      {isOpen && (
        <div className="mt-4 p-5 bg-neutral-850 border border-neutral-800 rounded-xl space-y-4 text-sm text-neutral-300">
          <div>
            <h4 className="font-medium text-neutral-100 mb-2">1. Light In → Heat Absorbed</h4>
            <p className="text-neutral-400">
              When light hits the surface, a fraction is absorbed and converted to heat. This
              fraction is the absorptivity (α). Dark surfaces absorb more; shiny surfaces reflect
              more.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-neutral-100 mb-2">
              1b. Reflected Light (if using mirrors)
            </h4>
            <p className="text-neutral-400">
              A flat mirror reflects sunlight into a spot that grows larger with distance. The Sun
              isn't a point source — its ~0.5° angular width causes the reflected beam to spread.
              Close to the mirror, the spot is nearly mirror-sized. Farther away, the spot grows and
              the light intensity (irradiance) at the target decreases.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-neutral-100 mb-2">2. Heat Escapes to Air</h4>
            <p className="text-neutral-400">
              As the object warms up, it loses heat to the surrounding air. Moving air carries heat
              away faster. This is called convection.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-neutral-100 mb-2">3. Hot Objects Radiate Energy</h4>
            <p className="text-neutral-400">
              Everything emits thermal radiation. Hotter objects radiate much more energy (it grows
              with temperature to the fourth power). This is why radiation dominates at high
              temperatures.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-neutral-100 mb-2">
              4. Temperature Stops Rising When Heat In = Heat Out
            </h4>
            <p className="text-neutral-400">
              The object heats up until heat absorbed from light exactly balances heat lost through
              convection and radiation. This is the equilibrium (maximum) temperature.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-neutral-100 mb-2">5. The Time Curve</h4>
            <p className="text-neutral-400">
              The temperature vs time graph is calculated by simulating many small time steps. At
              each step, we compute how much heat is gained and lost, and update the temperature.
              The curve shows how the object gradually approaches equilibrium.
            </p>
          </div>

          <div className="p-3 bg-neutral-800 rounded-lg text-xs text-neutral-500">
            <p className="font-medium text-neutral-400 mb-1">Technical note:</p>
            <p>
              This uses a lumped thermal model with explicit Euler time integration. Equilibrium is
              found using bisection. These are standard engineering approximations suitable for
              estimation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
