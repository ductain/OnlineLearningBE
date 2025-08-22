const teacherService = require('../services/teacherService');

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await teacherService.getAllTeachers();
    res.json(teachers);
  } catch (error) {
    res.status(500).json(error);
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
      const teacher = await teacherService.getTeacherById(id);
      if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json(error);
  }
}; 

exports.getTeacherSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await teacherService.getTeacherSchedule(id);
    res.json(schedule);
  } catch (error) {
    console.error('Error fetching teacher schedule:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};