module.exports = (sequelize, DataTypes) => {
  const AbyssTeamMember = sequelize.define('AbyssTeamMember', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID'
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '队伍ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    role: {
      type: DataTypes.ENUM('captain', 'member'),
      defaultValue: 'member',
      allowNull: false,
      comment: '角色：captain=队长, member=队员'
    },
    joined_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '加入时间'
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'abyss_team_members',
    timestamps: true,
    underscored: true,
    comment: '深渊队伍成员表',
    indexes: [
      {
        name: 'idx_team_member_team',
        fields: ['team_id']
      },
      {
        name: 'idx_team_member_user',
        fields: ['user_id']
      },
      {
        name: 'idx_team_member_unique',
        fields: ['team_id', 'user_id'],
        unique: true
      }
    ]
  });

  return AbyssTeamMember;
};
