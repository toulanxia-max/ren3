module.exports = (sequelize, DataTypes) => {
  const AbyssTeam = sequelize.define('AbyssTeam', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '队伍ID'
    },
    team_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      validate: {
        min: 1,
        max: 10
      },
      comment: '队伍编号 1-10'
    },
    team_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: '队伍名称'
    },
    captain_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '队长用户ID'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      allowNull: false,
      comment: '队伍状态'
    }
  }, {
    tableName: 'abyss_teams',
    timestamps: true,
    underscored: true,
    comment: '深渊队伍表',
    indexes: [
      {
        name: 'idx_team_number',
        fields: ['team_number']
      },
      {
        name: 'idx_captain_id',
        fields: ['captain_id']
      }
    ]
  });

  // 实例方法
  AbyssTeam.prototype.getTeamInfo = function() {
    return {
      id: this.id,
      team_number: this.team_number,
      team_name: this.team_name,
      captain_id: this.captain_id,
      status: this.status,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  return AbyssTeam;
};