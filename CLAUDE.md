# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**pixel-pint** is a minimalist, web-based pixel art drawing application. It's a local-first tool with no backend dependencies—all user data is stored in the browser's `localStorage`. The app supports a two-layer drawing system, smart thumbnails, PNG export at various scales, and respects system light/dark mode preferences.

## Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server (hot module reloading enabled) |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run lint` | Run ESLint on all JS/JSX files |
| `npm run preview` | Preview the built production bundle locally |

## Architecture Overview

### High-Level Structure

The application follows a **router-based architecture** with two main views:

1. **Home (ProjectList)** - Browse and manage pixel art projects
2. **Editor** - Create and edit a selected project

State management is **componentwise** (no external state library like Redux). Data persistence relies entirely on `localStorage`.

### Key Components & Responsibilities

**`src/App.jsx`**
- Main router that switches between Home and Editor views
- Manages view state and selected project ID
- Handles navigation callbacks

**`src/components/Editor.jsx`**
- Orchestrates the editor interface and state
- Manages project metadata (name, palette, thumbnail)
- Implements auto-save (1000ms debounce) to `localStorage`
- Handles undo/redo history state, export, and palette changes
- Props passed to Canvas include drawing tools, layer selection, and colors

**`src/components/canvas/Canvas.jsx`**
- Core drawing engine using a **three-canvas approach**:
  - **Checkerboard canvas** - Visual background grid
  - **Background layer canvas** - Base pixel layer
  - **Foreground layer canvas** - Top pixel layer with outlines when inactive
- Manages drawing state via `useCanvasDrawing` hook
- Handles touch gestures (pinch-to-zoom) via `useCanvasGestures` hook
- Implements undo/redo stacks (max 50 states) with serialization to DataURL
- Exposes imperative methods (save, getThumbnail, exportImage, clear, undo, redo) via `useImperativeHandle`

**`src/components/canvas/useCanvasDrawing.js`**
- Handles pixel-by-pixel drawing actions
- Implements **flood fill algorithm** (4-directional BFS) for bucket tool
- Coordinates between canvas coordinates and pixel grid coordinates
- Supports three tools: draw, erase, fill

**`src/components/canvas/useCanvasGestures.js`**
- Two-finger pinch-to-zoom for canvas scaling (1x to unbounded)
- Pan support while zooming
- Zoom bounds clamped to prevent overpanning
- Zoom sensitivity is configurable (currently 1.5)

**`src/components/Palette.jsx`**
- Color palette selector UI
- Displays project colors; switches to erase tool when needed

**`src/components/Toolbar.jsx`**
- Tool selection (draw, erase, fill)
- Layer switching (foreground/background)
- Undo/redo buttons with disabled states

**`src/components/ProjectList.jsx`**
- Homepage listing all projects with thumbnail previews
- New project creation modal
- Project selection and deletion

**`src/components/ExportModal.jsx` & `src/components/PaletteModal.jsx` & `src/components/PaletteSelector.jsx` & `src/components/NewProjectModal.jsx`**
- Modal dialogs for various editor actions

**`src/components/canvas/canvasUtils.js`**
- Helper functions: pixel color matching, hex-to-RGBA conversion, flood fill utilities, checkerboard drawing
- Distance and midpoint calculations for gesture recognition

**`src/utils/storage.js`**
- Abstraction layer for `localStorage` operations
- Functions: `getProjects()`, `createProject()`, `saveProjectData()`, `loadProjectData()`, `updateProjectMeta()`, `getCustomPalettes()`, `saveCustomPalette()`
- Storage keys: `pixel-pint-projects-list`, `pixel-pint-project-{id}`, `pixel-pint-custom-palettes`

**`src/utils/palettes.js`**
- Palette management and fetching from Lospec API

### Data Persistence

**Projects List** (`pixel-pint-projects-list`)
```
[
  { id, name, width, height, palette: [...], thumbnail, lastModified },
  ...
]
```

**Project Data** (`pixel-pint-project-{id}`)
```
{ background: <DataURL>, foreground: <DataURL> }
```

**Custom Palettes** (`pixel-pint-custom-palettes`)
```
{ paletteName: [...colors], ... }
```

### Build & Bundling

- **Bundler**: Vite with experimental Rolldown backend (`rolldown-vite@7.2.5`)
- **React version**: 19.2.0 with React DOM 19.2.0
- **CSS**: Tailwind CSS 4.1.18 + PostCSS (though most styling is in component CSS files)
- **Icons**: Lucide React for UI icons

### Development Server Config

The Vite dev server in `vite.config.js`:
- Proxies `/lospec-api/*` requests to `https://lospec.com` for palette fetching
- Allows host `skrewt-station.local`

### ESLint Configuration

- Uses ES 2020 syntax
- React Hooks plugin enforced
- React Refresh plugin for fast refresh
- Rule: Unused vars ignored if they start with capital letter (component convention)
- Ignores `dist/` directory

## Common Development Tasks

### Adding a New Drawing Tool

1. Add the tool name to the tool selection logic in `Toolbar.jsx`
2. Implement the tool logic in `useCanvasDrawing.js` within `handleAction()`
3. Pass the `activeTool` prop through Canvas to the hook
4. Update the cursor styling in `Canvas.css` if needed

### Modifying Canvas Rendering

The three-canvas system (`checkerboard`, `background`, `foreground`) is accessed via refs in Canvas.jsx. Changes to rendering should:
- Update the appropriate canvas ref
- Trigger `onCanvasChange()` to mark the editor as "saving"
- Call `saveStateToUndo()` before major changes for undo support

### Adding Project Metadata

New project metadata fields should be:
1. Added to the project object in `createProject()` in `storage.js`
2. Updated in the Editor component's state if displayed
3. Persisted via `updateProjectMeta()`

### Adjusting Gesture Sensitivity

Touch zoom sensitivity is hardcoded as `1.5` in `useCanvasGestures.js` line 33. Pan bounds are calculated dynamically based on canvas size.

## Known Implementation Details

- **No backend**: All data is localStorage-only; no cloud sync
- **Two-layer system**: Foreground and background layers only (not n-layer)
- **Undo/redo**: Limited to 50 states per project; states are serialized as DataURLs
- **Auto-save**: Debounced at 1000ms after any canvas change
- **Flood fill**: Simple 4-directional fill; no sophisticated flood fill variants
- **Export**: Supports 1x and 10x upscaling with nearest-neighbor interpolation (imageSmoothingEnabled = false)
- **Mobile support**: Touch events and pinch zoom work on mobile; cursor hints adjust for touch
