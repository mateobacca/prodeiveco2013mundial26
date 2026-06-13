# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Prode Mundial | Iveco 2013" — a static, **no-build** vanilla HTML/CSS/JS site for a World Cup 2026 prediction pool (*prode*). UI text and most identifiers are in Argentine Spanish. Served as a GitHub Pages static site (remote: `mateobacca/prodeiveco2013mundial26`; the live module gates behavior on the `mateobacca.github.io` host). There is no framework, bundler, transpiler, or package.json.

## Commands

- **Run locally:** serve the folder over HTTP, e.g. `python -m http.server 8000`, then open `http://localhost:8000`. Use a server, not `file://` — the app relies on `fetch` and on `location.hostname` checks.
- **Tests:** `node live.test.js` — run from the repo root (it `readFileSync`s `paises.js` and `live.js` by relative path). Pure Node, zero dependencies; it loads those scripts into a mock-DOM `vm` context and asserts. Only `live.js` + `paises.js` are covered; the rest of the app has no tests.
- **Lint/format:** none configured.

## Architecture

Three independent pages, each an HTML file that loads its own entry-point script plus shared scripts. There are no JS modules or imports — every file is a `<script>` that talks to others through **globals on `window`** and shared function names.

| Page | Entry script | Purpose |
|------|-------------|---------|
| `index.html` | `app.js` | Main dashboard: Tabla General, Ranking por Fecha, Pronósticos, Probabilidades |
| `calendario.html` | `calendario.js` | Group-stage fixtures + Argentine TV channels (hardcoded data) |
| `especiales.html` | `especiales.js` | Special predictions table |

Shared across pages: `theme.js` (light/dark, applied in `<head>` to avoid FOUC; persists to `localStorage["prode-theme"]`; sets `data-theme` on `<html>`), `loader.js` (loading screen; exposes `window.Loader.done()`, min 2s display), `nav.js` (mobile nav toggle), `paises.js` (country → flag + abbreviation; exposes `banderaImg()` and `abrevPais()` globals).

## Data sources

1. **Google Sheets as CSV** (`SHEET_ID` constant — duplicated in `app.js` and `especiales.js`, keep in sync). Fetched via `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=<name>`. Relevant sheets: `Fecha 1`–`Fecha 3`, `Play Off`, `<Fecha> %` (probabilities), `Especiales`. **CSV parsing is naive** (`split("\n")` then `split(",")`) — it assumes no commas, quotes, or newlines inside cells.
2. **Live scores:** Cloudflare Worker at `https://prode-live.cayefa.workers.dev/`, polled every 30s by `live.js`. Only matches with `status === "inprogress"` are shown.

### Sheet data model (important)

- **Fecha sheets:** row 0 = headers; col 0 = match (`"Local vs Visitante"`); col 1 = result (`L`/`E`/`V`, or empty = not played); cols 2+ = one column per player holding that player's pick. Player list is derived from header cols 2+. A point is scored when a player's pick equals col 1.
- **Especiales sheet** (long format): `0:Participante 1:Categoria 2:Prediccion 3:Resultado 4:Puntos_posibles 5:Puntos_obtenidos`.
- **Tabla General** = sum of all Fecha points + Especiales points, but Especiales points are only counted for players who also appear in the Fecha sheets (`jugadoresActivos` filter in `cargarGeneral`).

## Conventions and gotchas

- **Three separate country-name maps.** `app.js` has `PAISES`; `paises.js` has `PAISES_BANDERAS` (used by `calendario.js` and `live.js`); `live.js` has `TEAM_EN_ES` (English→Spanish, because the live API returns English names) plus `LIVE_ABBR` overrides. Adding/renaming a country often means editing more than one map. The source data contains the typo `"Agentina"` — it is kept intentionally as a key; don't "fix" it.
- **Responsive rendering is done in markup, not JS.** Match/team helpers emit *both* a `.partido-full` span (desktop: full names + flags) and a `.partido-abbr` span (mobile: 3-letter abbreviations); CSS shows one or the other via `@media (max-width:640px)`. When generating team/match HTML, follow this dual-span pattern rather than branching on viewport in JS.
- **Theming via CSS custom properties.** Tokens live in `:root` in `style.css`; dark mode overrides live under `[data-theme="dark"]`. Prefer adding/adjusting tokens over hardcoding colors.
- **Cache-busting is manual.** HTML references assets with `?v=N` query strings (e.g. `style.css?v=18`, `app.js?v=4`). Version numbers are **per-file and not in sync** with each other. When you change a file, bump its `?v=` in *every* HTML page that references it, or GitHub Pages/browser caches will serve the old version.
- **Local live-banner mock:** on `localhost`/`127.0.0.1`, append `?liveMock=1` to render a fake in-progress match (`LOCAL_MOCK_DATA` in `live.js`) without calling the Worker. Useful for styling the live scoreboard (the focus of recent commits).
- `live.js` is wrapped in an IIFE and exposes its testable API as `window.ProdeLive`; mirror that pattern if you add testable logic there, and extend `live.test.js`.
