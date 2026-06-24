const SHEET_ID = "1RSSAMBkZoR6I1Pr7RkbAkLh4acx7eK7Nyx4LbSJYMic";

const FECHAS = [
  "Fecha 1",
  "Fecha 2",
  "Fecha 3",
  "Play Off"
];

// Países: código ISO (para la bandera de flagcdn en desktop) y abreviatura
// de 3 letras (para mobile). La clave es el nombre tal como viene en la
// planilla (incluye el typo "Agentina").
const PAISES = {
  "Agentina":           { codigo:"ar",     abbr:"ARG" },
  "Argentina":          { codigo:"ar",     abbr:"ARG" },
  "Alemania":           { codigo:"de",     abbr:"ALE" },
  "Arabia Saudita":     { codigo:"sa",     abbr:"ARA" },
  "Argelia":            { codigo:"dz",     abbr:"ALG" },
  "Australia":          { codigo:"au",     abbr:"AUS" },
  "Austria":            { codigo:"at",     abbr:"AUT" },
  "Bosnia Herzegovina": { codigo:"ba",     abbr:"BOS" },
  "Brasil":             { codigo:"br",     abbr:"BRA" },
  "Bélgica":            { codigo:"be",     abbr:"BEL" },
  "Cabo Verde":         { codigo:"cv",     abbr:"CAB" },
  "Canadá":             { codigo:"ca",     abbr:"CAN" },
  "Colombia":           { codigo:"co",     abbr:"COL" },
  "Corea del Sur":      { codigo:"kr",     abbr:"COR" },
  "Costa de Marfil":    { codigo:"ci",     abbr:"CDM" },
  "Croacia":            { codigo:"hr",     abbr:"CRO" },
  "Curazao":            { codigo:"cw",     abbr:"CUR" },
  "Ecuador":            { codigo:"ec",     abbr:"ECU" },
  "Egipto":             { codigo:"eg",     abbr:"EGI" },
  "Escocia":            { codigo:"gb-sct", abbr:"ESC" },
  "España":             { codigo:"es",     abbr:"ESP" },
  "Estados Unidos":     { codigo:"us",     abbr:"USA" },
  "Francia":            { codigo:"fr",     abbr:"FRA" },
  "Ghana":              { codigo:"gh",     abbr:"GHA" },
  "Haití":              { codigo:"ht",     abbr:"HAI" },
  "Inglaterra":         { codigo:"gb-eng", abbr:"ING" },
  "Irak":               { codigo:"iq",     abbr:"IRK" },
  "Irán":               { codigo:"ir",     abbr:"IRN" },
  "Japón":              { codigo:"jp",     abbr:"JAP" },
  "Jordania":           { codigo:"jo",     abbr:"JOR" },
  "Marruecos":          { codigo:"ma",     abbr:"MAR" },
  "México":             { codigo:"mx",     abbr:"MEX" },
  "Noruega":            { codigo:"no",     abbr:"NOR" },
  "Nueva Zelanda":      { codigo:"nz",     abbr:"NZL" },
  "Panamá":             { codigo:"pa",     abbr:"PAN" },
  "Paraguay":           { codigo:"py",     abbr:"PAR" },
  "Países Bajos":       { codigo:"nl",     abbr:"HOL" },
  "Portugal":           { codigo:"pt",     abbr:"POR" },
  "Qatar":              { codigo:"qa",     abbr:"QAT" },
  "RD Congo":           { codigo:"cd",     abbr:"RDC" },
  "República Checa":    { codigo:"cz",     abbr:"CHQ" },
  "Senegal":            { codigo:"sn",     abbr:"SEN" },
  "Sudáfrica":          { codigo:"za",     abbr:"SUD" },
  "Suecia":             { codigo:"se",     abbr:"SUE" },
  "Suiza":              { codigo:"ch",     abbr:"SUI" },
  "Turquía":            { codigo:"tr",     abbr:"TUR" },
  "Túnez":              { codigo:"tn",     abbr:"TUN" },
  "Uruguay":            { codigo:"uy",     abbr:"URU" },
  "Uzbekistán":         { codigo:"uz",     abbr:"UZB" }
};

// Alias de nombres de equipo: la planilla a veces escribe distinto un mismo
// país (p. ej. "Catar"). Los unificamos al nombre canónico que figura en
// PAISES para que coincida la bandera y se muestre siempre igual.
const ALIAS_EQUIPO = {
  "Catar": "Qatar"
};

function nombreCanonico(nombre){
  return ALIAS_EQUIPO[(nombre || "").trim()] || nombre;
}

// Devuelve el partido en dos versiones (CSS muestra una u otra según pantalla):
//  - .partido-full  (desktop): [bandera] Local vs Visitante [bandera]
//  - .partido-abbr  (mobile):  ABR vs ABR, sin bandera
function formatPartido(texto){

  const partes = texto.split(/\s+vs\.?\s+/i);

  if(partes.length !== 2) return texto;

  const local  = nombreCanonico(partes[0].trim());
  const visita = nombreCanonico(partes[1].trim());
  const L = PAISES[local]  || {};
  const V = PAISES[visita] || {};

  const bandera = (codigo) =>
    codigo
      ? `<img class="flag" src="https://flagcdn.com/${codigo}.svg" alt="" loading="lazy">`
      : "";

  const completo =
    (L.codigo ? bandera(L.codigo) + " " : "") + local +
    " vs " +
    visita + (V.codigo ? " " + bandera(V.codigo) : "");

  const abrev =
    (L.abbr || local) + " vs " + (V.abbr || visita);

  return `<span class="partido-full">${completo}</span>` +
         `<span class="partido-abbr">${abrev}</span>`;
}

// Un solo equipo con su bandera, para la tabla de Probabilidades.
//  - lado "local":  bandera a la izquierda del nombre
//  - lado "visita": bandera a la derecha del nombre
// Igual que formatPartido, emite versión full (desktop) y abreviada (mobile).
function equipoHTML(nombre, lado){

  nombre = nombreCanonico(nombre);

  const P = PAISES[nombre] || {};

  const bandera = P.codigo
    ? `<img class="flag" src="https://flagcdn.com/${P.codigo}.svg" alt="" loading="lazy">`
    : "";

  const abbr = P.abbr || nombre;

  const full = lado === "visita"
    ? nombre + (bandera ? " " + bandera : "")
    : (bandera ? bandera + " " : "") + nombre;

  // En este cuadro también queremos la banderita en la versión compacta.
  const corta = lado === "visita"
    ? abbr + (bandera ? " " + bandera : "")
    : (bandera ? bandera + " " : "") + abbr;

  return `<span class="partido-full">${full}</span>` +
         `<span class="partido-abbr">${corta}</span>`;
}

const general = {};

function jugadoresDeFecha(datos){

  const encabezados = datos[0] || [];

  return encabezados
    .slice(2)
    .map(jugador => jugador.trim())
    .filter(Boolean);
}

async function cargarCSV(nombreHoja){

  const url =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombreHoja)}`;

  const texto = await fetch(url).then(r=>r.text());

  const filas = texto
    .trim()
    .split("\n")
    .map(f =>
      f.split(",").map(celda => celda.trim().replace(/^"|"$/g, "").trim())
    );

  return filas;
}

function normalizarHeader(s){
  return (s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function indiceColumna(headers, nombre, fallback){
  const buscado = normalizarHeader(nombre);
  const index = (headers || []).findIndex(h => normalizarHeader(h) === buscado);
  return index >= 0 ? index : fallback;
}

function calcularPuntos(datos){

  const jugadores = jugadoresDeFecha(datos);

  const puntos = {};

  jugadores.forEach(j=>puntos[j]=0);

  for(let i=1;i<datos.length;i++){

    const fila = datos[i];
    const resultado = fila[1];

    if(!resultado) continue;

    jugadores.forEach((jugador,index)=>{

      const pronostico = fila[index+2];

      if(pronostico===resultado){
        puntos[jugador]++;
      }

    });
  }

  return puntos;
}

function tablaRanking(puntos, opciones = {}){

  const ranking =
    Object.entries(puntos)
      .sort((a,b)=>b[1]-a[1]);

  const maxPuntos = ranking.length ? ranking[0][1] : 0;

  let html =
  `<table>
    <tr>
      <th>Pos</th>
      <th>Jugador</th>
      <th>Puntos</th>
    </tr>`;

  ranking.forEach(([jugador, pts])=>{

    // posición de competición: los empatados comparten puesto (1,1,1,4...)
    const pos = ranking.findIndex(r=>r[1]===pts) + 1;

    // resalta el podio (top 3 puestos), solo si ya hay puntos en juego
    // (sin puntos están todos empatados en el 1° y no tiene sentido destacar)
    const clasePodio = (pos <= 3 && pts > 0) ? ` class="top-${pos}"` : "";

    // ícono para el/los líderes (mayor puntaje, > 0): 🥇 fecha, 🏆 general
    const esLider = opciones.iconoLider && pts === maxPuntos && pts > 0;
    const icono = esLider ? ` ${opciones.iconoLider}` : "";

    html += `
      <tr${clasePodio}>
        <td>${pos}</td>
        <td>${jugador}${icono}</td>
        <td>${pts}</td>
      </tr>
    `;

  });

  html += "</table>";

  return html;
}

// Suma de los Puntos_obtenidos de la hoja "Especiales" por participante.
// Se lee por encabezado para que columnas auxiliares como "Chances" no sumen.
async function puntosEspeciales(){

  const datos = await cargarCSV("Especiales");
  const headers = datos[0] || [];
  const idxParticipante = indiceColumna(headers, "Participante", 0);
  const idxPuntosObtenidos = indiceColumna(headers, "Puntos_obtenidos", 5);

  const total = {};

  for(let i=1;i<datos.length;i++){

    const fila = datos[i];
    const jugador = fila[idxParticipante];

    if(!jugador) continue;

    const pts = parseInt(fila[idxPuntosObtenidos],10);

    if(!total[jugador]) total[jugador]=0;
    if(!isNaN(pts)) total[jugador]+=pts;
  }

  return total;
}

async function cargarGeneral(){

  Object.keys(general).forEach(jugador => delete general[jugador]);

  const jugadoresActivos = new Set();

  for(const fecha of FECHAS){

    const datos = await cargarCSV(fecha);

    jugadoresDeFecha(datos)
      .forEach(jugador => jugadoresActivos.add(jugador));

    const puntosFecha =
      calcularPuntos(datos);

    Object.entries(puntosFecha)
      .forEach(([jugador,puntos])=>{

      if(!general[jugador])
        general[jugador]=0;

      general[jugador]+=puntos;

    });
  }

  // Suma los puntos de las predicciones especiales al acumulado general.
  const especiales = await puntosEspeciales();

  Object.entries(especiales)
    .forEach(([jugador,puntos])=>{

    if(!jugadoresActivos.has(jugador)) return;

    if(!general[jugador])
      general[jugador]=0;

    general[jugador]+=puntos;

  });

  document.getElementById("general")
    .innerHTML =
      tablaRanking(general, { iconoLider: "🏆" });
}

async function cargarFecha(nombre){

  const datos =
    await cargarCSV(nombre);

  const puntos =
    calcularPuntos(datos);

  document.getElementById("fechaRanking")
    .innerHTML =
      tablaRanking(puntos, { iconoLider: "🥇" });

  let html = "<table>";

  datos.forEach((fila, index) => {

    html += "<tr>";

    const resultado = fila[1];

fila.forEach((celda, colIndex) => {

  if(index === 0){

    html += `<th>${celda}</th>`;

  }else if(colIndex === 0){

    html += `<td class="partido">${formatPartido(celda)}</td>`;

  }else{

    let clase = "";

    if(colIndex >= 2){

      if(resultado === "L" ||
         resultado === "E" ||
         resultado === "V"){

        if(celda === resultado){
          clase = "ok";
        }else{
          clase = "bad";
        }
      }else{
        clase = "pending";
      }
    }

    html += `<td class="${clase}">${celda}</td>`;
  }

});

    html += "</tr>";

  });

  // Fila de totales: aciertos acumulados por jugador en esta fecha.
  const jugadores = jugadoresDeFecha(datos);

  html += "<tr class='totales'>";
  html += "<td class='partido'>Aciertos</td>";
  html += "<td></td>";                       // columna RES (sin total)

  jugadores.forEach(jugador=>{
    html += `<td>${puntos[jugador] ?? 0}</td>`;
  });

  html += "</tr>";

  html += "</table>";

  document.getElementById("pronosticos")
    .innerHTML = html;
}

// Normaliza el nombre de un partido para cruzar las hojas "<Fecha>" y
// "<Fecha> %", que a veces escriben distinto a un mismo equipo (p. ej.
// "Qatar" en una y "Catar" en la otra). Sin tildes, sin mayúsculas y sin
// espacios de más, además de un par de alias conocidos.
function normPartido(s){
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\bcatar\b/g, "qatar")
    .replace(/\s+/g, " ")
    .trim();
}

// Tabla de Probabilidades: lee la hoja "<Fecha> %" (porcentaje L/E/V según la
// sumatoria de pronósticos) y, cruzando con la hoja "<Fecha>", permite ver qué
// participantes eligieron cada opción al tocar el valor.
async function cargarProbabilidades(nombreFecha){

  const cont = document.getElementById("probabilidades");

  let pct, votos;

  try{
    [pct, votos] = await Promise.all([
      cargarCSV(nombreFecha + " %"),
      cargarCSV(nombreFecha)
    ]);
  }catch(e){
    cont.innerHTML =
      `<p class="prob__empty">No se pudieron cargar las probabilidades.</p>`;
    return;
  }

  // ¿Existe la hoja "<Fecha> %" con datos?
  const hayDatos =
    pct && pct.length > 1 &&
    pct[0] && pct[0][0] &&
    pct[0][0].toUpperCase().includes("PARTIDO");

  if(!hayDatos){
    cont.innerHTML =
      `<p class="prob__empty">Las probabilidades de ${nombreFecha} todavía no están cargadas.</p>`;
    return;
  }

  // Mapa partido -> { L:[jugadores], E:[...], V:[...] }
  const jugadores = jugadoresDeFecha(votos);
  const votosPorPartido = {};   // clave normalizada -> {L,E,V}
  const votosPorOrden = [];     // mismo orden en que aparecen los partidos

  for(let i=1;i<votos.length;i++){

    const fila = votos[i];
    const partido = fila[0];

    if(!partido) continue;

    const m = { L:[], E:[], V:[] };

    jugadores.forEach((jugador,idx)=>{
      const v = fila[idx+2];
      if(m[v]) m[v].push(jugador);
    });

    votosPorPartido[normPartido(partido)] = m;
    votosPorOrden.push(m);
  }

  let html = `
    <div class="prob__row prob__row--head">
      <div class="prob__th">L</div>
      <div></div>
      <div class="prob__th">E</div>
      <div></div>
      <div class="prob__th">V</div>
    </div>
  `;

  let orden = 0;

  for(let i=1;i<pct.length;i++){

    const fila = pct[i];
    const partido = fila[0];

    if(!partido) continue;

    const partes = partido.split(/\s+vs\.?\s+/i);
    const local  = (partes[0] || "").trim();
    const visita = (partes[1] || "").trim();

    const L = fila[1] || "", E = fila[2] || "", V = fila[3] || "";

    // resalta la opción más probable
    const nums = [L,E,V].map(p => parseFloat(p) || 0);
    const max  = Math.max(...nums);
    const fav  = (n) => (n === max && max > 0) ? " is-fav" : "";

    // Cruce por nombre normalizado; si la grafía difiere demasiado, cae al
    // mismo orden de aparición (ambas hojas listan los partidos igual).
    const m = votosPorPartido[normPartido(partido)] ||
              votosPorOrden[orden] ||
              { L:[], E:[], V:[] };
    orden++;
    const data = (arr) => arr.join("|");

    html += `
      <div class="prob__row">
        <button class="prob__pct prob__pct--l${fav(nums[0])}" data-opt="Local" data-voters="${data(m.L)}">${L}</button>
        <div class="prob__eq prob__eq--local">${equipoHTML(local,"local")}</div>
        <button class="prob__pct prob__pct--e${fav(nums[1])}" data-opt="Empate" data-voters="${data(m.E)}">${E}</button>
        <div class="prob__eq prob__eq--visita">${equipoHTML(visita,"visita")}</div>
        <button class="prob__pct prob__pct--v${fav(nums[2])}" data-opt="Visitante" data-voters="${data(m.V)}">${V}</button>
      </div>
      <div class="prob__detail" hidden></div>
    `;
  }

  cont.innerHTML = `<div class="prob">${html}</div>`;
}

// Al tocar un porcentaje, despliega los participantes que eligieron esa opción.
document
.getElementById("probabilidades")
.addEventListener("click", e=>{

  const btn = e.target.closest(".prob__pct");
  if(!btn) return;

  const row = btn.closest(".prob__row");
  const detail = row.nextElementSibling;

  if(!detail || !detail.classList.contains("prob__detail")) return;

  const yaActivo = btn.classList.contains("is-active") && !detail.hidden;

  row.querySelectorAll(".prob__pct")
     .forEach(b => b.classList.remove("is-active"));

  if(yaActivo){
    detail.hidden = true;
    detail.innerHTML = "";
    return;
  }

  btn.classList.add("is-active");

  const opt = btn.dataset.opt;
  const voters = (btn.dataset.voters || "").split("|").filter(Boolean);

  const chips = voters.length
    ? voters.map(v => `<span class="prob__chip">${v}</span>`).join("")
    : `<span class="prob__none">Nadie</span>`;

  detail.innerHTML =
    `<span class="prob__detail-label">${opt} (${voters.length}):</span> ${chips}`;
  detail.hidden = false;

});

document
.getElementById("fechaSelect")
.addEventListener("change",e=>{

  cargarFecha(e.target.value);
  cargarProbabilidades(e.target.value);

});

(async()=>{

  try{
    await cargarGeneral();
    await cargarFecha("Fecha 3");
    await cargarProbabilidades("Fecha 3");
  }finally{
    if(window.Loader) window.Loader.done();
  }

})();
