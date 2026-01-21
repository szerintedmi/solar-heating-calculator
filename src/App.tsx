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
          </div>
        </div>

        {/* Explanations */}
        <div className="mt-8 max-w-3xl">
          <CalculationExplainer />
          <Assumptions />
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-neutral-800 text-center text-xs text-neutral-500">
          <p>
            Solar Heating Calculator — An educational tool for understanding thermal equilibrium.
          </p>
          <p className="mt-1">Results are estimates. Not for safety-critical applications.</p>
        </footer>
      </div>
    </div>
  );
}
