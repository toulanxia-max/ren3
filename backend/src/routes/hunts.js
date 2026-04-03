const express = require('express');
const router = express.Router();
const HuntController = require('../controllers/huntController');
const multer = require('multer');
const { auth, authorizeCaptainOrAdmin, authorizeAdmin } = require('../middleware/auth');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * @route GET /api/v1/hunts
 * @desc 获取猎杀记录列表
 * @access Private
 */
router.get('/', auth, HuntController.getHunts);

/**
 * @route GET /api/v1/hunts/:id
 * @desc 获取猎杀记录详情
 * @access Private
 */
router.get('/:id', auth, HuntController.getHunt);

/**
 * @route POST /api/v1/hunts
 * @desc 创建猎杀记录（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.post('/', auth, authorizeCaptainOrAdmin, HuntController.createHunt);

/**
 * @route POST /api/v1/hunts/manual
 * @desc 成员手动发布SS+猎杀任务
 * @access Private
 */
router.post('/manual', auth, HuntController.createManualHunt);

/**
 * @route POST /api/v1/hunts/upload
 * @desc 成员上传截图并自动生成任务
 * @access Private
 */
router.post('/upload', auth, upload.single('screenshot'), HuntController.uploadHunt);

/**
 * @route PUT /api/v1/hunts/:id
 * @desc 更新猎杀记录（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.put('/:id', auth, authorizeCaptainOrAdmin, HuntController.updateHunt);

/**
 * @route PUT /api/v1/hunts/:id/assign-slots
 * @desc 管理员分配5个位置
 * @access Private (Admin)
 */
router.put('/:id/assign-slots', auth, authorizeAdmin, HuntController.assignSlots);

/**
 * @route PUT /api/v1/hunts/:id/complete
 * @desc 完成猎杀任务（仅管理员或发布者）
 * @access Private
 */
router.put('/:id/complete', auth, HuntController.completeHunt);

/**
 * @route PUT /api/v1/hunts/:id/reopen
 * @desc 取消完成标记（仅管理员或发布者）
 * @access Private
 */
router.put('/:id/reopen', auth, HuntController.reopenHunt);

/**
 * @route DELETE /api/v1/hunts/:id
 * @desc 删除猎杀记录（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.delete('/:id', auth, authorizeCaptainOrAdmin, HuntController.deleteHunt);

module.exports = router;