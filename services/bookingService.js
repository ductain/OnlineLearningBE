const pool = require('../config/pool');

exports.createTrialBooking = async (params) => {
  const { studentId, teacherId, scheduleDate, scheduleTime } = params;

  if (!studentId || !teacherId || !scheduleDate || !scheduleTime) {
    const error = new Error('Missing required fields.');
    error.statusCode = 400;
    throw error;
  }

  // Optional: ensure teacher exists
  const teacherCheck = await pool.query('SELECT id FROM teachers WHERE id = $1', [teacherId]);
  if (teacherCheck.rows.length === 0) {
    const error = new Error('Teacher not found.');
    error.statusCode = 404;
    throw error;
  }

  // Optional: ensure student exists
  const studentCheck = await pool.query('SELECT id FROM students WHERE id = $1', [studentId]);
  if (studentCheck.rows.length === 0) {
    const error = new Error('Student not found.');
    error.statusCode = 404;
    throw error;
  }

  const insertQuery = `
    INSERT INTO bookings (studentId, teacherId, scheduleDate, scheduleTime, type, status)
    VALUES ($1, $2, $3, $4, 'trial', 'pending')
    RETURNING *
  `;

  const result = await pool.query(insertQuery, [studentId, teacherId, scheduleDate, scheduleTime]);
  return result.rows[0];
};

exports.getBookingsByStudentId = async (studentId) => {
  const query = `
    SELECT 
      b.id,
      b.studentid,
      b.teacherid,
      b.scheduledate,
      b.scheduletime,
      b.type,
      b.status,
      b.createdat,
      t.name as teacher_name,
      t.avatar as teacher_avatar,
      t.specialization as teacher_specialization,
      t.shortdesc as teacher_short_desc,
      t.rating as teacher_rating
    FROM bookings b
    JOIN teachers t ON b.teacherid = t.id
    WHERE b.studentid = $1
    ORDER BY b.scheduledate DESC, b.scheduletime DESC
  `;

  const result = await pool.query(query, [studentId]);
  return result.rows;
};

