import {
  defaultAbsorptivity,
  defaultConvection,
  defaultEmissivity,
  defaultIncidenceAngle,
  defaultIrradiance,
  defaultKFactor,
  defaultReflectance,
  defaultSpecificHeat,
} from "@/lib/presets";
import { defaultArea, defaultMass, defaultThickness } from "@/lib/presets/geometry";
import {
  CELSIUS_TO_KELVIN,
  type CalculationResult,
  type LightInput,
  type ReflectionInput,
  type SpotGeometry,
  type ThermalInputs,
  calculateEffectiveIlluminatedArea,
  calculateEquilibrium,
  calculateSpotGeometry,
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
    irradiance: defaultIrradiance,
    lux: 100000,
    kFactor: defaultKFactor,
    ndFilters: [],
    reflection: {
      enabled: false,
      reflectance: defaultReflectance,
      numReflectors: 1,
    },
    incidenceAngleDeg: defaultIncidenceAngle,
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

  // Compute spot geometry when mirror parameters are provided
  const spotGeometry = useMemo<SpotGeometry | null>(() => {
    if (
      light.reflection.enabled &&
      light.reflection.mirrorSizeMm !== undefined &&
      light.reflection.distanceM !== undefined
    ) {
      return calculateSpotGeometry(light.reflection.mirrorSizeMm, light.reflection.distanceM);
    }
    return null;
  }, [light.reflection]);

  // Compute incidence angle multiplier: cos(φ)
  // When light hits at an angle, effective collecting area shrinks
  const incidenceMultiplier = useMemo(() => {
    const angleRad = (light.incidenceAngleDeg * Math.PI) / 180;
    return Math.cos(angleRad);
  }, [light.incidenceAngleDeg]);

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

    // Apply reflection if enabled
    if (light.reflection.enabled) {
      const reflectanceDecimal = light.reflection.reflectance / 100;
      let irradiance = baseIrradiance * reflectanceDecimal * light.reflection.numReflectors;

      // Apply concentration factor from spot geometry (accounts for sun's angular spread)
      // As distance increases, the spot spreads and irradiance at target decreases
      if (spotGeometry) {
        irradiance *= spotGeometry.concentrationFactor;
      }

      // Apply incidence angle multiplier
      return irradiance * incidenceMultiplier;
    }

    // Apply incidence angle multiplier to direct light
    return baseIrradiance * incidenceMultiplier;
  }, [light, spotGeometry, incidenceMultiplier]);

  // Convert user-friendly units to SI units
  const thermalInputs = useMemo<ThermalInputs>(() => {
    const objectAreaM2 = state.areaCm2 / 10000; // cm² to m²

    // When reflection with mirror geometry is enabled, illuminated area may be limited by spot size
    // But the full object area is always used for cooling calculations
    const illuminatedAreaM2 =
      light.reflection.enabled && spotGeometry
        ? calculateEffectiveIlluminatedArea(objectAreaM2, spotGeometry)
        : objectAreaM2;

    return {
      irradiance: computedIrradiance,
      area: objectAreaM2, // Full object area for cooling
      illuminatedArea: illuminatedAreaM2, // May be smaller if spot < object
      thickness: state.thicknessMm / 1000, // mm to m
      mass: state.massGrams / 1000, // g to kg
      absorptivity: state.absorptivity,
      emissivity: state.emissivity,
      convectionCoeff: state.convectionCoeff,
      specificHeat: state.specificHeat,
      ambientTemp: state.ambientTempCelsius + CELSIUS_TO_KELVIN,
    };
  }, [state, computedIrradiance, light.reflection.enabled, spotGeometry]);

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

  const setReflection = (reflection: ReflectionInput) => {
    setState((prev) => ({
      ...prev,
      light: { ...prev.light, reflection },
    }));
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
    incidenceMultiplier,
    thermalInputs,
    results,
    spotGeometry,

    // Setters
    setLightInput,
    setReflection,
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
