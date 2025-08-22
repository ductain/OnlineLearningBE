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

module.exports = router;

