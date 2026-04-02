-- 《忍者必须死3》家族网站数据库初始化脚本
-- 创建数据库和用户

-- 创建数据库
CREATE DATABASE IF NOT EXISTS ninja_clan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建应用用户（生产环境建议使用单独用户）
CREATE USER IF NOT EXISTS 'ninja_clan_user'@'%' IDENTIFIED BY 'ninja_clan_password';
GRANT ALL PRIVILEGES ON ninja_clan_db.* TO 'ninja_clan_user'@'%';
FLUSH PRIVILEGES;

-- 使用数据库
USE ninja_clan_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  game_id VARCHAR(50) UNIQUE NOT NULL COMMENT '游戏内ID',
  username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
  email VARCHAR(100) UNIQUE COMMENT '邮箱',
  password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
  display_name VARCHAR(50) NOT NULL COMMENT '显示名称',
  avatar_url VARCHAR(255) COMMENT '头像URL',
  role ENUM('admin', 'captain', 'member') DEFAULT 'member' COMMENT '角色：管理员/队长/成员',
  clan_rank INT DEFAULT 0 COMMENT '家族职位等级',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active' COMMENT '状态',
  last_login TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_game_id (game_id),
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 深渊队伍表
CREATE TABLE IF NOT EXISTS abyss_teams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_number INT NOT NULL COMMENT '队伍编号 1-10',
  team_name VARCHAR(50) NOT NULL COMMENT '队伍名称',
  captain_id INT COMMENT '队长用户ID',
  status ENUM('active', 'inactive') DEFAULT 'active' COMMENT '队伍状态',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (captain_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uk_team_number (team_number),
  INDEX idx_team_number (team_number),
  INDEX idx_captain_id (captain_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='深渊队伍表';

-- 深渊排表（队伍成员关系）
CREATE TABLE IF NOT EXISTS abyss_schedules (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  team_id INT NOT NULL COMMENT '队伍ID',
  schedule_date DATE NOT NULL COMMENT '排表日期',
  week_number INT NOT NULL COMMENT '周数',
  status ENUM('scheduled', 'absent', 'completed') DEFAULT 'scheduled' COMMENT '状态',
  notes TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (team_id) REFERENCES abyss_teams(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_schedule (user_id, schedule_date),
  INDEX idx_schedule_date (schedule_date),
  INDEX idx_team_id (team_id),
  INDEX idx_week_number (week_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='深渊排表';

-- 请假记录表
CREATE TABLE IF NOT EXISTS leave_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  start_date DATE NOT NULL COMMENT '开始日期',
  end_date DATE NOT NULL COMMENT '结束日期',
  reason TEXT COMMENT '请假原因',
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '审核状态',
  approved_by INT COMMENT '审核人ID',
  approved_at TIMESTAMP NULL COMMENT '审核时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_dates (start_date, end_date),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='请假记录表';

-- SS+猎杀记录表
CREATE TABLE IF NOT EXISTS ssplus_hunts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  hunt_date DATE NOT NULL COMMENT '猎杀日期',
  target_name VARCHAR(100) NOT NULL COMMENT '目标名称',
  target_level VARCHAR(20) DEFAULT 'SS+' COMMENT '目标等级',
  screenshot_url VARCHAR(255) NOT NULL COMMENT '截图URL',
  hunt_time TIME COMMENT '猎杀时间（从图片识别或手动输入）',
  status ENUM('pending', 'in_progress', 'completed', 'failed') DEFAULT 'pending' COMMENT '状态',
  assigned_to INT COMMENT '分配给的用户ID',
  completed_by INT COMMENT '完成猎杀的用户ID',
  completed_at TIMESTAMP NULL COMMENT '完成时间',
  notes TEXT COMMENT '备注',
  created_by INT NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (completed_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_hunt_date (hunt_date),
  INDEX idx_target_name (target_name),
  INDEX idx_status (status),
  INDEX idx_assigned_to (assigned_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SS+猎杀记录表';

-- 家族战记录表
CREATE TABLE IF NOT EXISTS clan_battles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  battle_date DATE NOT NULL COMMENT '对战日期',
  opponent_clan_name VARCHAR(100) NOT NULL COMMENT '对手家族名称',
  result ENUM('win', 'lose', 'draw') COMMENT '对战结果',
  score_our INT DEFAULT 0 COMMENT '我方得分',
  score_opponent INT DEFAULT 0 COMMENT '对手得分',
  battle_log_url VARCHAR(255) COMMENT '对战日志URL',
  notes TEXT COMMENT '备注',
  recorded_by INT NOT NULL COMMENT '记录者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_battle_date (battle_date),
  INDEX idx_result (result)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='家族战记录表';

-- 深渊战绩表
CREATE TABLE IF NOT EXISTS abyss_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '用户ID',
  record_date DATE NOT NULL COMMENT '记录日期',
  damage_score DECIMAL(10,2) NOT NULL COMMENT '伤害分数',
  rank INT COMMENT '排名',
  notes TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_user_date (user_id, record_date),
  INDEX idx_record_date (record_date),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='深渊战绩表';

-- 四象顺序记录表
CREATE TABLE IF NOT EXISTS four_elements_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  week_start_date DATE NOT NULL COMMENT '周开始日期',
  week_end_date DATE NOT NULL COMMENT '周结束日期',
  element_order VARCHAR(50) NOT NULL COMMENT '四象顺序，逗号分隔',
  source ENUM('manual', 'auto', 'game_api') DEFAULT 'manual' COMMENT '来源',
  notes TEXT COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_week_date (week_start_date),
  INDEX idx_week_dates (week_start_date, week_end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='四象顺序记录表';

-- 活动记录表
CREATE TABLE IF NOT EXISTS activities (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(200) NOT NULL COMMENT '活动标题',
  description TEXT COMMENT '活动描述',
  activity_type ENUM('clan_event', 'game_update', 'announcement', 'other') DEFAULT 'clan_event' COMMENT '活动类型',
  start_date DATETIME COMMENT '开始时间',
  end_date DATETIME COMMENT '结束时间',
  organizer_id INT COMMENT '组织者ID',
  status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming' COMMENT '状态',
  participation_count INT DEFAULT 0 COMMENT '参与人数',
  created_by INT NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_activity_type (activity_type),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='活动记录表';

-- 兑换码记录表
CREATE TABLE IF NOT EXISTS redemption_codes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(100) NOT NULL UNIQUE COMMENT '兑换码',
  description VARCHAR(200) COMMENT '描述',
  expiration_date DATE COMMENT '过期日期',
  usage_limit INT DEFAULT 1 COMMENT '使用次数限制',
  used_count INT DEFAULT 0 COMMENT '已使用次数',
  status ENUM('active', 'expired', 'used_up') DEFAULT 'active' COMMENT '状态',
  created_by INT NOT NULL COMMENT '创建者ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_code (code),
  INDEX idx_status (status),
  INDEX idx_expiration (expiration_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='兑换码记录表';

-- 兑换码使用记录
CREATE TABLE IF NOT EXISTS code_redemptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code_id INT NOT NULL COMMENT '兑换码ID',
  user_id INT NOT NULL COMMENT '使用者ID',
  redeemed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '兑换时间',
  FOREIGN KEY (code_id) REFERENCES redemption_codes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uk_code_user (code_id, user_id),
  INDEX idx_user_id (user_id),
  INDEX idx_redemption_date (redeemed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='兑换码使用记录';

-- 插入初始数据
-- 插入默认深渊队伍（1-10队）
INSERT IGNORE INTO abyss_teams (team_number, team_name) VALUES
(1, '第一队'), (2, '第二队'), (3, '第三队'), (4, '第四队'), (5, '第五队'),
(6, '第六队'), (7, '第七队'), (8, '第八队'), (9, '第九队'), (10, '第十队');

-- 插入管理员用户（密码：admin123）
INSERT IGNORE INTO users (game_id, username, display_name, password_hash, role, clan_rank) VALUES
('ADMIN001', 'admin', '管理员', '$2a$10$N9qo8uLOickgx2ZMRZoMyeZH6S.zM3.7XpDcJQ6ZJ5Q1Jd9vJqK3y', 'admin', 99);

-- 插入本周四象顺序示例
INSERT IGNORE INTO four_elements_orders (week_start_date, week_end_date, element_order) VALUES
(CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 DAY), '青龙,白虎,朱雀,玄武');

-- 插入示例兑换码
INSERT IGNORE INTO redemption_codes (code, description, expiration_date, usage_limit, created_by) VALUES
('NINJA2023SPRING', '2023春季礼包', DATE_ADD(CURDATE(), INTERVAL 30 DAY), 50, 1),
('CLANWELCOME', '家族欢迎礼包', DATE_ADD(CURDATE(), INTERVAL 60 DAY), 100, 1);