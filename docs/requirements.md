# Solar Heating Calculator — Requirements (Simplified)

## 1. Purpose

Create an interactive, estimation-grade calculator that explains and estimates:

- How light intensity becomes absorbed heat
- How temperature changes over time
- The equilibrium (maximum) temperature

The tool is educational and should be transparent about assumptions and uncertainty. It is **not**
for precision engineering or safety certification.

---

## 2. Inputs & Conversions (Single Source of Truth)

All numeric inputs must allow direct entry. Presets and UI choices are implementation details and
are not defined here.

### 2.1 Light Input Modes

**Mode A — Direct Irradiance**

- Input irradiance `E` in W/m².
- **Convention:** `E` is the irradiance on a surface **perpendicular to the sun** (normal
  incidence), not Global Horizontal Irradiance (GHI). For tilted or horizontal surfaces, adjust for
  sun elevation angle.

**Mode B — Lux Input**

- Input illuminance `L` [lux] and `K` [lux per W/m²].
- Convert: `E = L / K`

**Mode C — Lux with ND Filter Compensation**

- Input `L_meas` [lux], ND attenuation factors `N₁, N₂, ...`, and `K`.
- Compute: `L = L_meas × (N₁ × N₂ × ...)`
- Convert: `E = L / K`

**K Factor Notes**

- `K` is an approximation and varies with spectrum, sky conditions, and sun angle.
- Expect meaningful uncertainty without calibration.

### 2.2 Surface Properties

- **Absorptivity `α` (0–1):** fraction of incident light absorbed as heat.
- **Emissivity `ε` (0–1):** efficiency of thermal radiation. Shiny metals are low-ε; matte/painted
  surfaces are high-ε. Emissivity is independent of visible color.

### 2.3 Environment

- **Convection coefficient `h`** [W/(m²·K)]
- **Ambient temperature `T_amb`** [K]

### 2.4 Object Geometry & Mass

- **Face area `A`** [m²] (illuminated face)
- **Thickness `d`** [m]
- **Mass `m`** [kg]
- **Specific heat `c`** [J/(kg·K)]

Cooling area assumes a cuboid with square cross-section:

```
A_cool = 2A + 4√A × d
```

---

## 3. Reflected Light Model (Mirrors)

When enabled, reflected light modifies the effective irradiance and illuminated area.

### 3.1 Spot Geometry (Sun Angular Size)

Sun half-angle:

```
θ_sun ≈ 0.267° ≈ 4.65 × 10⁻³ rad
```

Spot side length at distance `L`:

```
s_spot = s + 2L × tan(θ_sun)
```

Spot area:

```
A_spot = s_spot²
```

Concentration factor (≤ 1 for flat mirrors):

```
C(L) = s² / s_spot²
```

### 3.2 Effective Irradiance at Target

```
E_target = E_source × R × C(L) × n
```

Where:
- `R` = reflectance (0–1)
- `n` = number of reflectors

### 3.3 Effective Illuminated Area

```
A_eff = min(A, A_spot)
```

### 3.4 Absorbed Power (Reflection)

```
P_abs = E_source × R × C(L) × n × A_eff × α
```

Special cases:

1. If `A ≥ A_spot`, all reflected power is absorbed (independent of distance).
2. If `A < A_spot`, only a fraction is intercepted and power decreases with distance.

---

## 4. Thermal Model

### 4.1 Absorbed Power (Direct)

```
P_abs = E × A_eff × α
```

Where `A_eff` is the illuminated area (defaults to `A` if no spot limitation).

### 4.2 Heat Loss

Convection:

```
P_conv = h × A_cool × (T − T_amb)
```

Radiation (Stefan-Boltzmann):

```
P_rad = ε × σ × A_cool × (T⁴ − T_amb⁴)
```

```
P_loss = P_conv + P_rad
```

### 4.3 Equilibrium Temperature

```
P_abs = P_loss
```

Solve for `T` (e.g., bisection/Brent).

### 4.4 Transient Temperature

```
m × c × (dT/dt) = P_abs − P_loss
```

Solve numerically (e.g., explicit Euler).

---

## 5. Outputs (Minimum)

- Equilibrium temperature `T_eq`
- Absorbed power `P_abs`
- Convection loss `P_conv` and radiation loss `P_rad`
- Temperature vs time curve `T(t)`
- Time to reach representative fractions of equilibrium (e.g., 50%, 90%, 95%)

---

## 6. Assumptions & Limitations

- Object is suspended in air; **no conduction** to mounts or surfaces.
- **Uniform temperature** (lumped model); less accurate for thick/insulating materials or
  highly localized heating.
- **Cuboid geometry** with square cross-section; cooling area uses full object geometry.
- **Ambient = radiative environment**; outdoors this may underestimate radiative loss.
- **Constant convection coefficient**; real `h` varies with geometry, orientation, and ΔT.
- **Mirror optics simplified**; ignores cosine loss, aiming error, and imperfect overlap.
- **No phase changes** or chemical reactions.
- **Lux↔W/m² is approximate** (spectrum-dependent).
- Results are estimates, not guarantees.
