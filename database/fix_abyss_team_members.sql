-- 已有库补建：队伍管理 API 依赖 abyss_team_members；若缺表会 500
-- 用法：mysql -h... -u... -p... ninja_clan_db < fix_abyss_team_members.sql

CREATE TABLE IF NOT EXISTS abyss_team_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  team_id INT NOT NULL COMMENT '队伍ID',
  user_id INT NOT NULL COMMENT '用户ID',
  role ENUM('captain', 'member') NOT NULL DEFAULT 'member' COMMENT '角色',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  notes VARCHAR(255) NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (team_id) REFERENCES abyss_teams(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY idx_team_member_unique (team_id, user_id),
  INDEX idx_team_member_team (team_id),
  INDEX idx_team_member_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='深渊队伍成员表';
