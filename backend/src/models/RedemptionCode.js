module.exports = (sequelize, DataTypes) => {
  const RedemptionCode = sequelize.define('RedemptionCode', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '兑换码ID'
    },
    code: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      },
      comment: '兑换码'
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '描述'
    },
    expiration_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: '过期日期'
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1
      },
      comment: '使用次数限制'
    },
    used_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: '已使用次数'
    },
    status: {
      type: DataTypes.ENUM('active', 'expired', 'used_up'),
      defaultValue: 'active',
      allowNull: false,
      comment: '状态'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '创建者ID'
    }
  }, {
    tableName: 'redemption_codes',
    timestamps: true,
    underscored: true,
    comment: '兑换码记录表',
    indexes: [
      {
        name: 'idx_code',
        fields: ['code']
      },
      {
        name: 'idx_status',
        fields: ['status']
      },
      {
        name: 'idx_expiration',
        fields: ['expiration_date']
      }
    ]
  });

  // 实例方法
  RedemptionCode.prototype.getCodeInfo = function() {
    return {
      id: this.id,
      code: this.code,
      description: this.description,
      expiration_date: this.expiration_date,
      usage_limit: this.usage_limit,
      used_count: this.used_count,
      status: this.status,
      created_by: this.created_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  // 检查兑换码是否可用
  RedemptionCode.prototype.isAvailable = function() {
    const now = new Date();
    const expired = this.expiration_date && new Date(this.expiration_date) < now;
    return this.status === 'active' && !expired && this.used_count < this.usage_limit;
  };

  return RedemptionCode;
};