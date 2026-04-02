module.exports = (sequelize, DataTypes) => {
  const AbyssSchedule = sequelize.define('AbyssSchedule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '排表记录ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    team_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '队伍ID'
    },
    schedule_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '排表日期'
    },
    week_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '周数'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'absent', 'completed'),
      defaultValue: 'scheduled',
      allowNull: false,
      comment: '状态'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'abyss_schedules',
    timestamps: true,
    underscored: true,
    comment: '深渊排表',
    indexes: [
      {
        name: 'idx_schedule_date',
        fields: ['schedule_date']
      },
      {
        name: 'idx_team_id',
        fields: ['team_id']
      },
      {
        name: 'idx_week_number',
        fields: ['week_number']
      }
    ]
  });

  // 实例方法
  AbyssSchedule.prototype.getScheduleInfo = function() {
    return {
      id: this.id,
      user_id: this.user_id,
      team_id: this.team_id,
      schedule_date: this.schedule_date,
      week_number: this.week_number,
      status: this.status,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  return AbyssSchedule;
};