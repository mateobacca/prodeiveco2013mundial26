const SHEET_ID = "1RSSAMBkZoR6I1Pr7RkbAkLh4acx7eK7Nyx4LbSJYMic";

// Estructura de la hoja "Especiales" (formato largo). Se leen columnas por
// encabezado para que "Chances" no altere puntos si cambia de posicion.

async function cargarCSV(nombreHoja){
  const url =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombreHoja)}`;

  const texto = await fetch(url).then(r => r.text());

  return texto
    .trim()
    .split("\n")
    .map(f =>
      f.split(",").map(celda => celda.trim().replace(/^"|"$/g, "").trim())
    );
}

function esc(s){
  return (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

const NACIONALIDADES_JUGADORES = {
  "julian": "Argentina",
  "julián": "Argentina",
  "kane": "Inglaterra",
  "oyarzabal": "España",
  "oyarzábal": "España",
  "mbappe": "Francia",
  "mbappé": "Francia",
  "lautaro": "Argentina",
  "yamal": "España",
  "messi": "Argentina",
  "gakpo": "Países Bajos",
  "haaland": "Noruega",
  "enzo": "Argentina",
  "dibu": "Argentina",
  "bellingham": "Inglaterra"
};

function normalizarTexto(s){
  return (s || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function banderaPais(nombre){
  return (typeof banderaImg === "function") ? banderaImg(nombre) : "";
}

function paisDeJugador(nombre){
  const clave = normalizarTexto(nombre);
  return NACIONALIDADES_JUGADORES[clave] || "";
}

function prediccionConBandera(prediccion){
  if(!prediccion) return "—";

  const jugadorPais = paisDeJugador(prediccion);
  const pais = jugadorPais || prediccion;
  const bandera = banderaPais(pais);
  const tipo = jugadorPais ? "jugador" : "pais";
  const label = esc(prediccion);

  return bandera
    ? `<span class="esp-pred esp-pred--${tipo}">${bandera}<span>${label}</span></span>`
    : label;
}

function resultadoConBandera(resultado){
  if(!resultado) return "";

  const jugadorPais = paisDeJugador(resultado);
  const pais = jugadorPais || resultado;
  const bandera = banderaPais(pais);
  const label = esc(resultado);

  return bandera
    ? `${bandera}<strong>${label}</strong>`
    : `<strong>${label}</strong>`;
}

function esPrediccionSinChance(valor){
  return normalizarTexto(valor) === "no";
}

function indiceColumna(headers, nombre, fallback){
  const buscado = normalizarTexto(nombre);
  const index = (headers || []).findIndex(h => normalizarTexto(h) === buscado);
  return index >= 0 ? index : fallback;
}

async function cargarEspeciales(){

  const datos = await cargarCSV("Especiales");
  const headers = datos[0] || [];
  const idxParticipante = indiceColumna(headers, "Participante", 0);
  const idxCategoria = indiceColumna(headers, "Categoria", 1);
  const idxPrediccion = indiceColumna(headers, "Prediccion", 2);
  const idxResultado = indiceColumna(headers, "Resultado", 3);
  const idxPuntosPosibles = indiceColumna(headers, "Puntos_posibles", 4);
  const idxPuntosObtenidos = indiceColumna(headers, "Puntos_obtenidos", 5);
  const idxChances = indiceColumna(headers, "Chances", 6);

  // Agrupa por categoría preservando el orden de aparición.
  const categorias = new Map();

  for(let i = 1; i < datos.length; i++){
    const fila = datos[i];
    const participante = fila[idxParticipante];
    const categoria    = fila[idxCategoria];
    if(!participante || !categoria) continue;

    if(!categorias.has(categoria)){
      categorias.set(categoria, {
        posibles: parseInt(fila[idxPuntosPosibles], 10) || 0,
        resultado: "",
        filas: []
      });
    }

    const cat = categorias.get(categoria);
    if(fila[idxResultado] && !cat.resultado) cat.resultado = fila[idxResultado];

    const obtenidos = parseInt(fila[idxPuntosObtenidos], 10);

    cat.filas.push({
      participante,
      prediccion: fila[idxPrediccion],
      obtenidos: isNaN(obtenidos) ? 0 : obtenidos,
      sinChance: esPrediccionSinChance(fila[idxChances])
    });
  }

  let html = "";

  categorias.forEach((cat, nombre) => {

    // Orden: más puntos primero, luego alfabético.
    const filas = cat.filas.slice().sort((a, b) =>
      b.obtenidos - a.obtenidos ||
      a.participante.localeCompare(b.participante)
    );

    const resultado = cat.resultado
      ? `<span class="esp-result">Resultado: ${resultadoConBandera(cat.resultado)}</span>`
      : `<span class="esp-result">Resultado: a definir</span>`;

    html += `
      <section class="card">
        <div class="card__head">
          <h2 class="card__title">${esc(nombre)}</h2>
          ${resultado}
          <span class="esp-pts">${cat.posibles} pts</span>
        </div>
        <div class="tabla-scroll">
          <table class="esp-tabla">
            <tr><th>Jugador</th><th>Predicción</th><th>Pts</th></tr>`;

    filas.forEach(f => {
      const acierto = f.obtenidos > 0;
      const clase = f.sinChance ? "out" : (acierto ? "ok" : (f.prediccion ? "" : "pending"));
      const pred = prediccionConBandera(f.prediccion);

      html += `
            <tr>
              <td>${esc(f.participante)}</td>
              <td class="${clase}">${pred}</td>
              <td>${f.obtenidos}</td>
            </tr>`;
    });

    html += `
          </table>
        </div>
      </section>`;
  });

  document.getElementById("especiales").innerHTML = html;
}

cargarEspeciales().finally(() => {
  if(window.Loader) window.Loader.done();
});
