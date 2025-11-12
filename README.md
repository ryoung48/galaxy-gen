# Galaxy Generator

Galaxy Generator is a Vite + React + TypeScript application that procedurally creates a populated spiral galaxy, renders it on an interactive map, and surfaces deep lore about every generated polity, system, star, and orbit. The project pairs a heavy-weight simulation core with a canvas-driven UI so you can explore nations, trade routes, orbital ecologies, and statistical breakdowns of the setting that was just created.

## Getting Started
- `npm install` – install dependencies.
- `npm run dev` – start the Vite dev server (defaults to http://localhost:5173).
- `npm run build` – type-check and create a production bundle.
- `npm run preview` – locally preview the production build.

Generation happens client-side. From the landing screen, choose or randomize a seed and click **Generate World**. The seed drives every subsystem, so the same seed will always recreate the same galaxy.

## Project Layout
- `src/App.tsx` – theme bootstrapping and top-level view routing (landing → galaxy map → statistics).
- `src/context` – lightweight view state (selected entity, current seed) exposed with React context.
- `src/components`
  - `maps` – canvas rendering: Voronoi galaxy map, solar-system zoom, starfield background, legend overlays.
  - `codex` – entity detail panels (nations, systems, stars, orbits) that decorate text with in-app hyperlinks.
  - `statistics` – Nivo-based charts that aggregate atmospheric types, habitability, governments, etc.
  - `common` – reusable UI primitives (toggle groups, tooltips, styled text).
  - `Landing`, `Header`, `Footer` – ancillary UI.
- `src/model`
  - `galaxy` – world-scale generation, Voronoi diagrams, minimum spanning tree lanes, trade routing.
  - `nations` – territorial partitioning, government assignment, language selection, war state inference.
  - `languages` – constructed language and lexicon generator used when naming everything.
  - `system` – stars, stellar companions, orbits, biomes, atmospheres, moons, technology levels, tags.
  - `utilities` – deterministic RNG (`Dice`), geometry helpers, Voronoi wrapper, MST helpers, text formatters.
- `src/theme` – MUI theme, color helpers, and typography.

## Simulation Systems
- **Deterministic RNG** (`src/model/utilities/dice`)  
  Seeds are converted into a custom linear congruential generator and exposed as `window.dice`. Helper wrappers (`DICE.spawn`, `DICE.swap`) let the map renderers and generators create deterministic sub-sequences without breaking global continuity.

- **Galaxy Forge** (`src/model/galaxy`)  
  Generates several thousand candidate stars, relaxes them via Lloyd iterations of a Voronoi diagram, filters edge cells, and adds hyperlanes using a minimum spanning tree. The resulting structure (systems, MST edges, routes) is cached on `window.galaxy`.

- **Nation Builder** (`src/model/nations`)  
  Uses a custom distribution algorithm plus a quadtree-based spacing heuristic to cluster systems into nations. Each nation receives a unique language, flag palette, government type, and war state. Capital systems become homeworlds and later influence settlement density.

- **Language Forge** (`src/model/languages`)  
  Randomizes phoneme inventories, vowel/consonant clusters, digraphs, and predefined articles to produce a conlang per nation. Names across the galaxy are drawn from phoneme clusters while enforcing uniqueness via `window.galaxy.uniqueNames`.

- **Stellar Generation** (`src/model/system/stars`)  
  Builds primary stars and hierarchical stellar companions by sampling spectral and luminosity classes, computing physical properties (mass, temperature, luminosity, habitable zones), and recursively spawning satellites or companion stars.

- **Orbital Ecology** (`src/model/system/orbits`)  
  Classifies planetary bodies, belts, and moons; models atmospheres, hydrospheres, biospheres, orbital mechanics (eccentricity, tilt, period), technology levels, habitability scores, starports, and colonization outcomes. Capital/mainworld logic guarantees viable population centers.

- **Trade & Conflict** (`src/model/galaxy/trade`, `src/model/nations/index.ts`)  
  Builds inter-nation trade corridors by triangulating national capitals (Urquhart graph + A* along hyperlanes) and flags systems that lie on major trade routes. Border analysis injects limited wars between neighboring nations to add geopolitical texture.

- **Visualization Suite**
  - **Galaxy/System Map** (`src/components/maps`) – canvas zoom with pan/zoom limits; switches to local solar-system rendering above a zoom threshold; backs the scene with a seeded starfield; interactive picking for systems, stars, and orbits.
  - **Codex** (`src/components/codex`) – details the currently selected entity with inline navigation controlled by the view context.
  - **Statistics** (`src/components/statistics`) – chart panels summarizing star spectra, orbit types, biospheres, population tiers, governments, technology levels, etc.

- **Styling & UX** (`src/theme`, `src/components/common`)  
  A custom MUI theme sets typography and palettes, while utilities like `StyledText` render inline tooltips and clickable references that dispatch context transitions.

## Runtime Data Flow
1. **Landing** seeds the PRNG and calls `GALAXY.spawn`, which fills `window.galaxy` with all generated data while returning the initial view state.
2. **ViewContext** stores the active selection (`system`, `nation`, `star`, or `orbit`) and lets any component transition to a new entity.
3. **GalaxyMap** reacts to selection changes and zoom level, repaints the canvas, and feeds the Codex sidebar.
4. **StatisticsView** swaps chart components via a toggle group; each chart reads directly from `window.galaxy`.

## Contributing
- Keep new modules deterministic by sourcing randomness from `window.dice`.
- Favor the existing data shapes on `window.galaxy` when augmenting systems, so the Codex and visualization layers can access the new data without bespoke wiring.
- When adding UI, prefer the theme and common components to maintain a consistent presentation.

## License
No explicit license is provided; treat this codebase as all rights reserved unless the project owner specifies otherwise.
