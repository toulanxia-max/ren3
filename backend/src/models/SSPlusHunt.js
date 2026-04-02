module.exports = (sequelize, DataTypes) => {
  const SSPlusHunt = sequelize.define('SSPlusHunt', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '猎杀记录ID'
    },
    hunt_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '猎杀日期'
    },
    target_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: '目标名称'
    },
    countdown_end_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '倒计时结束时间'
    },
    countdown_days_remaining: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: '剩余天数（每日更新）'
    },
    assignment_slots: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [null, null, null, null, null],
      comment: '五个分配位置，存储用户ID数组'
    },
    target_level: {
      type: DataTypes.STRING(20),
      defaultValue: 'SS+',
      comment: '目标等级'
    },
    screenshot_url: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: '截图URL'
    },
    hunt_time: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: '猎杀时间'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
      defaultValue: 'pending',
      allowNull: false,
      comment: '状态'
    },
    assigned_to: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '分配给的用户ID'
    },
    completed_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '完成猎杀的用户ID'
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '完成时间'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建者ID'
    }
  }, {
    tableName: 'ssplus_hunts',
    timestamps: true,
    underscored: true,
    comment: 'SS+猎杀记录表',
    indexes: [
      {
        name: 'idx_hunt_date',
        fields: ['hunt_date']
      },
      {
        name: 'idx_target_name',
        fields: ['target_name']
      },
      {
        name: 'idx_status',
        fields: ['status']
      },
      {
        name: 'idx_assigned_to',
        fields: ['assigned_to']
      }
    ]
  });

  // 实例方法
  SSPlusHunt.prototype.getHuntInfo = function() {
    return {
      id: this.id,
      hunt_date: this.hunt_date,
      target_name: this.target_name,
      target_level: this.target_level,
      screenshot_url: this.screenshot_url,
      hunt_time: this.hunt_time,
      status: this.status,
      assigned_to: this.assigned_to,
      completed_by: this.completed_by,
      completed_at: this.completed_at,
      notes: this.notes,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  return SSPlusHunt;
};