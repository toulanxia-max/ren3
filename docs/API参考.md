# 《忍者必须死3》家族网站API参考

## 📡 API基础信息

### 基础URL
```
http://localhost:5000/api/v1
```

### 响应格式
```json
{
  "success": true/false,
  "message": "操作结果描述",
  "data": {},          // 成功时返回的数据
  "errors": []         // 失败时的错误详情
}
```

### 认证方式
需要在请求头中添加：
```
Authorization: Bearer <JWT令牌>
```

## 🔐 认证接口

### 用户注册
**POST** `/auth/register`

**请求示例**:
```json
{
  "game_id": "200801034671",
  "username": "夏投岚",
  "password": "password123",
  "display_name": "夏投岚",
  "email": "optional@example.com"  // 可选
}
```

**验证规则**:
- `game_id`: 3-50字符，必填，可以是中文
- `username`: 3-50字符，必填，支持中文
- `password`: 6-100字符，必填
- `display_name`: 1-50字符，必填
- `email`: 可选，需符合邮箱格式

**成功响应**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 5,
      "game_id": "200801034671",
      "username": "夏投岚",
      "display_name": "夏投岚",
      "role": "member",
      "clan_rank": 0,
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 用户登录
**POST** `/auth/login`

**请求示例**:
```json
{
  "username": "夏投岚",  // 支持用户名、游戏ID或邮箱
  "password": "xn0060623"
}
```

**响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 5,
      "game_id": "200801034671",
      "username": "夏投岚",
      "display_name": "夏投岚",
      "avatar_url": null,
      "role": "member",
      "clan_rank": 0,
      "status": "active",
      "last_login": "2026-03-28T16:20:18.431Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 获取当前用户信息
**GET** `/auth/me`

**请求头**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "game_id": "200801034671",
      "username": "夏投岚",
      "display_name": "夏投岚",
      "avatar_url": null,
      "role": "member",
      "clan_rank": 0,
      "status": "active",
      "last_login": "2026-03-28T16:20:18.431Z"
    }
  }
}
```

### 修改密码
**PUT** `/auth/password`

**请求示例**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

### 退出登录
**POST** `/auth/logout`

## 🏯 深渊系统接口

### 获取深渊队伍列表
**GET** `/abyss/teams`

**权限要求**: 已认证用户

**响应示例**:
```json
{
  "success": true,
  "data": {
    "teams": [
      {
        "id": 1,
        "team_number": 1,
        "team_name": "第一队",
        "captain_id": null,
        "status": "active",
        "created_at": "2026-03-28T14:02:34.000Z",
        "updated_at": "2026-03-28T14:02:34.000Z",
        "captain": null
      },
      // ... 共10个队伍
    ]
  }
}
```

### 获取深渊排表
**GET** `/abyss/schedules`

**权限要求**: 已认证用户

### 获取深渊战绩
**GET** `/abyss/records`

**权限要求**: 已认证用户

### 创建深渊排表记录
**POST** `/abyss/schedules`

**权限要求**: 队长(captain)或管理员(admin)

**请求示例**:
```json
{
  "team_id": 1,
  "schedule_date": "2026-03-30",
  "time_slot": "20:00-21:00",
  "notes": "本周深渊挑战"
}
```

### 更新深渊排表记录
**PUT** `/abyss/schedules/:id`

**权限要求**: 队长(captain)或管理员(admin)

### 提交深渊战绩
**POST** `/abyss/records`

**权限要求**: 已认证用户

**请求示例**:
```json
{
  "team_id": 1,
  "damage": 87500000,
  "screenshot_url": "/uploads/screenshots/深渊_20230315.png",
  "notes": "本周表现良好"
}
```

## 🐉 SS+猎杀接口

### 获取猎杀记录
**GET** `/hunts`

**权限要求**: 已认证用户

**响应示例**:
```json
{
  "success": true,
  "data": {
    "hunts": []
  }
}
```

### 创建猎杀任务
**POST** `/hunts`

**权限要求**: 队长(captain)或管理员(admin)

### 提交猎杀截图
**POST** `/hunts/upload`

**请求类型**: `multipart/form-data`

**参数**:
- `image`: 图片文件
- `hunt_type`: "ss+" 或 "sss"
- `notes`: 备注

## ⚔️ 家族战接口

### 获取家族战记录
**GET** `/battles`

**权限要求**: 已认证用户

### 创建家族战记录
**POST** `/battles`

**权限要求**: 队长(captain)或管理员(admin)

### 提交家族战战绩
**POST** `/battles/:id/participate`

**权限要求**: 已认证用户

## 🎪 活动接口

### 获取活动列表
**GET** `/activities`

**权限要求**: 已认证用户

### 创建活动
**POST** `/activities`

**权限要求**: 队长(captain)或管理员(admin)

### 参与活动
**POST** `/activities/:id/participate`

**权限要求**: 已认证用户

## 👥 用户管理接口

### 获取用户列表
**GET** `/users`

**权限要求**: 管理员(admin)

### 更新用户信息
**PUT** `/users/:id`

**权限要求**: 管理员(admin)或用户本人

### 更新用户角色
**PUT** `/users/:id/role`

**权限要求**: 管理员(admin)

**请求示例**:
```json
{
  "role": "captain"  // member/captain/admin
}
```

## 🔧 实用接口

### 健康检查
**GET** `/health`

**公开访问**: 是

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-28T16:18:42.548Z",
  "service": "Ninja Clan API",
  "version": "1.0.0",
  "environment": "development"
}
```

### 服务器信息
**GET** `/server-info`

**响应示例**:
```json
{
  "success": true,
  "data": {
    "name": "Ninja Clan API",
    "version": "1.0.0",
    "environment": "development",
    "uptime": "2 hours",
    "database": "connected",
    "timestamp": "2026-03-28T16:18:42.548Z"
  }
}
```

## 📊 错误码参考

### HTTP状态码
- `200 OK`: 请求成功
- `201 Created`: 资源创建成功
- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证或token无效
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `409 Conflict`: 资源冲突（如用户名已存在）
- `500 Internal Server Error`: 服务器内部错误

### 常见错误响应

#### 注册时用户名已存在
```json
{
  "success": false,
  "message": "用户名已被使用"
}
```

#### 登录密码错误
```json
{
  "success": false,
  "message": "用户名或密码错误"
}
```

#### 验证失败
```json
{
  "success": false,
  "message": "验证失败",
  "errors": [
    {
      "value": "",
      "msg": "邮箱格式不正确",
      "param": "email",
      "location": "body"
    }
  ]
}
```

#### Token过期
```json
{
  "success": false,
  "message": "Token已过期，请重新登录"
}
```

## 🔗 CURL命令示例

### 测试注册
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"game_id":"test123","username":"测试用户","password":"password123","display_name":"测试用户"}'
```

### 测试登录
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"测试用户","password":"password123"}'
```

### 测试认证API
```bash
# 保存token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 调用需要认证的API
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/abyss/teams

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/v1/auth/me
```

## 📝 数据库字段说明

### 用户表 (users)
```sql
id               主键
game_id          游戏ID（唯一）
username         用户名（唯一）
password_hash    密码哈希
display_name     显示名称
email            邮箱（可选）
role             角色：member/captain/admin
clan_rank        家族排名
status           状态：active/suspended/inactive
last_login       最后登录时间
created_at       创建时间
updated_at       更新时间
```

### 深渊队伍表 (abyss_teams)
```sql
id               主键
team_number      队伍编号（1-10）
team_name        队伍名称
captain_id       队长ID（外键）
status           状态：active/inactive
created_at       创建时间
updated_at       更新时间
```

### 深渊排表表 (abyss_schedules)
```sql
id               主键
team_id          队伍ID
user_id          用户ID
schedule_date    排表日期
time_slot        时间段
status           状态：scheduled/completed/canceled
notes            备注
created_at       创建时间
updated_at       更新时间
```

## 🔄 数据模型关系

```
用户 (users)
  ├── 属于深渊队伍 (abyss_teams) 作为队长
  ├── 参与深渊排表 (abyss_schedules)
  ├── 提交深渊战绩 (abyss_records)
  ├── 参与猎杀任务 (hunt_participants)
  ├── 参与家族战 (battle_participants)
  └── 参与活动 (activity_participants)

深渊队伍 (abyss_teams)
  ├── 有队长 (captain) → users
  ├── 有排表记录 (abyss_schedules)
  └── 有战绩记录 (abyss_records)
```

## 🛡️ 安全建议

### JWT配置
```env
# 生产环境必须修改
JWT_SECRET=your_very_strong_secret_key_here
JWT_EXPIRES_IN=7d  # 令牌有效期
```

### 密码安全
- 使用bcrypt哈希存储密码
- 密码最小长度6位
- 建议启用密码复杂度检查

### 请求限制
- 登录失败次数限制
- API请求频率限制
- IP黑名单功能

---

**文档版本**: 1.0
**最后更新**: 2026年3月29日
**适用版本**: API v1.0.0