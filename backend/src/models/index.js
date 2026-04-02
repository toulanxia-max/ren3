const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database');
const logger = require('../utils/logger');

// 创建Sequelize实例
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging ? (msg) => logger.debug(msg) : false,
    pool: config.pool,
    timezone: config.timezone,
    define: {
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      paranoid: false // 不启用软删除
    }
  }
);

// 导入模型定义函数
const defineUser = require('./User');
const defineAbyssTeam = require('./AbyssTeam');
const defineAbyssTeamMember = require('./AbyssTeamMember');
const defineAbyssSchedule = require('./AbyssSchedule');
const defineLeaveRecord = require('./LeaveRecord');
const defineSSPlusHunt = require('./SSPlusHunt');
const defineClanBattle = require('./ClanBattle');
const defineAbyssRecord = require('./AbyssRecord');
const defineFourElementsOrder = require('./FourElementsOrder');
const defineActivity = require('./Activity');
const defineRedemptionCode = require('./RedemptionCode');
const defineCodeRedemption = require('./CodeRedemption');

// 定义模型
const User = defineUser(sequelize, DataTypes);
const AbyssTeam = defineAbyssTeam(sequelize, DataTypes);
const AbyssTeamMember = defineAbyssTeamMember(sequelize, DataTypes);
const AbyssSchedule = defineAbyssSchedule(sequelize, DataTypes);
const LeaveRecord = defineLeaveRecord(sequelize, DataTypes);
const SSPlusHunt = defineSSPlusHunt(sequelize, DataTypes);
const ClanBattle = defineClanBattle(sequelize, DataTypes);
const AbyssRecord = defineAbyssRecord(sequelize, DataTypes);
const FourElementsOrder = defineFourElementsOrder(sequelize, DataTypes);
const Activity = defineActivity(sequelize, DataTypes);
const RedemptionCode = defineRedemptionCode(sequelize, DataTypes);
const CodeRedemption = defineCodeRedemption(sequelize, DataTypes);

// 定义关联关系

// User关联
User.hasMany(AbyssSchedule, { foreignKey: 'user_id', as: 'abyssSchedules' });
User.hasMany(LeaveRecord, { foreignKey: 'user_id', as: 'leaveRecords' });
User.hasMany(SSPlusHunt, { foreignKey: 'assigned_to', as: 'assignedHunts' });
User.hasMany(SSPlusHunt, { foreignKey: 'completed_by', as: 'completedHunts' });
User.hasMany(SSPlusHunt, { foreignKey: 'created_by', as: 'createdHunts' });
User.hasMany(ClanBattle, { foreignKey: 'recorded_by', as: 'recordedBattles' });
User.hasMany(AbyssRecord, { foreignKey: 'user_id', as: 'abyssRecords' });
User.hasMany(Activity, { foreignKey: 'organizer_id', as: 'organizedActivities' });
User.hasMany(Activity, { foreignKey: 'created_by', as: 'createdActivities' });
User.hasMany(RedemptionCode, { foreignKey: 'created_by', as: 'createdCodes' });
User.hasMany(CodeRedemption, { foreignKey: 'user_id', as: 'codeRedemptions' });

// AbyssTeam关联
AbyssTeam.hasMany(AbyssSchedule, { foreignKey: 'team_id', as: 'teamSchedules' });
AbyssTeam.belongsTo(User, { foreignKey: 'captain_id', as: 'captain' });
AbyssTeam.hasMany(AbyssTeamMember, { foreignKey: 'team_id', as: 'members' });

// AbyssTeamMember关联
AbyssTeamMember.belongsTo(AbyssTeam, { foreignKey: 'team_id', as: 'team' });
AbyssTeamMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// AbyssSchedule关联
AbyssSchedule.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AbyssSchedule.belongsTo(AbyssTeam, { foreignKey: 'team_id', as: 'team' });

// LeaveRecord关联
LeaveRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
LeaveRecord.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

// SSPlusHunt关联
SSPlusHunt.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignedUser' });
SSPlusHunt.belongsTo(User, { foreignKey: 'completed_by', as: 'completer' });
SSPlusHunt.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// ClanBattle关联
ClanBattle.belongsTo(User, { foreignKey: 'recorded_by', as: 'recorder' });

// AbyssRecord关联
AbyssRecord.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Activity关联
Activity.belongsTo(User, { foreignKey: 'organizer_id', as: 'organizer' });
Activity.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// RedemptionCode关联
RedemptionCode.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
RedemptionCode.hasMany(CodeRedemption, { foreignKey: 'code_id', as: 'redemptions' });

// CodeRedemption关联
CodeRedemption.belongsTo(RedemptionCode, { foreignKey: 'code_id', as: 'code' });
CodeRedemption.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// 导出模型和Sequelize实例
const db = {
  sequelize,
  Sequelize,
  User,
  AbyssTeam,
  AbyssTeamMember,
  AbyssSchedule,
  LeaveRecord,
  SSPlusHunt,
  ClanBattle,
  AbyssRecord,
  FourElementsOrder,
  Activity,
  RedemptionCode,
  CodeRedemption
};

module.exports = db;