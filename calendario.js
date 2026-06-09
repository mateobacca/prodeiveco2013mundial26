// ============================================================
//  Calendario de la fase de grupos + televisación (TV Argentina)
//  Datos transcritos de las infografías de @puntaje_ideal.
//  Pendiente: Fecha 1 (falta su infografía).
// ============================================================

// Canales de TV. Por ahora solo el label (placeholder de texto);
// los iconos se agregan después.
const CANALES = {
  dsports:     { label:"DSports" },
  dsports2:    { label:"DSports 2" },
  dsportsplus: { label:"DSports+" },
  tyc:         { label:"TyC Sports" },
  telefe:      { label:"Telefe" },
  disney:      { label:"Disney+" },
  tvp:         { label:"TV Pública" },
  flow:        { label:"Flow Sports" },
  movistar:    { label:"Movistar" },
  red:         { label:"RED" }
};

const CALENDARIO = [
  {
    fecha: "Fecha 1",
    dias: [
      { dia:"Jueves 11/06", partidos:[
        { hora:"16:00", local:"México",         visita:"Sudáfrica",      canales:["dsports","telefe","disney"] },
        { hora:"23:00", local:"Corea del Sur",  visita:"Chequia",        canales:["dsports","tyc"] }
      ]},
      { dia:"Viernes 12/06", partidos:[
        { hora:"16:00", local:"Canadá",         visita:"Bosnia",         canales:["dsports"] },
        { hora:"22:00", local:"Estados Unidos", visita:"Paraguay",       canales:["dsports","tyc","telefe","disney"] }
      ]},
      { dia:"Sábado 13/06", partidos:[
        { hora:"16:00", local:"Qatar",          visita:"Suiza",          canales:["dsports"] },
        { hora:"19:00", local:"Brasil",         visita:"Marruecos",      canales:["dsports","telefe","disney"] },
        { hora:"22:00", local:"Haití",          visita:"Escocia",        canales:["dsports","tyc"] }
      ]},
      { dia:"Domingo 14/06", partidos:[
        { hora:"01:00", local:"Australia",      visita:"Turquía",        canales:["dsports","tyc"] },
        { hora:"14:00", local:"Alemania",       visita:"Curazao",        canales:["dsports"] },
        { hora:"17:00", local:"Países Bajos",   visita:"Japón",          canales:["dsports2","tyc","telefe","disney"] },
        { hora:"20:00", local:"Costa de Marfil",visita:"Ecuador",        canales:["dsports","telefe","disney"] },
        { hora:"23:00", local:"Suecia",         visita:"Túnez",          canales:["dsports","tyc"] }
      ]},
      { dia:"Lunes 15/06", partidos:[
        { hora:"13:00", local:"España",         visita:"Cabo Verde",     canales:["dsports"] },
        { hora:"16:00", local:"Bélgica",        visita:"Egipto",         canales:["dsports2","tyc"] },
        { hora:"19:00", local:"Arabia Saudita", visita:"Uruguay",        canales:["dsports","tyc","telefe","disney"] },
        { hora:"22:00", local:"Irán",           visita:"Nueva Zelanda",  canales:["dsports","tyc"] }
      ]},
      { dia:"Martes 16/06", partidos:[
        { hora:"16:00", local:"Francia",        visita:"Senegal",        canales:["dsports"] },
        { hora:"19:00", local:"Irak",           visita:"Noruega",        canales:["dsports2","tyc"] },
        { hora:"22:00", local:"Argentina",      visita:"Argelia",        canales:["dsports","tyc","tvp","telefe","disney"], destacado:true }
      ]},
      { dia:"Miércoles 17/06", partidos:[
        { hora:"01:00", local:"Austria",        visita:"Jordania",       canales:["dsports","tyc"] },
        { hora:"14:00", local:"Portugal",       visita:"RD Congo",       canales:["dsports"] },
        { hora:"17:00", local:"Inglaterra",     visita:"Croacia",        canales:["dsports","tyc","telefe","disney"] },
        { hora:"20:00", local:"Ghana",          visita:"Panamá",         canales:["dsports2","tyc"] },
        { hora:"23:00", local:"Uzbekistán",     visita:"Colombia",       canales:["dsports","tyc"] }
      ]}
    ]
  },
  {
    fecha: "Fecha 2",
    dias: [
      { dia:"Jueves 18/06", partidos:[
        { hora:"13:00", local:"Chequia",        visita:"Sudáfrica",       canales:["dsports","tyc"] },
        { hora:"16:00", local:"Suiza",          visita:"Bosnia",          canales:["dsports","telefe","disney"] },
        { hora:"19:00", local:"Canadá",         visita:"Qatar",           canales:["dsports"] },
        { hora:"22:00", local:"México",         visita:"Corea del Sur",   canales:["dsports","tyc"] }
      ]},
      { dia:"Viernes 19/06", partidos:[
        { hora:"16:00", local:"Estados Unidos", visita:"Australia",       canales:["dsports","tyc"] },
        { hora:"19:00", local:"Escocia",        visita:"Marruecos",       canales:["dsports","telefe","disney"] },
        { hora:"21:30", local:"Brasil",         visita:"Haití",           canales:["dsports","tyc"] },
        { hora:"23:59", local:"Turquía",        visita:"Paraguay",        canales:["dsports"] }
      ]},
      { dia:"Sábado 20/06", partidos:[
        { hora:"14:00", local:"Países Bajos",   visita:"Suecia",          canales:["dsports","tyc"] },
        { hora:"17:00", local:"Alemania",       visita:"Costa de Marfil", canales:["dsports","tyc","telefe","disney"] },
        { hora:"21:00", local:"Ecuador",        visita:"Curazao",         canales:["dsports"] }
      ]},
      { dia:"Domingo 21/06", partidos:[
        { hora:"01:00", local:"Túnez",          visita:"Japón",           canales:["dsports"] },
        { hora:"13:00", local:"España",         visita:"Arabia Saudita",  canales:["dsports","tyc","telefe","disney"] },
        { hora:"16:00", local:"Bélgica",        visita:"Irán",            canales:["dsports2"] },
        { hora:"19:00", local:"Uruguay",        visita:"Cabo Verde",      canales:["dsports","telefe","disney"] },
        { hora:"22:00", local:"Nueva Zelanda",  visita:"Egipto",          canales:["dsports","tyc"] }
      ]},
      { dia:"Lunes 22/06", partidos:[
        { hora:"14:00", local:"Argentina",      visita:"Austria",         canales:["dsports","tyc","tvp","telefe","disney"], destacado:true },
        { hora:"18:00", local:"Francia",        visita:"Irak",            canales:["dsports"] },
        { hora:"21:00", local:"Noruega",        visita:"Senegal",         canales:["dsports","tyc"] },
        { hora:"23:59", local:"Jordania",       visita:"Argelia",         canales:["dsports"] }
      ]},
      { dia:"Martes 23/06", partidos:[
        { hora:"14:00", local:"Portugal",       visita:"Uzbekistán",      canales:["dsports","tyc","telefe","disney"] },
        { hora:"17:00", local:"Inglaterra",     visita:"Ghana",           canales:["dsports","telefe","disney"] },
        { hora:"20:00", local:"Panamá",         visita:"Croacia",         canales:["dsports2","tyc"] },
        { hora:"23:00", local:"Colombia",       visita:"RD Congo",        canales:["dsports"] }
      ]}
    ]
  },
  {
    fecha: "Fecha 3",
    dias: [
      { dia:"Miércoles 24/06", partidos:[
        { hora:"16:00", local:"Suiza",          visita:"Canadá",          canales:["dsports","tyc"] },
        { hora:"16:00", local:"Bosnia",         visita:"Qatar",           canales:["dsports2"] },
        { hora:"19:00", local:"Escocia",        visita:"Brasil",          canales:["dsports","telefe","disney"] },
        { hora:"19:00", local:"Marruecos",      visita:"Haití",           canales:["dsportsplus","tyc"] },
        { hora:"22:00", local:"Chequia",        visita:"México",          canales:["dsports"] },
        { hora:"22:00", local:"Sudáfrica",      visita:"Corea del Sur",   canales:["dsportsplus","tyc"] }
      ]},
      { dia:"Jueves 25/06", partidos:[
        { hora:"17:00", local:"Ecuador",        visita:"Alemania",        canales:["dsports","tyc","telefe","disney"] },
        { hora:"17:00", local:"Curazao",        visita:"Costa de Marfil", canales:["dsports2"] },
        { hora:"20:00", local:"Túnez",          visita:"Países Bajos",    canales:["dsports","tvp"] },
        { hora:"20:00", local:"Japón",          visita:"Suecia",          canales:["dsportsplus","tyc"] },
        { hora:"23:00", local:"Turquía",        visita:"Estados Unidos",  canales:["dsports","tyc"] },
        { hora:"23:00", local:"Paraguay",       visita:"Australia",       canales:["dsports2","telefe","disney"] }
      ]},
      { dia:"Viernes 26/06", partidos:[
        { hora:"16:00", local:"Noruega",        visita:"Francia",         canales:["dsports","tyc","telefe","disney"] },
        { hora:"16:00", local:"Senegal",        visita:"Irak",            canales:["dsports2"] },
        { hora:"21:00", local:"Uruguay",        visita:"España",          canales:["dsports","tyc","telefe","disney"] },
        { hora:"21:00", local:"Cabo Verde",     visita:"Arabia Saudita",  canales:["dsports2"] },
        { hora:"23:59", local:"Nueva Zelanda",  visita:"Bélgica",         canales:["dsports"] },
        { hora:"23:59", local:"Egipto",         visita:"Irán",            canales:["dsportsplus","tyc"] }
      ]},
      { dia:"Sábado 27/06", partidos:[
        { hora:"18:00", local:"Panamá",         visita:"Inglaterra",      canales:["dsports","tyc","tvp"] },
        { hora:"18:00", local:"Croacia",        visita:"Ghana",           canales:["dsportsplus","flow","movistar","red"] },
        { hora:"20:30", local:"Colombia",       visita:"Portugal",        canales:["dsports2"] },
        { hora:"20:30", local:"RD Congo",       visita:"Uzbekistán",      canales:["dsportsplus","tyc"] },
        { hora:"23:00", local:"Jordania",       visita:"Argentina",       canales:["dsports","tyc","tvp","telefe","disney"], destacado:true },
        { hora:"23:00", local:"Argelia",        visita:"Austria",         canales:["dsportsplus","flow","movistar","red"] }
      ]}
    ]
  }
];

// Partido con banderas. Dos versiones (toggle por CSS): desktop con
// nombres completos, mobile con abreviaturas. Bandera en ambas.
function equipos(local, visita){
  const bl = banderaImg(local), bv = banderaImg(visita);
  const vs = `<span class="match__vs">vs</span>`;
  const full = (bl ? bl + " " : "") + local + " " + vs + " " + visita + (bv ? " " + bv : "");
  const abbr = (bl ? bl + " " : "") + abrevPais(local) + " " + vs + " " + abrevPais(visita) + (bv ? " " + bv : "");
  return `<span class="partido-full">${full}</span><span class="partido-abbr">${abbr}</span>`;
}

function chips(canales){
  return canales
    .map(c => `<span class="chan">${(CANALES[c] || { label:c }).label}</span>`)
    .join("");
}

function render(){

  let html = "";

  for(const f of CALENDARIO){

    html += `<section class="card">
      <div class="card__head"><h2 class="card__title">${f.fecha}</h2></div>
      <div class="cal">`;

    for(const d of f.dias){

      html += `<div class="cal__day">
        <h3 class="cal__day-title">${d.dia}</h3>`;

      for(const p of d.partidos){
        html += `<div class="match${p.destacado ? " match--arg" : ""}">
          <span class="match__time">${p.hora}</span>
          <span class="match__teams">${equipos(p.local, p.visita)}</span>
          <span class="match__channels">${chips(p.canales)}</span>
        </div>`;
      }

      html += `</div>`;
    }

    html += `</div></section>`;
  }

  document.getElementById("calendario").innerHTML = html;
}

render();
