module.exports = (sequelize, DataTypes) => {
  const ClanBattle = sequelize.define('ClanBattle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '家族战记录ID'
    },
    battle_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: '对战日期'
    },
    opponent_clan_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: '对手家族名称'
    },
    result: {
      type: DataTypes.ENUM('win', 'lose', 'draw'),
      allowNull: true,
      comment: '对战结果'
    },
    score_our: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: '我方得分'
    },
    score_opponent: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      },
      comment: '对手得分'
    },
    battle_log_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '对战日志URL'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: '备注'
    },
    recorded_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '记录者ID'
    }
  }, {
    tableName: 'clan_battles',
    timestamps: true,
    underscored: true,
    comment: '家族战记录表',
    indexes: [
      {
        name: 'idx_battle_date',
        fields: ['battle_date']
      },
      {
        name: 'idx_result',
        fields: ['result']
      }
    ]
  });

  // 实例方法
  ClanBattle.prototype.getBattleInfo = function() {
    return {
      id: this.id,
      battle_date: this.battle_date,
      opponent_clan_name: this.opponent_clan_name,
      result: this.result,
      score_our: this.score_our,
      score_opponent: this.score_opponent,
      battle_log_url: this.battle_log_url,
      notes: this.notes,
      recorded_by: this.recorded_by,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  };

  return ClanBattle;
};