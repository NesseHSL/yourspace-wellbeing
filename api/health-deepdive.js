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
- No repeating points across sections.
- No generic "more research needed" without specifics.
- VALIDITY FIRST: Be analytically decisive about whether the evidence supports the claim. State clearly what the evidence shows. Do not dilute the verdict or evidence sections with caveats — those belong in CONFOUNDING_CHECK and LIMITATIONS. If the evidence is clear, say so clearly.

VERDICT LOGIC
GREEN = strong consistent evidence from high-quality studies supports the claim.
AMBER = some evidence exists but limited, mixed, indirect, or easy to overinterpret.
RED = evidence contradicts the claim or it clearly overreaches what research shows.
GREY = genuinely too ambiguous even after reasonable interpretation.

RED is not for weak evidence — that is AMBER. RED means evidence points the other way.

CLAIM CATEGORISATION
At the end of your response, output a single line in this exact format:
CATEGORY: [one of: Nutrition, Supplements, Skincare/Beauty, Fitness, Mental Health, Sleep, Weight Management, Other]

OUTPUT FORMAT — use exact markers only, no extra text.

VERDICT: GREEN / AMBER / RED / GREY

<<CLAIM_SNAPSHOT>>
Start with: We interpreted this claim as: — then the scientific question in plain English. Note key assumptions. No bullets.
<<END_CLAIM_SNAPSHOT>>

<<STRENGTHS>>
GREEN/AMBER: 3-5 bullets of what evidence supports this claim. What studies actually found. Be specific and direct — state clearly what the evidence shows.
RED: 3-5 bullets of what evidence contradicts this claim. Specific findings. Be direct and definitive.

After each bullet, if a specific study directly supports that point, include its URL on the very next line in this exact format:
→ [URL]

URL priority:
1. PubMed Central full-text (format: https://pmc.ncbi.nlm.nih.gov/articles/PMC[number]/)
2. Cochrane systematic review (format: https://www.cochranelibrary.com/cdsr/doi/[doi]/full)
3. PubMed abstract as last resort (format: https://pubmed.ncbi.nlm.nih.gov/[pmid]/)

Only include a URL if you are confident it exists and directly supports that specific bullet. Not every bullet needs a URL. Do not invent PMC numbers, DOIs, or PMIDs.
-
<<END_STRENGTHS>>

<<LIMITATIONS>>
3-5 bullets on evidence weaknesses. Study size, duration, inconsistency, indirect endpoints, measurement issues. No confounding/bias here.
-
<<END_LIMITATIONS>>

<<CONFOUNDING_CHECK>>
Open with exactly: Science is rarely black and white. Here's what makes this topic more complicated than the headline suggests.
Then explain confounding, reverse causation, bias specific to this claim. Plain English, concrete examples. No repeating evidence section.
<<END_CONFOUNDING_CHECK>>

<<MISINTERPRETATIONS>>
Open with exactly: Even good science gets twisted. Here's how this claim is commonly misrepresented.
Then 3-5 bullets specific to this claim's misrepresentation in media/online.
-
<<END_MISINTERPRETATIONS>>

HEALTH CLAIM: `;

async function searchWeb(query, apiKey) {
  try {
    const res = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: 'advanced',
        include_answer: false,
        max_results: 4
      })
    });
    const data = await res.json();
    return data.results || [];
  } catch (e) {
    return [];
  }
}

function formatResults(results, query) {
  if (!results.length) return '';
  const lines = results.map(r => {
    const snippet = (r.content || '').slice(0, 350).replace(/\n/g, ' ');
    return `  • ${r.title}\n    ${r.url}\n    ${snippet}`;
  }).join('\n');
  return `Query: "${query}"\n${lines}`;
}

function extractCategory(text) {
  const m = text.match(/CATEGORY:\s*(Nutrition|Supplements|Skincare\/Beauty|Fitness|Mental Health|Sleep|Weight Management|Other)/i);
  return m ? m[1] : 'Other';
}

function extractVerdict(text) {
  const m = text.match(/VERDICT:\s*(GREEN|AMBER|RED|GREY)/i);
  return m ? m[1].toUpperCase() : 'GREY';
}

function getCountryCode(req) {
  // Vercel sets this header automatically
  const country = req.headers['x-vercel-ip-country'];
  return (country && country.length === 2) ? country.toUpperCase() : null;
}

async function logToSupabase(claim_category, verdict, country_code, topic_category) {
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
        claim_category: claim_category || 'Other',
        verdict,
        is_paid: true,
        country_code: country_code || null,
      }]),
    });
  } catch (e) {
    // Non-fatal — don't let logging failure break the response
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { claim, paymentIntentId, topicCategory } = req.body;
  if (!claim) return res.status(400).json({ error: 'No claim provided' });
  if (!paymentIntentId) return res.status(400).json({ error: 'No payment reference provided' });

  // Verify payment with Stripe server-side (skip for demo mode)
  if (paymentIntentId !== 'demo') {
    try {
      const piRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
        headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const paymentIntent = await piRes.json();
      if (!piRes.ok || paymentIntent.status !== 'succeeded') {
        return res.status(402).json({ error: 'Payment not confirmed' });
      }
    } catch (e) {
      return res.status(402).json({ error: 'Could not verify payment' });
    }
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) return res.status(500).json({ error: 'API key not configured' });

  // Tavily web search for paid users
  let webContext = '';
  if (process.env.TAVILY_API_KEY) {
    const queries = [
      `systematic review meta-analysis ${claim}`,
      `randomized controlled trial evidence ${claim} 2023 2024 2025 2026`
    ];
    const results = await Promise.all(queries.map(q => searchWeb(q, process.env.TAVILY_API_KEY)));
    const formatted = queries
      .map((q, i) => formatResults(results[i], q))
      .filter(Boolean)
      .join('\n\n');
    if (formatted) {
      webContext = `RECENT WEB SEARCH RESULTS — use these to inform your analysis where relevant. Prioritise peer-reviewed and clinical sources. Treat non-peer-reviewed sources with appropriate scepticism. Do not invent or embellish anything not present in these results.\n\n${formatted}\n\n---\n\n`;
    }
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'x-api-key': anthropicKey
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 2500,
      system: SYS,
      messages: [{ role: 'user', content: webContext + PROMPT + claim }]
    })
  });

  const data = await response.json();
  if (!response.ok) {
    return res.status(response.status).json({ error: data.error?.message || 'API error' });
  }

  const text = data.content.find(block => block.type === 'text')?.text;
  const claimCategory = extractCategory(text);
  const verdict = extractVerdict(text);
  const countryCode = getCountryCode(req);

  // Log anonymised data — no personal identifiers
  await logToSupabase(claimCategory, verdict, countryCode, topicCategory || null);

  return res.status(200).json({ text });
}
