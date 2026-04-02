module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define('Activity', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '活动ID'
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: '活动标题'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '活动描述'
    },
    activity_type: {
      type: DataTypes.ENUM('clan_event', 'game_update', 'announcement', 'other'),
      defaultValue: 'clan_event',
      allowNull: false,
      comment: '活动类型'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '开始时间'
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '结束时间'
    },
    organizer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '组织者ID'
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
      defaultValue: 'upcoming',
      allowNull: false,
      comment: '状态'
    },
    participation_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: '参与人数'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建者ID'
    }
  }, {
    tableName: 'activities',
    timestamps: true,
    underscored: true,
    comment: '活动记录表',
    indexes: [
      {
        name: 'idx_activity_type',
        fields: ['activity_type']
      },
      {
        name: 'idx_status',
        fields: ['status']
      },
      {
        name: 'idx_dates',
        fields: ['start_date', 'end_date']
      }
    ]
  });

  // 实例方法
  Activity.prototype.getActivityInfo = function() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      activity_type: this.activity_type,
      start_date: this.start_date,
      end_date: this.end_date,
      organizer_id: this.organizer_id,
      status: this.status,
      participation_count: this.participation_count,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  return Activity;
};