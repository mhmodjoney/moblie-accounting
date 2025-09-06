const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("user", {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    full_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "new"
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "user"
    },
    subscription_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "free_trial"
    },
    subscription_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    subscription_start: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    subscription_end: {
      type: DataTypes.DATE,
      allowNull: false
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    device_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    }
  }, {
    timestamps: true
  });

  // Automatically hash password before saving
  User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  // Optionally hash on update
  User.beforeUpdate(async (user) => {
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  // Define associations
  User.associate = (models) => {
    User.hasMany(models.subscription, {
      foreignKey: 'user_id',
      as: 'subscriptions'
    });
    
    User.belongsTo(models.subscription_plan, {
      foreignKey: 'subscription_plan_id',
      targetKey: 'id',
      as: 'plan'
    });
  };

  return User;
};
