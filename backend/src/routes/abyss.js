const express = require('express');
const router = express.Router();
const AbyssController = require('../controllers/abyssController');
const { auth, authorizeCaptainOrAdmin, authorizeAdmin } = require('../middleware/auth');

/**
 * @route GET /api/v1/abyss/teams
 * @desc 获取深渊队伍列表
 * @access Private
 */
router.get('/teams', auth, AbyssController.getTeams);

/**
 * @route GET /api/v1/abyss/schedules
 * @desc 获取深渊排表
 * @access Private
 */
router.get('/schedules', auth, AbyssController.getSchedules);

/**
 * @route GET /api/v1/abyss/records
 * @desc 获取深渊战绩
 * @access Private
 */
router.get('/records', auth, AbyssController.getRecords);

/**
 * @route POST /api/v1/abyss/schedules
 * @desc 创建深渊排表记录（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.post('/schedules', auth, authorizeCaptainOrAdmin, AbyssController.createSchedule);

/**
 * @route PUT /api/v1/abyss/schedules/:id
 * @desc 更新深渊排表记录（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.put('/schedules/:id', auth, authorizeCaptainOrAdmin, AbyssController.updateSchedule);

/**
 * @route POST /api/v1/abyss/records
 * @desc 提交深渊战绩
 * @access Private
 */
router.post('/records', auth, AbyssController.submitRecord);

/**
 * @route POST /api/v1/abyss/leaves
 * @desc 成员自行提交并确认请假（自动退队）
 * @access Private
 */
router.post('/leaves', auth, AbyssController.submitLeave);

/**
 * @route GET /api/v1/abyss/leaves/me
 * @desc 获取当前用户请假记录
 * @access Private
 */
router.get('/leaves/me', auth, AbyssController.getMyLeaves);

/**
 * @route GET /api/v1/abyss/leaves/active
 * @desc 获取当前生效请假列表
 * @access Private
 */
router.get('/leaves/active', auth, AbyssController.getActiveLeaves);

/**
 * @route DELETE /api/v1/abyss/leaves/:id
 * @desc 取消已确认的请假（本人或管理员）
 * @access Private
 */
router.delete('/leaves/:id', auth, AbyssController.cancelLeave);

/**
 * @route GET /api/v1/abyss/weekly-config
 * @desc 获取首页本周配置（四象顺序/兑换码）
 * @access Private
 */
router.get('/weekly-config', auth, AbyssController.getWeeklyConfig);

/**
 * @route PUT /api/v1/abyss/weekly-config
 * @desc 队长或管理员更新首页本周配置
 * @access Private (Captain/Admin)
 */
router.put('/weekly-config', auth, authorizeCaptainOrAdmin, AbyssController.updateWeeklyConfig);

module.exports = router;