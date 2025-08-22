const express = require('express');
const router = express.Router();
const packageController = require('../controllers/packageController');

/**
 * @swagger
 * tags:
 *   name: Package
 *   description: Package APIs
 */

/**
 * @swagger
 * /api/v1/packages:
 *   get:
 *     tags: [Package]
 *     summary: Danh sách gói học
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *         required: false
 *     responses:
 *       200:
 *         description: OK
 */
router.get('/', packageController.getPackages);

/**
 * @swagger
 * /api/v1/packages/{id}:
 *   get:
 *     tags: [Package]
 *     summary: Chi tiết gói học
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OK
 *       404:
 *         description: Not found
 */
router.get('/:id', packageController.getPackageById);

module.exports = router;

