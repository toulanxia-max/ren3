module.exports = (sequelize, DataTypes) => {
  const FourElementsOrder = sequelize.define('FourElementsOrder', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '四象顺序ID'
    },
    week_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      unique: true,
      comment: '周开始日期'
    },
    week_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '周结束日期'
    },
    element_order: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: '四象顺序，逗号分隔'
    },
    source: {
      type: DataTypes.ENUM('manual', 'auto', 'game_api'),
      defaultValue: 'manual',
      allowNull: false,
      comment: '来源'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    }
  }, {
    tableName: 'four_elements_orders',
    timestamps: true,
    underscored: true,
    comment: '四象顺序记录表',
    indexes: [
      {
        name: 'idx_week_dates',
        fields: ['week_start_date', 'week_end_date']
      }
    ]
  });

  // 实例方法
  FourElementsOrder.prototype.getOrderInfo = function() {
    return {
      id: this.id,
      week_start_date: this.week_start_date,
      week_end_date: this.week_end_date,
      element_order: this.element_order,
      source: this.source,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  return FourElementsOrder;
};