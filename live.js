(function(){
  const LIVE_URL = "https://prode-live.cayefa.workers.dev/";
  const LOGO_URL = "img/live-logo-26.png";
  const POLL_MS = 30000;
  let warnedFetchError = false;

  const LOCAL_MOCK_DATA = {
    count:1,
    events:[{
      id:8287,
      league_id:27,
      league_name:"World Cup 2026",
      home_team_id:451,
      home_team:"Canada",
      away_team_id:452,
      away_team:"Bosnia",
      event_date:"2026-06-11T19:00:00Z",
      status:"inprogress",
      period:"2nd_half",
      current_minute:51,
      home_score:0,
      away_score:1,
      home_score_ht:1,
      away_score_ht:0,
      live_websocket:true,
      last_updated:"2026-06-11T21:00:22Z"
    }]
  };

  const TEAM_EN_ES = {
    "Algeria":"Argelia",
    "Argentina":"Argentina",
    "Australia":"Australia",
    "Austria":"Austria",
    "Belgium":"B\u00e9lgica",
    "Bosnia":"Bosnia",
    "Bosnia and Herzegovina":"Bosnia",
    "Bosnia Herzegovina":"Bosnia",
    "Brazil":"Brasil",
    "Canada":"Canad\u00e1",
    "Cape Verde":"Cabo Verde",
    "Colombia":"Colombia",
    "Congo DR":"RD Congo",
    "Croatia":"Croacia",
    "Curacao":"Curazao",
    "Cura\u00e7ao":"Curazao",
    "Czechia":"Chequia",
    "Czech Republic":"Chequia",
    "DR Congo":"RD Congo",
    "Ecuador":"Ecuador",
    "Egypt":"Egipto",
    "England":"Inglaterra",
    "France":"Francia",
    "Germany":"Alemania",
    "Ghana":"Ghana",
    "Haiti":"Hait\u00ed",
    "IR Iran":"Ir\u00e1n",
    "Iran":"Ir\u00e1n",
    "Iraq":"Irak",
    "Ivory Coast":"Costa de Marfil",
    "C\u00f4te d'Ivoire":"Costa de Marfil",
    "Japan":"Jap\u00f3n",
    "Jordan":"Jordania",
    "Korea Republic":"Corea del Sur",
    "South Korea":"Corea del Sur",
    "Mexico":"M\u00e9xico",
    "Morocco":"Marruecos",
    "Netherlands":"Pa\u00edses Bajos",
    "New Zealand":"Nueva Zelanda",
    "Norway":"Noruega",
    "Panama":"Panam\u00e1",
    "Paraguay":"Paraguay",
    "Portugal":"Portugal",
    "Qatar":"Qatar",
    "Saudi Arabia":"Arabia Saudita",
    "Scotland":"Escocia",
    "Senegal":"Senegal",
    "South Africa":"Sud\u00e1frica",
    "Spain":"Espa\u00f1a",
    "Sweden":"Suecia",
    "Switzerland":"Suiza",
    "Tunisia":"T\u00fanez",
    "Turkey":"Turqu\u00eda",
    "T\u00fcrkiye":"Turqu\u00eda",
    "USA":"Estados Unidos",
    "United States":"Estados Unidos",
    "United States of America":"Estados Unidos",
    "Uruguay":"Uruguay",
    "Uzbekistan":"Uzbekist\u00e1n"
  };

  const LIVE_ABBR = {
    "South Africa":"RSA"
  };

  function getLiveMatches(data){
    if(!data) return [];
    const matches = Array.isArray(data.results) ? data.results
      : Array.isArray(data.events) ? data.events
      : [];
    return matches.filter(match => match && match.status === "inprogress");
  }

  function getLocalMockData(){
    const loc = typeof location !== "undefined" ? location : null;
    if(!loc) return null;

    const isLocal = loc.hostname === "localhost" || loc.hostname === "127.0.0.1";
    if(!isLocal) return null;

    const params = new URLSearchParams(loc.search || "");
    return params.get("liveMock") === "1" ? LOCAL_MOCK_DATA : null;
  }

  function toSpanishTeam(name){
    return TEAM_EN_ES[name] || null;
  }

  function escapeHtml(value){
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function fallbackAbbr(name){
    return String(name || "")
      .replace(/[^A-Za-z\u00c0-\u017f ]/g, "")
      .trim()
      .replace(/\s+/g, "")
      .slice(0, 3)
      .toUpperCase() || "---";
  }

  function formatTeam(englishName){
    const spanishName = toSpanishTeam(englishName);
    if(!spanishName){
      console.warn("[live] Equipo sin mapeo EN\u2192ES:", englishName);
      return { name:englishName || "Equipo", abbr:fallbackAbbr(englishName), flag:"" };
    }

    return {
      name:spanishName,
      abbr:LIVE_ABBR[englishName] || (typeof abrevPais === "function" ? abrevPais(spanishName) : fallbackAbbr(spanishName)),
      flag:typeof banderaImg === "function" ? banderaImg(spanishName) : ""
    };
  }

  function formatMinute(match){
    if(Number.isFinite(match.current_minute)) return `${match.current_minute}'`;
    const period = String(match.period || "").toUpperCase();
    if(period === "HT") return "ET";
    if(period === "FT") return "FIN";
    if(period.includes("HALF")) return period.includes("1") ? "1T" : "2T";
    return "VIVO";
  }

  function renderTeam(team, side){
    const dot = `<span class="live-team__dot" aria-hidden="true"></span>`;
    const abbr = `<span class="live-team__abbr">${escapeHtml(team.abbr)}</span>`;
    const content = side === "away"
      ? `${abbr}${dot}${team.flag}`
      : `${team.flag}${dot}${abbr}`;

    return `<span class="live-team live-team--${side}" title="${escapeHtml(team.name)}">
      ${content}
    </span>`;
  }

  function renderMatches(matches){
    return matches.map(match => {
      const home = formatTeam(match.home_team);
      const away = formatTeam(match.away_team);
      const homeScore = Number.isFinite(match.home_score) ? match.home_score : 0;
      const awayScore = Number.isFinite(match.away_score) ? match.away_score : 0;
      const score = `${homeScore} - ${awayScore}`;

      return `<div class="live-score__match">
        <div class="live-score__minute" aria-label="Minuto ${escapeHtml(formatMinute(match))}">${escapeHtml(formatMinute(match))}</div>
        <div class="live-score__board">
          ${renderTeam(home, "home")}
          <span class="live-score__goal live-score__goal--home">${escapeHtml(homeScore)}</span>
          <span class="live-score__logo-wrap">
            <img class="live-score__logo" src="${LOGO_URL}" alt="FIFA 26">
          </span>
          <span class="live-score__goal live-score__goal--away">${escapeHtml(awayScore)}</span>
          ${renderTeam(away, "away")}
          <span class="live-score__sr-score">
            ${escapeHtml(home.name)} ${escapeHtml(score)} ${escapeHtml(away.name)}
          </span>
        </div>
      </div>`;
    }).join("");
  }

  function ensureBanner(){
    let banner = document.getElementById("live-score");
    if(banner) return banner;

    banner = document.createElement("section");
    banner.id = "live-score";
    banner.className = "live-score";
    banner.hidden = true;
    banner.setAttribute("aria-live", "polite");
    const slot = document.getElementById("live-slot");
    if(slot){
      slot.insertAdjacentElement("afterend", banner);
    }else{
      document.body.insertAdjacentElement("afterbegin", banner);
    }
    return banner;
  }

  function setBanner(matches){
    const banner = ensureBanner();
    if(!matches.length){
      banner.hidden = true;
      banner.innerHTML = "";
      return;
    }
    banner.innerHTML = `<div class="live-score__inner wrap">${renderMatches(matches)}</div>`;
    banner.hidden = false;
  }

  async function refresh(){
    try{
      const mockData = getLocalMockData();
      if(mockData){
        warnedFetchError = false;
        setBanner(getLiveMatches(mockData));
        return;
      }

      const response = await fetch(LIVE_URL, { cache:"no-store" });
      if(!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      warnedFetchError = false;
      setBanner(getLiveMatches(data));
    }catch(error){
      if(!warnedFetchError){
        warnedFetchError = true;
        console.warn("[live] No se pudo actualizar el marcador:", error);
      }
      setBanner([]);
    }
  }

  function init(){
    refresh();
    setInterval(refresh, POLL_MS);
  }

  window.ProdeLive = {
    TEAM_EN_ES,
    getLiveMatches,
    getLocalMockData,
    toSpanishTeam,
    formatTeam,
    renderMatches,
    setBanner,
    init
  };

  if(typeof document !== "undefined"){
    document.addEventListener("DOMContentLoaded", init);
  }
})();
