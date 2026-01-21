# CLAUDE.md

## Project Overview

Solar Heating Estimator — an interactive, estimation-grade calculator that predicts how hot an object gets under light exposure.

**Target audience:** Curious non-experts and experienced technical users. Educational tool, not precision engineering.

## Goals

1. **Allow any input** — Users can always enter raw values directly
2. **Presets are helpers, not constraints** — Optional, visible, editable
3. **Progressive disclosure** — Explanations on demand, never block fast use
4. **Clarity over precision** — Order-of-magnitude accuracy is acceptable

## Key Assumptions

- Object is a **rectangular plate/block suspended in air** (no backing contact)
- Light absorbed on one face, heat lost from all faces
- Single uniform temperature (lumped thermal model)
- Ambient temperature = radiative environment temperature
- Constant convection coefficient

## Documentation

- `docs/requirements.md` — Full requirements and equations
- `docs/presets.md` — Preset values with justifications
