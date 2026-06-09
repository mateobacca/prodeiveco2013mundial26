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

// Devuelve el partido en dos versiones (CSS muestra una u otra según pantalla):
//  - .partido-full  (desktop): [bandera] Local vs Visitante [bandera]
//  - .partido-abbr  (mobile):  ABR vs ABR, sin bandera
function formatPartido(texto){

  const partes = texto.split(/\s+vs\.?\s+/i);

  if(partes.length !== 2) return texto;

  const local  = partes[0].trim();
  const visita = partes[1].trim();
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

const general = {};

async function cargarCSV(nombreHoja){

  const url =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombreHoja)}`;

  const texto = await fetch(url).then(r=>r.text());

  const filas = texto
    .trim()
    .split("\n")
    .map(f =>
      f.split(",").map(celda => celda.trim().replace(/^"|"$/g, ""))
    );

  return filas;
}

function calcularPuntos(datos){

  const encabezados = datos[0];
  const jugadores = encabezados.slice(2);

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

    // resalta el podio (top 3 puestos)
    const clasePodio = pos <= 3 ? ` class="top-${pos}"` : "";

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
// Hoja en formato largo: 0:Participante ... 5:Puntos_obtenidos
async function puntosEspeciales(){

  const datos = await cargarCSV("Especiales");

  const total = {};

  for(let i=1;i<datos.length;i++){

    const fila = datos[i];
    const jugador = fila[0];

    if(!jugador) continue;

    const pts = parseInt(fila[5],10);

    if(!total[jugador]) total[jugador]=0;
    if(!isNaN(pts)) total[jugador]+=pts;
  }

  return total;
}

async function cargarGeneral(){

  for(const fecha of FECHAS){

    const datos = await cargarCSV(fecha);

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

  html += "</table>";

  document.getElementById("pronosticos")
    .innerHTML = html;
}

document
.getElementById("fechaSelect")
.addEventListener("change",e=>{

  cargarFecha(e.target.value);

});

(async()=>{

  try{
    await cargarGeneral();
    await cargarFecha("Fecha 1");
  }finally{
    if(window.Loader) window.Loader.done();
  }

})();