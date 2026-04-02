const app = require('./app');
const config = require('./config');
const { sequelize, Sequelize } = require('./models');
const logger = require('./utils/logger');
// const cronService = require('./services/cronService');

/**
 * 未开启 FORCE_DB_ALTER 时，sync 不会给已有表加新列；头像依赖 avatar_url，缺列时上传会失败或无法持久化。
 */
async function ensureUserAvatarUrlColumn() {
  const qi = sequelize.getQueryInterface();
  try {
    const desc = await qi.describeTable('users');
    if (!desc.avatar_url) {
      await qi.addColumn('users', 'avatar_url', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
      logger.info('已自动添加数据库列 users.avatar_url（头像功能需要）');
    }
  } catch (err) {
    logger.warn('检查/添加 users.avatar_url 列失败，请确认数据库权限或手动加列:', err.message);
  }
}

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    logger.info('数据库连接成功');

    await ensureUserAvatarUrlColumn();

    // 同步数据库模型（开发环境）
    if (config.app.nodeEnv === 'development') {
      // 默认仅确保表存在，避免 alter 在长期开发中反复增索引导致启动失败。
      // 如需结构自动迁移，手动设置 FORCE_DB_ALTER=true 再启动一次。
      const forceAlter = process.env.FORCE_DB_ALTER === 'true';
      await sequelize.sync(forceAlter ? { alter: true } : undefined);
      logger.info(`数据库模型同步完成${forceAlter ? '（alter模式）' : ''}`);
    }

    // 启动定时任务服务（暂时禁用）
    // cronService.startAllJobs();
    // logger.info('定时任务服务已启动');
    logger.info('定时任务服务已禁用');

    // 启动服务器
    const server = app.listen(config.app.port, () => {
      logger.info(`
===========================================
  ${config.app.name} v${config.app.version}
  环境: ${config.app.nodeEnv}
  地址: http://localhost:${config.app.port}
  时间: ${new Date().toLocaleString()}
===========================================
      `);
    });

    // 优雅关闭
    const gracefulShutdown = async () => {
      logger.info('收到关闭信号，正在优雅关闭...');

      // 停止定时任务（暂时禁用）
      // cronService.stopAllJobs();
      // logger.info('定时任务已停止');
      logger.info('定时任务已禁用');

      // 关闭数据库连接
      await sequelize.close();
      logger.info('数据库连接已关闭');

      // 关闭服务器
      server.close(() => {
        logger.info('HTTP服务器已关闭');
        process.exit(0);
      });

      // 强制关闭超时
      setTimeout(() => {
        logger.error('强制关闭超时，强制退出');
        process.exit(1);
      }, 10000);
    };

    // 监听关闭信号
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

    // 未捕获异常处理
    process.on('uncaughtException', (error) => {
      logger.error('未捕获的异常:', error);
      gracefulShutdown();
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error('未处理的Promise拒绝:', reason);
      // 可以记录更多信息
    });

  } catch (error) {
    logger.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 如果直接运行此文件
if (require.main === module) {
  startServer();
}

module.exports = startServer;