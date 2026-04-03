const {
  AbyssTeam,
  AbyssSchedule,
  AbyssRecord,
  AbyssTeamMember,
  LeaveRecord,
  User,
  FourElementsOrder,
  RedemptionCode,
  sequelize
} = require('../models');
const { Op, QueryTypes } = require('sequelize');
const logger = require('../utils/logger');

class AbyssController {
  /** 与 getDay()/setDate 一致用本地时区，避免 toISOString() 用 UTC 导致周界错一天、读写对不上 */
  static toLocalDateOnly(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  static getCurrentWeekRange() {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return {
      weekStart: AbyssController.toLocalDateOnly(monday),
      weekEnd: AbyssController.toLocalDateOnly(sunday)
    };
  }

  /**
   * 若库中无深渊队伍（未跑 init 种子），补插 1–10 队，与 database/init.sql 一致
   */
  static async ensureDefaultAbyssTeams() {
    // 每次拉列表都执行：缺队则补、已有则 IGNORE；避免「表里曾删过队 / count 误判」导致页面永远空白
    await sequelize.query(
      `INSERT IGNORE INTO abyss_teams (team_number, team_name, status) VALUES
       (1,'第一队','active'),(2,'第二队','active'),(3,'第三队','active'),(4,'第四队','active'),(5,'第五队','active'),
       (6,'第六队','active'),(7,'第七队','active'),(8,'第八队','active'),(9,'第九队','active'),(10,'第十队','active')`,
      { type: QueryTypes.INSERT }
    );
  }

  /**
   * 队长/管理员：向 abyss_teams 写入默认 1～10 队（INSERT IGNORE，可重复执行）
   */
  static async seedDefaultTeams(req, res, next) {
    try {
      if (req.user?.role !== 'admin' && req.user?.role !== 'captain') {
        return res.status(403).json({
          success: false,
          message: '仅队长或管理员可初始化队伍'
        });
      }
      await AbyssController.ensureDefaultAbyssTeams();
      const teamCount = await AbyssTeam.count();
      res.status(200).json({
        success: true,
        message:
          '已写入默认深渊队伍（1～10 队）。生成排表图使用其中 1～9 队：1～4 一张、5～9 一张。',
        data: { team_count: teamCount }
      });
    } catch (error) {
      logger.error('初始化默认深渊队伍失败:', error);
      next(error);
    }
  }

  /**
   * 获取深渊队伍列表
   */
  static async getTeams(req, res, next) {
    try {
      await AbyssController.ensureDefaultAbyssTeams();
      const teams = await AbyssTeam.findAll({
        include: [
          { model: AbyssTeamMember, as: 'members', include: [{ model: require('../models').User, as: 'user', attributes: ['id', 'username', 'display_name', 'game_id'] }] },
          { model: require('../models').User, as: 'captain', attributes: ['id', 'username', 'display_name', 'game_id'] }
        ],
        order: [['team_number', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: { teams }
      });
    } catch (error) {
      logger.error('获取深渊队伍列表失败:', error);
      next(error);
    }
  }

  /**
   * 获取深渊排表
   */
  static async getSchedules(req, res, next) {
    try {
      const { date, week } = req.query;
      const where = {};

      if (date) where.schedule_date = date;
      if (week) where.week_number = week;

      const schedules = await AbyssSchedule.findAll({
        where,
        include: ['user', 'team']
      });

      res.status(200).json({
        success: true,
        data: { schedules }
      });
    } catch (error) {
      logger.error('获取深渊排表失败:', error);
      next(error);
    }
  }

  /**
   * 获取深渊战绩
   */
  static async getRecords(req, res, next) {
    try {
      const { userId, date } = req.query;
      const where = {};

      if (userId) where.user_id = userId;
      if (date) where.record_date = date;

      const records = await AbyssRecord.findAll({
        where,
        include: ['user']
      });

      res.status(200).json({
        success: true,
        data: { records }
      });
    } catch (error) {
      logger.error('获取深渊战绩失败:', error);
      next(error);
    }
  }

  /**
   * 创建深渊排表记录
   */
  static async createSchedule(req, res, next) {
    try {
      const schedule = await AbyssSchedule.create(req.body);

      res.status(201).json({
        success: true,
        message: '排表记录创建成功',
        data: { schedule }
      });
    } catch (error) {
      logger.error('创建深渊排表记录失败:', error);
      next(error);
    }
  }

  /**
   * 更新深渊排表记录
   */
  static async updateSchedule(req, res, next) {
    try {
      const schedule = await AbyssSchedule.findByPk(req.params.id);
      if (!schedule) {
        return res.status(404).json({
          success: false,
          message: '排表记录不存在'
        });
      }

      await schedule.update(req.body);

      res.status(200).json({
        success: true,
        message: '排表记录更新成功',
        data: { schedule }
      });
    } catch (error) {
      logger.error('更新深渊排表记录失败:', error);
      next(error);
    }
  }

  /**
   * 提交深渊战绩
   */
  static async submitRecord(req, res, next) {
    try {
      const record = await AbyssRecord.create({
        ...req.body,
        user_id: req.user.id
      });

      res.status(201).json({
        success: true,
        message: '深渊战绩提交成功',
        data: { record }
      });
    } catch (error) {
      logger.error('提交深渊战绩失败:', error);
      next(error);
    }
  }

  /**
   * 提交请假申请（成员自行确认）
   * 确认后将自动从深渊队伍中移除
   */
  static async submitLeave(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      const { start_date, end_date, reason = '' } = req.body;
      const userId = req.user.id;

      if (!start_date || !end_date) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '请提供开始和结束日期'
        });
      }

      if (new Date(start_date) > new Date(end_date)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '结束日期不能早于开始日期'
        });
      }

      const overlapLeave = await LeaveRecord.findOne({
        where: {
          user_id: userId,
          status: 'approved',
          [Op.or]: [
            {
              start_date: { [Op.between]: [start_date, end_date] }
            },
            {
              end_date: { [Op.between]: [start_date, end_date] }
            },
            {
              start_date: { [Op.lte]: start_date },
              end_date: { [Op.gte]: end_date }
            }
          ]
        },
        transaction
      });

      if (overlapLeave) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '该时间段已有生效请假记录'
        });
      }

      const leaveRecord = await LeaveRecord.create({
        user_id: userId,
        start_date,
        end_date,
        reason,
        status: 'approved',
        approved_by: userId,
        approved_at: new Date()
      }, { transaction });

      const memberships = await AbyssTeamMember.findAll({
        where: { user_id: userId },
        transaction
      });

      const captainTeamIds = memberships
        .filter((member) => member.role === 'captain')
        .map((member) => member.team_id);

      if (captainTeamIds.length > 0) {
        await AbyssTeam.update(
          { captain_id: null },
          { where: { id: captainTeamIds }, transaction }
        );
      }

      await AbyssTeamMember.destroy({
        where: { user_id: userId },
        transaction
      });

      await transaction.commit();

      logger.info(`用户请假成功并自动退队: userId=${userId}, leaveId=${leaveRecord.id}`);

      res.status(201).json({
        success: true,
        message: '请假确认成功，已自动从深渊队伍中移除',
        data: { leaveRecord }
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('提交请假失败:', error);
      next(error);
    }
  }

  /**
   * 获取我的请假记录
   */
  static async getMyLeaves(req, res, next) {
    try {
      const leaves = await LeaveRecord.findAll({
        where: { user_id: req.user.id },
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'display_name', 'game_id'] }
        ],
        order: [['created_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: { leaves }
      });
    } catch (error) {
      logger.error('获取我的请假记录失败:', error);
      next(error);
    }
  }

  /**
   * 获取当前生效的请假列表（用于排表/队伍管理拦截）
   */
  static async getActiveLeaves(req, res, next) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const leaves = await LeaveRecord.findAll({
        where: {
          status: 'approved',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today }
        },
        include: [
          { model: User, as: 'user', attributes: ['id', 'username', 'display_name', 'game_id'] }
        ],
        order: [['start_date', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: { leaves }
      });
    } catch (error) {
      logger.error('获取生效请假列表失败:', error);
      next(error);
    }
  }

  /**
   * 获取首页本周配置（四象顺序+本周兑换码）
   */
  static async getWeeklyConfig(req, res, next) {
    try {
      const todayLocal = AbyssController.toLocalDateOnly(new Date());
      const { weekStart, weekEnd } = AbyssController.getCurrentWeekRange();

      // 与 updateWeeklyConfig 写入的 week_start_date 一致；否则多行「本周」重叠时会取到旧种子行，顶部四象不更新
      let fourElements = await FourElementsOrder.findOne({
        where: { week_start_date: weekStart }
      });
      if (!fourElements) {
        fourElements = await FourElementsOrder.findOne({
          where: {
            week_start_date: { [Op.lte]: todayLocal },
            week_end_date: { [Op.gte]: todayLocal }
          },
          order: [['week_start_date', 'DESC']]
        });
      }

      const weeklyCode = await RedemptionCode.findOne({
        where: {
          description: 'WEEKLY_HOME_CODE',
          status: 'active',
          [Op.or]: [
            { expiration_date: null },
            { expiration_date: { [Op.gte]: todayLocal } }
          ]
        },
        order: [['updated_at', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: {
          week_start_date: fourElements?.week_start_date || weekStart,
          week_end_date: fourElements?.week_end_date || weekEnd,
          element_order: fourElements?.element_order || '青龙/白虎/朱雀/玄武',
          weekly_code: weeklyCode?.code || '',
          weekly_code_expiration: weeklyCode?.expiration_date || weekEnd
        }
      });
    } catch (error) {
      logger.error('获取本周首页配置失败:', error);
      next(error);
    }
  }

  /**
   * 管理员更新首页本周配置（四象顺序+本周兑换码）
   */
  static async updateWeeklyConfig(req, res, next) {
    const transaction = await sequelize.transaction();
    try {
      if (req.user?.role !== 'admin' && req.user?.role !== 'captain') {
        await transaction.rollback();
        return res.status(403).json({
          success: false,
          message: '仅队长或管理员可修改本周配置'
        });
      }

      const {
        week_start_date,
        week_end_date,
        element_order,
        weekly_code
      } = req.body;

      const { weekStart, weekEnd } = AbyssController.getCurrentWeekRange();
      const startDate = week_start_date || weekStart;
      const endDate = week_end_date || weekEnd;

      if (!element_order || !String(element_order).trim()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '请填写本周四象顺序'
        });
      }

      if (!weekly_code || !String(weekly_code).trim()) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '请填写本周兑换码'
        });
      }

      if (new Date(startDate) > new Date(endDate)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: '周结束日期不能早于开始日期'
        });
      }

      const orderTrim = String(element_order).trim();
      const codeTrim = String(weekly_code).trim();

      // 用 MySQL 原生 ODKU，避免 Sequelize upsert/find+create 在唯一键上仍抛错 → 前端「数据已存在」
      await sequelize.query(
        `INSERT INTO four_elements_orders (week_start_date, week_end_date, element_order, source, created_at, updated_at)
         VALUES (?, ?, ?, 'manual', NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           week_end_date = VALUES(week_end_date),
           element_order = VALUES(element_order),
           source = VALUES(source),
           updated_at = NOW()`,
        { replacements: [startDate, endDate, orderTrim], transaction }
      );

      await sequelize.query(
        `INSERT INTO redemption_codes (code, description, expiration_date, usage_limit, used_count, status, created_by, created_at, updated_at)
         VALUES (?, 'WEEKLY_HOME_CODE', ?, 999999, 0, 'active', ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE
           description = VALUES(description),
           expiration_date = VALUES(expiration_date),
           usage_limit = VALUES(usage_limit),
           status = VALUES(status),
           updated_at = NOW()`,
        { replacements: [codeTrim, endDate, req.user.id], transaction }
      );

      await RedemptionCode.update(
        { status: 'expired' },
        {
          where: {
            description: 'WEEKLY_HOME_CODE',
            code: { [Op.ne]: codeTrim }
          },
          transaction
        }
      );

      await transaction.commit();

      res.status(200).json({
        success: true,
        message: '本周配置更新成功',
        data: {
          week_start_date: startDate,
          week_end_date: endDate,
          element_order: orderTrim,
          weekly_code: String(weekly_code).trim()
        }
      });
    } catch (error) {
      await transaction.rollback();
      logger.error('更新本周首页配置失败:', error);
      next(error);
    }
  }
}

module.exports = AbyssController;