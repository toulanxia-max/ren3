const { AbyssTeamMember, AbyssTeam, User, LeaveRecord } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AbyssTeamMemberController {
  static async getMembers(req, res, next) {
    try {
      const { teamId } = req.query;
      const where = {};
      
      if (teamId) {
        where.team_id = teamId;
      }

      const members = await AbyssTeamMember.findAll({
        where,
        include: [
          { model: AbyssTeam, as: 'team', attributes: ['id', 'team_name'] },
          { model: User, as: 'user', attributes: ['id', 'username', 'display_name', 'game_id'] }
        ],
        order: [['role', 'ASC'], ['joined_at', 'ASC']]
      });

      res.status(200).json({
        success: true,
        data: { members }
      });
    } catch (error) {
      logger.error('获取队员列表失败:', error);
      next(error);
    }
  }

  static async addMember(req, res, next) {
    try {
      const { team_id, user_id, role = 'member', notes } = req.body;
      const operatorRole = req.user?.role;

      if (operatorRole !== 'admin' && operatorRole !== 'captain') {
        return res.status(403).json({
          success: false,
          message: '需要队长或管理员权限'
        });
      }

      if (operatorRole !== 'admin' && role === 'captain') {
        return res.status(403).json({
          success: false,
          message: '仅管理员可添加队长'
        });
      }

      const team = await AbyssTeam.findByPk(team_id);
      if (!team) {
        return res.status(404).json({
          success: false,
          message: '队伍不存在'
        });
      }

      const user = await User.findByPk(user_id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const existing = await AbyssTeamMember.findOne({
        where: { user_id },
        include: [{ model: AbyssTeam, as: 'team', attributes: ['id', 'team_name'] }]
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: `该用户已在队伍 ${existing.team?.team_name || existing.team_id} 中，不能重复加入其他队伍`
        });
      }

      const today = new Date().toISOString().slice(0, 10);
      const activeLeave = await LeaveRecord.findOne({
        where: {
          user_id,
          status: 'approved',
          start_date: { [Op.lte]: today },
          end_date: { [Op.gte]: today }
        }
      });
      if (activeLeave) {
        return res.status(400).json({
          success: false,
          message: '该成员请假中，暂时无法加入队伍'
        });
      }

      if (role === 'captain') {
        await AbyssTeamMember.update(
          { role: 'member' },
          { where: { team_id, role: 'captain' } }
        );
        await team.update({ captain_id: user_id });
      }

      const member = await AbyssTeamMember.create({
        team_id,
        user_id,
        role,
        notes
      });

      logger.info(`添加队员: ${user.username} 到 ${team.team_name}`);

      res.status(201).json({
        success: true,
        message: '添加成功',
        data: { member }
      });
    } catch (error) {
      logger.error('添加队员失败:', error);
      next(error);
    }
  }

  static async removeMember(req, res, next) {
    try {
      const { id } = req.params;
      const operatorRole = req.user?.role;

      if (operatorRole !== 'admin' && operatorRole !== 'captain') {
        return res.status(403).json({
          success: false,
          message: '需要队长或管理员权限'
        });
      }

      const member = await AbyssTeamMember.findByPk(id);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: '队员记录不存在'
        });
      }

      if (member.role === 'captain' && operatorRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: '仅管理员可移除队长'
        });
      }

      if (member.role === 'captain') {
        await AbyssTeam.update(
          { captain_id: null },
          { where: { id: member.team_id } }
        );
      }

      await member.destroy();

      logger.info(`移除队员 ID: ${id}`);

      res.status(200).json({
        success: true,
        message: '移除成功'
      });
    } catch (error) {
      logger.error('移除队员失败:', error);
      next(error);
    }
  }

  static async updateMember(req, res, next) {
    try {
      const { id } = req.params;
      const { role, notes } = req.body;
      const operatorRole = req.user?.role;

      if (operatorRole !== 'admin' && operatorRole !== 'captain') {
        return res.status(403).json({
          success: false,
          message: '需要队长或管理员权限'
        });
      }

      const member = await AbyssTeamMember.findByPk(id);
      if (!member) {
        return res.status(404).json({
          success: false,
          message: '队员记录不存在'
        });
      }

      if (role === 'captain') {
        if (operatorRole !== 'admin') {
          return res.status(403).json({
            success: false,
            message: '仅管理员可设置队长'
          });
        }
        await AbyssTeamMember.update(
          { role: 'member' },
          { where: { team_id: member.team_id, role: 'captain' } }
        );
        await AbyssTeam.update(
          { captain_id: member.user_id },
          { where: { id: member.team_id } }
        );
      }

      await member.update({ role, notes });

      res.status(200).json({
        success: true,
        message: '更新成功',
        data: { member }
      });
    } catch (error) {
      logger.error('更新队员失败:', error);
      next(error);
    }
  }

  static async getMyTeams(req, res, next) {
    try {
      const userId = req.user.id;

      const memberships = await AbyssTeamMember.findAll({
        where: { user_id: userId },
        include: [{ model: AbyssTeam, as: 'team' }]
      });

      const teams = memberships.map(m => m.team);

      res.status(200).json({
        success: true,
        data: { teams }
      });
    } catch (error) {
      logger.error('获取我的队伍失败:', error);
      next(error);
    }
  }
}

module.exports = AbyssTeamMemberController;
