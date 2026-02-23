import {
  EnvironmentInput,
  GeometryInput,
  LightInput,
  ReflectionInput,
  SurfaceInput,
} from "@/components/inputs";
import { Assumptions, CalculationExplainer, Formulas, Header } from "@/components/layout";
import { ResultsDisplay, SensitivityAnalysis, TemperatureChart } from "@/components/outputs";
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
              computedIrradiance={calc.displayIrradiance}
              incidenceMultiplier={calc.incidenceMultiplier}
              onChange={calc.setLightInput}
            />

            <ReflectionInput
              reflection={calc.light.reflection}
              spotGeometry={calc.spotGeometry}
              onChange={calc.setReflection}
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
              spotGeometry={calc.spotGeometry}
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

            <SensitivityAnalysis
              thermalInputs={calc.thermalInputs}
              baseIrradiance={calc.computedIrradiance / calc.incidenceMultiplier}
              reflectionEnabled={calc.light.reflection.enabled}
              currentReflectance={calc.light.reflection.reflectance}
              currentIncidenceAngleDeg={calc.light.incidenceAngleDeg}
              currentAreaCm2={calc.areaCm2}
              currentThicknessMm={calc.thicknessMm}
              currentMassGrams={calc.massGrams}
              displayIrradiance={calc.displayIrradiance}
            />

            <CalculationExplainer />
            <Assumptions />
            <Formulas
              thermalInputs={calc.thermalInputs}
              results={calc.results}
              light={calc.light}
              spotGeometry={calc.spotGeometry}
              incidenceMultiplier={calc.incidenceMultiplier}
              displayIrradiance={calc.displayIrradiance}
            />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-neutral-800 flex flex-col items-center gap-4">
          <p className="text-xs text-neutral-500">
            An educational tool. Not for safety-critical applications.
          </p>
          <div className="flex items-center gap-4">
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
