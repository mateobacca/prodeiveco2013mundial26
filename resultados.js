// ============================================================
//  Resultados — partidos terminados + chips de aciertos/errores
//  ------------------------------------------------------------
//  Cruce de dos fuentes (ver CLAUDE.md):
//   - Planilla (Google Sheets): manda. Un partido aparece cuando el admin
//     cargo el resultado L/E/V (col 1). De ahi salen el resultado oficial y
//     los chips (quien pego / quien erro), igual que la Tabla General.
//   - Worker/API: solo completa el MARCADOR (goles). Si no tiene el partido,
//     se muestra igual con el resultado, sin el numero exacto (degradacion).
//
//  Patron IIFE + window.ProdeResultados (testeable), como live.js.
// ============================================================
(function(){
  const SHEET_ID = "1RSSAMBkZoR6I1Pr7RkbAkLh4acx7eK7Nyx4LbSJYMic";
  const FECHAS = ["Fecha 1", "Fecha 2", "Fecha 3", "Play Off"];

  // URL del worker de resultados (BSD events finished). PLACEHOLDER: reemplazar
  // por la URL real al desplegar workers/resultados-worker.js. Mientras tanto,
  // en localhost se puede probar con ?resMock=1 (datos falsos, sin worker).
  const WORKER_RESULTADOS_URL = "https://prode-resultados.cayefa.workers.dev/";

  const POLL_MS = 90000;        // re-fetch en ventana de partido
  const WINDOW_MS = 2.5 * 60 * 60 * 1000;  // duracion estimada de un partido
  const RESULTADOS = { L: 1, E: 1, V: 1 };
  const RES_LABEL = { L: "Local", E: "Empate", V: "Visita" };

  let warnedFetchError = false;
  let pollTimer = null;

  // Datos de prueba para estilar sin worker (solo en localhost con ?resMock=1).
  const RES_MOCK = {
    count: 3,
    events: [
      { home_team:"Mexico",  away_team:"South Africa", home_score:2, away_score:0, status:"finished", event_date:"2026-06-11T19:00:00Z" },
      { home_team:"Korea Republic", away_team:"Czechia", home_score:3, away_score:1, status:"finished", event_date:"2026-06-12T02:00:00Z" },
      { home_team:"Canada",  away_team:"Bosnia",        home_score:1, away_score:1, status:"finished", event_date:"2026-06-12T19:00:00Z" }
    ]
  };

  // Alias canonicos para el cruce de nombres entre planilla y API.
  // La planilla usa "Republica Checa" / "Bosnia Herzegovina"; la API (via
  // TEAM_EN_ES de live.js) da "Chequia" / "Bosnia". Los unificamos.
  const CANON = {
    chequia: "chequia",
    republicacheca: "chequia",
    czechia: "chequia",
    czechrepublic: "chequia",
    bosnia: "bosnia",
    bosniaherzegovina: "bosnia",
    bosniayherzegovina: "bosnia",
    bosniaandherzegovina: "bosnia"
  };

  // ---- helpers de texto -------------------------------------------------
  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // minusculas, sin acentos, solo [a-z0-9] + alias canonicos.
  // Quita marcas de acento (rango combinante U+0300..U+036F) por codigo,
  // sin literales combinantes en el fuente.
  function normalizeName(name){
    const d = String(name == null ? "" : name).toLowerCase().normalize("NFD");
    let s = "";
    for(let i = 0; i < d.length; i++){
      const c = d.charCodeAt(i);
      if(c >= 0x300 && c <= 0x36f) continue;                 // marca de acento
      if((c >= 97 && c <= 122) || (c >= 48 && c <= 57)) s += d[i];  // a-z 0-9
    }
    return CANON[s] || s;
  }

  // Clave de partido (respeta orden local|visita).
  function matchKey(local, visita){
    return normalizeName(local) + "|" + normalizeName(visita);
  }

  // EN->ES usando el mapa de live.js (al momento de llamar, no de cargar).
  function toSpanishTeam(name){
    const f = (typeof window !== "undefined" && window.ProdeLive && window.ProdeLive.toSpanishTeam);
    return (f ? f(name) : null) || null;
  }

  // ---- API / worker -----------------------------------------------------
  function getEventsArray(data){
    if(!data) return [];
    if(Array.isArray(data)) return data;
    if(Array.isArray(data.events)) return data.events;
    if(Array.isArray(data.results)) return data.results;
    return [];
  }

  // Mapa matchKey -> { home, away, status, date } con los goles de la API.
  function indexGoals(events){
    const map = {};
    getEventsArray(events).forEach(ev => {
      if(!ev) return;
      const home = toSpanishTeam(ev.home_team) || ev.home_team;
      const away = toSpanishTeam(ev.away_team) || ev.away_team;
      map[matchKey(home, away)] = {
        home: ev.home_score,
        away: ev.away_score,
        status: ev.status,
        date: ev.event_date
      };
    });
    return map;
  }

  function getLocalMock(){
    const loc = typeof location !== "undefined" ? location : null;
    if(!loc) return null;
    const isLocal = loc.hostname === "localhost" || loc.hostname === "127.0.0.1";
    if(!isLocal) return null;
    return new URLSearchParams(loc.search || "").get("resMock") === "1" ? RES_MOCK : null;
  }

  async function fetchEvents(){
    const mock = getLocalMock();
    if(mock) return mock;
    const res = await fetch(WORKER_RESULTADOS_URL, { cache: "no-store" });
    if(!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  }

  // ---- planilla ---------------------------------------------------------
  async function cargarCSV(nombreHoja){
    const url =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombreHoja)}`;
    const texto = await fetch(url).then(r => r.text());
    return texto
      .trim()
      .split("\n")
      .map(f => f.split(",").map(celda => celda.trim().replace(/^"|"$/g, "")));
  }

  async function cargarHojas(){
    return Promise.all(
      FECHAS.map(fecha =>
        cargarCSV(fecha)
          .then(datos => ({ fecha, datos }))
          .catch(() => ({ fecha, datos: [] }))
      )
    );
  }

  // ---- cruce + logica de chips -----------------------------------------
  function jugadoresDeFecha(datos){
    return (datos[0] || [])
      .slice(2)
      .map(j => String(j == null ? "" : j).trim())
      .filter(Boolean);
  }

  // Verdes = pegaron el resultado; rojos = erraron. Sin pronostico => ninguno.
  function computeChips(fila, jugadores, resultado){
    const ok = [], bad = [];
    jugadores.forEach((jugador, index) => {
      const pronostico = fila[index + 2];
      if(!pronostico) return;
      if(pronostico === resultado) ok.push(jugador);
      else bad.push(jugador);
    });
    return { ok, bad };
  }

  // Recorre las hojas, toma las filas con resultado cargado (col1 en {L,E,V})
  // y arma la lista de partidos terminados con sus chips + goles (si los hay).
  function buildFinishedMatches(sheets, goals){
    const out = [];
    const mapaGoles = goals || {};

    (sheets || []).forEach(({ fecha, datos }) => {
      if(!datos || datos.length < 2) return;
      const jugadores = jugadoresDeFecha(datos);

      for(let i = 1; i < datos.length; i++){
        const fila = datos[i];
        const partido = fila[0];
        const resultado = fila[1];
        if(!partido || !RESULTADOS[resultado]) continue;   // sin cargar => no terminado

        const partes = String(partido).split(/\s+vs\.?\s+/i);
        if(partes.length !== 2) continue;
        const local = partes[0].trim();
        const visita = partes[1].trim();

        const { ok, bad } = computeChips(fila, jugadores, resultado);
        const g = mapaGoles[matchKey(local, visita)] || null;
        const tieneGoles = g && Number.isFinite(g.home) && Number.isFinite(g.away);

        if(tieneGoles){
          // Aviso si la API y la planilla discrepan (posible error de carga).
          const derivado = g.home > g.away ? "L" : (g.home < g.away ? "V" : "E");
          if(derivado !== resultado){
            console.warn(`[resultados] ${partido}: planilla=${resultado} pero API=${g.home}-${g.away} (${derivado})`);
          }
        }

        out.push({
          fecha, local, visita, resultado, ok, bad,
          goals: tieneGoles ? { home: g.home, away: g.away } : null,
          date: g && g.date ? g.date : null
        });
      }
    });

    return out;
  }

  // ---- render -----------------------------------------------------------
  function banderaDe(nombre){
    return typeof banderaImg === "function" ? banderaImg(nombre) : "";
  }
  function abrevDe(nombre){
    return typeof abrevPais === "function" ? abrevPais(nombre) : nombre;
  }

  // Equipo en dos versiones (CSS muestra una): desktop nombre completo,
  // mobile abreviatura. Bandera del lado externo en ambas.
  function teamHTML(nombre, lado){
    const flag = banderaDe(nombre);
    const nom = escapeHtml(nombre);
    const abr = escapeHtml(abrevDe(nombre));
    const full = lado === "visita"
      ? nom + (flag ? " " + flag : "")
      : (flag ? flag + " " : "") + nom;
    const corta = lado === "visita"
      ? abr + (flag ? " " + flag : "")
      : (flag ? flag + " " : "") + abr;
    return `<span class="partido-full">${full}</span><span class="partido-abbr">${corta}</span>`;
  }

  function scoreHTML(m){
    if(m.goals){
      return `<span class="res-score">` +
        `<span class="res-score__n">${escapeHtml(m.goals.home)}</span>` +
        `<span class="res-score__sep">-</span>` +
        `<span class="res-score__n">${escapeHtml(m.goals.away)}</span>` +
        `</span>`;
    }
    const label = RES_LABEL[m.resultado] || m.resultado;
    return `<span class="res-score res-score--pending" title="Resultado: ${escapeHtml(label)}">` +
      `<span class="res-badge res-badge--${escapeHtml(m.resultado)}">${escapeHtml(m.resultado)}</span>` +
      `</span>`;
  }

  function chipsHTML(m){
    const ok = m.ok.map(j => `<span class="res-chip res-chip--ok">${escapeHtml(j)}</span>`).join("");
    const bad = m.bad.map(j => `<span class="res-chip res-chip--bad">${escapeHtml(j)}</span>`).join("");
    if(!ok && !bad) return `<span class="res-chip res-chip--none">-</span>`;
    return ok + bad;
  }

  function matchRowHTML(m){
    return `<div class="res-match">` +
      `<div class="res-match__game">` +
        `<span class="res-team res-team--home">${teamHTML(m.local, "local")}</span>` +
        scoreHTML(m) +
        `<span class="res-team res-team--away">${teamHTML(m.visita, "visita")}</span>` +
      `</div>` +
      `<div class="res-match__chips" aria-label="Pegaron ${m.ok.length}, erraron ${m.bad.length}">${chipsHTML(m)}</div>` +
    `</div>`;
  }

  function renderHTML(matches){
    if(!matches || !matches.length){
      return `<p class="res-empty">Todavia no hay partidos terminados.</p>`;
    }
    const order = [];
    const byFecha = {};
    matches.forEach(m => {
      if(!byFecha[m.fecha]){ byFecha[m.fecha] = []; order.push(m.fecha); }
      byFecha[m.fecha].push(m);
    });
    return order.map(fecha => {
      const items = byFecha[fecha];
      const hint = `${items.length} ${items.length === 1 ? "partido" : "partidos"}`;
      return `<section class="card">` +
        `<div class="card__head">` +
          `<h2 class="card__title">${escapeHtml(fecha)}</h2>` +
          `<span class="card__hint">${hint}</span>` +
        `</div>` +
        `<div class="res-list">${items.map(matchRowHTML).join("")}</div>` +
      `</section>`;
    }).join("");
  }

  // ---- orquestacion + refresh ------------------------------------------
  function calendario(){
    return typeof CALENDARIO !== "undefined" ? CALENDARIO : [];
  }

  // Arma los horarios de inicio (en instante UTC) desde CALENDARIO.
  // Los horarios del calendario son ART (UTC-3): UTC = ART + 3h.
  function parseKickoffsUTC(cal){
    const kicks = [];
    (cal || []).forEach(f => (f.dias || []).forEach(d => {
      const md = /(\d{2})\/(\d{2})/.exec(d.dia || "");
      if(!md) return;
      const dd = +md[1], mo = +md[2];
      (d.partidos || []).forEach(p => {
        const mt = /(\d{1,2}):(\d{2})/.exec(p.hora || "");
        if(!mt) return;
        kicks.push(Date.UTC(2026, mo - 1, dd, +mt[1] + 3, +mt[2]));
      });
    }));
    return kicks;
  }

  // Hay algun partido en curso ahora? (kickoff <= now <= kickoff + 2.5h)
  function isWithinMatchWindow(now, cal, windowMs){
    const dur = windowMs || WINDOW_MS;
    const t = (now instanceof Date) ? now.getTime() : now;
    return parseKickoffsUTC(cal).some(k => t >= k && t <= k + dur);
  }

  async function refresh(){
    let goals = {};
    try{
      goals = indexGoals(await fetchEvents());
      warnedFetchError = false;
    }catch(error){
      if(!warnedFetchError){
        warnedFetchError = true;
        console.warn("[resultados] No se pudieron cargar los goles:", error);
      }
    }

    const cont = document.getElementById("resultados");
    if(!cont) return;

    try{
      const sheets = await cargarHojas();
      cont.innerHTML = renderHTML(buildFinishedMatches(sheets, goals));
    }catch(error){
      console.warn("[resultados] No se pudo cargar la planilla:", error);
      cont.innerHTML = `<p class="res-empty">No se pudieron cargar los resultados.</p>`;
    }
  }

  function scheduleNext(){
    clearTimeout(pollTimer);
    pollTimer = null;
    if(typeof document !== "undefined" && document.hidden) return;
    if(isWithinMatchWindow(Date.now(), calendario())){
      pollTimer = setTimeout(tick, POLL_MS);
    }
  }

  async function tick(){
    await refresh();
    scheduleNext();
  }

  function init(){
    refresh().finally(() => { if(window.Loader) window.Loader.done(); });
    scheduleNext();
    document.addEventListener("visibilitychange", () => {
      if(document.hidden){ clearTimeout(pollTimer); pollTimer = null; return; }
      if(isWithinMatchWindow(Date.now(), calendario())) tick();
    });
  }

  window.ProdeResultados = {
    normalizeName,
    matchKey,
    indexGoals,
    computeChips,
    buildFinishedMatches,
    renderHTML,
    matchRowHTML,
    isWithinMatchWindow,
    parseKickoffsUTC
  };

  if(typeof document !== "undefined"){
    document.addEventListener("DOMContentLoaded", init);
  }
})();
