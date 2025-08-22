const pool = require('../config/pool');

exports.getAllTeachers = async () => {
  const result = await pool.query('SELECT * FROM teachers');
  return result.rows;
};

exports.getTeacherById = async (id) => {
  const result = await pool.query('SELECT * FROM teachers WHERE id = $1', [id]);
  return result.rows[0];
};

exports.getTeacherSchedule = async (teacherId) => {
  const result = await pool.query(
    'SELECT id, teacherId, dayOfWeek, startTime, endTime, isActive FROM teacher_schedules WHERE teacherId = $1 ORDER BY dayOfWeek ASC, startTime ASC',
    [teacherId]
  );

  const vietnameseDays = [
    'Chủ Nhật',
    'Thứ 2',
    'Thứ 3',
    'Thứ 4',
    'Thứ 5',
    'Thứ 6',
    'Thứ 7',
  ];

  return result.rows.map((row) => ({
    id: row.id,
    teacherId: row.teacherid,
    dayOfWeek: row.dayofweek,
    dayName: vietnameseDays[row.dayofweek],
    startTime: row.starttime,
    endTime: row.endtime,
    isActive: row.isactive,
  }));
};