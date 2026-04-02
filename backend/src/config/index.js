const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

const config = {
  // 应用配置
  app: {
    name: process.env.APP_NAME || 'Ninja Clan API',
    version: process.env.APP_VERSION || '1.0.0',
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiBaseUrl: process.env.API_BASE_URL || '/api/v1',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
  },

  // 数据库配置
  database: require('./database'),

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    algorithm: 'HS256'
  },

  // 文件上传配置
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,gif,webp').split(','),
    screenshotPath: './uploads/screenshots'
  },

  // Redis配置（可选）
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || '',
    ttl: 3600 // 默认缓存时间1小时
  },

  // 游戏相关配置
  game: {
    clanId: process.env.GAME_CLAN_ID || '',
    apiKey: process.env.GAME_API_KEY || '',
    gameName: '忍者必须死3'
  },

  // 定时任务配置
  cron: {
    updateFourElements: process.env.CRON_UPDATE_FOUR_ELEMENTS || '0 0 * * 4', // 每周四凌晨
    cleanupOldLogs: process.env.CRON_CLEANUP_OLD_LOGS || '0 2 * * *' // 每天凌晨2点
  },

  // 安全配置
  security: {
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    rateLimitWindowMs: 15 * 60 * 1000, // 15分钟
    rateLimitMax: 100 // 每个IP每15分钟最多100个请求
  },

  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log',
    maxSize: '10m',
    maxFiles: '30d'
  }
};

// 验证必需的环境变量
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'JWT_SECRET'];
if (config.app.nodeEnv === 'production') {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    throw new Error(`缺少必需的环境变量: ${missingVars.join(', ')}`);
  }
}

module.exports = config;