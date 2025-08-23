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
    INSERT INTO purchases (studentid, packageid, status)
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

  // Create Stripe Checkout session (which creates a payment intent internally)
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: packageData.name,
            description: `${packageData.teachername}`,
          },
          unit_amount: Math.round(packageData.price), // Amount in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${frontendUrl}/package`,
    cancel_url: `${frontendUrl}`,
    metadata: {
      studentId: studentId,
      packageId: packageId,
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
    
    // Check if purchase already exists to prevent duplicates
    const existingPurchase = await pool.query(
      'SELECT id FROM purchases WHERE studentid = $1 AND packageid = $2 AND status = $3',
      [studentId, packageId, 'active']
    );
    
    if (existingPurchase.rows.length > 0) {
      console.log('Purchase already exists, skipping duplicate insertion:', existingPurchase.rows[0].id);
      return existingPurchase.rows[0];
    }
    
    // Create purchase record
    const insertQuery = `
      INSERT INTO purchases (studentid, packageid, status)
      VALUES ($1, $2, 'active')
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [studentId, packageId]);
    console.log('New purchase created:', result.rows[0].id);
    return result.rows[0];
  }
  
  throw new Error('Payment not completed');
};

exports.getPurchasesByStudentId = async (studentId) => {
  const query = `
    SELECT 
      p.id,
      p.studentid,
      p.packageid,
      p.status,
      p.startdate,
      p.enddate,
      p.createdat,
      pkg.name as package_name,
      pkg.totalhours as package_total_hours,
      pkg.price as package_price,
      t.id as teacher_id,
      t.name as teacher_name,
      t.avatar as teacher_avatar,
      t.specialization as teacher_specialization,
      t.shortdesc as teacher_short_desc,
      t.rating as teacher_rating
    FROM purchases p
    JOIN packages pkg ON p.packageid = pkg.id
    JOIN teachers t ON pkg.teacherid = t.id
    WHERE p.studentid = $1
    ORDER BY p.createdat DESC
  `;

  const result = await pool.query(query, [studentId]);
  return result.rows;
};

