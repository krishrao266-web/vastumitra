const Razorpay = require('razorpay');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // TEMPORARY DIAGNOSTIC — remove after debugging
  console.log('DEBUG key_id:', JSON.stringify(process.env.RAZORPAY_KEY_ID));
  console.log('DEBUG key_id length:', process.env.RAZORPAY_KEY_ID?.length);
  console.log('DEBUG key_secret length:', process.env.RAZORPAY_KEY_SECRET?.length);
  console.log('DEBUG key_secret first/last char codes:', process.env.RAZORPAY_KEY_SECRET?.charCodeAt(0), process.env.RAZORPAY_KEY_SECRET?.charCodeAt(process.env.RAZORPAY_KEY_SECRET.length - 1));

  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: 2000, // amount is in paise: 2000 = ₹20
      currency: 'INR',
      receipt: 'vastu_' + Date.now(),
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error('create-order error:', err);
    res.status(500).json({ error: 'Could not create payment order' });
  }
};
