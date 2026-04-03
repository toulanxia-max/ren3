-- 线上库若已按旧版 init 建表，会缺下列字段，导致 SS+ 上传/手动发布 500。
-- 在服务器执行一次（若某列已存在会报错，可忽略该列或手动删掉对应 ALTER）：
--   mysql ninja_clan_db < fix_ssplus_hunts_columns.sql

ALTER TABLE ssplus_hunts
  ADD COLUMN countdown_end_at DATETIME NULL COMMENT '倒计时结束时间' AFTER target_level;

ALTER TABLE ssplus_hunts
  ADD COLUMN countdown_days_remaining INT NULL COMMENT '剩余天数快照' AFTER countdown_end_at;

ALTER TABLE ssplus_hunts
  ADD COLUMN assignment_slots JSON NULL COMMENT '五个位置用户ID数组' AFTER countdown_days_remaining;
