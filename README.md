# pixel-pint
**The Pint-Sized Pixel Editor**

`pixel-pint` is a minimalist, web-based pixel art drawing application designed for both mobile and desktop. It emphasizes simplicity, local-first storage, and a distraction-free creative experience.

## Key Features
- **Local-First:** All drawings are stored entirely in your browser's local storage. No accounts, no syncing, no cloud.
- **Layer System:** Two-layer drawing system (Foreground and Background.)
- **Smart Thumbnails:** Automatic generation of pixel-perfect thumbnails for your project list.
- **Export Options:** Export your creations as PNGs at true size or upscaled 10x with sharp nearest-neighbor scaling.
- **Sleek Interface:** A compact toolbar that stays out of your way.
- **Themed:** Full support for system-level light and dark modes.

## Application Structure
- **`src/App.jsx`**: The main router that switches between the Home (Project List) and Editor views.
- **`src/components/`**:
  - **`Canvas.jsx`**: The core drawing engine utilizing multiple HTML5 canvases for layers and interaction.
  - **`Editor.jsx`**: Orchestrates the drawing interface, state, and project-specific logic.
  - **`ProjectList.jsx`**: The homepage component for managing and creating new projects.
  - **`Palette.jsx`, `Toolbar.jsx`, `ExportModal.jsx`**: Specialized UI components for the editor.
- **`src/utils/storage.js`**: abstraction layer for `localStorage` persistence of project metadata and pixel data.

## Getting Started
1. Clone the repository.
2. Run `npm install`.
3. Run `npm run dev` to start the development server.
4. Start pixelling!
