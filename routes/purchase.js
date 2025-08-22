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

module.exports = router;

