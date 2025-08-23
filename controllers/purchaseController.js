const purchaseService = require('../services/purchaseService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPurchase = async (req, res) => {
  try {
    const { packageId } = req.body;
    const studentId = req.user?.id;

    const purchase = await purchaseService.createPurchase({ studentId, packageId });
    res.status(201).json({ message: 'Mua gói học thành công', purchase });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error creating purchase:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.createPaymentIntent = async (req, res) => {
  try {
    const { packageId } = req.body;
    const studentId = req.user?.id;

    const paymentData = await purchaseService.createPaymentIntent({ studentId, packageId });
    res.json({
      message: 'Checkout session created successfully',
      checkoutUrl: paymentData.checkoutUrl,
      sessionId: paymentData.sessionId,
      amount: paymentData.amount,
      package: paymentData.package
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      try {
        const session = event.data.object;
        if (session.payment_status === 'paid') {
          await purchaseService.handlePaymentSuccess(session.id);
          console.log('Payment succeeded:', session.id);
        }
      } catch (error) {
        console.error('Error handling payment success:', error);
      }
      break;
    
    case 'checkout.session.expired':
      const session = event.data.object;
      console.log('Checkout session expired:', session.id);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

