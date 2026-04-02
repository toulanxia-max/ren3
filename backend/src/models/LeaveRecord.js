module.exports = (sequelize, DataTypes) => {
  const LeaveRecord = sequelize.define('LeaveRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '请假记录ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '开始日期'
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '结束日期'
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '请假原因'
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
      allowNull: false,
      comment: '审核状态'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: '审核人ID'
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '审核时间'
    }
  }, {
    tableName: 'leave_records',
    timestamps: true,
    underscored: true,
    comment: '请假记录表',
    indexes: [
      {
        name: 'idx_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_dates',
        fields: ['start_date', 'end_date']
      },
      {
        name: 'idx_status',
        fields: ['status']
      }
    ]
  });

  // 实例方法
  LeaveRecord.prototype.getLeaveInfo = function() {
    return {
      id: this.id,
      user_id: this.user_id,
      start_date: this.start_date,
      end_date: this.end_date,
      reason: this.reason,
      status: this.status,
      approved_by: this.approved_by,
      approved_at: this.approved_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  return LeaveRecord;
};