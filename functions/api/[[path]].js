// Cloudflare Pages versions of api/ask.php (KUFIZ AI) and api/visits.php (profile visit counter).
// Pages routes every /api/* request here, so the front end's api/*.php calls work unchanged on XAMPP and Cloudflare.

// ponytail: per-isolate memory, resets when Cloudflare recycles the worker; move to KV if the key gets abused.
const hits = new Map();
const LIMIT = 20;
const HOUR = 3600 * 1000;

function json(status, data) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

function overLimit(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => t > now - HOUR);
  if (recent.length >= LIMIT) return true;
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

export async function onRequest({ request, env, params }) {
  const path = [].concat(params.path || []).join('/');
  if (path === 'visits.php') return visits(request, env);
  if (path === 'ask.php') return ask(request, env);
  return json(404, { error: 'Not found.' });
}

// Visit counter in the VISITS KV namespace (bind it under Settings > Bindings).
// ponytail: KV read-then-write isn't atomic, so simultaneous visits can undercount; use a Durable Object if exact counts matter.
async function visits(request, env) {
  if (!env.VISITS) return json(200, { count: null });
  let count = Number(await env.VISITS.get('count')) || 0;
  if (request.method === 'POST') {
    count += 1;
    await env.VISITS.put('count', String(count));
  }
  return json(200, { count });
}

async function ask(request, env) {
  if (request.method !== 'POST') return json(405, { error: 'POST only.' });

  let question = '';
  try {
    question = String((await request.json()).question ?? '').trim();
  } catch {
    // bad JSON falls through to the empty-question check
  }
  if (!question || question.length > 500) return json(400, { error: 'Ask a question under 500 characters.' });
  if (overLimit(request.headers.get('CF-Connecting-IP') || 'unknown')) {
    return json(429, { error: 'Too many questions this hour. Try again later or send an email.' });
  }

  const key = env.GROQ_API_KEY;
  if (!key) return json(500, { error: 'The AI is not configured yet.' });

  const siteData = await (await env.ASSETS.fetch(new URL('/js/data.js', request.url))).text();
  const system = "You are KUFIZ AI, the assistant on Tengku Mohamad Syafiz's portfolio (handle: kufiz). "
    + "Answer visitors' questions about him, his work, projects and skills using ONLY the data below. "
    + 'Keep answers short: at most 3 sentences, plain text, no markdown. '
    + "If the data does not cover it, say you don't know and suggest emailing tengkusyafiz98@gmail.com. "
    + 'Never invent facts, salaries, addresses or phone numbers. Politely decline unrelated tasks.\n\n'
    + 'PORTFOLIO DATA:\n' + siteData;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: 'openai/gpt-oss-120b',
        temperature: 0.3,
        max_completion_tokens: 400,
        reasoning_effort: 'low',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question },
        ],
      }),
    });
    const data = await res.json();
    const answer = (data.choices?.[0]?.message?.content || '').trim();
    if (!answer) return json(502, { error: 'The AI is unavailable right now. Please try again.' });
    return json(200, { answer });
  } catch {
    return json(502, { error: 'The AI is unavailable right now. Please try again.' });
  }
}
