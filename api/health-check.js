const SYS = `You are the YourSpace Health Claim Checker, an evidence-based health claim evaluator. Your role is to help curious, health-literate non-experts understand whether a health claim is supported by scientific evidence, where research is commonly overinterpreted, and how headlines distort science.

You have deep knowledge of epidemiology, clinical trial methodology, nutritional science, and the hierarchy of evidence. You reason carefully and specifically. When evidence exists, you engage with what it actually shows. When it does not, you say so clearly.

TONE: Write as if explaining to a smart, curious non-scientist — like someone who reads the Guardian but not the Lancet. Short sentences. Concrete examples. Explain technical terms briefly. Never condescending. Never preachy. Direct and occasionally dry.

You are not a clinician. No medical advice, diagnoses, or treatment recommendations. Never tell users what to eat, take, or do.`;

const PROMPT = `You will be given a health claim in natural language. It may be vague or informal.

If vague, interpret it into the closest scientifically testable question. Do NOT reject vague claims.

Engage with what evidence actually shows — not hypothetical studies. If RCTs, systematic reviews, or large cohorts exist, reason about what they found. If evidence is sparse, say so specifically.

STRICT RULES
- No medical or dietary advice.
- Do not invent study details, citations, or outcomes.
- Do not overstate certainty.
- Plain English. Explain technical terms briefly.
- No observational findings treated as proof of causation.
- No surrogate markers treated as clinical outcomes unless clearly linked.
- VALIDITY FIRST: Be analytically decisive about whether the evidence supports the claim. State clearly what the evidence shows.

VERDICT LOGIC
GREEN = strong consistent evidence from high-quality studies supports the claim.
AMBER = some evidence exists but limited, mixed, indirect, or easy to overinterpret.
RED = evidence contradicts the claim or it clearly overreaches what research shows.
GREY = genuinely too ambiguous even after reasonable interpretation.

RED is not for weak evidence — that is AMBER. RED means evidence points the other way.

Also extract a short topic label (2-5 words, e.g. "magnesium and anxiety", "seed oils", "collagen and skin") and output it on a single line as:
TOPIC: [label]

OUTPUT FORMAT — use exact markers only, no extra text outside them.

VERDICT: GREEN / AMBER / RED / GREY

<<BOTTOM_LINE>>
2-4 sentences. What the evidence actually shows. Specific and direct. No interpreted claim restatement. No advice.
<<END_BOTTOM_LINE>>

TOPIC: [2-5 word label]

HEALTH CLAIM: `;

function extractTopic(text) {
  const m = text.match(/TOPIC:\s*(.+)/i);
  return m ? m[1].trim().slice(0, 100) : null;
}

function extractVerdict(text) {
  const m = text.match(/VERDICT:\s*(GREEN|AMBER|RED|GREY)/i);
  return m ? m[1].toUpperCase() : 'GREY';
}

function getCountryCode(req) {
  const country = req.headers['x-vercel-ip-country'];
  return (country && country.length === 2) ? country.toUpperCase() : null;
}

async function logToSupabase(topic_category, verdict, country_code) {
  try {
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/deep_dives`, {
      method: 'POST',
      headers: {
        'apikey':        process.env.SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`,
        'Content-Type':  'application/json',
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify([{
        topic_category: topic_category || null,
        claim_category: null, // set by the deep dive endpoint for paid searches
        verdict,
        is_paid: false,
        country_code: country_code || null,
      }]),
    });
  } catch (e) {
    // Non-fatal
  }
}

async function callAnthropic(apiKey, claim, model = 'claude-sonnet-5') {
  const headers = {
    'Content-Type': 'application/json',
    'anthropic-version': '2023-06-01',
    'x-api-key': apiKey
  };
  const body = JSON.stringify({
    model,
    max_tokens: 600,
    system: SYS,
    messages: [{ role: 'user', content: PROMPT + claim }]
  });

  let response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST', headers, body
  });

  // Retry once on overload (529)
  if (response.status === 529) {
    await new Promise(r => setTimeout(r, 1000));
    response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', headers, body
    });
  }

  // Fall back to Haiku if Sonnet is still overloaded
  if (response.status === 529 && model === 'claude-sonnet-5') {
    response = await callAnthropic(apiKey, claim, 'claude-haiku-4-5');
  }

  return response;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { claim } = req.body;
  if (!claim) return res.status(400).json({ error: 'No claim provided' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  try {
    const response = await callAnthropic(apiKey, claim);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'API error' });
    }

    const text = data.content.find(block => block.type === 'text')?.text;
    const topic = extractTopic(text);
    const verdict = extractVerdict(text);
    const countryCode = getCountryCode(req);

    // Log anonymised free check — no personal identifiers
    await logToSupabase(topic, verdict, countryCode);

    return res.status(200).json({ text, topic });
  } catch (e) {
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
}
