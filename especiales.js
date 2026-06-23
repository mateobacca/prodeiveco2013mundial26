const SHEET_ID = "1RSSAMBkZoR6I1Pr7RkbAkLh4acx7eK7Nyx4LbSJYMic";

// Estructura de la hoja "Especiales" (formato largo):
//  0:Participante 1:Categoria 2:Prediccion 3:Resultado 4:Puntos_posibles 5:Puntos_obtenidos
//  6:Chances opcional ("Si" / "No"). Las "No" se muestran tachadas.

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
  const estado = normalizarTexto(valor);
  if(estado === "si") return false;
  return estado === "sinchance" ||
    estado === "tachado" ||
    estado === "eliminado" ||
    estado === "eliminada" ||
    estado === "afuera" ||
    estado === "no" ||
    estado === "x" ||
    estado === "true" ||
    estado === "1";
}

function indiceColumna(headers, nombre, fallback){
  const buscado = normalizarTexto(nombre);
  const index = (headers || []).findIndex(h => normalizarTexto(h) === buscado);
  return index >= 0 ? index : fallback;
}

async function cargarEspeciales(){

  const datos = await cargarCSV("Especiales");
  const headers = datos[0] || [];
  const idxChances = indiceColumna(headers, "Chances", 6);

  // Agrupa por categoría preservando el orden de aparición.
  const categorias = new Map();

  for(let i = 1; i < datos.length; i++){
    const fila = datos[i];
    const participante = fila[0];
    const categoria    = fila[1];
    if(!participante || !categoria) continue;

    if(!categorias.has(categoria)){
      categorias.set(categoria, {
        posibles: parseInt(fila[4], 10) || 0,
        resultado: "",
        filas: []
      });
    }

    const cat = categorias.get(categoria);
    if(fila[3] && !cat.resultado) cat.resultado = fila[3];

    const obtenidos = parseInt(fila[5], 10);

    cat.filas.push({
      participante,
      prediccion: fila[2],
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
      const clase = acierto ? "ok" : (f.sinChance ? "out" : (f.prediccion ? "" : "pending"));
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
