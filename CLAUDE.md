# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Prode Mundial | Iveco 2013" — a static, **no-build** vanilla HTML/CSS/JS site for a World Cup 2026 prediction pool (*prode*). UI text and most identifiers are in Argentine Spanish. Served as a GitHub Pages static site (remote: `mateobacca/prodeiveco2013mundial26`; the live module gates behavior on the `mateobacca.github.io` host). There is no framework, bundler, transpiler, or package.json.

## Commands

- **Run locally:** serve the folder over HTTP, e.g. `python -m http.server 8000`, then open `http://localhost:8000`. Use a server, not `file://` — the app relies on `fetch` and on `location.hostname` checks.
- **Tests:** `node live.test.js` and `node resultados.test.js` — run from the repo root (they `readFileSync` the relevant scripts by relative path). Pure Node, zero dependencies; each loads scripts into a mock-DOM `vm` context and asserts (`resultados.test.js` loads `paises.js`+`live.js`+`resultados.js`). Covered: `live.js`, `paises.js`, `resultados.js`; the rest of the app has no tests. Note: values returned from the `vm` realm need a `JSON` round-trip before `deepStrictEqual` (different prototypes) — see the `plain()` helper.
- **Lint/format:** none configured.

## Architecture

Four independent pages, each an HTML file that loads its own entry-point script plus shared scripts. There are no JS modules or imports — every file is a `<script>` that talks to others through **globals on `window`** and shared function names.

| Page | Entry script | Purpose |
|------|-------------|---------|
| `index.html` | `app.js` | Main dashboard: Tabla General, Ranking por Fecha, Pronósticos, Probabilidades |
| `calendario.html` | `calendario.js` | Group-stage fixtures + Argentine TV channels (hardcoded data) |
| `especiales.html` | `especiales.js` | Special predictions table |
| `resultados.html` | `resultados.js` | Finished matches: score (from a worker) + green/red chips of who got each result right/wrong (from the Sheet) |

Shared across pages: `theme.js` (light/dark, applied in `<head>` to avoid FOUC; persists to `localStorage["prode-theme"]`; sets `data-theme` on `<html>`), `loader.js` (loading screen; exposes `window.Loader.done()`, min 2s display), `nav.js` (mobile nav toggle), `paises.js` (country → flag + abbreviation; exposes `banderaImg()` and `abrevPais()` globals).

## Data sources

1. **Google Sheets as CSV** (`SHEET_ID` constant — duplicated in `app.js`, `especiales.js`, and `resultados.js`, keep in sync). Fetched via `https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=<name>`. Relevant sheets: `Fecha 1`–`Fecha 3`, `Play Off`, `<Fecha> %` (probabilities), `Especiales`. **CSV parsing is naive** (`split("\n")` then `split(",")`) — it assumes no commas, quotes, or newlines inside cells.
2. **Live scores:** Cloudflare Worker at `https://prode-live.cayefa.workers.dev/`, polled every 30s by `live.js`. Only matches with `status === "inprogress"` are shown.
3. **Finished results:** a *second* Cloudflare Worker (source in `workers/resultados-worker.js`, deployed separately — **not** served by Pages) wrapping the BSD Sports API `GET /api/v2/events/?league_id=27&season_id=188&status=finished`. World Cup 2026 = `league_id=27`, `season_id=188` (the `season_id` bypasses the API's default 7-day window → whole tournament in one call). Auth is a header `Authorization: Token <key>` (DRF token; same key the live worker uses, kept as a Worker secret `BSD_API_KEY`). `resultados.js` calls it **only to fill in goal counts** — the match list, official result, and chips come from the Sheet, so the page still works if the worker is down. Set the deployed URL in `resultados.js` (`WORKER_RESULTADOS_URL`).

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
- `live.js` is wrapped in an IIFE and exposes its testable API as `window.ProdeLive`; mirror that pattern if you add testable logic there, and extend `live.test.js`. `resultados.js` follows the same pattern (`window.ProdeResultados`, tested in `resultados.test.js`).
- **Sheet↔API name join (resultados).** The Sheet stores matches in Spanish (`"Local vs Visitante"`); the API returns English. `resultados.js` maps EN→ES via `ProdeLive.toSpanishTeam`, then joins on `normalizeName()` (lowercase, accent/space-stripped, plus a small `CANON` alias map because the Sheet says `"República Checa"`/`"Bosnia Herzegovina"` while the maps say `"Chequia"`/`"Bosnia"`). A match shows its goal count only if this join hits; otherwise it falls back to an `L`/`E`/`V` badge.
- **Results refresh is calendar-gated.** `resultados.js` only auto-polls (90s) while a match is in progress, using kickoff times parsed from `CALENDARIO` (treated as ART = UTC-3). That's why `resultados.html` also loads `calendario.js` — purely for the `CALENDARIO` global; `calendario.js`'s `render()` no-ops when `#calendario` is absent. Local mock: `?resMock=1` on localhost (like `?liveMock=1`).
