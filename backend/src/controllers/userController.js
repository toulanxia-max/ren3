const fs = require('fs');
const path = require('path');
const { User } = require('../models');
const logger = require('../utils/logger');

class UserController {
  /**
   * 获取用户列表（管理员）
   */
  static async getUsers(req, res, next) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ['password_hash'] }
      });

      res.status(200).json({
        success: true,
        data: { users }
      });
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      next(error);
    }
  }

  /**
   * 获取用户详情
   */
  static async getUser(req, res, next) {
    try {
      const userId = req.params.id || req.user.id;
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['password_hash'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('获取用户详情失败:', error);
      next(error);
    }
  }

  /**
   * 更新用户信息
   */
  static async updateUser(req, res, next) {
    try {
      const userId = req.params.id || req.user.id;
      const updateData = req.body;

      if (req.user.role !== 'admin' && String(userId) !== String(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: '只能修改自己的资料'
        });
      }

      // 确保不能修改密码和角色（通过单独接口）
      delete updateData.password_hash;
      delete updateData.role;
      // 头像仅允许通过上传接口写入，避免 PUT 误传或篡改 URL
      delete updateData.avatar_url;

      const abyssRolePattern = /^(\d+[^/]+)(\/\d+[^/]+)*$/;
      const treasurePattern = /^\d+\+\d+$/;

      if (typeof updateData.email === 'string' && updateData.email.trim() === '') {
        updateData.email = null;
      }

      if (typeof updateData.abyss_role_config === 'string') {
        updateData.abyss_role_config = updateData.abyss_role_config.trim();
        if (updateData.abyss_role_config && !abyssRolePattern.test(updateData.abyss_role_config)) {
          return res.status(400).json({
            success: false,
            message: '深渊使用角色格式错误，应为如 6水/6椒/6枭/6滴'
          });
        }
      }

      if (typeof updateData.treasure_config === 'string') {
        updateData.treasure_config = updateData.treasure_config.trim();
        if (updateData.treasure_config && !treasurePattern.test(updateData.treasure_config)) {
          return res.status(400).json({
            success: false,
            message: '宝物情况格式错误，应为如 3+3 或 0+0'
          });
        }
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      await user.update(updateData);

      res.status(200).json({
        success: true,
        message: '用户信息更新成功',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      logger.error('更新用户信息失败:', error);
      next(error);
    }
  }

  /**
   * 上传用户头像
   */
  static async uploadAvatar(req, res, next) {
    try {
      const userId = req.params.id || req.user.id;

      if (req.user.role !== 'admin' && String(userId) !== String(req.user.id)) {
        return res.status(403).json({
          success: false,
          message: '只能修改自己的头像'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: '请先选择头像图片'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      const oldAvatarUrl = user.avatar_url;
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      await user.update({ avatar_url: avatarUrl });
      await user.reload();

      if (oldAvatarUrl && oldAvatarUrl.startsWith('/uploads/avatars/')) {
        const oldFilePath = path.join(__dirname, '../../', oldAvatarUrl.replace('/uploads/', 'uploads/'));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      res.status(200).json({
        success: true,
        message: '头像上传成功',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      logger.error('上传头像失败:', error);
      next(error);
    }
  }

  /**
   * 删除用户（管理员）
   */
  static async deleteUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      await user.destroy();

      logger.info(`用户被删除: ${user.username} (ID: ${user.id})`);

      res.status(200).json({
        success: true,
        message: '用户删除成功'
      });
    } catch (error) {
      logger.error('删除用户失败:', error);
      next(error);
    }
  }

  /**
   * 更新用户角色（管理员）
   */
  static async updateUserRole(req, res, next) {
    try {
      const userId = req.params.id || req.body.userId;
      const { role } = req.body;
      const allowedRoles = ['admin', 'captain', 'member'];

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: '缺少用户 ID'
        });
      }

      if (!role || !allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: '角色必须是 admin、captain 或 member'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      await user.update({ role });

      logger.info(`用户角色更新: ${user.username} -> ${role}`);

      res.status(200).json({
        success: true,
        message: '用户角色更新成功',
        data: { user: user.getPublicProfile() }
      });
    } catch (error) {
      logger.error('更新用户角色失败:', error);
      next(error);
    }
  }

  /**
   * 获取用户统计数据
   */
  static async getUserStats(req, res, next) {
    try {
      // 简单统计示例
      const totalUsers = await User.count();
      const activeUsers = await User.count({ where: { status: 'active' } });
      const admins = await User.count({ where: { role: 'admin' } });
      const captains = await User.count({ where: { role: 'captain' } });

      res.status(200).json({
        success: true,
        data: {
          totalUsers,
          activeUsers,
          admins,
          captains,
          members: totalUsers - admins - captains
        }
      });
    } catch (error) {
      logger.error('获取用户统计数据失败:', error);
      next(error);
    }
  }
}

module.exports = UserController;