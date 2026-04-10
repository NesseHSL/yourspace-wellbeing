export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, userId } = req.body;

  // Price ID to programme mapping
  const PROGRAMMES = {
    'price_1TKgTb3qlwzbgcp90SbfgCx6': { name: 'YourSpace Pre-Hab', days: 90 },
    'price_1TKgUA3qlwzbgcp9ri4kF42a': { name: 'Sofa to Studio', days: 90 },
    'price_1TKgVa3qlwzbgcp90PqK6EvG': { name: 'The Home Studio', days: 30 },
    'price_1TKgVa3qlwzbgcp9Bjt9s6yg': { name: 'The Home Studio', days: 365 },
    'price_1TKga13qlwzbgcp91FW2aAUs': { name: 'All Access', days: 30 },
    'price_1TKga13qlwzbgcp9VINFmvVQ': { name: 'All Access', days: 365 },
  };

  try {
    // Verify payment with Stripe
    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    });
    const session = await stripeRes.json();

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    const priceId = session.metadata?.price_id;
    const programme = PROGRAMMES[priceId];

    if (!programme) {
      return res.status(400).json({ error: 'Unknown programme' });
    }

    // Calculate expiry
    const purchasedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + programme.days);

    // Record in Supabase
    const supabaseRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/purchases`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          user_id: userId || session.metadata?.user_id,
          programme_id: priceId,
          programme_name: programme.name,
          amount_paid: session.amount_total / 100,
          currency: session.currency,
          purchased_at: purchasedAt.toISOString(),
          expires_at: expiresAt.toISOString(),
          stripe_payment_id: session.payment_intent,
          stripe_receipt_url: session.receipt_url || null,
          is_active: true
        })
      }
    );

    if (!supabaseRes.ok) {
      throw new Error('Failed to record purchase');
    }

    return res.status(200).json({ success: true, programme: programme.name });
  } catch (error) {
    console.error('Record purchase error:', error);
    return res.status(500).json({ error: error.message });
  }
}
