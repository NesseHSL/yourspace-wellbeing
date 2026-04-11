export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, userId } = req.body;

  // Price ID → programme details
  const PROGRAMMES = {
    'price_1TKgTb3qlwzbgcp90SbfgCx6': { id: 'prehab',         name: 'YourSpace Pre-Hab',  days: 90,  type: 'one-off' },
    'price_1TKgUA3qlwzbgcp9ri4kF42a': { id: 'sofa-to-studio', name: 'Sofa to Studio',      days: 90,  type: 'one-off' },
    'price_1TKgVa3qlwzbgcp90PqK6EvG': { id: 'home-studio',    name: 'The Home Studio',     days: 30,  type: 'subscription' },
    'price_1TKgVa3qlwzbgcp9Bjt9s6yg': { id: 'home-studio',    name: 'The Home Studio',     days: 365, type: 'subscription' },
    'price_1TKga13qlwzbgcp91FW2aAUs': { id: 'all-access',     name: 'All Access',          days: 30,  type: 'subscription' },
  };

  // All Access unlocks all of these
  const ALL_ACCESS_PROGRAMMES = [
    { id: 'prehab',         name: 'YourSpace Pre-Hab' },
    { id: 'sofa-to-studio', name: 'Sofa to Studio' },
    { id: 'home-studio',    name: 'The Home Studio' },
  ];

  try {
    // Verify payment with Stripe
    const stripeRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}`,
      { headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` } }
    );
    const session = await stripeRes.json();

    // 'no_payment_required' occurs when a 100% coupon brings the total to £0
    const validStatuses = ['paid', 'no_payment_required'];
    if (!validStatuses.includes(session.payment_status)) {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const priceId    = session.metadata?.price_id;
    const programme  = PROGRAMMES[priceId];

    if (!programme) {
      return res.status(400).json({ error: 'Unknown programme' });
    }

    const resolvedUserId  = userId || session.metadata?.user_id;
    const stripePaymentId = session.subscription || session.payment_intent;
    const purchasedAt     = new Date().toISOString();

    const supabaseHeaders = {
      'apikey':        process.env.SUPABASE_PUBLISHABLE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SECRET_SERVICE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal',
    };

    // ── ALL ACCESS ────────────────────────────────────────────────────
    // Record one purchase row per unlocked programme.
    // Only the first row carries the real amount_paid; the rest are £0
    // so the purchase history can show one consolidated "All Access" entry.
    if (programme.id === 'all-access') {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);
      const expiresAtStr = expiresAt.toISOString();
      const totalPaid = session.amount_total / 100;

      const rows = ALL_ACCESS_PROGRAMMES.map((p, i) => ({
        user_id:          resolvedUserId,
        programme_id:     p.id,
        programme_name:   p.name,
        amount_paid:      i === 0 ? totalPaid : 0,
        currency:         session.currency,
        purchased_at:     purchasedAt,
        expires_at:       expiresAtStr,
        stripe_payment_id: stripePaymentId,
        is_active:        true,
        access_type:      'all-access',
      }));

      const supabaseRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/purchases`,
        { method: 'POST', headers: supabaseHeaders, body: JSON.stringify(rows) }
      );

      if (!supabaseRes.ok) {
        const errText = await supabaseRes.text();
        console.error('Supabase error (All Access):', errText);
        throw new Error(`Supabase All Access insert failed: ${errText}`);
      }

      return res.status(200).json({ success: true, programme: 'All Access' });
    }

    // ── SINGLE PROGRAMME ─────────────────────────────────────────────
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + programme.days);

    const supabaseRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/purchases`,
      {
        method:  'POST',
        headers: supabaseHeaders,
        body: JSON.stringify({
          user_id:          resolvedUserId,
          programme_id:     programme.id,
          programme_name:   programme.name,
          amount_paid:      session.amount_total / 100,
          currency:         session.currency,
          purchased_at:     purchasedAt,
          expires_at:       expiresAt.toISOString(),
          stripe_payment_id: stripePaymentId,
          is_active:        true,
        }),
      }
    );

    if (!supabaseRes.ok) {
      const errText = await supabaseRes.text();
      console.error('Supabase error:', errText);
      throw new Error('Failed to record purchase');
    }

    return res.status(200).json({ success: true, programme: programme.name });

  } catch (error) {
    console.error('Record purchase error:', error);
    return res.status(500).json({ error: error.message, detail: error.stack });
  }
}
