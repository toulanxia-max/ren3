/**
 * 404处理中间件
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `找不到资源: ${req.method} ${req.originalUrl}`,
    error: 'Not Found'
  });
};

module.exports = notFoundHandler;