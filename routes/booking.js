const express = require('express');
const router = express.Router();
const { verifyToken } = require('../config/verify');
const bookingController = require('../controllers/bookingController');

/**
 * @swagger
 * tags:
 *   name: Booking
 *   description: Booking APIs
 */

/**
 * @swagger
 * /api/v1/bookings/trial:
 *   post:
 *     tags: [Booking]
 *     summary: Tạo lịch học thử
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teacherId:
 *                 type: integer
 *               scheduleDate:
 *                 type: string
 *                 format: date
 *               scheduleTime:
 *                 type: string
 *                 format: time
 *     responses:
 *       201:
 *         description: Đặt lịch học thử thành công
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/trial', verifyToken, bookingController.createTrialBooking);

/**
 * @swagger
 * /api/v1/bookings/my-bookings:
 *   get:
 *     tags: [Booking]
 *     summary: Lấy tất cả lịch học của học viên
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách lịch học
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       studentid:
 *                         type: integer
 *                       teacherid:
 *                         type: integer
 *                       scheduledate:
 *                         type: string
 *                         format: date
 *                       scheduletime:
 *                         type: string
 *                         format: time
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdat:
 *                         type: string
 *                         format: date-time
 *                       teacher_name:
 *                         type: string
 *                       teacher_avatar:
 *                         type: string
 *                       teacher_specialization:
 *                         type: string
 *                       teacher_short_desc:
 *                         type: string
 *                       teacher_rating:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/my-bookings', verifyToken, bookingController.getBookingsByStudentId);

module.exports = router;

