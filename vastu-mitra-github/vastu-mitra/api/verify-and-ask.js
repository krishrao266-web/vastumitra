const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    direction,
    question,
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !question) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Verify the payment actually happened and wasn't tampered with,
  // before spending anything on the Claude API call.
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + '|' + razorpay_payment_id)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: 'Payment verification failed' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system:
          "You are a knowledgeable, grounded Vastu Shastra consultant writing for an Indian homeowner. Answer the specific question clearly in 120-180 words: state the relevant principle, what it means for their situation, and one or two practical remedies if relevant. Be warm but concise, avoid fear-mongering, and gently note where a structural engineer or architect should be consulted for anything load-bearing or safety-related.",
        messages: [
          {
            role: 'user',
            content: 'Direction concerned: ' + (direction || 'Not sure') + '\n\nQuestion: ' + question,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', errBody);
      return res.status(502).json({ error: 'Answer service is unavailable right now' });
    }

    const data = await response.json();
    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();

    res.status(200).json({ answer: text || 'No answer returned — please try again.' });
  } catch (err) {
    console.error('verify-and-ask error:', err);
    res.status(500).json({ error: 'Could not reach the answer service' });
  }
};
