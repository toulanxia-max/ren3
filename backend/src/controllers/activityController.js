const { Activity, RedemptionCode, CodeRedemption } = require('../models');
const logger = require('../utils/logger');

class ActivityController {
  /**
   * 获取活动列表
   */
  static async getActivities(req, res, next) {
    try {
      const { type, status } = req.query;
      const where = {};

      if (type) where.activity_type = type;
      if (status) where.status = status;

      const activities = await Activity.findAll({
        where,
        include: ['organizer', 'creator']
      });

      res.status(200).json({
        success: true,
        data: { activities }
      });
    } catch (error) {
      logger.error('获取活动列表失败:', error);
      next(error);
    }
  }

  /**
   * 获取活动详情
   */
  static async getActivity(req, res, next) {
    try {
      const activity = await Activity.findByPk(req.params.id, {
        include: ['organizer', 'creator']
      });

      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '活动不存在'
        });
      }

      res.status(200).json({
        success: true,
        data: { activity }
      });
    } catch (error) {
      logger.error('获取活动详情失败:', error);
      next(error);
    }
  }

  /**
   * 创建活动
   */
  static async createActivity(req, res, next) {
    try {
      const activity = await Activity.create({
        ...req.body,
        created_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: '活动创建成功',
        data: { activity }
      });
    } catch (error) {
      logger.error('创建活动失败:', error);
      next(error);
    }
  }

  /**
   * 更新活动
   */
  static async updateActivity(req, res, next) {
    try {
      const activity = await Activity.findByPk(req.params.id);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '活动不存在'
        });
      }

      await activity.update(req.body);

      res.status(200).json({
        success: true,
        message: '活动更新成功',
        data: { activity }
      });
    } catch (error) {
      logger.error('更新活动失败:', error);
      next(error);
    }
  }

  /**
   * 删除活动
   */
  static async deleteActivity(req, res, next) {
    try {
      const activity = await Activity.findByPk(req.params.id);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: '活动不存在'
        });
      }

      await activity.destroy();

      res.status(200).json({
        success: true,
        message: '活动删除成功'
      });
    } catch (error) {
      logger.error('删除活动失败:', error);
      next(error);
    }
  }

  /**
   * 获取兑换码列表
   */
  static async getRedemptionCodes(req, res, next) {
    try {
      const { status } = req.query;
      const where = {};

      if (status) where.status = status;

      const codes = await RedemptionCode.findAll({
        where,
        include: ['creator']
      });

      res.status(200).json({
        success: true,
        data: { codes }
      });
    } catch (error) {
      logger.error('获取兑换码列表失败:', error);
      next(error);
    }
  }

  /**
   * 创建兑换码
   */
  static async createRedemptionCode(req, res, next) {
    try {
      const code = await RedemptionCode.create({
        ...req.body,
        created_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: '兑换码创建成功',
        data: { code }
      });
    } catch (error) {
      logger.error('创建兑换码失败:', error);
      next(error);
    }
  }

  /**
   * 更新兑换码
   */
  static async updateRedemptionCode(req, res, next) {
    try {
      const code = await RedemptionCode.findByPk(req.params.id);
      if (!code) {
        return res.status(404).json({
          success: false,
          message: '兑换码不存在'
        });
      }

      await code.update(req.body);

      res.status(200).json({
        success: true,
        message: '兑换码更新成功',
        data: { code }
      });
    } catch (error) {
      logger.error('更新兑换码失败:', error);
      next(error);
    }
  }

  /**
   * 兑换码兑换
   */
  static async redeemCode(req, res, next) {
    try {
      const { code } = req.body;
      const redemptionCode = await RedemptionCode.findOne({
        where: { code }
      });

      if (!redemptionCode) {
        return res.status(404).json({
          success: false,
          message: '兑换码不存在'
        });
      }

      // 检查兑换码是否可用
      if (!redemptionCode.isAvailable()) {
        return res.status(400).json({
          success: false,
          message: '兑换码已失效或已使用完毕'
        });
      }

      // 检查用户是否已兑换过
      const existingRedemption = await CodeRedemption.findOne({
        where: {
          code_id: redemptionCode.id,
          user_id: req.user.id
        }
      });

      if (existingRedemption) {
        return res.status(400).json({
          success: false,
          message: '您已兑换过此兑换码'
        });
      }

      // 创建兑换记录
      await CodeRedemption.create({
        code_id: redemptionCode.id,
        user_id: req.user.id
      });

      // 更新使用次数
      await redemptionCode.increment('used_count');

      // 检查是否需要更新状态
      if (redemptionCode.used_count >= redemptionCode.usage_limit) {
        await redemptionCode.update({ status: 'used_up' });
      }

      res.status(200).json({
        success: true,
        message: '兑换成功',
        data: { code: redemptionCode.getCodeInfo() }
      });
    } catch (error) {
      logger.error('兑换码兑换失败:', error);
      next(error);
    }
  }
}

module.exports = ActivityController;