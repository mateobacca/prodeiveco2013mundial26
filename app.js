const SHEET_ID = "1RSSAMBkZoR6I1Pr7RkbAkLh4acx7eK7Nyx4LbSJYMic";

const FECHAS = [
  "Fecha 1",
  "Fecha 2",
  "Fecha 3",
  "Play Off"
];

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

  await cargarGeneral();

  await cargarFecha("Fecha 1");

})();