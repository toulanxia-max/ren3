const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const UserController = require('../controllers/userController');
const { auth, authorizeAdmin } = require('../middleware/auth');
// const userValidator = require('../validators/userValidator');

const avatarUploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(avatarUploadDir)) {
  fs.mkdirSync(avatarUploadDir, { recursive: true });
}

const uploadAvatar = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarUploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      cb(null, `avatar-${req.user.id}-${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('仅支持图片文件'));
    }
    cb(null, true);
  }
});

const handleAvatarUpload = (req, res, next) => {
  uploadAvatar.single('avatar')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ success: false, message: '图片大小不能超过 2MB' });
      }
      return res.status(400).json({
        success: false,
        message: err.message || '头像上传失败'
      });
    }
    next();
  });
};

/**
 * @route GET /api/v1/users
 * @desc 获取用户列表
 * @access Private
 */
router.get('/', auth, UserController.getUsers);

/**
 * @route GET /api/v1/users/stats
 * @desc 获取用户统计数据
 * @access Private (Admin)
 */
router.get('/stats', auth, authorizeAdmin, UserController.getUserStats);

/**
 * @route GET /api/v1/users/:id
 * @desc 获取用户详情
 * @access Private
 */
router.get('/:id?', auth, UserController.getUser);

/**
 * @route PUT /api/v1/users/:id/role
 * @desc 更新用户角色（管理员）——须放在 /:id? 之前，避免被错误匹配
 * @access Private (Admin)
 */
router.put('/:id/role', auth, authorizeAdmin, UserController.updateUserRole);

/**
 * @route PUT /api/v1/users/:id
 * @desc 更新用户信息
 * @access Private
 */
router.put('/:id?', auth, UserController.updateUser);

/**
 * @route POST /api/v1/users/avatar
 * @desc 上传当前用户头像（须放在 /:id/avatar 之前，避免被误匹配）
 * @access Private
 */
router.post('/avatar', auth, handleAvatarUpload, UserController.uploadAvatar);

/**
 * @route POST /api/v1/users/:id/avatar
 * @desc 上传指定用户头像（管理员可为他人上传）
 * @access Private
 */
router.post('/:id/avatar', auth, handleAvatarUpload, UserController.uploadAvatar);

/**
 * @route DELETE /api/v1/users/:id
 * @desc 删除用户（管理员）
 * @access Private (Admin)
 */
router.delete('/:id', auth, authorizeAdmin, UserController.deleteUser);

module.exports = router;