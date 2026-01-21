# CLAUDE.md

## What This Is

Single-page calculator that estimates how hot objects get under light exposure. Calculates equilibrium temperature, temperature vs time curve, and heat loss breakdown (convection vs radiation).

**Target audience:** Curious non-experts and technical users. Educational tool, not precision engineering.

## Tech Stack

- **Bun** — Runtime and package manager
- **Vite** — Build tool
- **React + TypeScript** — UI
- **Tailwind CSS** — Styling
- **Recharts** — Charts
- **Biome** — Lint + format
- **Vitest** — Tests

## Commands

```bash
bun install          # Install dependencies
bun run dev          # Start dev server
bun run build        # Production build
bun run check        # Lint and format (Biome)
bun run test         # Run tests (watch mode)
bun run test:run     # Run tests once
```

## After Making Changes

Always run before committing:
```bash
bun run check && bun run test:run && bun run build
```

## Source Map

```
src/
├── lib/
│   ├── thermal/          # Core physics calculations (pure functions, no React)
│   │   ├── equations.ts  # P_abs, P_conv, P_rad, lux conversions
│   │   ├── solver.ts     # Equilibrium solver, transient simulation
│   │   ├── constants.ts  # Stefan-Boltzmann, simulation params
│   │   └── types.ts      # ThermalInputs, EquilibriumResult, etc.
│   └── presets/          # Preset values (K factor, absorptivity, etc.)
├── hooks/
│   └── useCalculator.ts  # Main state hook (inputs → calculations → results)
├── components/
│   ├── ui/               # Generic components (NumberInput, PresetSelect, Card)
│   ├── inputs/           # Input sections (Light, Surface, Environment, Geometry)
│   ├── outputs/          # Results display and temperature chart
│   └── layout/           # Header, explanations, assumptions
├── App.tsx               # Main layout
└── main.tsx              # Entry point

tests/
└── thermal/              # Unit tests for calculation functions
```

## Where to Start

| Task | Start Here |
|------|------------|
| Fix/add calculation logic | `src/lib/thermal/` |
| Add/modify presets | `src/lib/presets/` |
| Change UI layout | `src/App.tsx` |
| Modify input behavior | `src/components/inputs/` |
| Change results display | `src/components/outputs/` |
| Add new state/computed values | `src/hooks/useCalculator.ts` |

## Design Principles

1. **Allow any input** — Users can always enter raw values directly
2. **Presets are helpers** — Optional, visible, editable, never constraints
3. **Progressive disclosure** — Explanations on demand, never block fast use
4. **Clarity over precision** — Order-of-magnitude accuracy is acceptable

## Physics Model

- Object is a **cuboid suspended in air** (no backing contact)
- Light absorbed on one face, heat lost from all six faces
- Single uniform temperature (lumped thermal model)
- Heat loss via convection + radiation (Stefan-Boltzmann)

## Documentation

- `docs/requirements.md` — Full requirements and thermal equations
- `docs/presets.md` — Preset values with physical justifications
