const pool = require('../config/pool');

exports.getPackages = async (teacherId) => {
  if (teacherId) {
    const result = await pool.query('SELECT * FROM packages WHERE teacherId = $1', [teacherId]);
    return result.rows;
  }
  const result = await pool.query('SELECT * FROM packages');
  return result.rows;
};

exports.getPackageById = async (id) => {
  const result = await pool.query('SELECT * FROM packages WHERE id = $1', [id]);
  if (result.rows.length === 0) {
    const error = new Error('Package not found.');
    error.statusCode = 404;
    throw error;
  }
  return result.rows[0];
};

