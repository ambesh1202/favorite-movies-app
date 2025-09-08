const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

/**
 * @openapi
 * /api/v1/auth/signup:
 *   post:
 *     summary: Signup
 */
router.post('/signup', signup);

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Login
 */
router.post('/login', login);

module.exports = router;
