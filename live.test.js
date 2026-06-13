const fs = require("fs");
const vm = require("vm");
const assert = require("assert");

const liveSlot = {
  id: "live-slot",
  children: [],
  insertAdjacentElement(position, element) {
    this.children.push({ position, element });
  }
};

const context = {
  console: {
    log: console.log,
    warn(message, value) {
      context.warnings.push(`${message} ${value}`);
    }
  },
  warnings: [],
  document: {
    addEventListener() {},
    getElementById(id) {
      if(id === "live-slot") return liveSlot;
      return null;
    },
    createElement() { return { className:"", hidden:false, innerHTML:"", setAttribute() {}, remove() {} }; },
    body: { insertAdjacentElement() {} }
  },
  setInterval() {},
  clearInterval() {},
  fetch() {},
  location: { hostname:"127.0.0.1", search:"?liveMock=1" },
  URLSearchParams,
  window: {}
};

vm.createContext(context);
vm.runInContext(fs.readFileSync("paises.js", "utf8"), context);
vm.runInContext(fs.readFileSync("live.js", "utf8"), context);

const api = context.window.ProdeLive;

assert.deepStrictEqual(api.getLiveMatches({ results:[{ home_team:"Mexico", status:"inprogress" }] }), [{ home_team:"Mexico", status:"inprogress" }]);
assert.deepStrictEqual(api.getLiveMatches({ events:[{ home_team:"Mexico", status:"inprogress" }] }), [{ home_team:"Mexico", status:"inprogress" }]);
assert.deepStrictEqual(api.getLiveMatches({ count:0, events:[] }), []);
assert.strictEqual(api.getLocalMockData().count, 1);
assert.strictEqual(api.getLocalMockData().events[0].current_minute, 93);
assert.strictEqual(api.getLocalMockData().events[0].home_team, "Mexico");
assert.strictEqual(api.getLocalMockData().events[0].away_team, "South Africa");
assert.strictEqual(api.getLocalMockData().events[0].home_score, 2);
assert.strictEqual(api.getLocalMockData().events[0].away_score, 0);

context.location.hostname = "mateobacca.github.io";
assert.strictEqual(api.getLocalMockData(), null);
context.location.hostname = "127.0.0.1";

assert.strictEqual(api.toSpanishTeam("Mexico"), "M\u00e9xico");
assert.strictEqual(api.toSpanishTeam("South Africa"), "Sud\u00e1frica");
assert.strictEqual(api.toSpanishTeam("Bosnia"), "Bosnia");
assert.strictEqual(api.toSpanishTeam("Korea Republic"), "Corea del Sur");
assert.strictEqual(api.toSpanishTeam("C\u00f4te d'Ivoire"), "Costa de Marfil");
assert.strictEqual(api.toSpanishTeam("Unknown FC"), null);

const known = api.formatTeam("Mexico");
assert.strictEqual(known.abbr, "MEX");
assert.ok(known.flag.includes("flagcdn.com/mx.svg"));
assert.strictEqual(known.color, "#006847");

const bosnia = api.formatTeam("Bosnia");
assert.strictEqual(bosnia.abbr, "BOS");
assert.ok(bosnia.flag.includes("flagcdn.com/ba.svg"));

const unknown = api.formatTeam("Unknown FC");
assert.strictEqual(unknown.abbr, "UNK");
assert.strictEqual(unknown.flag, "");
assert.strictEqual(unknown.color, "#8aa0a8");
assert.ok(context.warnings.some(message => message.includes("Unknown FC")));

const html = api.renderMatches([{
  home_team:"Mexico",
  away_team:"South Africa",
  home_score:2,
  away_score:0,
  current_minute:79,
  period:"2nd_half"
}]);
assert.ok(html.includes("MEX"));
assert.ok(html.includes("RSA"));
assert.ok(html.includes("2 - 0"));
assert.ok(html.includes("79&#039;"));
assert.ok(html.includes("img/live-logo-26.png"));
assert.ok(html.includes("live-score__logo"));
assert.ok(html.includes("--home-color:#006847"));
assert.ok(html.includes("--away-color:#FCB917"));

const canadaBosniaHtml = api.renderMatches([{
  home_team:"Canada",
  away_team:"Bosnia",
  home_score:0,
  away_score:1,
  current_minute:51,
  period:"2nd_half"
}]);
const awayBlock = canadaBosniaHtml.match(/<span class="live-team live-team--away"[\s\S]*?<\/span>\s*<\/div>/)[0];
assert.ok(awayBlock.includes("BOS"));
assert.ok(awayBlock.includes("flagcdn.com/ba.svg"));
assert.ok(/<span class="live-team__abbr">BOS<\/span>\s*<span class="live-team__dot"[\s\S]*flagcdn\.com\/ba\.svg/.test(awayBlock));

api.setBanner([{
  home_team:"Mexico",
  away_team:"South Africa",
  home_score:2,
  away_score:0,
  current_minute:79,
  period:"2nd_half"
}]);
assert.strictEqual(liveSlot.children.length, 1);
assert.strictEqual(liveSlot.children[0].position, "afterend");
assert.ok(liveSlot.children[0].element.innerHTML.includes("live-score__logo"));

console.log("live tests passed");
