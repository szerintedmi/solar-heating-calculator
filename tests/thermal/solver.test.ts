import { describe, expect, it } from "vitest";
import { CELSIUS_TO_KELVIN } from "@/lib/thermal/constants";
import {
  calculateEquilibrium,
  simulateTransient,
  solveEquilibriumTemperature,
} from "@/lib/thermal/solver";
import type { ThermalInputs } from "@/lib/thermal/types";

function createDefaultInputs(overrides: Partial<ThermalInputs> = {}): ThermalInputs {
  return {
    irradiance: 1000, // W/m² (full sun)
    area: 0.01, // m² (10cm × 10cm)
    thickness: 0.01, // m (1cm)
    mass: 0.1, // kg
    absorptivity: 0.85, // dark surface
    emissivity: 0.85, // typical painted surface
    convectionCoeff: 10, // W/(m²·K) - light air movement
    specificHeat: 500, // J/(kg·K) - metal
    ambientTemp: 20 + CELSIUS_TO_KELVIN, // 20°C in Kelvin
    ...overrides,
  };
}

describe("solveEquilibriumTemperature", () => {
  it("returns ambient temperature when no light input", () => {
    const inputs = createDefaultInputs({ irradiance: 0 });
    const temp = solveEquilibriumTemperature(inputs);
    expect(temp).toBe(inputs.ambientTemp);
  });

  it("finds equilibrium above ambient with light input", () => {
    const inputs = createDefaultInputs();
    const temp = solveEquilibriumTemperature(inputs);
    expect(temp).toBeGreaterThan(inputs.ambientTemp);
  });

  it("higher irradiance leads to higher equilibrium temperature", () => {
    const inputs1 = createDefaultInputs({ irradiance: 500 });
    const inputs2 = createDefaultInputs({ irradiance: 1000 });
    const temp1 = solveEquilibriumTemperature(inputs1);
    const temp2 = solveEquilibriumTemperature(inputs2);
    expect(temp2).toBeGreaterThan(temp1);
  });

  it("higher absorptivity leads to higher equilibrium temperature", () => {
    const inputs1 = createDefaultInputs({ absorptivity: 0.3 });
    const inputs2 = createDefaultInputs({ absorptivity: 0.9 });
    const temp1 = solveEquilibriumTemperature(inputs1);
    const temp2 = solveEquilibriumTemperature(inputs2);
    expect(temp2).toBeGreaterThan(temp1);
  });

  it("higher convection coefficient leads to lower equilibrium temperature", () => {
    const inputs1 = createDefaultInputs({ convectionCoeff: 5 }); // still air
    const inputs2 = createDefaultInputs({ convectionCoeff: 30 }); // windy
    const temp1 = solveEquilibriumTemperature(inputs1);
    const temp2 = solveEquilibriumTemperature(inputs2);
    expect(temp2).toBeLessThan(temp1);
  });

  it("higher emissivity leads to lower equilibrium temperature", () => {
    const inputs1 = createDefaultInputs({ emissivity: 0.1 }); // polished metal
    const inputs2 = createDefaultInputs({ emissivity: 0.9 }); // matte black
    const temp1 = solveEquilibriumTemperature(inputs1);
    const temp2 = solveEquilibriumTemperature(inputs2);
    expect(temp2).toBeLessThan(temp1);
  });
});

describe("calculateEquilibrium", () => {
  it("returns complete equilibrium results", () => {
    const inputs = createDefaultInputs();
    const result = calculateEquilibrium(inputs);

    expect(result.temperature).toBeGreaterThan(inputs.ambientTemp);
    expect(result.absorbedPower).toBeGreaterThan(0);
    expect(result.convectionLoss).toBeGreaterThan(0);
    expect(result.radiationLoss).toBeGreaterThan(0);
    expect(result.totalLoss).toBeCloseTo(result.convectionLoss + result.radiationLoss, 6);
  });

  it("has absorbed power equal to total loss at equilibrium", () => {
    const inputs = createDefaultInputs();
    const result = calculateEquilibrium(inputs);
    // At equilibrium, P_abs = P_loss (within solver tolerance)
    expect(result.absorbedPower).toBeCloseTo(result.totalLoss, 2);
  });

  it("calculates absorbed power correctly", () => {
    const inputs = createDefaultInputs();
    const result = calculateEquilibrium(inputs);
    // P_abs = E × A × α = 1000 × 0.01 × 0.85 = 8.5 W
    expect(result.absorbedPower).toBeCloseTo(8.5, 6);
  });
});

describe("simulateTransient", () => {
  it("starts at ambient temperature", () => {
    const inputs = createDefaultInputs();
    const equilibriumTemp = solveEquilibriumTemperature(inputs);
    const result = simulateTransient(inputs, equilibriumTemp);

    expect(result.timeSeries[0].time).toBe(0);
    expect(result.timeSeries[0].temperature).toBe(inputs.ambientTemp);
  });

  it("approaches equilibrium temperature", () => {
    const inputs = createDefaultInputs();
    const equilibriumTemp = solveEquilibriumTemperature(inputs);
    const result = simulateTransient(inputs, equilibriumTemp);

    const lastPoint = result.timeSeries[result.timeSeries.length - 1];
    // Should be close to equilibrium (within 5%)
    expect(lastPoint.temperature).toBeCloseTo(equilibriumTemp, 0);
  });

  it("returns milestone times in correct order", () => {
    const inputs = createDefaultInputs();
    const equilibriumTemp = solveEquilibriumTemperature(inputs);
    const result = simulateTransient(inputs, equilibriumTemp);

    expect(result.time50).toBeLessThanOrEqual(result.time90);
    expect(result.time90).toBeLessThanOrEqual(result.time95);
  });

  it("higher mass leads to longer heating time", () => {
    const inputs1 = createDefaultInputs({ mass: 0.05 });
    const inputs2 = createDefaultInputs({ mass: 0.2 });
    const eq1 = solveEquilibriumTemperature(inputs1);
    const eq2 = solveEquilibriumTemperature(inputs2);
    const result1 = simulateTransient(inputs1, eq1);
    const result2 = simulateTransient(inputs2, eq2);

    expect(result2.time90).toBeGreaterThan(result1.time90);
  });

  it("higher specific heat leads to longer heating time", () => {
    const inputs1 = createDefaultInputs({ specificHeat: 500 }); // metal
    const inputs2 = createDefaultInputs({ specificHeat: 2000 }); // plastic
    const eq1 = solveEquilibriumTemperature(inputs1);
    const eq2 = solveEquilibriumTemperature(inputs2);
    const result1 = simulateTransient(inputs1, eq1);
    const result2 = simulateTransient(inputs2, eq2);

    expect(result2.time90).toBeGreaterThan(result1.time90);
  });

  it("handles zero thermal capacity gracefully", () => {
    const inputs = createDefaultInputs({ mass: 0 });
    const equilibriumTemp = solveEquilibriumTemperature(inputs);
    const result = simulateTransient(inputs, equilibriumTemp);

    expect(result.timeSeries.length).toBeGreaterThan(0);
    expect(result.time50).toBe(0);
    expect(result.time90).toBe(0);
    expect(result.time95).toBe(0);
  });

  it("produces reasonable time series length", () => {
    const inputs = createDefaultInputs();
    const equilibriumTemp = solveEquilibriumTemperature(inputs);
    const result = simulateTransient(inputs, equilibriumTemp);

    // Should be downsampled to ~200 points or fewer
    expect(result.timeSeries.length).toBeLessThanOrEqual(201);
    expect(result.timeSeries.length).toBeGreaterThan(1);
  });
});
