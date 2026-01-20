# Underground Page Refactoring Plan (Code Strata Integration)

## 🎯 Goal
Transform `pages/Underground.tsx` into a "Code Strata" visualization, integrating the rich geological SVG aesthetics from the provided reference code (`git/` folder) while maintaining the existing project structure.

## 📂 Source References
The reference code is located in the `git/` folder in the project root:
- `git/App.tsx` (Main layout logic)
- `git/components/` (UI Components)
- `git/services/` (Data structure logic)

## 📋 Implementation Steps

### 1. Component Migration
Create a new directory `components/underground/` and migrate the following components. **Note:** Update imports to match the `at-an-arbor` project structure (e.g., Tailwind classes might need checking, though standard Tailwind is used).

- [x] **`components/underground/NoiseFilter.tsx`**
  - Copy from `git/components/NoiseFilter.tsx`.
  - Essential for the "grainy" SVG texture.
- [x] **`components/underground/StrataLayer.tsx`**
  - Copy from `git/components/StrataLayer.tsx`.
  - Visualizes a single week of contributions as a geological layer.
- [x] **`components/underground/GeologicalReport.tsx`**
  - Copy from `git/components/GeologicalReport.tsx`.
  - Displays analysis details.

### 2. Data Logic Integration (`lib/github-strata.ts`)
Create a new service file `lib/github-strata.ts` that combines the real API fetching with the data structure required by `StrataLayer`.

- [x] **Input**: Data from `https://github-contributions-api.jogruber.de/v4/{username}`.
- [x] **Output**: `StrataData` interface (defined in `git/types.ts`).
- [x] **Logic**:
  - Fetch flat contribution data.
  - Group into 7-day chunks (Weeks).
  - Map to `ContributionWeek` structure.
  - **Important**: The reference code creates "Start point" and "End point" for SVG paths based on 7 days. Ensure the array grouping is correct.

### 3. Page Assembly (`pages/Underground.tsx`)
Rewrite `pages/Underground.tsx` to mirror the structure of `git/App.tsx` but adapted for routing.

- [x] **Structure**:
  - `<NoiseFilter />` (Hidden SVG defs)
  - `<FixedOverlay />` (Grainy texture overlay)
  - `<Header />` (Excavation Site title)
  - `<MainContent />` (Stack of `StrataLayer` components)
  - `<GeologicalReport />` (Fixed bottom panel)
- [x] **Routing**: Ensure it stays at the `/underground` route.
- [x] **Interactions**: Keep the hover logic (`handleLayerHover`) to update the report panel.

## ⚠️ Notes
- **Gemini Service**: The reference code uses a `geminiService.ts`. You can mock this for now (return static strings) or implement a simple "insight generator" based on the contribution count (e.g., "High activity detected on weekend: Passion Project Hypothesis").
- **Styling**: The reference uses standard Tailwind colors (`neutral-950`, `red-500`). Ensure these variables exist or work with the current `tailwind.config.mjs`.

## 🚀 Next Command to Run
All tasks for the Underground refactoring are complete!
You can verify the page at `/underground` (or `/at-an-arbor/underground`).
