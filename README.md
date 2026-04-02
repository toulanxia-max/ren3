# 《忍者必须死3》家族网站

基于游戏《忍者必须死3》的家族管理系统，提供家族成员管理、深渊排表、SS+猎杀、家族战记录等功能。

## 功能特性

### 核心功能
- **用户认证**：家族成员专用登录系统，角色权限管理
- **深渊管理系统**：10队×10人排表系统，请假功能，排行榜
- **SS+猎杀系统**：截图上传，时间识别倒计时，任务分配
- **家族战系统**：对战记录，战绩统计，奖励追踪
- **资讯系统**：深渊历程，兑换码管理，四象顺序自动更新
- **活动管理**：活动发布，参与记录，积分统计

### 技术特性
- **水墨风格UI**：仿宣纸背景，毛笔字体，墨色主题
- **实时更新**：WebSocket实时通知，自动数据同步
- **响应式设计**：支持桌面和移动端访问
- **安全可靠**：JWT认证，数据加密，防攻击措施

## 项目结构

```
忍3/
├── backend/          # Node.js + Express后端服务
├── frontend/         # React前端应用
├── database/         # 数据库脚本和迁移
├── docs/            # 项目文档
└── docker-compose.yml # 容器化部署配置
```

## 快速开始

### 环境要求
- Node.js 16+
- MySQL/PostgreSQL 数据库
- Redis (可选，用于缓存和会话)

### 开发环境搭建

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd 忍3
   ```

2. **安装后端依赖**
   ```bash
   cd backend
   npm install
   ```

3. **安装前端依赖**
   ```bash
   cd ../frontend
   npm install
   ```

4. **配置环境变量**
   - 复制 `backend/.env.example` 到 `backend/.env`
   - 复制 `frontend/.env.example` 到 `frontend/.env`
   - 根据实际情况修改配置

5. **启动服务**
   ```bash
   # 启动后端服务
   cd backend
   npm run dev

   # 启动前端服务 (另一个终端)
   cd frontend
   npm start
   ```

6. **访问应用**
   - 前端: http://localhost:3000
   - 后端API: http://localhost:3001

## 部署

### Docker部署
```bash
# 使用Docker Compose一键部署
docker-compose up -d
```

### 生产环境配置
1. 配置SSL证书 (HTTPS)
2. 设置反向代理 (Nginx)
3. 配置数据库备份
4. 设置监控和日志

## 开发指南

### 代码规范
- 遵循ESLint配置的代码风格
- 使用Prettier格式化代码
- 提交前运行测试

### 分支策略
- `main`: 生产环境分支
- `develop`: 开发环境分支
- `feature/*`: 功能开发分支
- `hotfix/*`: 紧急修复分支

### 提交规范
- feat: 新功能
- fix: bug修复
- docs: 文档更新
- style: 代码格式
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具

## 技术栈

### 后端
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MySQL/PostgreSQL + Sequelize
- **认证**: JWT + bcrypt
- **缓存**: Redis
- **文件上传**: Multer + Sharp
- **定时任务**: Node-cron

### 前端
- **框架**: React 18
- **路由**: React Router v6
- **状态管理**: Context API
- **样式**: Tailwind CSS + 自定义水墨风格
- **HTTP客户端**: Axios
- **图表**: Chart.js
- **动画**: Framer Motion

## 联系方式

如有问题或建议，请联系项目维护者。

## 许可证

本项目仅供学习和交流使用，请勿用于商业用途。