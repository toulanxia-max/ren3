const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const { User } = require('../models');
const config = require('../config');
const logger = require('../utils/logger');

class AuthController {
  /**
   * 用户注册
   */
  static async register(req, res, next) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '验证失败',
          errors: errors.array()
        });
      }

      const { game_id, username, password, display_name, email } = req.body;

      // 检查用户是否已存在
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { game_id },
            { username },
            ...(email ? [{ email }] : [])
          ]
        }
      });

      if (existingUser) {
        const field = existingUser.game_id === game_id ? '游戏ID' :
                     existingUser.username === username ? '用户名' : '邮箱';
        return res.status(409).json({
          success: false,
          message: `${field}已被使用`
        });
      }

      // 哈希密码
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 创建用户
      const user = await User.create({
        game_id,
        username,
        password_hash: passwordHash,
        display_name: display_name || username,
        email,
        role: 'member',
        status: 'active'
      });

      // 生成JWT令牌
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      logger.info(`新用户注册: ${username} (游戏ID: ${game_id})`);

      res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
    } catch (error) {
      logger.error('注册失败:', error);
      next(error);
    }
  }

  /**
   * 用户登录
   */
  static async login(req, res, next) {
    try {
      // 验证输入
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '验证失败',
          errors: errors.array()
        });
      }

      const { username, password } = req.body;

      // 查找用户
      const user = await User.findOne({
        where: {
          [Op.or]: [
            { username },
            { email: username },
            { game_id: username }
          ]
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return res.status(403).json({
          success: false,
          message: `用户已被${user.status === 'suspended' ? '禁用' : '停用'}`
        });
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: '用户名或密码错误'
        });
      }

      // 更新最后登录时间
      await user.update({ last_login: new Date() });

      // 生成JWT令牌
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      logger.info(`用户登录: ${user.username} (角色: ${user.role})`);

      res.status(200).json({
        success: true,
        message: '登录成功',
        data: {
          user: user.getPublicProfile(),
          token
        }
      });
    } catch (error) {
      logger.error('登录失败:', error);
      next(error);
    }
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(req, res, next) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user.getPublicProfile()
        }
      });
    } catch (error) {
      logger.error('获取用户信息失败:', error);
      next(error);
    }
  }

  /**
   * 修改密码
   */
  static async changePassword(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: '验证失败',
          errors: errors.array()
        });
      }

      const { currentPassword, newPassword } = req.body;
      const user = req.user;

      // 验证当前密码
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: '当前密码错误'
        });
      }

      // 哈希新密码
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      // 更新密码
      await user.update({ password_hash: newPasswordHash });

      logger.info(`用户修改密码: ${user.username}`);

      res.status(200).json({
        success: true,
        message: '密码修改成功'
      });
    } catch (error) {
      logger.error('修改密码失败:', error);
      next(error);
    }
  }

  /**
   * 退出登录（令牌黑名单需要Redis，这里只是简单返回）
   */
  static async logout(req, res, next) {
    try {
      // 实际应用中，这里应该将令牌加入黑名单
      // 需要Redis或其他存储来管理黑名单

      logger.info(`用户退出登录: ${req.user.username}`);

      res.status(200).json({
        success: true,
        message: '退出登录成功'
      });
    } catch (error) {
      logger.error('退出登录失败:', error);
      next(error);
    }
  }
}

module.exports = AuthController;