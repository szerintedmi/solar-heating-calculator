# Preset Value Ranges — With Justification

This section defines default numeric values and ranges for all presets.
All values are order-of-magnitude correct, suitable for estimation and intuition.

---

## 1. Lux to W/m² Conversion (K Value)

**Definition:** K = lux per W/m² (daylight luminous efficacy)

**Key idea:** K depends mainly on solar elevation + atmosphere, even under clear sky.

### Presets

| Preset Label | K Value (lux/W·m⁻²) | Typical Range | Justification |
|--------------|---------------------|---------------|---------------|
| Clear sky, high sun (summer noon) | 115 | 105–125 | Short air mass, spectrum close to AM1–AM1.5; high visible fraction |
| Clear sky, mid sun (spring/autumn noon) | 100 | 90–110 | Moderate air mass; common "rule of thumb" |
| Clear sky, low sun (London January noon) | 90 | 80–100 | Long air path removes more blue; lower visible efficacy |
| Bright overcast daylight | 105 | 95–120 | Diffuse sky still rich in visible wavelengths |
| Indoor artificial lighting | 60 | 40–80 | LEDs/fluorescents optimized for vision, not radiant power |

**UX note:** Display as:

> "K is an approximation. Real values vary ±20–40% depending on sky and sun height."

---

## 2. Surface Absorptivity (α)

**Definition:** Fraction of incoming light converted to heat at the surface.

**Key idea:** This is mostly about color and finish, not bulk material.

### Presets

| Preset Label | α (absorptivity) | Typical Range | Justification |
|--------------|------------------|---------------|---------------|
| Matte black surface | 0.95 | 0.90–0.98 | Near-ideal absorber; soot, matte paint, carbon |
| Dark surface | 0.85 | 0.75–0.90 | Dark plastics, dark paints |
| Medium colored surface | 0.65 | 0.50–0.75 | Red, green, blue paints |
| Light surface | 0.40 | 0.25–0.55 | White, beige, light grey |
| Shiny / reflective | 0.15 | 0.05–0.30 | Polished metals, mirrors |

**Justification text for users:**

> "Absorptivity controls how much light turns into heat. Dark, matte surfaces absorb most light; shiny surfaces reflect it."

---

## 3. Emissivity (ε)

**Definition:** Efficiency of thermal radiation emission (in the infrared).

**Key idea:** Shiny/metallic surfaces are poor radiators; matte/painted surfaces radiate well regardless of color.

### Presets

| Preset Label | ε (emissivity) | Typical Range | Justification |
|--------------|----------------|---------------|---------------|
| Matte black surface | 0.95 | 0.90–0.98 | Near-ideal thermal radiator |
| Painted / oxidized surface | 0.85 | 0.75–0.90 | Most real-world surfaces |
| Bare metal (oxidized) | 0.60 | 0.40–0.75 | Depends on oxidation |
| Polished metal | 0.10 | 0.03–0.20 | Very poor radiator |

**UX hint:**

> "Radiation dominates heat loss at high temperatures."

---

## 4. Environment / Air Movement (Convection)

**Definition:** How strongly air removes heat from the surface.

**Key idea:** Wind matters more than material for peak temperature.

### Presets

| Preset Label | h (W/m²·K) | Typical Range | Justification |
|--------------|------------|---------------|---------------|
| Still indoor air | 5 | 3–7 | Natural convection only |
| Outdoor, calm | 8 | 6–10 | Buoyancy-driven airflow |
| Light air movement | 15 | 10–20 | Walking speed air |
| Breezy / windy | 30 | 20–50 | Wind dramatically increases losses |

**UX explanation:**

> "Moving air carries heat away quickly and strongly limits maximum temperature."

---

## 5. Typical Material Heat Capacity (for Mass-Based Presets)

If presets include material mass modeling:

| Material Class | Specific Heat c (J/kg·K) | Justification |
|----------------|--------------------------|---------------|
| Metal | 500–900 | Steel ~500, aluminum ~900 |
| Glass / ceramic | 700–900 | Similar thermal inertia |
| Plastic | 1200–2000 | Plastics heat slowly |
| Wood | 1500–2500 | High heat capacity |

---

## 6. Temperature Regime Guidance (Educational Hint)

This should appear as a non-blocking hint, not a rule.

| Regime | Approx Surface Temperature | Dominant Loss |
|--------|----------------------------|---------------|
| Low | < 100 °C | Convection |
| Medium | 100–300 °C | Convection + radiation |
| High | > 300 °C | Radiation (T⁴ dominates) |

**Explanation:**

> "Radiation grows with the fourth power of temperature, so it eventually caps how hot the surface can get."

---

## 7. Why These Presets Are "Correct Enough"

- All values are representative midpoints, not extremes
- Ranges reflect real variability
- Errors are typically ±20–40%, which is acceptable for:
  - Intuition
  - Comparison
  - Relative scaling
- Presets teach cause–effect, not exact prediction

---

## Design Rule (for the Developer)

> Presets should get users into the right physical regime quickly, while manual inputs let advanced users refine the numbers.
