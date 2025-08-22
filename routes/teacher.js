const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');

/**
 * @swagger
 * tags:
 *   name: Teacher
 *   description: The Teacher managing API
 */

/**
 * @swagger
 * /api/v1/teachers:
 *   get:
 *     tags: [Teacher]
 *     summary: Get all teachers
 *     description: Retrieve a list of all teachers in the database.
 *     responses:
 *       200:
 *         description: A list of teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   avatar:
 *                     type: string
 *                   specialization:
 *                     type: string
 *                   shortDesc:
 *                     type: string
 *                   longDesc:
 *                     type: string
 *                   rating:
 *                     type: number
 *                   introVideo:
 *                     type: string
 */
router.get('/', teacherController.getAllTeachers);

/**
 * @swagger
 * /api/v1/teachers/{id}:
 *   get:
 *     tags: [Teacher]
 *     summary: Get a teacher by ID
 *     description: Retrieve a single teacher by its unique ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the teacher
 *     responses:
 *       200:
 *         description: teacher found
 *       404:
 *         description: teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/:id', teacherController.getTeacherById);

/**
 * @swagger
 * /api/v1/teachers/{id}/schedule:
 *   get:
 *     tags: [Teacher]
 *     summary: Lịch rảnh theo tuần của giáo viên
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/:id/schedule', teacherController.getTeacherSchedule);

module.exports = router; 