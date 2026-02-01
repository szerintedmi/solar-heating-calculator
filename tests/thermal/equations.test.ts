import { describe, expect, it } from "vitest";
import { STEFAN_BOLTZMANN } from "@/lib/thermal/constants";
import {
  calculateAbsorbedPower,
  calculateConvectionLoss,
  calculateCoolingArea,
  calculateNDAttenuation,
  calculateRadiationLoss,
  luxToIrradiance,
  luxWithNDToIrradiance,
} from "@/lib/thermal/equations";

describe("calculateCoolingArea", () => {
  it("calculates cooling area for a square plate", () => {
    // 10cm × 10cm plate, 1cm thick
    // A = 0.01 m², d = 0.01 m
    // √A = 0.1 m
    // A_cool = 2×0.01 + 4×0.1×0.01 = 0.02 + 0.004 = 0.024 m²
    const area = calculateCoolingArea(0.01, 0.01);
    expect(area).toBeCloseTo(0.024, 6);
  });

  it("calculates cooling area for a thin sheet", () => {
    // 1m × 1m plate, 1mm thick
    // A = 1 m², d = 0.001 m
    // A_cool = 2×1 + 4×1×0.001 = 2 + 0.004 = 2.004 m²
    const area = calculateCoolingArea(1, 0.001);
    expect(area).toBeCloseTo(2.004, 6);
  });

  it("returns just 2A for zero thickness", () => {
    const area = calculateCoolingArea(0.01, 0);
    expect(area).toBeCloseTo(0.02, 6);
  });
});

describe("calculateAbsorbedPower", () => {
  it("calculates absorbed power correctly", () => {
    // 1000 W/m² × 0.01 m² × 0.9 = 9 W
    const power = calculateAbsorbedPower(1000, 0.01, 0.9);
    expect(power).toBeCloseTo(9, 6);
  });

  it("returns 0 for zero irradiance", () => {
    const power = calculateAbsorbedPower(0, 0.01, 0.9);
    expect(power).toBe(0);
  });

  it("returns 0 for zero absorptivity", () => {
    const power = calculateAbsorbedPower(1000, 0.01, 0);
    expect(power).toBe(0);
  });

  it("handles typical solar irradiance", () => {
    // Full sun (~1000 W/m²) on a dark surface (α=0.85)
    // Area = 0.1 m² (about A4 paper size)
    const power = calculateAbsorbedPower(1000, 0.1, 0.85);
    expect(power).toBeCloseTo(85, 6);
  });
});

describe("calculateConvectionLoss", () => {
  it("calculates convection loss correctly", () => {
    // h = 10 W/(m²·K), A = 0.024 m², ΔT = 50 K
    // P_conv = 10 × 0.024 × 50 = 12 W
    const loss = calculateConvectionLoss(10, 0.024, 323.15, 273.15);
    expect(loss).toBeCloseTo(12, 6);
  });

  it("returns 0 when temperature equals ambient", () => {
    const loss = calculateConvectionLoss(10, 0.024, 293.15, 293.15);
    expect(loss).toBe(0);
  });

  it("returns negative for cooling scenario", () => {
    // Object colder than ambient
    const loss = calculateConvectionLoss(10, 0.024, 273.15, 293.15);
    expect(loss).toBeLessThan(0);
  });
});

describe("calculateRadiationLoss", () => {
  it("calculates radiation loss correctly", () => {
    // ε = 0.9, A = 0.024 m², T = 373.15 K (100°C), T_amb = 293.15 K (20°C)
    // P_rad = 0.9 × 5.67e-8 × 0.024 × (373.15⁴ - 293.15⁴)
    const expected = 0.9 * STEFAN_BOLTZMANN * 0.024 * (373.15 ** 4 - 293.15 ** 4);
    const loss = calculateRadiationLoss(0.9, 0.024, 373.15, 293.15);
    expect(loss).toBeCloseTo(expected, 6);
  });

  it("returns 0 when temperature equals ambient", () => {
    const loss = calculateRadiationLoss(0.9, 0.024, 293.15, 293.15);
    expect(loss).toBeCloseTo(0, 6);
  });

  it("scales with T⁴", () => {
    const T_amb = 293.15;
    // Double the temperature difference
    const loss1 = calculateRadiationLoss(0.9, 0.024, T_amb + 50, T_amb);
    const loss2 = calculateRadiationLoss(0.9, 0.024, T_amb + 100, T_amb);
    // Radiation loss should increase much more than linearly
    expect(loss2 / loss1).toBeGreaterThan(2);
  });
});

describe("luxToIrradiance", () => {
  it("converts lux to irradiance correctly", () => {
    // 100,000 lux / 100 (lux per W/m²) = 1000 W/m²
    const irradiance = luxToIrradiance(100000, 100);
    expect(irradiance).toBeCloseTo(1000, 6);
  });

  it("handles indoor lighting scenario", () => {
    // 500 lux / 60 (indoor K) ≈ 8.33 W/m²
    const irradiance = luxToIrradiance(500, 60);
    expect(irradiance).toBeCloseTo(8.333, 2);
  });

  it("returns 0 for zero K factor", () => {
    const irradiance = luxToIrradiance(1000, 0);
    expect(irradiance).toBe(0);
  });
});

describe("calculateNDAttenuation", () => {
  it("returns 1 for empty array", () => {
    const attenuation = calculateNDAttenuation([]);
    expect(attenuation).toBe(1);
  });

  it("returns single ND value", () => {
    const attenuation = calculateNDAttenuation([64]);
    expect(attenuation).toBe(64);
  });

  it("multiplies multiple ND filters", () => {
    // ND64 × ND4 = 256
    const attenuation = calculateNDAttenuation([64, 4]);
    expect(attenuation).toBe(256);
  });

  it("handles three filters", () => {
    // ND8 × ND4 × ND2 = 64
    const attenuation = calculateNDAttenuation([8, 4, 2]);
    expect(attenuation).toBe(64);
  });
});

describe("luxWithNDToIrradiance", () => {
  it("calculates irradiance with ND filter compensation", () => {
    // Measured: 1000 lux behind ND64
    // Actual: 1000 × 64 = 64,000 lux
    // Irradiance: 64,000 / 100 = 640 W/m²
    const irradiance = luxWithNDToIrradiance(1000, [64], 100);
    expect(irradiance).toBeCloseTo(640, 6);
  });

  it("handles stacked ND filters", () => {
    // Measured: 100 lux behind ND64 + ND4 (total ND256)
    // Actual: 100 × 256 = 25,600 lux
    // Irradiance: 25,600 / 100 = 256 W/m²
    const irradiance = luxWithNDToIrradiance(100, [64, 4], 100);
    expect(irradiance).toBeCloseTo(256, 6);
  });

  it("works with no ND filters", () => {
    const irradiance = luxWithNDToIrradiance(10000, [], 100);
    expect(irradiance).toBeCloseTo(100, 6);
  });
});
