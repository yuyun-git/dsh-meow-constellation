# dsh-meow-constellation · Memory Constellation

A real-time 3D star map for [meow-memory](https://www.npmjs.com/package/meow-memory)'s seven-layer SQLite store. Drag to rotate, drag a star to move it, scroll to zoom, click a star to read the full memory and its metadata.

## Highlights

- **Seven layers** (`soul / user / rules / project / topic / fact / lesson`), each on its own concentric ring and depth plane, with its own colour and toggleable legend entry.
- **Draggable**: drag empty space to rotate the 3D view; drag an individual star to reposition it (reset restores the layout).
- **Click for detail**: layer/status badges, timestamps, importance stars, project, subcategory, goal, hit count, keywords, full content, related memories and copyable memory ID.
- **Live**: polls the host every 4s; repaints only when `memory.db` changes, preserving manual positions.
- **Filters**: full-text / keyword / project search, workspace switch, "include archived / stale" toggle.
- **Offline demo**: opening the HTML outside DSH falls back to built-in sample data.

## Install

Requires DSH ≥ 0.2.0-rc.1, Node ≥ 22.5 (`node:sqlite`) and `meow-memory`.

```bash
dsh plugin --profile desktop add dsh-meow-constellation --config.minimumReleaseAge=0
# local checkout
dsh plugin --profile desktop add file:/path/to/dsh-meow-constellation --config.minimumReleaseAge=0
```

Restart the DSH desktop app. A glowing orb appears bottom-right; click it or press `Alt+M`. `Esc` closes the overlay. The page is also served directly at `/meow-constellation/app`.

## Routes & safety

| Route | Purpose |
| --- | --- |
| `GET /meow-constellation/app` | star-map page (single file, inline CSS/JS) |
| `GET /meow-constellation/api/workspaces` | discovered workspaces that own a `memory.db` |
| `GET /meow-constellation/api/memories?dir=<abs>&all=1` | all seven layers + metadata |

The database is opened read-only and only `SELECT *` runs. `dir` must be one of the discovered workspace paths (no traversal). Routes are loopback-only so memory contents are never exposed to the LAN. Archived/stale rows are returned only with `all=1`.

## Development

```bash
npm run check
npm run smoke
```

MIT © 2026
