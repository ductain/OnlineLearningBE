const express = require('express');
const router = express.Router();
const { verifyToken } = require('../config/verify');
const purchaseController = require('../controllers/purchaseController');

/**
 * @swagger
 * tags:
 *   name: Purchase
 *   description: Purchase APIs
 */

/**
 * @swagger
 * /api/v1/purchases:
 *   post:
 *     tags: [Purchase]
 *     summary: Mua gói học
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Mua gói học thành công
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/', verifyToken, purchaseController.createPurchase);

/**
 * @swagger
 * /api/v1/purchases/payment-intent:
 *   post:
 *     tags: [Purchase]
 *     summary: Tạo Stripe Checkout session
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               packageId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Checkout session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 checkoutUrl:
 *                   type: string
 *                   description: URL to redirect user for payment
 *                 sessionId:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 package:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       400:
 *         description: Bad request
 */
router.post('/payment-intent', verifyToken, purchaseController.createPaymentIntent);

/**
 * @swagger
 * /api/v1/purchases/test-webhook/{sessionId}:
 *   get:
 *     tags: [Purchase]
 *     summary: Test webhook processing (for debugging)
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Test completed
 */
router.get('/test-webhook/:sessionId', purchaseController.testWebhook);

/**
 * @swagger
 * /api/v1/purchases/webhook-test:
 *   get:
 *     tags: [Purchase]
 *     summary: Test webhook endpoint accessibility
 *     responses:
 *       200:
 *         description: Webhook endpoint is accessible
 */
router.get('/webhook-test', purchaseController.webhookTest);

/**
 * @swagger
 * /api/v1/purchases/my-purchases:
 *   get:
 *     tags: [Purchase]
 *     summary: Lấy tất cả gói học đã mua của học viên
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách gói học đã mua
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 purchases:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       studentid:
 *                         type: integer
 *                       packageid:
 *                         type: integer
 *                       status:
 *                         type: string
 *                       startdate:
 *                         type: string
 *                         format: date-time
 *                       enddate:
 *                         type: string
 *                         format: date-time
 *                       createdat:
 *                         type: string
 *                         format: date-time
 *                       package_name:
 *                         type: string
 *                       package_total_hours:
 *                         type: integer
 *                       package_price:
 *                         type: number
 *                       teacher_id:
 *                         type: integer
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
router.get('/my-purchases', verifyToken, purchaseController.getPurchasesByStudentId);

module.exports = router;

