## Project Overview

This is a science fiction universe generator built with React, TypeScript, and Vite.

## Important << CLAUDE READ THIS>>
- Do not run linters or formatters after making changes. I will do this for you later.
- Do not try to run the app or build it. I will do this for you later.

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Material-UI with custom sci-fi theme
- **Visualization**: Nivo charts, D3.js for data visualization and geometric calculations
- **Styling**: Emotion CSS-in-JS with zero border-radius design aesthetic

### Application Structure
The app uses React Context + useReducer for state management with these key directories:

- `src/components/` - UI components organized by domain
- `src/model/` - Core business logic and procedural generation
- `src/context/` - Application state management
- `src/theme/` - Material-UI theming with "Michroma" font

### Global Objects
The app uses `window.dice` and `window.galaxy` as global objects for procedural generation. TypeScript declarations are in `window.d.ts`.

### Key Architectural Patterns
- Canvas-based rendering for galaxy and solar system maps
- D3.js integration for complex data visualizations
- Procedural generation algorithms using mathematical models
- Interactive zoom/pan functionality with coordinate transformations
- Context-based routing between galaxy, system, and codex views