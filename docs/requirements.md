# Solar Heating Calculator — Requirements

## 1. Purpose

Create an interactive, estimation-grade calculator that helps users understand and estimate:

- How light intensity (lux or W/m²) becomes absorbed heat
- How temperature changes over time
- What equilibrium (maximum) temperature is reached
- How material choice and environment limit heating

The tool is meant to be:

- **Useful to curious non-experts** — educational and approachable
- **Efficient for experienced users** — fast input, minimal friction
- **Transparent about assumptions and uncertainty** — honest about limitations

It is **not** a precision engineering or safety certification tool.

---

## 2. Core Principles

1. **Allow any input** — Users can always enter raw values directly.
2. **Presets are helpers, not constraints** — Presets must be optional, visible, editable, and overridable.
3. **Progressive disclosure** — Explanations are available on demand and never block fast use.
4. **Clarity over precision** — The goal is understanding and order-of-magnitude accuracy.

---

## 3. Inputs & Presets

All numeric inputs must be editable directly. Each input category must also offer human-readable presets where applicable.

> **Note:** Concrete preset values are defined in [presets.md](./presets.md). This section specifies what presets must exist and their requirements.

### 3.1 Light Input

The app must support multiple input modes via a selector (radio buttons or dropdown):

#### Mode A — Direct Irradiance Input (Default)

- User inputs irradiance `E` in W/m² directly.
- No conversion required.

#### Mode B — Lux Input (Convert to W/m²)

- User inputs:
  - Measured illuminance `L` [lux]
  - K factor `K` [lux per W/m²]
- App computes: `E = L / K`

#### Mode C — Lux Input with ND Filter Compensation

- User inputs:
  - Sensor-measured illuminance `L_meas` [lux] (behind ND filter)
  - ND attenuation factor `N` (dimensionless), e.g., ND64 → N=64, ND1000 → N=1000
  - K factor `K`
- App computes:
  - `L = L_meas × N`
  - `E = L / K`
- **ND stacking**: Allow multiple ND values; total attenuation `N = N₁ × N₂ × ...`
- **Suggested ND preset buttons**: ND2, ND4, ND8, ND16, ND32, ND64, ND100, ND400, ND1000

#### K Factor (Daylight Luminous Efficacy)

The K factor bridges lux (photopic-weighted visible light) to irradiance (W/m²):

```
K = lux / (W/m²)
E ≈ lux / K
```

**K Input Requirements:**

- Numeric field with slider
- Preset dropdown with representative values

**Required K presets must cover:**

- Clear sky conditions at different sun angles (high, mid, low)
- Overcast/diffuse daylight
- Indoor artificial lighting

**Helper text** (must be displayed):
> "Typical outdoor daylight K is often around ~100 lux per W/m², but varies with sky and sun angle. Expect ±20–40% uncertainty if you don't calibrate."

**UI must clarify:**

- K is an approximation
- Real conditions vary with sky, season, and sun angle

### 3.2 Surface Absorptivity (α)

Controls how much incoming light turns into heat (0–1 scale).

**Required presets must cover the spectrum from:**

- Near-ideal absorbers (matte black)
- Dark surfaces
- Medium/colored surfaces
- Light surfaces
- Reflective/shiny surfaces

**Plain-language explanation:**
> "This controls how much incoming light turns into heat."

Users must be able to override the value directly.

### 3.3 Surface Emissivity (ε)

Controls efficiency of thermal radiation emission (0–1 scale).

**Required presets must cover:**

- Near-ideal radiators (matte black)
- Typical painted/oxidized surfaces
- Bare metals with varying oxidation
- Polished metals (poor radiators)

**Key concept to convey:** Shiny/metallic surfaces are poor radiators (low ε); matte/painted surfaces are good radiators (high ε). This is independent of color—a white painted surface and a black painted surface both have high emissivity.

> **Note:** Thermal emissivity (infrared, ~5–50 μm) and solar absorptivity (visible/near-IR, ~0.3–2.5 μm) are measured at different wavelengths. They are often similar for common materials but can differ significantly for selective coatings or bare metals.

**Plain-language explanation:**
> "This controls how efficiently the surface radiates heat away. Shiny metals are poor radiators; matte or painted surfaces radiate well. Radiation dominates heat loss at high temperatures."

Users must be able to override the value directly.

### 3.4 Material Heat Capacity (c)

For transient (time-based) calculations, the model needs specific heat capacity.

**Required presets must provide specific heat values for:**

- Metals
- Glass/ceramic
- Plastics
- Wood

**Plain-language explanation:**
> "Materials with higher heat capacity take longer to heat up."

### 3.5 Environment / Air Movement

Describes typical airflow situations affecting convective heat loss (convection coefficient `h`).

**Required presets must cover:**

- Still indoor air (natural convection only)
- Outdoor calm conditions
- Light air movement
- Breezy/windy conditions

**Plain-language explanation:**
> "Moving air carries heat away faster and lowers the maximum temperature."

Manual override must always be possible.

### 3.6 Ambient Temperature (T_amb)

The surrounding air/environment temperature. Required for all heat loss calculations.

**Input requirements:**

- Numeric field in °C (or user-selectable °C/°F)
- Default: 20°C (typical room temperature)
- Common presets (optional): "Room temperature (20°C)", "Hot day (35°C)", "Cold day (5°C)"

**Plain-language explanation:**
> "The temperature of the surrounding air. Heat flows from hot to cold."

### 3.7 Object Geometry

The model treats the object as a **cuboid** (box shape) illuminated on one face (typically the top).

#### Illuminated Area (A)

The face receiving light.

**Input requirements:**

- Numeric field in m² or cm²
- Default: 0.01 m² (10 cm × 10 cm)
- Optional quick presets: "Phone screen", "A4 paper", "1 m²"

#### Thickness (d)

The object's thickness (perpendicular to the illuminated face).

**Input requirements:**

- Numeric field in mm or cm
- Default: 10 mm (1 cm)
- Optional quick presets: "Thin sheet (1 mm)", "Plate (5 mm)", "Block (50 mm)"

#### Cooling Area (calculated)

The total surface area that loses heat is calculated automatically, assuming a square cross-section:

```
A_cool = 2A + 4√A × d
```

This accounts for:
- Top face: A
- Bottom face: A
- Four sides: 4 × √A × d

**Plain-language explanation:**
> "Thicker objects have more surface area to lose heat from, which lowers the maximum temperature."

### 3.8 Object Mass / Thermal Mass (m)

The mass of the heated object, needed for transient (time-based) calculations.

**Input requirements:**

- Numeric field in kg or g
- Default: 0.1 kg (100 g)

**Plain-language explanation:**
> "Heavier objects take longer to heat up but also hold more heat."

---

## 4. Thermal Model

### 4.1 Conceptual Requirements

The calculator must implement a **single-temperature (lumped) thermal model** that:

- Assumes the object is **suspended in air** (no contact with other surfaces)
- Balances absorbed power against:
  - Heat lost to air (convection)
  - Heat lost by thermal radiation
- Produces:
  - A maximum (equilibrium) temperature `T_eq`
  - A temperature-vs-time curve `T(t)`

### 4.2 Core Equations

#### Variable Reference

| Symbol | Name | Unit | Description |
|--------|------|------|-------------|
| `E` | Irradiance | W/m² | Light power per unit area |
| `A` | Illuminated area | m² | Face receiving light |
| `d` | Thickness | m | Object thickness |
| `A_cool` | Cooling area | m² | Total surface area (calculated) |
| `α` | Absorptivity | — (0–1) | Fraction of light absorbed |
| `ε` | Emissivity | — (0–1) | Thermal radiation efficiency |
| `h` | Convection coefficient | W/(m²·K) | Heat transfer to air |
| `c` | Specific heat capacity | J/(kg·K) | Heat capacity per unit mass |
| `m` | Mass | kg | Object mass |
| `T` | Temperature | K | Object temperature (Kelvin) |
| `T_amb` | Ambient temperature | K | Surrounding air and radiative environment temperature |
| `σ` | Stefan-Boltzmann constant | W/(m²·K⁴) | 5.67 × 10⁻⁸ |

> **Geometry model:** The object is a cuboid with square cross-section (side length √A). Light is absorbed on one face (`A`), heat is lost from all six faces (`A_cool = 2A + 4√A × d`).

#### Absorbed Power

```
P_abs = E × A × α
```

This is the power input from light.

#### Convection Heat Loss

```
P_conv = h × A_cool × (T - T_amb)
```

Heat lost to surrounding air from all exposed surfaces. Dominates at lower temperatures.

#### Radiation Heat Loss (Stefan-Boltzmann Law)

```
P_rad = ε × σ × A_cool × (T⁴ - T_amb⁴)
```

Where:
- `σ = 5.67 × 10⁻⁸ W/(m²·K⁴)` (Stefan-Boltzmann constant)
- `T` and `T_amb` must be in **Kelvin** (K = °C + 273.15)

Heat lost by thermal radiation from all exposed surfaces. Dominates at higher temperatures due to T⁴ scaling.

> **Radiative environment note:** The model uses `T_amb` as both the air temperature (for convection) and the radiative environment temperature. This is a reasonable approximation for indoor scenarios. Outdoors, surfaces may "see" a sky that is colder than ambient air, which would increase radiative losses—this is a known simplification.

#### Total Heat Loss

```
P_loss = P_conv + P_rad
```

#### Equilibrium Condition

At equilibrium, heat in equals heat out:

```
P_abs = P_loss
```

Solving this equation (where `T` is the unknown) gives `T_eq`.

#### Transient Energy Balance (Time Evolution)

The temperature change over time follows:

```
m × c × (dT/dt) = P_abs - P_loss
```

Or equivalently:

```
dT/dt = (P_abs - P_conv - P_rad) / (m × c)
```

This ordinary differential equation (ODE) is solved numerically to produce the `T(t)` curve.

### 4.3 Suggested Numerical Approaches

The exact numerical method is left to the developer. Suggested approaches:

- **Equilibrium solver**: Bisection or Brent's method on `f(T) = P_abs - P_loss = 0`
- **Transient simulation**: Explicit Euler method with small time steps:
  ```
  T_new = T_old + dt × (P_abs - P_loss) / (m × c)
  ```

---

## 5. Outputs

### 5.1 Numeric Results

At minimum, the app must display:

- **Equilibrium (maximum) temperature** `T_eq`
- **Absorbed power** `P_abs`
- **Relative contribution of loss mechanisms:**
  - Air (convection) losses — `P_conv`
  - Radiation losses — `P_rad`
- **Time to reach selected fractions** of final temperature:
  - ~50% (t₅₀)
  - ~90% (t₉₀)
  - ~95% (t₉₅)

**If lux input is used (Mode B or C), also show:**

- Input lux `L` (and `L_meas` if ND mode)
- Total ND attenuation `N` (if applicable)
- K value used
- Computed `E` (W/m²)
- Computed absorbed power `P_abs`

**Reverse display (sanity check):**

- Predicted lux for computed E: `L_pred = E × K`

### 5.2 Visualization

**Required:**

- Temperature vs time curve

**Recommended (optional):**

- Visual indication of equilibrium point
- Comparison curves when presets change

**Graph requirements:**

- Must remain readable for:
  - Very fast heating
  - Slow heating
  - High or low equilibrium temperatures

---

## 6. Explanations & Transparency

### 6.1 Parameter Explanations

For every major input (K value, absorptivity, emissivity, environment, material), the app must provide:

- A plain-language explanation
- Accessible via: tooltip, info icon, or expandable section
- Non-modal and non-blocking

Advanced users must be able to ignore these entirely.

### 6.2 Calculation Explanation

The app must offer an optional **"How this is calculated"** view that:

- Explains the model in words, not equations
- Covers:
  - "Light in → heat absorbed"
  - "Heat escapes to air"
  - "Hot objects radiate energy"
  - "Temperature stops rising when heat in = heat out"
- Explains the time curve as:
  > "Repeated small time steps showing how temperature changes."

This view must:

- Be skippable
- Never interrupt normal calculator use

### 6.3 Temperature Regime Guidance

The app should provide educational hints about which loss mechanism dominates at different temperatures:

- Low temperatures (<100°C): convection dominates
- Medium temperatures (100–300°C): both contribute
- High temperatures (>300°C): radiation dominates (T⁴ relationship)

---

## 7. User Experience

### 7.1 Non-Restrictive Inputs

- The app must accept any numeric values.
- If inputs are unusual, show **soft warnings**, not errors.

**Example warning:**
> "This light intensity is higher than typical sunlight and may imply concentration."

### 7.2 Progressive Complexity

**Beginner users can:**

- Choose presets
- Read explanations
- Understand trends

**Advanced users can:**

- Input numbers directly
- Ignore explanations
- Focus only on outputs and graphs

### 7.3 Validation & Warnings (Lux Mode)

When using Lux mode, show a warning banner:
> "Lux→W/m² conversion uses K and may be off by ±20–40% depending on spectrum and sky."

**Sanity checks:**

- If computed `E > 2000 W/m²`: "Above typical horizontal clear-sky solar irradiance; may be concentration or input mismatch."
- If computed `E < 0`: Invalid input error.

---

## 8. Assumptions & Limitations

Somewhere in the UI (footer, expandable note, or info panel), clearly state:

- **Object suspended in air** — No heat loss to a backing surface or mount; only convection and radiation are modeled
- **Uniform temperature assumption** — The entire object is treated as one temperature (lumped model)
- **Cuboid geometry** — The object is modeled as a cuboid with square cross-section; cooling area is calculated from illuminated area and thickness
- **Ambient = radiative environment** — `T_amb` is used for both air temperature and radiative surroundings (may underestimate radiative loss outdoors where sky is colder than air)
- **Constant convection coefficient** — `h` is treated as constant; in reality it varies with geometry, orientation, and temperature difference
- **No phase changes** — No melting, burning, or chemical reactions modeled
- **Approximate lux ↔ W/m² conversion** — K factor is spectrum-dependent
- **Results are estimates, not guarantees** — Use for understanding, not safety-critical decisions

---

## 9. Preset Requirements

All presets must:

1. **Be optional** — Users can always input values directly
2. **Display the numeric value** — Show what value the preset sets
3. **Be editable after selection** — Selecting a preset populates the field, which can then be modified
4. **Include plain-language descriptions** — Help users understand what each preset represents
5. **Cover the practical range** — From low to high values users might encounter
6. **Be order-of-magnitude correct** — ±20–40% accuracy is acceptable for estimation

Concrete preset values and their justifications are defined in [presets.md](./presets.md).

---

## 10. Optional Features

These features enhance the user experience but are not required:

### 10.1 K Uncertainty Band

Add an option: **"Show uncertainty band from K range"**

Inputs:

- `K_min`, `K_max`

Compute two scenarios:

- `E_min = L / K_max`
- `E_max = L / K_min`

Run equilibrium + transient for both and plot a shaded band between curves.

### 10.2 Auto K Estimate

If user provides solar altitude (or date/time/location), suggest a K range. This remains approximate but can help users who don't have a calibration reference.

### 10.3 Power Terms Visualization

Optional plot showing power terms (absorbed, convective loss, radiative loss) vs time.

---

## 11. Explicit Non-Requirements

- No mandated programming language or framework
- No mandated numerical solver
- No required safety enforcement
- No sensor hardware integration

All implementation decisions are left to the developer.

---

## 12. Success Criteria

The calculator is successful if:

1. A **non-expert can understand** why temperature rises and stops
2. A **technical user can quickly estimate** max temperature and heating time
3. **Changing one parameter** (wind, surface color, material) visibly changes the curve
4. The tool feels **educational, transparent, and fast** — not opaque or restrictive
