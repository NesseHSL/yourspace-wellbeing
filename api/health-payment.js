// Pricing: 150 pence (£1.50) early access, 250 pence (£2.50) standard
// Switch happens at 1000 paid dives — tracked via Supabase
async function getCurrentPrice() {
  try {
    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/deep_dives?select=id&is_paid=eq.true`,
      {
        headers: {
          'apikey':        process.env.SUPABASE_PUBLISHABLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`,
          'Prefer':        'count=exact',
        },
      }
    );
    const range = res.headers.get('content-range'); // e.g. "0-24/1234"
    const count = range ? parseInt(range.split('/')[1], 10) : 0;
    return count < 1000 ? 150 : 250;
  } catch (e) {
    return 150; // default to early access price if Supabase unavailable
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe not configured' });
  }

  try {
    const amount = await getCurrentPrice();

    const params = new URLSearchParams({
      amount: String(amount),
      currency: 'gbp',
      description: 'YourSpace Health Claim Checker deep dive',
      'automatic_payment_methods[enabled]': 'true',
      // No customer object, no email, no metadata with identifiers
    });

    const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    const paymentIntent = await stripeRes.json();
    if (!stripeRes.ok) {
      throw new Error(paymentIntent.error?.message || 'Stripe error');
    }

    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount,
    });
  } catch (e) {
    console.error('Payment error:', e.message);
    res.status(500).json({ error: e.message });
  }
}
