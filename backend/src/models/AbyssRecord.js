module.exports = (sequelize, DataTypes) => {
  const AbyssRecord = sequelize.define('AbyssRecord', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '深渊战绩ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '用户ID'
    },
    record_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '记录日期'
    },
    damage_score: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      },
      comment: '伤害分数'
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1
      },
      comment: '排名'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'abyss_records',
    timestamps: true,
    underscored: true,
    comment: '深渊战绩表',
    indexes: [
      {
        name: 'idx_record_date',
        fields: ['record_date']
      },
      {
        name: 'idx_user_id',
        fields: ['user_id']
      }
    ]
  });

  // 实例方法
  AbyssRecord.prototype.getRecordInfo = function() {
    return {
      id: this.id,
      user_id: this.user_id,
      record_date: this.record_date,
      damage_score: parseFloat(this.damage_score),
      rank: this.rank,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  return AbyssRecord;
};