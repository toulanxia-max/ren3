module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: '用户ID'
    },
    game_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      },
      comment: '游戏内ID'
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50]
      },
      comment: '用户名'
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      },
      comment: '邮箱'
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      },
      comment: '密码哈希'
    },
    display_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '',
      validate: {
        notEmpty: true
      },
      comment: '显示名称'
    },
    signature: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: '',
      comment: '个人签名'
    },
    abyss_role_config: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: '',
      comment: '深渊角色配置，例如6水/6椒/6枭/6滴'
    },
    treasure_config: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: '',
      comment: '宝物配置，例如3+3'
    },
    avatar_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: '头像URL'
    },
    role: {
      type: DataTypes.ENUM('admin', 'captain', 'member'),
      defaultValue: 'member',
      allowNull: false,
      comment: '角色：管理员/队长/成员'
    },
    clan_rank: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 99
      },
      comment: '家族职位等级'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended'),
      defaultValue: 'active',
      allowNull: false,
      comment: '状态'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: '最后登录时间'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    comment: '用户表',
    indexes: [
      {
        name: 'idx_game_id',
        fields: ['game_id']
      },
      {
        name: 'idx_username',
        fields: ['username']
      },
      {
        name: 'idx_role',
        fields: ['role']
      },
      {
        name: 'idx_status',
        fields: ['status']
      }
    ]
  });

  // 实例方法
  User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password_hash;
    delete values.created_at;
    delete values.updated_at;
    return values;
  };

  User.prototype.getPublicProfile = function() {
    return {
      id: this.id,
      game_id: this.game_id,
      username: this.username,
      email: this.email,
      display_name: this.display_name,
      signature: this.signature,
      abyss_role_config: this.abyss_role_config,
      treasure_config: this.treasure_config,
      avatar_url: this.avatar_url,
      role: this.role,
      clan_rank: this.clan_rank,
      status: this.status,
      last_login: this.last_login,
      updated_at: this.updated_at
    };
  };

  return User;
};