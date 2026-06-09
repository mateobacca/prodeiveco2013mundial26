const SHEET_ID = "1RSSAMBkZoR6I1Pr7RkbAkLh4acx7eK7Nyx4LbSJYMic";

// Estructura de la hoja "Especiales" (formato largo):
//  0:Participante 1:Categoria 2:Prediccion 3:Resultado 4:Puntos_posibles 5:Puntos_obtenidos

async function cargarCSV(nombreHoja){
  const url =
`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(nombreHoja)}`;

  const texto = await fetch(url).then(r => r.text());

  return texto
    .trim()
    .split("\n")
    .map(f =>
      f.split(",").map(celda => celda.trim().replace(/^"|"$/g, ""))
    );
}

function esc(s){
  return (s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

async function cargarEspeciales(){

  const datos = await cargarCSV("Especiales");

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
      obtenidos: isNaN(obtenidos) ? 0 : obtenidos
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
      ? `<span class="esp-result">Resultado: <strong>${esc(cat.resultado)}</strong></span>`
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
      const clase = acierto ? "ok" : (f.prediccion ? "" : "pending");
      const pred = f.prediccion ? esc(f.prediccion) : "—";

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
