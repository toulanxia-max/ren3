const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/activityController');
const { auth, authorizeCaptainOrAdmin } = require('../middleware/auth');

/**
 * @route GET /api/v1/activities
 * @desc 获取活动列表
 * @access Private
 */
router.get('/', auth, ActivityController.getActivities);

/**
 * @route GET /api/v1/activities/:id
 * @desc 获取活动详情
 * @access Private
 */
router.get('/:id', auth, ActivityController.getActivity);

/**
 * @route POST /api/v1/activities
 * @desc 创建活动（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.post('/', auth, authorizeCaptainOrAdmin, ActivityController.createActivity);

/**
 * @route PUT /api/v1/activities/:id
 * @desc 更新活动（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.put('/:id', auth, authorizeCaptainOrAdmin, ActivityController.updateActivity);

/**
 * @route DELETE /api/v1/activities/:id
 * @desc 删除活动（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.delete('/:id', auth, authorizeCaptainOrAdmin, ActivityController.deleteActivity);

/**
 * @route GET /api/v1/activities/codes
 * @desc 获取兑换码列表
 * @access Private
 */
router.get('/codes', auth, ActivityController.getRedemptionCodes);

/**
 * @route POST /api/v1/activities/codes
 * @desc 创建兑换码（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.post('/codes', auth, authorizeCaptainOrAdmin, ActivityController.createRedemptionCode);

/**
 * @route PUT /api/v1/activities/codes/:id
 * @desc 更新兑换码（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.put('/codes/:id', auth, authorizeCaptainOrAdmin, ActivityController.updateRedemptionCode);

/**
 * @route POST /api/v1/activities/codes/redeem
 * @desc 兑换码兑换
 * @access Private
 */
router.post('/codes/redeem', auth, ActivityController.redeemCode);

module.exports = router;