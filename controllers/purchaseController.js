const purchaseService = require('../services/purchaseService');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Track processed webhook events to prevent duplicates
const processedEvents = new Set();

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

  console.log('Webhook received - Headers:', req.headers);
  console.log('Webhook endpoint secret:', endpointSecret ? 'Set' : 'Not set');

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('Received webhook event:', event.type);
  console.log('Event data:', JSON.stringify(event.data, null, 2));

  // Check if we've already processed this event
  const eventId = event.id;
  if (processedEvents.has(eventId)) {
    console.log('Event already processed, skipping:', eventId);
    return res.json({ received: true, message: 'Event already processed' });
  }

  // Add event to processed set
  processedEvents.add(eventId);

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      try {
        const session = event.data.object;
        console.log('Checkout session completed:', session.id);
        console.log('Payment status:', session.payment_status);
        console.log('Session metadata:', session.metadata);
        
        if (session.payment_status === 'paid') {
          console.log('Processing payment success for session:', session.id);
          await purchaseService.handlePaymentSuccess(session.id);
          console.log('Payment succeeded via checkout session:', session.id);
        } else {
          console.log('Session not paid, status:', session.payment_status);
        }
      } catch (error) {
        console.error('Error handling checkout session completion:', error);
      }
      break;

    case 'payment_intent.succeeded':
      try {
        const paymentIntent = event.data.object;
        console.log('Payment intent succeeded:', paymentIntent.id);
        console.log('Payment intent metadata:', paymentIntent.metadata);
        
        // For direct payment intents, we need to find the associated session
        const sessions = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1
        });
        
        if (sessions.data.length > 0) {
          console.log('Found associated session:', sessions.data[0].id);
          await purchaseService.handlePaymentSuccess(sessions.data[0].id);
          console.log('Payment succeeded via payment intent:', paymentIntent.id);
        } else {
          console.log('No session found for payment intent:', paymentIntent.id);
        }
      } catch (error) {
        console.error('Error handling payment success:', error);
      }
      break;
    
    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent.id);
      break;
    
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Test endpoint for debugging webhook
exports.testWebhook = async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('Testing webhook with session ID:', sessionId);
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log('Session found:', session.id, 'Payment status:', session.payment_status);
    console.log('Session metadata:', session.metadata);
    
    if (session.payment_status === 'paid') {
      await purchaseService.handlePaymentSuccess(session.id);
      res.json({ message: 'Test webhook processed successfully', sessionId });
    } else {
      res.json({ message: 'Session not paid', sessionId, paymentStatus: session.payment_status });
    }
  } catch (error) {
    console.error('Test webhook error:', error);
    res.status(500).json({ message: 'Test webhook failed', error: error.message });
  }
};

// Simple webhook test endpoint
exports.webhookTest = async (req, res) => {
  res.json({ 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString(),
    method: req.method,
    headers: req.headers
  });
};

exports.getPurchasesByStudentId = async (req, res) => {
  try {
    const studentId = req.user?.id;
    
    if (!studentId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const purchases = await purchaseService.getPurchasesByStudentId(studentId);
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

