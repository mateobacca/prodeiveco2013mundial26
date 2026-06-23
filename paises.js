// ============================================================
//  Mapa de países para el calendario: código ISO (bandera de
//  flagcdn) + abreviatura de 3 letras (para mobile).
//  La clave es el nombre tal como aparece en los datos. Incluye
//  variantes: "Chequia"/"República Checa", "Bosnia"/"Bosnia
//  Herzegovina" y el typo "Agentina".
//  (Nota: la app principal tiene su propio mapa en app.js; si más
//  adelante se quiere, se pueden unificar en este archivo.)
// ============================================================
// `color` es el color identificador del equipo (kit/bandera). Lo usa el
// marcador en vivo para el puntito y la franja inferior. Editable por país.
const PAISES_BANDERAS = {
  "Agentina":           { codigo:"ar",     abbr:"ARG", color:"#75AADB" },
  "Argentina":          { codigo:"ar",     abbr:"ARG", color:"#75AADB" },
  "Alemania":           { codigo:"de",     abbr:"ALE", color:"#FFCE00" },
  "Arabia Saudita":     { codigo:"sa",     abbr:"ARA", color:"#1A7E3E" },
  "Argelia":            { codigo:"dz",     abbr:"ALG", color:"#007A3D" },
  "Australia":          { codigo:"au",     abbr:"AUS", color:"#FFCD00" },
  "Austria":            { codigo:"at",     abbr:"AUT", color:"#EF3340" },
  "Bosnia":             { codigo:"ba",     abbr:"BOS", color:"#FAD201" },
  "Bosnia Herzegovina": { codigo:"ba",     abbr:"BOS", color:"#FAD201" },
  "Brasil":             { codigo:"br",     abbr:"BRA", color:"#FFDF00" },
  "Bélgica":            { codigo:"be",     abbr:"BEL", color:"#FDDA24" },
  "Cabo Verde":         { codigo:"cv",     abbr:"CAB", color:"#003893" },
  "Canadá":             { codigo:"ca",     abbr:"CAN", color:"#D52B1E" },
  "Chequia":            { codigo:"cz",     abbr:"CHQ", color:"#D7141A" },
  "Colombia":           { codigo:"co",     abbr:"COL", color:"#FCD116" },
  "Corea del Sur":      { codigo:"kr",     abbr:"COR", color:"#CD2E3A" },
  "Costa de Marfil":    { codigo:"ci",     abbr:"CDM", color:"#FF8200" },
  "Croacia":            { codigo:"hr",     abbr:"CRO", color:"#D81E05" },
  "Curazao":            { codigo:"cw",     abbr:"CUR", color:"#002B7F" },
  "Ecuador":            { codigo:"ec",     abbr:"ECU", color:"#FFD100" },
  "Egipto":             { codigo:"eg",     abbr:"EGI", color:"#CE1126" },
  "Escocia":            { codigo:"gb-sct", abbr:"ESC", color:"#005EB8" },
  "España":             { codigo:"es",     abbr:"ESP", color:"#C60B1E" },
  "Estados Unidos":     { codigo:"us",     abbr:"USA", color:"#B31942" },
  "Francia":            { codigo:"fr",     abbr:"FRA", color:"#0055A4" },
  "Ghana":              { codigo:"gh",     abbr:"GHA", color:"#FCD116" },
  "Haití":              { codigo:"ht",     abbr:"HAI", color:"#00209F" },
  "Inglaterra":         { codigo:"gb-eng", abbr:"ING", color:"#CE1124" },
  "Irak":               { codigo:"iq",     abbr:"IRK", color:"#007A3D" },
  "Irán":               { codigo:"ir",     abbr:"IRN", color:"#239F40" },
  "Japón":              { codigo:"jp",     abbr:"JAP", color:"#002D62" },
  "Jordania":           { codigo:"jo",     abbr:"JOR", color:"#CE1126" },
  "Marruecos":          { codigo:"ma",     abbr:"MAR", color:"#C1272D" },
  "México":             { codigo:"mx",     abbr:"MEX", color:"#006847" },
  "Noruega":            { codigo:"no",     abbr:"NOR", color:"#BA0C2F" },
  "Nueva Zelanda":      { codigo:"nz",     abbr:"NZL", color:"#E9E9E9" },
  "Panamá":             { codigo:"pa",     abbr:"PAN", color:"#D21034" },
  "Paraguay":           { codigo:"py",     abbr:"PAR", color:"#D52B1E" },
  "Paises Bajos":       { codigo:"nl",     abbr:"HOL", color:"#FF7900" },
  "Países Bajos":       { codigo:"nl",     abbr:"HOL", color:"#FF7900" },
  "Portugal":           { codigo:"pt",     abbr:"POR", color:"#DA291C" },
  "Qatar":              { codigo:"qa",     abbr:"QAT", color:"#8A1538" },
  "RD Congo":           { codigo:"cd",     abbr:"RDC", color:"#007FFF" },
  "República Checa":    { codigo:"cz",     abbr:"CHQ", color:"#D7141A" },
  "Senegal":            { codigo:"sn",     abbr:"SEN", color:"#00853F" },
  "Sudáfrica":          { codigo:"za",     abbr:"SUD", color:"#FCB917" },
  "Suecia":             { codigo:"se",     abbr:"SUE", color:"#FECC00" },
  "Suiza":              { codigo:"ch",     abbr:"SUI", color:"#D52B1E" },
  "Turquía":            { codigo:"tr",     abbr:"TUR", color:"#E30A17" },
  "Túnez":              { codigo:"tn",     abbr:"TUN", color:"#E70013" },
  "Uruguay":            { codigo:"uy",     abbr:"URU", color:"#5BC2E7" },
  "Uzbekistán":         { codigo:"uz",     abbr:"UZB", color:"#0072CE" }
};

// <img> de la bandera (flagcdn) para un país, o "" si no se conoce.
function banderaImg(nombre){
  const p = PAISES_BANDERAS[nombre];
  return (p && p.codigo)
    ? `<img class="flag" src="https://flagcdn.com/${p.codigo}.svg" alt="" loading="lazy">`
    : "";
}

// Abreviatura de 3 letras (o el nombre si no se conoce).
function abrevPais(nombre){
  const p = PAISES_BANDERAS[nombre];
  return (p && p.abbr) || nombre;
}

// Color identificador del equipo (puntito + franja del marcador en vivo).
// Si no se conoce el país, devuelve un gris neutro.
function colorPais(nombre){
  const p = PAISES_BANDERAS[nombre];
  return (p && p.color) || "#8aa0a8";
}
