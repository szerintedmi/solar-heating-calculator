import { EnvironmentInput, GeometryInput, LightInput, SurfaceInput } from "@/components/inputs";
import { Assumptions, CalculationExplainer, Header } from "@/components/layout";
import { ResultsDisplay, TemperatureChart } from "@/components/outputs";
import { useCalculator } from "@/hooks/useCalculator";

export function App() {
  const calc = useCalculator();

  return (
    <div className="min-h-screen bg-neutral-925 text-neutral-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Header />

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input column */}
          <div className="space-y-6">
            <LightInput
              lightInput={calc.light}
              computedIrradiance={calc.computedIrradiance}
              onChange={calc.setLightInput}
            />

            <SurfaceInput
              absorptivity={calc.absorptivity}
              emissivity={calc.emissivity}
              onAbsorptivityChange={calc.setAbsorptivity}
              onEmissivityChange={calc.setEmissivity}
            />

            <EnvironmentInput
              convectionCoeff={calc.convectionCoeff}
              ambientTempCelsius={calc.ambientTempCelsius}
              onConvectionChange={calc.setConvectionCoeff}
              onAmbientTempChange={calc.setAmbientTempCelsius}
            />

            <GeometryInput
              areaCm2={calc.areaCm2}
              thicknessMm={calc.thicknessMm}
              massGrams={calc.massGrams}
              specificHeat={calc.specificHeat}
              onAreaChange={calc.setAreaCm2}
              onThicknessChange={calc.setThicknessMm}
              onMassChange={calc.setMassGrams}
              onSpecificHeatChange={calc.setSpecificHeat}
            />
          </div>

          {/* Output column */}
          <div className="space-y-6">
            <ResultsDisplay results={calc.results} />

            <TemperatureChart
              timeSeries={calc.results.transient.timeSeries}
              equilibriumTemp={calc.results.equilibrium.temperature}
              ambientTemp={calc.thermalInputs.ambientTemp}
            />

            <CalculationExplainer />
            <Assumptions />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-neutral-800 flex flex-col items-center gap-4">
          <p className="text-xs text-neutral-500">
            An educational tool. Not for safety-critical applications.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/szerintedmi/solar-heating-calculator"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label="View source on GitHub"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>GitHub</title>
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://creativecommons.org/licenses/by/4.0/legalcode.en"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-300 transition-colors"
              aria-label="CC BY 4.0 License"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>Creative Commons</title>
                <path d="M11.983 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 1.846c5.598 0 10.154 4.556 10.154 10.154s-4.556 10.154-10.154 10.154-10.154-4.556-10.154-10.154 4.556-10.154 10.154-10.154zm-3.877 5.077c-2.143 0-3.877 1.922-3.877 4.308s1.734 4.308 3.877 4.308c1.328 0 2.512-.701 3.182-1.803l-1.439-.924c-.377.606-.996.981-1.743.981-1.199 0-2.143-1.078-2.143-2.562s.944-2.562 2.143-2.562c.747 0 1.366.375 1.743.981l1.439-.924c-.67-1.102-1.854-1.803-3.182-1.803zm7.692 0c-2.143 0-3.877 1.922-3.877 4.308s1.734 4.308 3.877 4.308c1.328 0 2.512-.701 3.182-1.803l-1.439-.924c-.377.606-.996.981-1.743.981-1.199 0-2.143-1.078-2.143-2.562s.944-2.562 2.143-2.562c.747 0 1.366.375 1.743.981l1.439-.924c-.67-1.102-1.854-1.803-3.182-1.803z" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <title>Attribution</title>
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 1.846c5.598 0 10.154 4.556 10.154 10.154s-4.556 10.154-10.154 10.154-10.154-4.556-10.154-10.154 4.556-10.154 10.154-10.154zm0 3.077c-1.278 0-2.308 1.03-2.308 2.308s1.03 2.308 2.308 2.308 2.308-1.03 2.308-2.308-1.03-2.308-2.308-2.308zm-2.538 5.538v8.308h1.538v-5.538h2v5.538h1.538v-8.308z" />
              </svg>
              <span className="text-xs ml-1">CC BY 4.0</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
