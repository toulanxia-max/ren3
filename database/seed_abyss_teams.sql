-- 深渊队伍默认数据（与 init.sql、GET /abyss/teams 内 ensureDefaultAbyssTeams 一致；仅作手工补库用）
-- 排表图导出：1～4 队一张 PNG，5～9 队一张 PNG；第 10 队为备用，不参与默认两张图。
--
-- 在服务器上执行（把库名、账号换成你的）：
--   mysql -h127.0.0.1 -uYOUR_USER -p YOUR_DB < database/seed_abyss_teams.sql
--
-- 要求已存在表 abyss_teams（见 database/init.sql 里 CREATE TABLE）。

INSERT IGNORE INTO abyss_teams (team_number, team_name, status) VALUES
(1,'第一队','active'),(2,'第二队','active'),(3,'第三队','active'),(4,'第四队','active'),(5,'第五队','active'),
(6,'第六队','active'),(7,'第七队','active'),(8,'第八队','active'),(9,'第九队','active'),(10,'第十队','active');
