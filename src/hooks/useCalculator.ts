import {
  defaultAbsorptivity,
  defaultConvection,
  defaultEmissivity,
  defaultKFactor,
  defaultReflectance,
  defaultSpecificHeat,
} from "@/lib/presets";
import { defaultArea, defaultMass, defaultThickness } from "@/lib/presets/geometry";
import {
  CELSIUS_TO_KELVIN,
  type CalculationResult,
  type LightInput,
  type ThermalInputs,
  calculateEquilibrium,
  luxToIrradiance,
  luxWithNDToIrradiance,
  simulateTransient,
} from "@/lib/thermal";
import { useMemo, useState } from "react";

interface CalculatorState {
  light: LightInput;
  absorptivity: number;
  emissivity: number;
  convectionCoeff: number;
  ambientTempCelsius: number;
  areaCm2: number;
  thicknessMm: number;
  massGrams: number;
  specificHeat: number;
}

const initialState: CalculatorState = {
  light: {
    mode: "direct",
    irradiance: 1000,
    lux: 100000,
    kFactor: defaultKFactor,
    ndFilters: [],
    reflection: {
      enabled: false,
      reflectance: defaultReflectance,
      numReflectors: 1,
    },
  },
  absorptivity: defaultAbsorptivity,
  emissivity: defaultEmissivity,
  convectionCoeff: defaultConvection,
  ambientTempCelsius: 20,
  areaCm2: defaultArea * 10000, // Convert from m² to cm²
  thicknessMm: defaultThickness * 1000, // Convert from m to mm
  massGrams: defaultMass * 1000, // Convert from kg to g
  specificHeat: defaultSpecificHeat,
};

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(initialState);

  // Extract light for cleaner dependency tracking
  const { light } = state;

  // Compute effective irradiance based on light input mode
  const computedIrradiance = useMemo(() => {
    // Get base irradiance from mode
    let baseIrradiance: number;
    switch (light.mode) {
      case "direct":
        baseIrradiance = light.irradiance;
        break;
      case "lux":
        baseIrradiance = luxToIrradiance(light.lux, light.kFactor);
        break;
      case "lux-nd":
        baseIrradiance = luxWithNDToIrradiance(light.lux, light.ndFilters, light.kFactor);
        break;
      default:
        baseIrradiance = light.irradiance;
    }

    // Apply reflection multiplier if enabled
    if (light.reflection.enabled) {
      const reflectanceDecimal = light.reflection.reflectance / 100;
      return baseIrradiance * reflectanceDecimal * light.reflection.numReflectors;
    }

    return baseIrradiance;
  }, [light]);

  // Convert user-friendly units to SI units
  const thermalInputs = useMemo<ThermalInputs>(() => {
    return {
      irradiance: computedIrradiance,
      area: state.areaCm2 / 10000, // cm² to m²
      thickness: state.thicknessMm / 1000, // mm to m
      mass: state.massGrams / 1000, // g to kg
      absorptivity: state.absorptivity,
      emissivity: state.emissivity,
      convectionCoeff: state.convectionCoeff,
      specificHeat: state.specificHeat,
      ambientTemp: state.ambientTempCelsius + CELSIUS_TO_KELVIN,
    };
  }, [state, computedIrradiance]);

  // Run calculations
  const results = useMemo<CalculationResult>(() => {
    const equilibrium = calculateEquilibrium(thermalInputs);
    const transient = simulateTransient(thermalInputs, equilibrium.temperature);
    return { equilibrium, transient };
  }, [thermalInputs]);

  // Update functions
  const setLightInput = (updates: Partial<LightInput>) => {
    setState((prev) => ({
      ...prev,
      light: { ...prev.light, ...updates },
    }));
  };

  const setAbsorptivity = (absorptivity: number) => {
    setState((prev) => ({ ...prev, absorptivity }));
  };

  const setEmissivity = (emissivity: number) => {
    setState((prev) => ({ ...prev, emissivity }));
  };

  const setConvectionCoeff = (convectionCoeff: number) => {
    setState((prev) => ({ ...prev, convectionCoeff }));
  };

  const setAmbientTempCelsius = (ambientTempCelsius: number) => {
    setState((prev) => ({ ...prev, ambientTempCelsius }));
  };

  const setAreaCm2 = (areaCm2: number) => {
    setState((prev) => ({ ...prev, areaCm2 }));
  };

  const setThicknessMm = (thicknessMm: number) => {
    setState((prev) => ({ ...prev, thicknessMm }));
  };

  const setMassGrams = (massGrams: number) => {
    setState((prev) => ({ ...prev, massGrams }));
  };

  const setSpecificHeat = (specificHeat: number) => {
    setState((prev) => ({ ...prev, specificHeat }));
  };

  return {
    // State
    light: state.light,
    absorptivity: state.absorptivity,
    emissivity: state.emissivity,
    convectionCoeff: state.convectionCoeff,
    ambientTempCelsius: state.ambientTempCelsius,
    areaCm2: state.areaCm2,
    thicknessMm: state.thicknessMm,
    massGrams: state.massGrams,
    specificHeat: state.specificHeat,

    // Computed
    computedIrradiance,
    thermalInputs,
    results,

    // Setters
    setLightInput,
    setAbsorptivity,
    setEmissivity,
    setConvectionCoeff,
    setAmbientTempCelsius,
    setAreaCm2,
    setThicknessMm,
    setMassGrams,
    setSpecificHeat,
  };
}
