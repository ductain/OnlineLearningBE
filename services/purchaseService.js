const pool = require('../config/pool');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.createPurchase = async (params) => {
  const { studentId, packageId } = params;

  if (!studentId || !packageId) {
    const error = new Error('Missing required fields.');
    error.statusCode = 400;
    throw error;
  }

  // Validate student exists
  const student = await pool.query('SELECT id FROM students WHERE id = $1', [studentId]);
  if (student.rows.length === 0) {
    const error = new Error('Student not found.');
    error.statusCode = 404;
    throw error;
  }

  // Validate package exists
  const pkg = await pool.query('SELECT id FROM packages WHERE id = $1', [packageId]);
  if (pkg.rows.length === 0) {
    const error = new Error('Package not found.');
    error.statusCode = 404;
    throw error;
  }

  const insertQuery = `
    INSERT INTO purchases (studentId, packageId, status)
    VALUES ($1, $2, 'active')
    RETURNING *
  `;

  const result = await pool.query(insertQuery, [studentId, packageId]);
  return result.rows[0];
};

exports.createPaymentIntent = async (params) => {
  const { studentId, packageId } = params;

  if (!studentId || !packageId) {
    const error = new Error('Missing required fields.');
    error.statusCode = 400;
    throw error;
  }

  // Validate student exists
  const student = await pool.query('SELECT id, name FROM students WHERE id = $1', [studentId]);
  if (student.rows.length === 0) {
    const error = new Error('Student not found.');
    error.statusCode = 404;
    throw error;
  }

  // Validate package exists and get price
  const pkg = await pool.query(`
    SELECT p.id, p.name, p.price, p.totalHours, t.name as teacherName 
    FROM packages p 
    JOIN teachers t ON p.teacherId = t.id 
    WHERE p.id = $1
  `, [packageId]);
  
  if (pkg.rows.length === 0) {
    const error = new Error('Package not found.');
    error.statusCode = 404;
    throw error;
  }

  const packageData = pkg.rows[0];

  // Validate and set frontend URL
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  if (!frontendUrl.startsWith('http://') && !frontendUrl.startsWith('https://')) {
    throw new Error('FRONTEND_URL must include http:// or https:// scheme');
  }

  // Create Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: packageData.name,
            description: `${packageData.totalHours} hours with ${packageData.teachername}`,
          },
          unit_amount: Math.round(packageData.price), // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${frontendUrl}/payment/cancel`,
    metadata: {
      studentId: studentId.toString(),
      packageId: packageId.toString(),
      studentName: student.rows[0].name,
      packageName: packageData.name,
      teacherName: packageData.teachername
    },
    customer_email: student.rows[0].email || undefined,
  });

  return {
    checkoutUrl: session.url,
    sessionId: session.id,
    amount: packageData.price,
    package: packageData
  };
};

exports.handlePaymentSuccess = async (sessionId) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  
  if (session.payment_status === 'paid') {
    const { studentId, packageId } = session.metadata;
    
    const insertQuery = `
      INSERT INTO purchases (studentId, packageId, status)
      VALUES ($1, $2, 'active')
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [studentId, packageId]);
    return result.rows[0];
  }
  
  throw new Error('Payment not completed');
};

