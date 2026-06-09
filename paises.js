// ============================================================
//  Mapa de países para el calendario: código ISO (bandera de
//  flagcdn) + abreviatura de 3 letras (para mobile).
//  La clave es el nombre tal como aparece en los datos. Incluye
//  variantes: "Chequia"/"República Checa", "Bosnia"/"Bosnia
//  Herzegovina" y el typo "Agentina".
//  (Nota: la app principal tiene su propio mapa en app.js; si más
//  adelante se quiere, se pueden unificar en este archivo.)
// ============================================================
const PAISES = {
  "Agentina":           { codigo:"ar",     abbr:"ARG" },
  "Argentina":          { codigo:"ar",     abbr:"ARG" },
  "Alemania":           { codigo:"de",     abbr:"ALE" },
  "Arabia Saudita":     { codigo:"sa",     abbr:"ARA" },
  "Argelia":            { codigo:"dz",     abbr:"ALG" },
  "Australia":          { codigo:"au",     abbr:"AUS" },
  "Austria":            { codigo:"at",     abbr:"AUT" },
  "Bosnia":             { codigo:"ba",     abbr:"BOS" },
  "Bosnia Herzegovina": { codigo:"ba",     abbr:"BOS" },
  "Brasil":             { codigo:"br",     abbr:"BRA" },
  "Bélgica":            { codigo:"be",     abbr:"BEL" },
  "Cabo Verde":         { codigo:"cv",     abbr:"CAB" },
  "Canadá":             { codigo:"ca",     abbr:"CAN" },
  "Chequia":            { codigo:"cz",     abbr:"CHQ" },
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

// <img> de la bandera (flagcdn) para un país, o "" si no se conoce.
function banderaImg(nombre){
  const p = PAISES[nombre];
  return (p && p.codigo)
    ? `<img class="flag" src="https://flagcdn.com/${p.codigo}.svg" alt="" loading="lazy">`
    : "";
}

// Abreviatura de 3 letras (o el nombre si no se conoce).
function abrevPais(nombre){
  const p = PAISES[nombre];
  return (p && p.abbr) || nombre;
}
