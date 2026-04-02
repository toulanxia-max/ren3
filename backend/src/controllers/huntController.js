const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { SSPlusHunt, User } = require('../models');
const logger = require('../utils/logger');

class HuntController {
  static async enforceHuntLimit(maxCount = 10) {
    const currentCount = await SSPlusHunt.count();
    if (currentCount < maxCount) return;

    const removeCount = currentCount - maxCount + 1;
    const oldest = await SSPlusHunt.findAll({
      order: [['created_at', 'ASC']],
      limit: removeCount
    });
    if (oldest.length > 0) {
      await SSPlusHunt.destroy({ where: { id: oldest.map((item) => item.id) } });
    }
  }

  static parseBossAndCountdown(text = '') {
    const normalized = String(text || '').replace(/\s+/g, '');
    const bossCandidates = [
      '青冥龙王', '绫翼', '雷龙', '冰凤凰', '火麒麟', '土玄武'
    ];

    let bossName = '青冥龙王';
    for (const boss of bossCandidates) {
      if (normalized.includes(boss)) {
        bossName = boss;
        break;
      }
    }

    let days = 0;
    let hours = 0;
    const dayMatch = normalized.match(/(\d+)\s*天/);
    const hourMatch = normalized.match(/(\d+)\s*小时/);
    if (dayMatch) days = parseInt(dayMatch[1], 10);
    if (hourMatch) hours = parseInt(hourMatch[1], 10);

    const totalHours = days * 24 + hours;
    const countdownEndAt = totalHours > 0 ? new Date(Date.now() + totalHours * 3600 * 1000) : null;
    const countdownDaysRemaining = countdownEndAt
      ? Math.max(0, Math.ceil((countdownEndAt.getTime() - Date.now()) / (24 * 3600 * 1000)))
      : null;

    return { bossName, countdownEndAt, countdownDaysRemaining };
  }

  static updateCountdownDays(hunt) {
    if (!hunt.countdown_end_at) return null;
    const remaining = Math.max(
      0,
      Math.ceil((new Date(hunt.countdown_end_at).getTime() - Date.now()) / (24 * 3600 * 1000))
    );
    return remaining;
  }
  /**
   * 获取猎杀记录列表
   */
  static async getHunts(req, res, next) {
    try {
      const { date, status, assignedTo } = req.query;
      const where = {};

      if (date) where.hunt_date = date;
      if (status) where.status = status;
      if (assignedTo) where.assigned_to = assignedTo;

      const hunts = await SSPlusHunt.findAll({
        where,
        include: ['assignedUser', 'completer', 'creator']
      });

      const userIds = Array.from(new Set(
        hunts.flatMap((hunt) => Array.isArray(hunt.assignment_slots) ? hunt.assignment_slots : []).filter(Boolean)
      ));
      const users = userIds.length > 0
        ? await User.findAll({ where: { id: { [Op.in]: userIds } }, attributes: ['id', 'username', 'display_name'] })
        : [];
      const userMap = users.reduce((acc, u) => {
        acc[u.id] = u;
        return acc;
      }, {});

      const normalizedHunts = hunts.map((hunt) => {
        const remainingDays = HuntController.updateCountdownDays(hunt);
        return {
          ...hunt.toJSON(),
          countdown_days_remaining: remainingDays,
          assignment_users: (hunt.assignment_slots || []).map((id) => (id ? userMap[id] || null : null))
        };
      });

      res.status(200).json({
        success: true,
        data: { hunts: normalizedHunts }
      });
    } catch (error) {
      logger.error('获取猎杀记录列表失败:', error);
      next(error);
    }
  }

  /**
   * 获取猎杀记录详情
   */
  static async getHunt(req, res, next) {
    try {
      const hunt = await SSPlusHunt.findByPk(req.params.id, {
        include: ['assignedUser', 'completer', 'creator']
      });

      if (!hunt) {
        return res.status(404).json({
          success: false,
          message: '猎杀记录不存在'
        });
      }

      res.status(200).json({
        success: true,
        data: { hunt }
      });
    } catch (error) {
      logger.error('获取猎杀记录详情失败:', error);
      next(error);
    }
  }

  /**
   * 创建猎杀记录
   */
  static async createHunt(req, res, next) {
    try {
      await HuntController.enforceHuntLimit(10);
      const hunt = await SSPlusHunt.create({
        ...req.body,
        created_by: req.user.id,
        assignment_slots: Array.isArray(req.body.assignment_slots) ? req.body.assignment_slots.slice(0, 5) : [null, null, null, null, null]
      });

      res.status(201).json({
        success: true,
        message: '猎杀记录创建成功',
        data: { hunt }
      });
    } catch (error) {
      logger.error('创建猎杀记录失败:', error);
      next(error);
    }
  }

  /**
   * 成员手动创建猎杀任务（不依赖截图识别）
   */
  static async createManualHunt(req, res, next) {
    try {
      const { boss_name, countdown_hint, notes = '' } = req.body;
      if (!boss_name || !String(boss_name).trim()) {
        return res.status(400).json({
          success: false,
          message: '请填写Boss名称'
        });
      }
      if (!countdown_hint || !String(countdown_hint).trim()) {
        return res.status(400).json({
          success: false,
          message: '请填写倒计时（例如：19天22小时）'
        });
      }

      const { countdownEndAt, countdownDaysRemaining } = HuntController.parseBossAndCountdown(String(countdown_hint));
      if (!countdownEndAt || countdownDaysRemaining === null) {
        return res.status(400).json({
          success: false,
          message: '倒计时格式不正确，请按“19天22小时”填写'
        });
      }

      await HuntController.enforceHuntLimit(10);
      const hunt = await SSPlusHunt.create({
        hunt_date: new Date().toISOString().slice(0, 10),
        target_name: String(boss_name).trim(),
        target_level: 'SS+',
        screenshot_url: '/uploads/hunts/manual-entry.png',
        status: 'pending',
        countdown_end_at: countdownEndAt,
        countdown_days_remaining: countdownDaysRemaining,
        assignment_slots: [null, null, null, null, null],
        notes: String(notes || '').trim(),
        created_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: '任务发布成功',
        data: { hunt }
      });
    } catch (error) {
      logger.error('手动创建猎杀任务失败:', error);
      next(error);
    }
  }

  /**
   * 更新猎杀记录
   */
  static async updateHunt(req, res, next) {
    try {
      const hunt = await SSPlusHunt.findByPk(req.params.id);
      if (!hunt) {
        return res.status(404).json({
          success: false,
          message: '猎杀记录不存在'
        });
      }

      const payload = { ...req.body };
      if (Array.isArray(payload.assignment_slots)) {
        payload.assignment_slots = payload.assignment_slots.slice(0, 5);
      }
      await hunt.update(payload);

      res.status(200).json({
        success: true,
        message: '猎杀记录更新成功',
        data: { hunt }
      });
    } catch (error) {
      logger.error('更新猎杀记录失败:', error);
      next(error);
    }
  }

  /**
   * 完成猎杀任务
   */
  static async completeHunt(req, res, next) {
    try {
      const hunt = await SSPlusHunt.findByPk(req.params.id);
      if (!hunt) {
        return res.status(404).json({
          success: false,
          message: '猎杀记录不存在'
        });
      }

      await hunt.update({
        status: 'completed',
        completed_by: req.user.id,
        completed_at: new Date()
      });

      res.status(200).json({
        success: true,
        message: '猎杀任务已完成',
        data: { hunt }
      });
    } catch (error) {
      logger.error('完成猎杀任务失败:', error);
      next(error);
    }
  }

  /**
   * 删除猎杀记录
   */
  static async deleteHunt(req, res, next) {
    try {
      const hunt = await SSPlusHunt.findByPk(req.params.id);
      if (!hunt) {
        return res.status(404).json({
          success: false,
          message: '猎杀记录不存在'
        });
      }

      await hunt.destroy();

      res.status(200).json({
        success: true,
        message: '猎杀记录删除成功'
      });
    } catch (error) {
      logger.error('删除猎杀记录失败:', error);
      next(error);
    }
  }

  /**
   * 上传截图并自动生成猎杀任务（成员可用）
   */
  static async uploadHunt(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请上传截图文件'
        });
      }

      const uploadsDir = path.join(__dirname, '../../uploads/hunts');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const ext = path.extname(req.file.originalname) || '.jpg';
      const fileName = `hunt_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
      const fullPath = path.join(uploadsDir, fileName);
      fs.writeFileSync(fullPath, req.file.buffer);

      const screenshotUrl = `/uploads/hunts/${fileName}`;
      const hintText = `${req.body?.ocr_text || ''} ${req.body?.boss_hint || ''} ${req.body?.countdown_hint || ''}`;
      const { bossName, countdownEndAt, countdownDaysRemaining } = HuntController.parseBossAndCountdown(hintText);

      if (!countdownEndAt || countdownDaysRemaining === null) {
        return res.status(400).json({
          success: false,
          message: '未识别到倒计时，请填写“倒计时提示”（例如：19天22小时）后重试'
        });
      }

      await HuntController.enforceHuntLimit(10);
      const hunt = await SSPlusHunt.create({
        hunt_date: new Date().toISOString().slice(0, 10),
        target_name: bossName,
        target_level: 'SS+',
        screenshot_url: screenshotUrl,
        status: 'pending',
        countdown_end_at: countdownEndAt,
        countdown_days_remaining: countdownDaysRemaining,
        assignment_slots: [null, null, null, null, null],
        notes: req.body?.notes || '',
        created_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: '截图上传成功，已自动生成猎杀任务',
        data: { hunt }
      });
    } catch (error) {
      logger.error('上传猎杀截图失败:', error);
      next(error);
    }
  }

  /**
   * 管理员分配5个位置
   */
  static async assignSlots(req, res, next) {
    try {
      const hunt = await SSPlusHunt.findByPk(req.params.id);
      if (!hunt) {
        return res.status(404).json({
          success: false,
          message: '猎杀记录不存在'
        });
      }

      const slots = Array.isArray(req.body?.assignment_slots) ? req.body.assignment_slots.slice(0, 5) : null;
      if (!slots || slots.length !== 5) {
        return res.status(400).json({
          success: false,
          message: '请提供5个位置的分配数组'
        });
      }

      const normalizedSlots = slots.map((slot) => (slot ? parseInt(slot, 10) : null));
      const nonNullSlots = normalizedSlots.filter((slot) => slot !== null && !Number.isNaN(slot));
      if (new Set(nonNullSlots).size !== nonNullSlots.length) {
        return res.status(400).json({
          success: false,
          message: '同一成员不能在同一猎杀任务中重复分配'
        });
      }

      await hunt.update({ assignment_slots: normalizedSlots });

      res.status(200).json({
        success: true,
        message: '分配成功',
        data: { hunt }
      });
    } catch (error) {
      logger.error('分配猎杀位置失败:', error);
      next(error);
    }
  }
}

module.exports = HuntController;