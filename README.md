# KodNest Premium Build System – Design Shell

This repository contains the visual and structural shell for the **KodNest Premium Build System**. It is intentionally focused on layout, typography, and interaction rules rather than product functionality.

## Philosophy

- **Calm, intentional, coherent, confident**
- No gradients, glassmorphism, neon colors, or novelty effects
- Predictable layout with generous whitespace and measured typography

## Layout Model

Every page follows the same high-level structure:

1. **Top Bar** – Project name (left), progress indicator (`Step X / Y`, center), status badge (right).
2. **Context Header** – Large serif headline with one-line subtext explaining the current context.
3. **Primary Workspace + Secondary Panel** – A 70/30 split:
   - Primary: main interaction surface with quiet cards.
   - Secondary: guidance, copyable build prompt, and outcome feedback buttons.
4. **Proof Footer** – Checklist for `UI Built`, `Logic Working`, `Test Passed`, and `Deployed`, each with a required proof field.

## Design Tokens

- **Background**: `#F7F6F3`
- **Primary text**: `#111111`
- **Accent**: `#8B0000`
- **Success**: muted green
- **Warning**: muted amber

Spacing scale (only):

- `8px`, `16px`, `24px`, `40px`, `64px`

Typography:

- Headings: serif, confident, generous spacing
- Body: system sans-serif, 16px, line-height between 1.6–1.8, max text width 720px

## Components

- **Buttons**
  - Primary: solid deep red
  - Secondary: outlined deep red
  - Shared radius, padding, and hover treatment
- **Inputs**
  - Clean 1px borders, subtle focus ring using the accent color
  - No drop shadows
- **Cards**
  - Subtle borders, no shadows, balanced internal padding

Transitions use a single, quiet timing: `~180ms ease-in-out` without bounce or parallax.

## Files

- `index.html` – Page structure and semantic layout.
- `styles.css` – Design tokens, layout rules, and UI components.
- `package.json` – Placeholder for future tooling or dependencies.

## Running

This shell is plain HTML and CSS. You can open `index.html` directly in your browser or serve it with any static file server.

## Next Steps

- Map real product steps to the progress indicator.
- Wire the prompt and feedback buttons to your build / orchestration layer.
- Capture and persist proof footer entries as part of your delivery workflow.

