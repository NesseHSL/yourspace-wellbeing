export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { priceId, mode, userId, userEmail, successUrl, cancelUrl } = req.body;

  // Dynamic statement descriptors per product
  const DESCRIPTORS = {
    'price_1TKgTb3qlwzbgcp90SbfgCx6': 'YOURSPACE',
    'price_1TKgUA3qlwzbgcp9ri4kF42a': 'YOURSPACE',
    'price_1TKgVa3qlwzbgcp90PqK6EvG': 'YOURSPACE',
    'price_1TKgVa3qlwzbgcp9Bjt9s6yg': 'YOURSPACE',
    'price_1U7zGl3qlwzbgcp9sNjlcIYu': 'YOURSPACE',
    'price_1U3wIK3qlwzbgcp9oC7W1lps': 'YOURSPACE',
    'price_PLACEHOLDER_RESTORE': 'YOURSPACE',
    'price_1TKgT63qlwzbgcp9IBc6QrcA': 'CITE THE APP',
    'price_1TKgT63qlwzbgcp9K2PRVMac': 'CITE THE APP',
  };

  // Home Studio monthly gets a 7-day free trial
  const TRIAL_PRICE_IDS = new Set([
    'price_1TKgVa3qlwzbgcp90PqK6EvG',
  ]);

  try {
    const descriptor = DESCRIPTORS[priceId] || 'HERSPACE LONDON';
    const hasTrial = TRIAL_PRICE_IDS.has(priceId);

    const params = new URLSearchParams({
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'mode': mode,
      'success_url': successUrl,
      'cancel_url': cancelUrl,
      'metadata[user_id]': userId || '',
      'metadata[price_id]': priceId,
      'allow_promotion_codes': 'true',
      // Trials start at £0 due today, so force card collection now —
      // otherwise Stripe may skip it and have nothing to bill on day 8.
      'payment_method_collection': hasTrial ? 'always' : 'if_required',
    });

    // statement_descriptor param differs by payment mode
    if (mode === 'subscription') {
      params.append('subscription_data[description]', descriptor);
      if (hasTrial) {
        params.append('subscription_data[trial_period_days]', '7');
      }
    } else {
      params.append('payment_intent_data[statement_descriptor]', descriptor);
    }

    if (userEmail) params.append('customer_email', userEmail);

    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const session = await response.json();

    if (!response.ok) {
      throw new Error(session.error?.message || 'Stripe error');
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: error.message });
  }
}
