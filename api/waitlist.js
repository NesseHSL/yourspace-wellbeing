export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName, programme } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const { createClient } = await import('@supabase/supabase-js');
  const sb = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY
  );

  const { error } = await sb
    .from('waitlist')
    .insert({
      email: email.toLowerCase().trim(),
      first_name: firstName || null,
      programme: programme || null,
    });

  if (error) {
    if (error.code === '23505') {
      // Already signed up — treat as success so we don't reveal who's registered
      return res.status(200).json({ message: 'success' });
    }
    console.error('Waitlist error:', error);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }

  await notifyAdmin(
    'New YourSpace waitlist signup',
    `<p><strong>${email}</strong> just joined the waitlist${programme ? ` for <strong>${programme}</strong>` : ''}.</p>` +
      (firstName ? `<p>Name: ${firstName}</p>` : '')
  );

  return res.status(200).json({ message: 'success' });
}

async function notifyAdmin(subject, html) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'YourSpace <notifications@yourspacewellbeing.com>',
        to: process.env.NOTIFY_EMAIL,
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error('Notification email failed:', err);
  }
}
