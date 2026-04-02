const logger = require('../utils/logger');

/**
 * 错误处理中间件
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  logger.error('错误处理中间件捕获到错误:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user ? req.user.id : '未认证'
  });

  // 默认错误响应
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';
  let errors = err.errors;

  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = '数据验证失败';
    errors = err.errors;
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = '数据库验证失败';
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = '数据已存在';
    errors = err.errors.map(e => ({
      field: e.path,
      message: '该值已存在'
    }));
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = '无效的令牌';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = '令牌已过期';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = '文件大小超过限制';
  } else if (err.code === 'ENOENT') {
    statusCode = 404;
    message = '文件不存在';
  }

  // 生产环境隐藏详细错误信息
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && statusCode === 500) {
    message = '服务器内部错误';
    errors = undefined;
  }

  // 发送错误响应
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(!isProduction && statusCode === 500 && { stack: err.stack })
  });
};

module.exports = errorHandler;