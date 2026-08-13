// api/create-portal-session.js — opens Stripe's hosted Billing Portal for a
// subscription so the customer can cancel, update payment method, or view
// invoices themselves. No Stripe customer ID is stored anywhere, so it's
// looked up from the subscription at request time.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscriptionId, returnUrl } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({ error: 'subscriptionId is required' });
  }

  try {
    const subRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
      headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` }
    });
    const subscription = await subRes.json();

    if (!subRes.ok) {
      throw new Error(subscription.error?.message || 'Could not find that subscription');
    }

    const params = new URLSearchParams({
      customer: subscription.customer,
      return_url: returnUrl,
    });

    const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });

    const portalSession = await portalRes.json();

    if (!portalRes.ok) {
      throw new Error(portalSession.error?.message || 'Could not open the billing portal');
    }

    return res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal session error:', error);
    return res.status(500).json({ error: error.message });
  }
}
