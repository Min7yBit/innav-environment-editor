# InNav Environment Editor

A desktop-first, **vanilla HTML/CSS/JavaScript** interactive prototype for Team Pathfinder's engineering-facing indoor navigation environment editor. It is separate from the visitor-facing InNav application.

## Features implemented

- Project dashboard: create, search, rename, duplicate, open and delete multiple buildings.
- Floor management: add, rename, reorder, set numbers/elevations, switch and hide floors; floor-stack overview.
- Editable SVG floor plans: select, place, drag and resize rectangular rooms; change type, dimensions, position and floor.
- Destinations: place, move, rename, categorize, configure accessibility, visibility, floors and connected graph nodes.
- Navigation graph: add, drag and connect nodes, remove edges, create cross-floor connections and edit accessibility.
- Real shortest-path calculation with Dijkstra's algorithm, floor-specific route highlights and derived instructions; disconnected routes fail clearly.
- Data-driven validation of references, IDs, missing information, graph connectivity and invalid cross-floor edges.
- Browser localStorage persistence, save/unsaved indicators, in-session undo/redo, JSON export and import.
- Explicit **model-import metadata demonstration**: file selection/drag-and-drop records filename/size/type, but does not display mesh geometry.
- No build step, backend, runtime dependencies or external CDNs.

## File structure

```text
innav-environment-editor/
├── index.html            Main layout
├── styles.css            Responsive style system
├── app.js                State, rendering, tools, routing, storage, validation
├── assets/
│   └── favicon.svg       InNav mark
├── render.yaml           Optional Render Blueprint configuration
├── .gitignore
├── tests/test-core.js     Dependency-free data / routing checks
└── README.md
```

## Run locally

Either open `index.html` directly in a modern browser or use a static server in this directory:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000/`. Python is only a local convenience: **it is not required by Render**. All asset URLs are relative.

## Tests

Run the dependency-free core checks with `node tests/test-core.js`. These check the sample project, building creation, cross-floor routing, disconnected paths, JSON serialization and validation. **These are not a substitute for manual browser UI testing or post-deployment verification.**

## Basic workflow

1. Open the sample **Pathfinder Innovation Centre** project or create a new building.
2. Select a floor; use **Room**, **Destination**, and **Node** on the toolbar, then click the plan.
3. Switch to **Select** to drag objects. Select a room's lower-right amber handle to resize it. Properties on the right are editable.
4. Choose **Connect** and click two nodes. Use **Esc** to cancel a partially selected connection. A link across floors must involve a `lift` or `stairs` node to pass validation.
5. In **Navigation** or **Runtime preview**, select a start and destination and click **Calculate route**. Destinations must have graph-node assignments.
6. Open **Validation** to inspect actionable findings; save with **Save** or Ctrl/Cmd+S.
7. Click **Export JSON** to download the current project. Use **Import JSON** on the Projects screen to load an exported configuration as a new project.

**Important persistence note:** localStorage is origin- and browser-specific. Projects saved at `localhost` do not automatically appear at a deployed `onrender.com` URL. Export JSON locally and import on the deployed site to transfer data. Clearing site data or using private browsing may erase saved projects; back up with JSON. Save is explicit, not automatic, for editor modifications. Project creation/deletion/import are immediately persisted to keep the dashboard consistent.

## Deploy to Render Static Site

1. Add these files to a GitHub repository, with `index.html` at the repository root.
2. In the [Render dashboard](https://dashboard.render.com/), choose **New → Static Site** and connect the GitHub repository.
3. Select the branch to deploy (usually `main`).
4. Configure **Build command:** leave blank if Render allows it; if the UI requires a command, use `echo "Static site - no build required"`.
5. Configure **Publish directory:** `.` (the project root). Environment variables: none.
6. Deploy. Render provides an HTTPS `*.onrender.com` address. Do not confuse it with the *existing visitor reference site*, `https://innavappprototype.onrender.com`.
7. Open the new public address and verify the checklist below. Static file hosting requires no rewrite rules because this application has only one page and does not use history-based paths.

Alternatively, `render.yaml` provides Blueprint-style static site settings. The unique service name in that file is a **suggestion**; update it in Render if it is already taken.

### Git commands

```bash
git init
git add .
git commit -m "Build InNav Environment Editor prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

Create the empty repository on GitHub first; replace the placeholder remote with its actual URL. These commands are instructions, not a claim that a repository has been created.

## Verification checklist

- [ ] HTTPS public URL responds successfully (check only after deployment).
- [ ] No missing CSS, JavaScript or favicon in browser Network tab.
- [ ] Dashboard opens a project; floor plan is rendered.
- [ ] Create a project with multiple floors; switch and rename floors.
- [ ] Create, drag, resize, edit and delete a room.
- [ ] Add a destination and graph node; connect nodes.
- [ ] Preview a real route; try disconnected nodes and confirm an error.
- [ ] Run validation on valid and invalid objects.
- [ ] Save, refresh, reopen the project; data persists within the same origin.
- [ ] Export JSON and re-import it successfully.
- [ ] Check browser Console for uncaught errors.

## Limitations and scope

This is a design/engineering prototype, **not a production mapping or navigation system**. The editor uses 2D SVG plan units rather than calibrated metres, and distances are deliberately labeled plan units. The 3D floor stack is a structural overview, **not a real 3D model viewer**. Import Model only records metadata: GLB/glTF/OBJ/FBX/STL files are not parsed or uploaded. Imported binary models are not persisted or embedded in JSON. There is no backend, accounts, real-time collaboration, georeferencing, floor-plan CAD import, accessibility certification, path geometry collision detection or cloud synchronization. Undo/redo history is only available in the current editing session.

### Design references

Based on Team Pathfinder's supplied InNav visual guide and editor paper-prototype sketches. Uses Deep Slate structure, off-white plan canvas, **amber for editing and selection**, and **electric blue for navigation graph and routes**.
## Interactive 3D building

In the Editor, select **3D Building** to view a perspective-rendered multi-storey building generated from the current room and floor geometry. Drag to orbit, Shift+drag to pan, scroll to zoom, and click rooms or destinations to inspect them. Navigation nodes, graph edges, and calculated routes share the live 2D editor data. This is dependency-free Canvas 3D projection, not a GLB/glTF mesh renderer or Unreal Engine. Imported 3D model files are metadata-only in this prototype.
