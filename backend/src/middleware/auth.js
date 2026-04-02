const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * 认证中间件
 * 验证JWT令牌并附加用户信息到请求对象
 */
const auth = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '访问被拒绝，请提供有效的认证令牌'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // 验证令牌
    const decoded = jwt.verify(token, config.jwt.secret);

    // 查找用户
    const user = await User.findByPk(decoded.userId);
    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    // 附加用户信息到请求对象
    req.user = user;
    req.token = token;

    // 记录访问日志（可选）
    logger.debug(`用户访问: ${user.username} - ${req.method} ${req.path}`);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期'
      });
    }

    logger.error('认证中间件错误:', error);
    next(error);
  }
};

/**
 * 角色检查中间件
 * @param {Array} roles - 允许的角色数组
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '用户未认证'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '权限不足，访问被拒绝'
      });
    }

    next();
  };
};

/**
 * 队长或管理员权限检查
 */
const authorizeCaptainOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '用户未认证'
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'captain') {
    return res.status(403).json({
      success: false,
      message: '需要队长或管理员权限'
    });
  }

  next();
};

/**
 * 管理员权限检查
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '用户未认证'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }

  next();
};

module.exports = {
  auth,
  authorize,
  authorizeCaptainOrAdmin,
  authorizeAdmin
};