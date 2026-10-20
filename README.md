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

## Interactive 3D Building View

Select **3D Building** from the Editor workspace. Drag to orbit, Shift+drag to pan, scroll to zoom, and click a room or POI to select it. The view renders perspective-projected 3D floor plates, extruded rooms, vertical elevation, destinations, and the same navigation graph and shortest path as the 2D editor. Room geometry changes in the inspector or plan appear when switching to the 3D view. The implementation uses a dependency-free HTML Canvas software projection; it is **not** a GLB/glTF model renderer or the Unreal application. There is no external CDN dependency.

## 2026 hi-fi implementation: stakeholder demo journey

The default entrypoint is the redesigned **InNav welcome screen**. Follow the implemented journey:

1. **Splash / Welcome:** create a project, open the project library, import configuration JSON, or choose a recent project.
2. **Project library:** search real browser-local projects; choose **Load building** to open that project's building-selection stage.
3. **Select building:** interactive SVG campus map with named, selectable building markers; the left list includes only editable projects. Other buildings in the drawing are labeled *site context*. Choose **Open 2D floor editor** or **Open 3D building view**.
4. **Individual level editor:** a shared floor selector; left tools for rooms, doors, destinations, path nodes, lifts, stairs, escalators, and graph connections; right floors, scene hierarchy, and contextual properties. A 2D/3D/stack view switch retains one underlying building configuration.
5. **3D camera toggle:** Orbit / Pivot rotates around the building like Blender/Maya. Free Fly uses right-mouse drag to look, W/A/S/D to translate horizontally, Q/E to move vertically, Shift for faster travel, and the wheel for movement. Click the 3D viewport to focus it for keyboard controls. Camera modes are viewing/navigation controls, not physics simulations.
6. **Vertical navigation:** placing a lift, staircase, or escalator creates a configuration object, a navigation node on the active level, and a corresponding node with a cross-level graph edge on an adjacent level when available. Lift edges are marked accessible. Connections to nearby existing nodes are added where possible. Use the graph view to complete routes where additional connections are required.
7. **Persistence:** building data, including fixture instances, floor plans, paths, and destinations, is saved to `localStorage` with **Save**. Reload the application to retrieve saved projects. Export JSON to share a configuration; import it on another browser to restore data.

### Camera and editing limitations

The 3D workspace is a real-time software-projected 3D visualization using Canvas: building floor slabs, extruded room blocks, selectable points and infrastructure objects are generated from your project data. It is **not** a WebGL mesh editor or Unreal renderer. Uploaded GLB/glTF/FBX models are still **metadata-only**; the binary meshes are not imported or stored. Site-selection artwork is schematic and does not provide a geospatial campus model. Doors and vertical connectors are editor data objects for reference/implementation, not physically simulated openings or escalator geometry. Cross-floor routing is calculated by the connected navigation graph, not inferred from 3D geometry. Browser-local saving does not synchronize between users or devices.

### Test commands

```
node --check app.js
node --check experience.js
node --check three-view.js
node tests/test-core.js
node tests/test-experience.js
```

Render Static Site uses publish directory `.` and no install or build process. `index.html` loads `styles.css`, `experience.css`, `three-view.js`, `app.js`, and `experience.js` with relative paths; images are in `assets/`. The URL is `https://innav-environment-editor.onrender.com/` once the corresponding commit is deployed.

## October 2026 feedback update

- **Floor stack:** the level list has independent vertical scrolling. Click a floor to select it; the panel no longer clips long buildings.
- **3D:** only the *selected floor* is rendered, with orbit/pivot and free-fly camera modes intact. Change levels using the floor picker or right-hand floor list. This is a schematic floor extrusion, not a mesh import.
- **Route preview:** the editor's **Route preview** action opens the route planner directly and, when possible, calculates a real route between default configured destinations. A disconnected graph produces an error instead of a fake success.
- **Pick endpoints:** in Runtime Preview use a room or destination dropdown, or click **Pick** beside Start/Destination, then click a room or destination marker on the 2D floor plan. Switch floors to pick endpoints on different levels. Room routes attach to the nearest navigation node on that floor within 240 plan units; if no node is nearby, the UI explains how to fix it. Routes use the actual graph and lift/stair links.
- **Data persistence:** all project data remains local in the browser unless exported; room-picked route endpoints are UI state and don't modify saved building geometry.

For QA, check a tall building (15+ levels), selecting a level in the stack and switching to 3D, picking rooms on two levels, calculating a connected route, changing the level to inspect route segments, and testing an intentionally disconnected graph. The included browser smoke test (`tests/smoke-feedback.py`) uses Playwright and Chromium and tests the client-side UI without a server.

## Floor stack and room picking (October 2026 correction)

- Floor Stack is a dedicated scrollable region with visible scrollbar and Up/Down controls. Click a floor card to open its 2D plan.
- The toolbar's **Route Preview** button switches to the 2D map even when invoked from Floor Stack or 3D.
- In Route Preview, click **Pick** next to Start or Destination, then click a room footprint or destination marker on the map. Use the floor selector to pick across floors.
- Regression test: `python tests/regression.py` (requires Playwright and Chromium). Test at 800×640, 1200×640 and 1536×864.