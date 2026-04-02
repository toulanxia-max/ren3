const { ClanBattle } = require('../models');
const logger = require('../utils/logger');

class BattleController {
  /**
   * 获取家族战记录列表
   */
  static async getBattles(req, res, next) {
    try {
      const { date, result } = req.query;
      const where = {};

      if (date) where.battle_date = date;
      if (result) where.result = result;

      const battles = await ClanBattle.findAll({
        where,
        include: ['recorder']
      });

      res.status(200).json({
        success: true,
        data: { battles }
      });
    } catch (error) {
      logger.error('获取家族战记录列表失败:', error);
      next(error);
    }
  }

  /**
   * 获取家族战记录详情
   */
  static async getBattle(req, res, next) {
    try {
      const battle = await ClanBattle.findByPk(req.params.id, {
        include: ['recorder']
      });

      if (!battle) {
        return res.status(404).json({
          success: false,
          message: '家族战记录不存在'
        });
      }

      res.status(200).json({
        success: true,
        data: { battle }
      });
    } catch (error) {
      logger.error('获取家族战记录详情失败:', error);
      next(error);
    }
  }

  /**
   * 创建家族战记录
   */
  static async createBattle(req, res, next) {
    try {
      const battle = await ClanBattle.create({
        ...req.body,
        recorded_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: '家族战记录创建成功',
        data: { battle }
      });
    } catch (error) {
      logger.error('创建家族战记录失败:', error);
      next(error);
    }
  }

  /**
   * 更新家族战记录
   */
  static async updateBattle(req, res, next) {
    try {
      const battle = await ClanBattle.findByPk(req.params.id);
      if (!battle) {
        return res.status(404).json({
          success: false,
          message: '家族战记录不存在'
        });
      }

      await battle.update(req.body);

      res.status(200).json({
        success: true,
        message: '家族战记录更新成功',
        data: { battle }
      });
    } catch (error) {
      logger.error('更新家族战记录失败:', error);
      next(error);
    }
  }

  /**
   * 删除家族战记录
   */
  static async deleteBattle(req, res, next) {
    try {
      const battle = await ClanBattle.findByPk(req.params.id);
      if (!battle) {
        return res.status(404).json({
          success: false,
          message: '家族战记录不存在'
        });
      }

      await battle.destroy();

      res.status(200).json({
        success: true,
        message: '家族战记录删除成功'
      });
    } catch (error) {
      logger.error('删除家族战记录失败:', error);
      next(error);
    }
  }

  /**
   * 获取家族战统计数据
   */
  static async getBattleStats(req, res, next) {
    try {
      const totalBattles = await ClanBattle.count();
      const wins = await ClanBattle.count({ where: { result: 'win' } });
      const loses = await ClanBattle.count({ where: { result: 'lose' } });
      const draws = await ClanBattle.count({ where: { result: 'draw' } });

      res.status(200).json({
        success: true,
        data: {
          totalBattles,
          wins,
          loses,
          draws,
          winRate: totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(2) : 0
        }
      });
    } catch (error) {
      logger.error('获取家族战统计数据失败:', error);
      next(error);
    }
  }
}

module.exports = BattleController;