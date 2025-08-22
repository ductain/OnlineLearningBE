const studentController = require("../controllers/studentController");

const router = require("express").Router();

router.post("/register", studentController.register);
router.post("/login", studentController.login);


/**
 * @swagger
 * tags:
 *   name: Student
 *   description: The Student managing API
 */

/**
 * @swagger
 * /api/v1/students/register:
 *   post:
 *     summary: register
 *     tags: [Student]
 *     requestBody:
 *      required: true
 *      description: Input username, password, name
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      username:
 *                          type: string
 *                      password:
 *                          type: string
 *                      name:
 *                          type: string
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       404:
 *         description: Username đã tồn tại.
 *       400:
 *         description: Password phải có ít nhất 6 ký tự.
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/v1/students/login:
 *   post:
 *     summary: login
 *     tags: [Student]
 *     requestBody:
 *      required: true
 *      description: Input username, pasword 
 *      content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                      username:
 *                          type: string
 *                      password:
 *                          type: string
 *     responses:
 *       201:
 *         description: Đăng nhập thành công
 *       401:
 *         description: Sai username hoặc password
 *       400:
 *         description: Cần Username và password.
 *       500:
 *         description: Internal Server Error
 */

module.exports = router; 