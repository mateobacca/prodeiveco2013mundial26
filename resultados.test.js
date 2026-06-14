const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

// Contexto mock (como live.test.js). resultados.js es un IIFE que solo expone
// window.ProdeResultados; no toca el DOM al cargar (init corre en DOMContentLoaded,
// que aca es un no-op), asi que alcanza con un document/fetch falsos.
const context = {
  console: { log: console.log, warn() {} },
  document: {
    addEventListener() {},
    getElementById() { return null; }
  },
  setTimeout() {}, clearTimeout() {}, setInterval() {}, clearInterval() {},
  fetch() {},
  location: { hostname: "127.0.0.1", search: "" },
  URLSearchParams,
  window: {}
};

vm.createContext(context);
vm.runInContext(fs.readFileSync("paises.js", "utf8"), context);   // banderaImg / abrevPais
vm.runInContext(fs.readFileSync("live.js", "utf8"), context);     // window.ProdeLive.toSpanishTeam
vm.runInContext(fs.readFileSync("resultados.js", "utf8"), context);

const api = context.window.ProdeResultados;

// Los objetos/arrays creados dentro del vm tienen otro prototipo (otra realm),
// asi que deepStrictEqual contra literales de este archivo falla por prototipo.
// plain() los normaliza a esta realm conservando la comparacion estricta de valores.
const plain = v => JSON.parse(JSON.stringify(v));

// ---- normalizeName: unifica variantes planilla <-> API ----
assert.strictEqual(api.normalizeName("República Checa"), "chequia");
assert.strictEqual(api.normalizeName("Chequia"), "chequia");
assert.strictEqual(api.normalizeName("Czechia"), "chequia");
assert.strictEqual(api.normalizeName("Bosnia Herzegovina"), "bosnia");
assert.strictEqual(api.normalizeName("Bosnia"), "bosnia");
assert.strictEqual(api.normalizeName("México"), "mexico");
assert.strictEqual(api.normalizeName("Estados Unidos"), "estadosunidos");

// ---- matchKey ----
assert.strictEqual(api.matchKey("México", "Sudáfrica"), "mexico|sudafrica");
assert.strictEqual(api.matchKey("Corea del Sur", "República Checa"), "coreadelsur|chequia");

// ---- indexGoals: API (ingles) -> clave normalizada en espanol ----
const idx = api.indexGoals([
  { home_team: "Mexico", away_team: "South Africa", home_score: 2, away_score: 0, status: "finished" },
  { home_team: "Korea Republic", away_team: "Czechia", home_score: 3, away_score: 1, status: "finished" }
]);
assert.strictEqual(idx["mexico|sudafrica"].home, 2);
assert.strictEqual(idx["mexico|sudafrica"].away, 0);
// La clave de la API ("Korea Republic"/"Czechia") coincide con la de la planilla
// ("Corea del Sur"/"Republica Checa") tras normalizar -> el cruce funciona.
assert.strictEqual(idx["coreadelsur|chequia"].home, 3);
assert.strictEqual(idx["coreadelsur|chequia"].away, 1);

// ---- computeChips: verdes (pegaron) / rojos (erraron) ----
const jugadores = ["ALBER", "ALE", "CAYE"];
assert.deepStrictEqual(
  plain(api.computeChips(["México vs Sudáfrica", "L", "E", "L", "L"], jugadores, "L")),
  { ok: ["ALE", "CAYE"], bad: ["ALBER"] }
);
// Pronostico vacio => no cuenta para ningun chip.
assert.deepStrictEqual(
  plain(api.computeChips(["X vs Y", "E", "E", "", "V"], jugadores, "E")),
  { ok: ["ALBER"], bad: ["CAYE"] }
);

// ---- buildFinishedMatches: integracion planilla + goles ----
const sheets = [{
  fecha: "Fecha 1",
  datos: [
    ["PARTIDO", "RES", "ALBER", "ALE", "CAYE"],
    ["México vs Sudáfrica", "L", "E", "L", "L"],
    ["Corea del Sur vs República Checa", "V", "V", "E", "L"],
    ["Haití vs Escocia", "-", "V", "V", "V"]   // sin cargar => se ignora
  ]
}];
const matches = api.buildFinishedMatches(sheets, idx);
assert.strictEqual(matches.length, 2);

const m0 = matches[0];
assert.strictEqual(m0.fecha, "Fecha 1");
assert.strictEqual(m0.local, "México");
assert.strictEqual(m0.visita, "Sudáfrica");
assert.strictEqual(m0.resultado, "L");
assert.deepStrictEqual(plain(m0.goals), { home: 2, away: 0 });
assert.deepStrictEqual(plain(m0.ok), ["ALE", "CAYE"]);
assert.deepStrictEqual(plain(m0.bad), ["ALBER"]);

const m1 = matches[1];
assert.strictEqual(m1.local, "Corea del Sur");
assert.strictEqual(m1.resultado, "V");
assert.deepStrictEqual(plain(m1.goals), { home: 3, away: 1 });   // cruzo aunque difieran los nombres
assert.deepStrictEqual(plain(m1.ok), ["ALBER"]);
assert.deepStrictEqual(plain(m1.bad), ["ALE", "CAYE"]);

// Sin goles de la API => goals null (la pagina muestra el resultado, no el marcador).
const sinGoles = api.buildFinishedMatches(sheets, {});
assert.strictEqual(sinGoles[0].goals, null);

// ---- renderHTML / matchRowHTML ----
const html = api.renderHTML(matches);
assert.ok(html.includes("Fecha 1"));
assert.ok(html.includes("res-chip--ok"));
assert.ok(html.includes("res-chip--bad"));
assert.ok(html.includes("CAYE"));
assert.ok(html.includes("res-score__n"));   // marcador presente

// Partido sin marcador: badge del resultado en vez de numeros.
const pendiente = api.matchRowHTML({ fecha: "Fecha 1", local: "A", visita: "B", resultado: "V", ok: [], bad: [], goals: null });
assert.ok(pendiente.includes("res-score--pending"));
assert.ok(pendiente.includes("res-badge--V"));

// ---- isWithinMatchWindow / parseKickoffsUTC (horarios ART = UTC-3) ----
const cal = [{
  fecha: "Fecha 1",
  dias: [{ dia: "Jueves 11/06", partidos: [{ hora: "16:00", local: "A", visita: "B" }] }]
}];
// 16:00 ART = 19:00 UTC del 11/06/2026
assert.strictEqual(api.parseKickoffsUTC(cal)[0], Date.UTC(2026, 5, 11, 19, 0));
assert.strictEqual(api.isWithinMatchWindow(Date.UTC(2026, 5, 11, 20, 0), cal), true);   // 1h despues
assert.strictEqual(api.isWithinMatchWindow(Date.UTC(2026, 5, 11, 18, 0), cal), false);  // antes del inicio
assert.strictEqual(api.isWithinMatchWindow(Date.UTC(2026, 5, 11, 22, 0), cal), false);  // 3h despues (> 2.5h)

console.log("resultados tests passed");
