const pool = require('../config/pool');

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

