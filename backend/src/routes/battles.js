const express = require('express');
const router = express.Router();
const BattleController = require('../controllers/battleController');
const { auth, authorizeCaptainOrAdmin } = require('../middleware/auth');

/**
 * @route GET /api/v1/battles
 * @desc 获取家族战记录列表
 * @access Private
 */
router.get('/', auth, BattleController.getBattles);

/**
 * @route GET /api/v1/battles/stats
 * @desc 获取家族战统计数据
 * @access Private
 */
router.get('/stats', auth, BattleController.getBattleStats);

/**
 * @route GET /api/v1/battles/:id
 * @desc 获取家族战记录详情
 * @access Private
 */
router.get('/:id', auth, BattleController.getBattle);

/**
 * @route POST /api/v1/battles
 * @desc 创建家族战记录（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.post('/', auth, authorizeCaptainOrAdmin, BattleController.createBattle);

/**
 * @route PUT /api/v1/battles/:id
 * @desc 更新家族战记录（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.put('/:id', auth, authorizeCaptainOrAdmin, BattleController.updateBattle);

/**
 * @route DELETE /api/v1/battles/:id
 * @desc 删除家族战记录（队长或管理员）
 * @access Private (Captain/Admin)
 */
router.delete('/:id', auth, authorizeCaptainOrAdmin, BattleController.deleteBattle);

module.exports = router;