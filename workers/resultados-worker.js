// ============================================================
//  prode-resultados — Cloudflare Worker (partidos TERMINADOS)
//  ------------------------------------------------------------
//  Gemelo del worker live, pero en vez de /events/live/ consulta la lista
//  general de eventos y devuelve solo los partidos finalizados del Mundial.
//
//  IMPORTANTE: este archivo NO se ejecuta en GitHub Pages. Es la fuente del
//  worker, versionada acá para no perderla. Se despliega aparte en Cloudflare.
//
//  --- Deploy (una vez) ---
//   1. Crear un Worker nuevo (dashboard de Cloudflare o `wrangler init`),
//      p. ej. prode-resultados  ->  https://prode-resultados.cayefa.workers.dev/
//   2. Pegar este código.
//   3. Cargar el secret con la API key de BSD (la MISMA del worker live):
//        wrangler secret put BSD_API_KEY        (o Settings > Variables)
//      Esquema de auth confirmado: header  `Authorization: Token <API_KEY>`.
//   4. Deploy y copiar la URL final en resultados.js -> WORKER_RESULTADOS_URL.
//
//  Mundial 2026: league_id=27, season_id=188 (season_id evita la ventana por
//  defecto de 7 dias -> devuelve toda la temporada). El grupo entero son ~104
//  partidos, entran de sobra en limit=200 (no hace falta paginar).
//
//  Cache: la respuesta se cachea ~300 s server-side (Cache API). Los resultados
//  terminados son inmutables, asi que no hace falta cron ni KV.
// ============================================================

const SOURCE =
  "https://sports.bzzoiro.com/api/v2/events/?league_id=27&season_id=188&limit=200";

// Estados que cuentan como "terminado" (grupos da 'finished'; aet/penalties
// cubren las llaves de mata-mata que se definen en alargue o penales).
const FINISHED = new Set(["finished", "aet", "penalties"]);

const TTL = 300; // segundos de cache

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*"
};

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Cache compartido (una sola entrada para todos los clientes).
    const cache = caches.default;
    const cacheKey = new Request(new URL(request.url).origin + "/__resultados", { method: "GET" });
    const hit = await cache.match(cacheKey);
    if (hit) return withCors(hit);

    let upstream;
    try {
      upstream = await fetch(SOURCE, {
        headers: {
          "Authorization": "Token " + (env.BSD_API_KEY || ""),
          "Accept": "application/json"
        }
      });
    } catch (e) {
      return json({ error: true, detail: "upstream fetch failed" }, 502);
    }

    if (!upstream.ok) {
      return json({ error: true, status: upstream.status, detail: "upstream error" }, 502);
    }

    const data = await upstream.json();
    const raw = Array.isArray(data) ? data : (data.events || data.results || []);

    const events = raw
      .filter(ev => ev && FINISHED.has(String(ev.status)))
      .map(ev => ({
        id: ev.id,
        home_team: ev.home_team,
        away_team: ev.away_team,
        home_score: ev.home_score,
        away_score: ev.away_score,
        home_score_ht: ev.home_score_ht,
        away_score_ht: ev.away_score_ht,
        status: ev.status,
        event_date: ev.event_date
      }));

    const res = new Response(JSON.stringify({ count: events.length, events }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=" + TTL,
        ...CORS
      }
    });

    ctx.waitUntil(cache.put(cacheKey, res.clone()));
    return res;
  }
};

// Reaplica CORS sobre una respuesta cacheada.
function withCors(resp) {
  const headers = new Headers(resp.headers);
  for (const [k, v] of Object.entries(CORS)) headers.set(k, v);
  return new Response(resp.body, { status: resp.status, headers });
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS }
  });
}
