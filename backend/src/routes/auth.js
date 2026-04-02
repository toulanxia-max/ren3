const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authValidator = require('../validators/authValidator');
const { auth } = require('../middleware/auth');

/**
 * @route POST /api/v1/auth/register
 * @desc 用户注册
 * @access Public
 */
router.post('/register', authValidator.register, AuthController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc 用户登录
 * @access Public
 */
router.post('/login', authValidator.login, AuthController.login);

/**
 * @route GET /api/v1/auth/me
 * @desc 获取当前用户信息
 * @access Private
 */
router.get('/me', auth, AuthController.getCurrentUser);

/**
 * @route PUT /api/v1/auth/password
 * @desc 修改密码
 * @access Private
 */
router.put('/password', auth, authValidator.changePassword, AuthController.changePassword);

/**
 * @route POST /api/v1/auth/logout
 * @desc 退出登录
 * @access Private
 */
router.post('/logout', auth, AuthController.logout);

module.exports = router;