import crypto from 'crypto';

export const config = {
  api: { bodyParser: false },
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false;

  const parts = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')));
  const timestamp = parts.t;
  const signature = parts.v1;
  if (!timestamp || !signature) return false;

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  const sigBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expectedSig, 'hex');
  if (sigBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

// Every row from the same subscription (including each All Access programme
// row — see api/record-purchase.js) shares one stripe_payment_id. Pass
// programmeIds to scope the update to specific programmes only — used to
// keep Sofa to Studio's fixed one-time window from being extended on renewal.
async function updatePurchasesForSubscription(subscriptionId, { isActive, expiresAt, programmeIds }) {
  const supabaseHeaders = {
    'apikey':        process.env.SUPABASE_PUBLISHABLE_KEY,
    'Authorization': `Bearer ${process.env.SUPABASE_SECRET_SERVICE_KEY}`,
    'Content-Type':  'application/json',
    'Prefer':        'return=minimal',
  };

  const body = { is_active: isActive };
  if (expiresAt !== undefined) body.expires_at = expiresAt;

  let url = `${process.env.SUPABASE_URL}/rest/v1/purchases?stripe_payment_id=eq.${subscriptionId}`;
  if (programmeIds) {
    url += `&programme_id=in.(${programmeIds.join(',')})`;
  }

  const res = await fetch(url, { method: 'PATCH', headers: supabaseHeaders, body: JSON.stringify(body) });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Supabase update failed:', errText);
    throw new Error('Failed to update purchases');
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawBody = await getRawBody(req);
  const sigHeader = req.headers['stripe-signature'];

  if (!verifyStripeSignature(rawBody, sigHeader, process.env.STRIPE_WEBHOOK_SECRET)) {
    console.error('Invalid Stripe webhook signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(rawBody);

  try {
    switch (event.type) {
      // Fires on every successful subscription payment, including renewals —
      // this is what keeps expires_at current without anyone re-purchasing.
      case 'invoice.paid': {
        const subscriptionId = event.data.object.subscription;
        if (!subscriptionId) break;

        const subRes = await fetch(
          `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
          { headers: { 'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}` } }
        );
        const subscription = await subRes.json();
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();

        // Sofa to Studio is deliberately excluded — it keeps the fixed
        // 60-day window set at purchase (api/record-purchase.js) rather than
        // renewing indefinitely alongside the subscription.
        await updatePurchasesForSubscription(subscriptionId, {
          isActive: true,
          expiresAt,
          programmeIds: ['home-studio', 'prehab', 'nutrition-guide', 'restore', 'health-claim-checker'],
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscriptionId = event.data.object.id;
        await updatePurchasesForSubscription(subscriptionId, { isActive: false });
        break;
      }

      case 'invoice.payment_failed': {
        const subscriptionId = event.data.object.subscription;
        if (subscriptionId) {
          await updatePurchasesForSubscription(subscriptionId, { isActive: false });
        }
        break;
      }

      default:
        break; // ignore events we don't act on
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ error: error.message });
  }
}
