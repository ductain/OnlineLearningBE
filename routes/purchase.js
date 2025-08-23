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
 * /api/v1/purchases/webhook:
 *   post:
 *     tags: [Purchase]
 *     summary: Stripe webhook endpoint
 *     responses:
 *       200:
 *         description: Webhook received
 *       400:
 *         description: Webhook error
 */
router.post('/webhook', express.raw({ type: 'application/json' }), purchaseController.handleWebhook);

module.exports = router;

