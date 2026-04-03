const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const config = require('./config');

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const abyssRoutes = require('./routes/abyss');
const abyssTeamMemberRoutes = require('./routes/abyssTeamMembers');
const huntRoutes = require('./routes/hunts');
const battleRoutes = require('./routes/battles');
const activityRoutes = require('./routes/activities');

// 导入中间件
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');

// 创建Express应用
const app = express();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS配置（无 Origin 的请求如 curl、同页部分场景放行）
const corsOptions = {
  origin: (origin, callback) => {
    const allow = config.security.corsOrigins;
    if (!origin) return callback(null, true);
    if (allow.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// 请求解析中间件
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 压缩响应
app.use(compression());

// 日志中间件
if (config.app.nodeEnv !== 'test') {
  app.use(morgan(config.app.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/docs', express.static(path.join(__dirname, '../docs')));

// 健康检查路由
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: config.app.name,
    version: config.app.version,
    environment: config.app.nodeEnv
  });
});

// 前端 public 资源：开发时 proxy 可能把 /manifest.json 等转到后端，避免返回 JSON 404
const frontendPublicDir = path.join(__dirname, '../../frontend/public');
app.get('/manifest.json', (req, res) => {
  const filePath = path.join(frontendPublicDir, 'manifest.json');
  if (fs.existsSync(filePath)) {
    res.type('application/json');
    return res.sendFile(filePath);
  }
  res.type('application/json');
  return res.json({
    short_name: '紫川家族',
    name: '紫川家族站 · 忍3',
    start_url: config.app.frontendUrl || '/',
    display: 'standalone',
    theme_color: '#1a1a1a',
    background_color: '#f5f5f0'
  });
});
app.get('/service-worker.js', (req, res) => {
  const filePath = path.join(frontendPublicDir, 'service-worker.js');
  if (fs.existsSync(filePath)) {
    res.type('application/javascript; charset=utf-8');
    return res.sendFile(filePath);
  }
  res.type('application/javascript; charset=utf-8');
  return res.send('self.addEventListener("fetch",()=>{});');
});

// 禁止缓存 REST API（避免 GET /auth/me 等返回 304 时拿不到最新 JSON，头像/资料看起来「永远不变」）
app.use(config.app.apiBaseUrl, (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// API路由
app.use(`${config.app.apiBaseUrl}/auth`, authRoutes);
app.use(`${config.app.apiBaseUrl}/users`, userRoutes);
app.use(`${config.app.apiBaseUrl}/abyss`, abyssRoutes);
app.use(`${config.app.apiBaseUrl}/abyss/members`, abyssTeamMemberRoutes);
app.use(`${config.app.apiBaseUrl}/hunts`, huntRoutes);
app.use(`${config.app.apiBaseUrl}/battles`, battleRoutes);
app.use(`${config.app.apiBaseUrl}/activities`, activityRoutes);

// 根路径重定向到前端
app.get('/', (req, res) => {
  res.redirect(config.app.frontendUrl);
});

// 404处理
app.use(notFoundHandler);

// 错误处理
app.use(errorHandler);

// 导出应用
module.exports = app;