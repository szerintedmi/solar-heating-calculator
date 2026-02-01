import { describe, expect, it } from "vitest";
import { SUN_HALF_ANGLE_RAD } from "@/lib/thermal/constants";
import {
  calculateAbsorbedPower,
  calculateCoolingArea,
  calculateEffectiveIlluminatedArea,
  calculateSpotGeometry,
  getIlluminatedArea,
} from "@/lib/thermal/equations";
import type { ThermalInputs } from "@/lib/thermal/types";

describe("SUN_HALF_ANGLE_RAD", () => {
  it("is approximately 4.65 milliradians", () => {
    expect(SUN_HALF_ANGLE_RAD).toBeCloseTo(4.65e-3, 5);
  });

  it("equals approximately 0.267 degrees", () => {
    const degrees = SUN_HALF_ANGLE_RAD * (180 / Math.PI);
    expect(degrees).toBeCloseTo(0.267, 2);
  });
});

describe("calculateSpotGeometry", () => {
  it("returns mirror size at zero distance", () => {
    // At zero distance, spot = mirror
    const result = calculateSpotGeometry(100, 0);
    expect(result.sideLength).toBeCloseTo(0.1, 6); // 100mm = 0.1m
    expect(result.area).toBeCloseTo(0.01, 6); // 0.1² = 0.01 m²
    expect(result.concentrationFactor).toBeCloseTo(1, 6);
  });

  it("calculates spot size for 50mm mirror at 2m distance", () => {
    // s_spot = 50 + 2×2000×tan(0.00465) = 50 + 18.6 = 68.6mm
    const result = calculateSpotGeometry(50, 2);
    expect(result.sideLength * 1000).toBeCloseTo(68.6, 0);
    // Concentration = (50/68.6)² ≈ 0.531
    expect(result.concentrationFactor).toBeCloseTo(0.531, 2);
  });

  it("calculates spot size for 100mm mirror at 1m distance", () => {
    // s_spot = 100 + 2×1000×tan(0.00465) = 100 + 9.3 = 109.3mm
    const result = calculateSpotGeometry(100, 1);
    expect(result.sideLength * 1000).toBeCloseTo(109.3, 0);
    // Concentration = (100/109.3)² ≈ 0.838
    expect(result.concentrationFactor).toBeCloseTo(0.838, 2);
  });

  it("calculates spot size for 100mm mirror at 5m distance", () => {
    // s_spot = 100 + 2×5000×tan(0.00465) = 100 + 46.5 = 146.5mm
    const result = calculateSpotGeometry(100, 5);
    expect(result.sideLength * 1000).toBeCloseTo(146.5, 0);
    // Concentration = (100/146.5)² ≈ 0.466
    expect(result.concentrationFactor).toBeCloseTo(0.466, 2);
  });

  it("calculates spot size for 100mm mirror at 10m distance", () => {
    // s_spot = 100 + 2×10000×tan(0.00465) = 100 + 93 = 193mm
    const result = calculateSpotGeometry(100, 10);
    expect(result.sideLength * 1000).toBeCloseTo(193, 0);
    // Concentration = (100/193)² ≈ 0.269
    expect(result.concentrationFactor).toBeCloseTo(0.269, 2);
  });

  it("concentration factor decreases with distance", () => {
    const near = calculateSpotGeometry(100, 1);
    const far = calculateSpotGeometry(100, 10);
    expect(far.concentrationFactor).toBeLessThan(near.concentrationFactor);
  });

  it("spot area is always >= mirror area", () => {
    const result = calculateSpotGeometry(100, 5);
    const mirrorAreaM2 = (100 / 1000) ** 2;
    expect(result.area).toBeGreaterThanOrEqual(mirrorAreaM2);
  });

  it("concentration factor is always <= 1", () => {
    // Test various distances
    for (const distance of [0, 0.1, 1, 5, 10, 20]) {
      const result = calculateSpotGeometry(100, distance);
      expect(result.concentrationFactor).toBeLessThanOrEqual(1);
    }
  });
});

describe("calculateEffectiveIlluminatedArea", () => {
  it("returns object area when no spot geometry", () => {
    const area = calculateEffectiveIlluminatedArea(0.01, undefined);
    expect(area).toBe(0.01);
  });

  it("returns object area when object is smaller than spot", () => {
    const spotGeometry = { sideLength: 0.1, area: 0.01, concentrationFactor: 0.5 };
    const area = calculateEffectiveIlluminatedArea(0.005, spotGeometry);
    expect(area).toBe(0.005);
  });

  it("returns spot area when object is larger than spot", () => {
    const spotGeometry = { sideLength: 0.1, area: 0.01, concentrationFactor: 0.5 };
    const area = calculateEffectiveIlluminatedArea(0.02, spotGeometry);
    expect(area).toBe(0.01);
  });

  it("returns same value when object equals spot", () => {
    const spotGeometry = { sideLength: 0.1, area: 0.01, concentrationFactor: 0.5 };
    const area = calculateEffectiveIlluminatedArea(0.01, spotGeometry);
    expect(area).toBe(0.01);
  });
});

describe("absorbed power with reflection (integration)", () => {
  // This tests the expected calculation pattern used in useCalculator:
  // E_target = E_source × reflectance × concentrationFactor
  // A_eff = min(objectArea, spotArea)
  // P_abs = E_target × A_eff × absorptivity

  const computeAbsorbedPower = (
    sourceIrradiance: number,
    reflectance: number,
    mirrorSizeMm: number,
    distanceM: number,
    objectAreaM2: number,
    absorptivity: number,
  ) => {
    const spot = calculateSpotGeometry(mirrorSizeMm, distanceM);
    const effectiveIrradiance = sourceIrradiance * reflectance * spot.concentrationFactor;
    const effectiveArea = calculateEffectiveIlluminatedArea(objectAreaM2, spot);
    return calculateAbsorbedPower(effectiveIrradiance, effectiveArea, absorptivity);
  };

  it("absorbed power decreases with distance when object < spot", () => {
    // 100mm mirror, small object (1cm² = 0.0001 m²)
    const nearPower = computeAbsorbedPower(1000, 0.9, 100, 1, 0.0001, 0.9);
    const farPower = computeAbsorbedPower(1000, 0.9, 100, 10, 0.0001, 0.9);

    // At 1m: spot ≈ 109mm, concentration ≈ 0.838
    // At 10m: spot ≈ 193mm, concentration ≈ 0.269
    // Since object is smaller than spot at both distances, power should decrease
    expect(farPower).toBeLessThan(nearPower);
    expect(farPower / nearPower).toBeCloseTo(0.269 / 0.838, 1);
  });

  it("absorbed power is constant when object > spot at all distances", () => {
    // 50mm mirror, large object (1m² = 1 m²), so object always > spot
    const nearPower = computeAbsorbedPower(1000, 0.9, 50, 1, 1, 0.9);
    const farPower = computeAbsorbedPower(1000, 0.9, 50, 10, 1, 0.9);

    // When object is larger than spot, all reflected power is captured
    // P_abs = E × R × mirrorArea × α (independent of distance)
    const mirrorAreaM2 = (50 / 1000) ** 2;
    const expectedPower = 1000 * 0.9 * mirrorAreaM2 * 0.9;

    expect(nearPower).toBeCloseTo(expectedPower, 4);
    expect(farPower).toBeCloseTo(expectedPower, 4);
    expect(nearPower).toBeCloseTo(farPower, 4);
  });

  it("absorbed power equals theoretical maximum when spot fits on object", () => {
    // 100mm mirror, 1m² object, at 1m distance
    // Spot ≈ 109mm × 109mm ≈ 0.012 m² (fits inside object)
    const power = computeAbsorbedPower(1000, 0.9, 100, 1, 1, 0.9);

    // All reflected power is captured: E × R × mirrorArea × α
    const mirrorAreaM2 = (100 / 1000) ** 2;
    const expectedPower = 1000 * 0.9 * mirrorAreaM2 * 0.9;

    expect(power).toBeCloseTo(expectedPower, 4);
  });
});

describe("getIlluminatedArea", () => {
  const baseInputs: ThermalInputs = {
    irradiance: 1000,
    area: 0.01,
    thickness: 0.01,
    mass: 0.1,
    absorptivity: 0.9,
    emissivity: 0.9,
    convectionCoeff: 10,
    specificHeat: 500,
    ambientTemp: 293.15,
  };

  it("returns area when illuminatedArea is not set", () => {
    expect(getIlluminatedArea(baseInputs)).toBe(0.01);
  });

  it("returns illuminatedArea when set", () => {
    const inputs = { ...baseInputs, illuminatedArea: 0.005 };
    expect(getIlluminatedArea(inputs)).toBe(0.005);
  });

  it("illuminatedArea does not affect cooling area calculation", () => {
    // Cooling area should always be based on full object area
    const coolingWithoutIlluminated = calculateCoolingArea(baseInputs.area, baseInputs.thickness);
    const inputsWithIlluminated = { ...baseInputs, illuminatedArea: 0.001 };
    const coolingWithIlluminated = calculateCoolingArea(
      inputsWithIlluminated.area,
      inputsWithIlluminated.thickness,
    );

    // Both should be the same since cooling uses 'area', not 'illuminatedArea'
    expect(coolingWithIlluminated).toBe(coolingWithoutIlluminated);
  });
});
