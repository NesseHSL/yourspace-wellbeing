// api/meal-plan.js — YourSpace Meal Plan Generator
// Vercel serverless function — calls Anthropic API server-side so the key is never exposed

export default async function handler(req, res) {

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { calories, protein, activeDays, frameworks, allergies, programme } = req.body;

  // Basic validation
  if (!calories || !protein) {
    return res.status(400).json({ error: 'Calorie and protein targets are required.' });
  }
  if (activeDays === undefined || activeDays === null || activeDays < 0 || activeDays > 7) {
    return res.status(400).json({ error: 'Active days must be a number between 0 and 7.' });
  }

  // ── PROGRAMME FRAMING ────────────────────────────────────────────────────
  // Different YourSpace programmes reuse this same generator with different
  // framing/duration. Default stays Sofa to Studio for backwards compatibility.
  const PROGRAMME_CONTEXT = {
    'sofa-to-studio': {
      about: 'The user is following the Sofa to Studio barre fitness programme. Active sessions burn approximately 300–400 kcal. The full programme runs 42 days: 30 active days and 12 rest days.',
      disclaimerContext: 'YourSpace Wellbeing fitness programme',
    },
    'back-to-it': {
      about: 'The user is following the Back to It Challenge — a 4-week programme combining 4 studio classes a week with this nutrition plan. Active sessions are a mix of Barre, Pilates, Strength, and Cardio classes at HerSpace London, burning approximately 300–450 kcal depending on class type. The challenge runs 28 days.',
      disclaimerContext: 'YourSpace Wellbeing Back to It Challenge',
    },
    'nutrition-guide': {
      about: 'The user has subscribed to the standalone YourSpace Nutrition Guide — they are not necessarily on a specific fitness programme. Active sessions could be any kind of exercise (studio class, gym, home workout), burning approximately 300–400 kcal on average.',
      disclaimerContext: 'YourSpace Wellbeing Nutrition Guide',
    },
  };
  const ctx = PROGRAMME_CONTEXT[programme] || PROGRAMME_CONTEXT['sofa-to-studio'];

  // ── SYSTEM PROMPT ──────────────────────────────────────────────────────────
  const systemPrompt = `You are a nutrition assistant for YourSpace Wellbeing. Your role is to generate practical, balanced, personalised 7-day meal plans to support exercise performance and general wellbeing.

You are NOT a clinical nutrition service. Do not make claims about treating, managing, or preventing any medical condition or disease. If a user's inputs suggest a complex medical condition (e.g. diabetes, eating disorder, kidney disease), acknowledge this warmly and advise them to consult a registered dietitian before following any meal plan.

---

ABOUT THE PROGRAMME
${ctx.about}

---

CALORIE ADJUSTMENT
- On ACTIVE days: add 250–300 kcal to their stated daily target to properly fuel the session. Distribute this primarily across pre- and post-workout meals or snacks.
- On REST days: use their base calorie target exactly as provided.
- Never recommend a total daily intake below 1,200 kcal regardless of goal.

---

NUTRITIONAL PRIORITIES

1. PROTEIN — hit the user's protein target every single day. Distribute evenly across meals where possible. Prioritise whole food sources: eggs, fish, chicken, legumes, Greek yoghurt, cottage cheese, tofu, tempeh, edamame. For plant-based users, pay particular attention to protein combining.

2. FIBRE — aim for roughly 1g fibre per 3–4g protein as a practical guide, with a target of 25–30g fibre per day. Prioritise vegetables, legumes, wholegrains, and fruit. If the dietary framework or calorie target makes this target difficult to achieve through food alone, include this note at the end of the plan:
"💚 Gut health tip: Based on your plan, you may find it helpful to supplement with a high-quality fibre product to support digestion and keep things moving. We'll share our recommended option in the app soon."

3. CARBOHYDRATES — prioritise complex, whole food sources (oats, sweet potato, brown rice, quinoa, legumes, wholegrain bread). On active days, time the majority of carbohydrates around the workout — in the pre-workout snack and post-workout meal.

4. FATS — include healthy fats daily: olive oil, avocado, oily fish, nuts and seeds (where permitted). Do not recommend low-fat or fat-free approaches.

---

MEAL PLAN FORMAT
Produce a 7-day plan. Each day should include:
- Breakfast
- Mid-morning snack (include if calories allow — generally yes)
- Lunch
- Pre-workout snack (ACTIVE days only — include this)
- Dinner
- Evening snack (optional — include only if calories allow and it aids protein/fibre targets)

For each meal, include:
- **Meal name** in bold
- A one-line description of what it is
- Approximate kcal and protein (g) in brackets, e.g. *(~420 kcal | 32g protein)*
- **Ingredients**: a short bulleted list with realistic quantities for one serving (e.g. "120g chicken breast", "1 tbsp olive oil", "80g spinach"). If the meal is batch-cooked, quantities should reflect the full batch, with a note on how many portions it makes.
- **Method**: 2–5 short, numbered steps. Assume a home cook with basic kitchen equipment (hob, oven, blender) and no professional technique. Be concrete and quick to follow, not padded.
- A ⭐ **BATCH COOK** label for any meal that can be made in bulk and stored

At the end of the day, include a **Day Total** showing total kcal and protein.

After all 7 days, include:
### 🥘 Batch Cooking Plan
A simple summary of what to prep on Day 1 and what to prep on Day 4 or 5 to cover the rest of the week.

### 🛒 Shopping List
Grouped into: Produce | Protein | Dairy & Alternatives | Grains & Pulses | Store Cupboard

---

VARIETY
Rotate proteins, grains, and vegetable bases across the week so nothing repeats within the plan itself. Keep it feeling fresh rather than defaulting to the same handful of "safe" recipes every time.

---

DIETARY FRAMEWORKS — STRICT RULES
- **COELIAC**: absolutely no gluten. Flag oats explicitly: "use certified gluten-free oats only." Never say "gluten-free option available" — treat it as a non-negotiable absolute requirement throughout.
- **NUT-FREE**: no nuts or nut-derived products of any kind. Check sauces, pestos, dressings, and protein bars carefully.
- **VEGAN**: no animal products whatsoever, including honey and gelatine. Prioritise protein combining at every meal. Include this note: "As a long-term vegan, a B12 supplement is strongly advisable — please speak to your GP or a dietitian."
- **VEGETARIAN**: no meat or fish. Eggs and dairy are permitted unless the user has also specified dairy-free.
- **PESCATARIAN**: no meat or poultry. Fish and seafood are permitted and encouraged as a primary protein source, alongside eggs and dairy unless otherwise restricted.
- Multiple frameworks may apply simultaneously. Apply ALL rules at once — never suggest a workaround that violates any of them.

---

TONE
Warm, practical, and encouraging. Frame food as fuel, pleasure, and nourishment — not restriction. Never use language like "cheat meal," "bad foods," "clean eating," or "guilty pleasure." Keep recipe descriptions appetising and achievable for someone who cooks at home.

---

FORMATTING
Format your entire response in clean Markdown:
- Use ## for day headers: e.g. ## Day 1 — Monday
- Use ### for section headers (Batch Cooking Plan, Shopping List)
- Use **bold** for meal names
- Use a horizontal rule --- between each day
- Keep it scannable and easy to read on a phone

---

DISCLAIMER
End every meal plan with:

---
*This plan has been created to support your ${ctx.disclaimerContext} and is intended as general healthy eating guidance only. It is not a substitute for personalised advice from a registered dietitian or other healthcare professional. If you have a medical condition, complex dietary needs, or concerns about your nutrition, please consult a qualified professional before following this plan.*`;

  // ── USER MESSAGE ───────────────────────────────────────────────────────────
  const frameworkList = frameworks && frameworks.length > 0
    ? frameworks.join(', ')
    : 'Standard (no restrictions)';

  const userMessage = `Please generate a 7-day meal plan for the following user:

Daily calorie target: ${calories} kcal
Daily protein target: ${protein}g
This week has exactly ${activeDays} ACTIVE day(s) and ${7 - activeDays} REST day(s) out of the 7 — this is a hard requirement, not a suggestion. Exactly ${activeDays} of the 7 days must include a pre-workout snack and the +250–300 kcal active-day boost on top of the base calorie target. Exactly ${7 - activeDays} days must use the base calorie target exactly as provided, with no pre-workout snack. Spread the active days naturally through the week rather than clustering them, unless the count makes that impossible (e.g. 0 or 7 active days). Before finishing, check your plan actually contains ${activeDays} active day(s) and ${7 - activeDays} rest day(s) — not a uniform week.
Dietary framework: ${frameworkList}
Additional allergies or foods to avoid: ${allergies && allergies.trim() ? allergies.trim() : 'None'}

Please produce a varied, practical, and appetising 7-day plan, with full recipes (ingredients and method) for every meal, batch cooking clearly marked, and a full shopping list at the end.`;

  // ── API CALL ───────────────────────────────────────────────────────────────
  // Model IDs eventually retire (this is what broke the generator last time —
  // it was still calling a model that no longer existed). PRIMARY_MODEL is the
  // one actually used; FALLBACK_MODEL only kicks in if Anthropic retires the
  // primary and this file hasn't been updated yet, so the feature degrades
  // instead of failing outright. Still needs an occasional check against
  // https://platform.claude.com/docs/en/about-claude/models/overview
  const PRIMARY_MODEL = 'claude-sonnet-5';
  const FALLBACK_MODEL = 'claude-haiku-4-5';

  // Full recipes push output well beyond what the old lighter format needed,
  // so this is streamed — recommended practice for high max_tokens requests,
  // and it avoids the whole response having to land in one long synchronous
  // wait.
  async function callClaude(model) {
    const body = {
      model,
      max_tokens: 16000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
      stream: true
    };

    // Thinking isn't needed for this templated, rule-driven task, and
    // claude-sonnet-5 runs adaptive thinking by default when this is
    // omitted — that adds a thinking block ahead of the text block below.
    // Only set on the primary model; the fallback (Haiku) already defaults
    // to no thinking and may not accept this shape.
    if (model === PRIMARY_MODEL) {
      body.thinking = { type: 'disabled' };
    }

    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });
  }

  // Reads an Anthropic SSE stream and returns the accumulated text content.
  async function readStreamedText(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let text = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep the last, possibly-partial line for next chunk

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const event = JSON.parse(line.slice(6));

        if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
          text += event.delta.text;
        } else if (event.type === 'error') {
          throw new Error(event.error?.message || 'Streaming error from Anthropic');
        }
      }
    }

    return text;
  }

  try {
    let response = await callClaude(PRIMARY_MODEL);

    // A retired/unknown model ID comes back as a 404 — retry once on the
    // fallback rather than failing the whole request.
    if (response.status === 404) {
      console.error(`Primary model ${PRIMARY_MODEL} unavailable, retrying on ${FALLBACK_MODEL}`);
      response = await callClaude(FALLBACK_MODEL);
    }

    if (!response.ok) {
      const data = await response.json();
      console.error('Anthropic API error:', data);
      return res.status(500).json({
        error: 'We couldn\'t generate your meal plan right now. Please try again in a moment.',
        detail: `${response.status} ${data.error?.type || ''}: ${data.error?.message || 'Unknown error'}`
      });
    }

    const text = await readStreamedText(response);

    if (!text) {
      console.error('No text content received from Anthropic stream');
      return res.status(500).json({
        error: 'We couldn\'t generate your meal plan right now. Please try again in a moment.',
        detail: 'Empty response from stream'
      });
    }

    return res.status(200).json({ plan: text });

  } catch (error) {
    console.error('Meal plan generation error:', error.message);
    return res.status(500).json({
      error: 'We couldn\'t generate your meal plan right now. Please try again in a moment.',
      detail: error.message
    });
  }
}
