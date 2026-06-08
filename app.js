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
    .map(f=>f.split(","));

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

function tablaRanking(puntos){

  const ranking =
    Object.entries(puntos)
      .sort((a,b)=>b[1]-a[1]);

  let html =
  `<table>
    <tr>
      <th>Pos</th>
      <th>Jugador</th>
      <th>Puntos</th>
    </tr>`;

  ranking.forEach((r,i)=>{

    html += `
      <tr>
        <td>${i+1}</td>
        <td>${r[0]}</td>
        <td>${r[1]}</td>
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
      tablaRanking(general);
}

async function cargarFecha(nombre){

  const datos =
    await cargarCSV(nombre);

  const puntos =
    calcularPuntos(datos);

  document.getElementById("fechaRanking")
    .innerHTML =
      tablaRanking(puntos);

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