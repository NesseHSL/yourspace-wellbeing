export default async function handler(req, res) {
  try {
    const response = await fetch('https://api.stripe.com/v1/prices?limit=100&expand[]=data.product', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`
      }
    });
    const data = await response.json();
    
    const prices = data.data.map(price => ({
      price_id: price.id,
      product_id: price.product.id,
      product_name: price.product.name,
      amount: price.unit_amount,
      currency: price.currency,
      type: price.type,
      interval: price.recurring?.interval || 'one-off'
    }));

    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
