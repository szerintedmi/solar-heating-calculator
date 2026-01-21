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

**Key idea:** Emissivity is mostly about **surface finish** (shiny vs matte/painted), not visible color.

> **Note:** Thermal emissivity (longwave infrared, ~5–50 μm) and solar absorptivity (visible/near‑IR, ~0.3–2.5 μm) are measured at different wavelengths. Many common matte/painted non-metal surfaces have high ε (~0.9), but metals and selective coatings can differ dramatically.

### Presets

| Preset Label | ε (emissivity) | Typical Range | Justification |
|--------------|----------------|---------------|---------------|
| Matte / painted surface (any color) | 0.90 | 0.85–0.95 | Most paints and matte coatings radiate well regardless of visible color |
| Wood (unfinished) | 0.90 | 0.85–0.95 | Most wood surfaces are good IR emitters; finish matters more than species |
| Plastic (most, matte) | 0.90 | 0.85–0.95 | Many polymers have high longwave emissivity; varies with additives/finish |
| Rubber / silicone | 0.94 | 0.90–0.97 | Common elastomers are typically very high-ε surfaces |
| Paper / fabric | 0.93 | 0.90–0.97 | Fibrous/matte surfaces tend to be excellent radiators |
| Glass / ceramic | 0.92 | 0.85–0.95 | Typical non-metal solids have high longwave emissivity |
| Concrete / brick / stone | 0.93 | 0.90–0.97 | Common building materials are typically high-ε in the longwave IR |
| Metal, oxidized / anodized | 0.80 | 0.60–0.90 | Oxide layers and anodizing raise ε substantially |
| Metal, bare / brushed (clean) | 0.20 | 0.10–0.40 | Bare metals are moderate-to-poor radiators when not oxidized |
| Metal, polished / mirror-like | 0.05 | 0.02–0.10 | Very poor radiator (radiation losses can be dramatically lower) |

**UX hint:**

> "Radiation dominates heat loss at high temperatures."

**How much does ε vary by material/type?**

- **Wood, plastics, paper, fabrics, glass/ceramics:** usually **not a huge spread** (often ~0.85–0.95). Surface finish (glossy vs matte), coatings, and contamination matter more than the exact base material.
- **Metals:** **huge spread** depending on oxidation and polish (polished foil can be ~0.02–0.1; oxidized/anodized surfaces can be ~0.6–0.9). This is often the single biggest emissivity-driven difference users encounter in practice.

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
