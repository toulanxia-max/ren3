module.exports = (sequelize, DataTypes) => {
  const CodeRedemption = sequelize.define('CodeRedemption', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '兑换记录ID'
    },
    code_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '兑换码ID'
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '使用者ID'
    },
    redeemed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      comment: '兑换时间'
    }
  }, {
    tableName: 'code_redemptions',
    timestamps: false, // 此表不使用标准的created_at/updated_at
    underscored: true,
    comment: '兑换码使用记录',
    indexes: [
      {
        name: 'idx_user_id',
        fields: ['user_id']
      },
      {
        name: 'idx_redemption_date',
        fields: ['redeemed_at']
      }
    ]
  });

  // 实例方法
  CodeRedemption.prototype.getRedemptionInfo = function() {
    return {
      id: this.id,
      code_id: this.code_id,
      user_id: this.user_id,
      redeemed_at: this.redeemed_at
    };
  };

  return CodeRedemption;
};