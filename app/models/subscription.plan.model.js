module.exports = (sequelize, DataTypes) => {
  const SubscriptionPlan = sequelize.define("subscription_plan", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    plan_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "USD"
    },
    duration_days: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: true
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'subscription_plans'
  });

  // Define associations
  SubscriptionPlan.associate = (models) => {
    SubscriptionPlan.hasMany(models.user, {
      foreignKey: 'subscription_plan_id',
      sourceKey: 'id',
      as: 'users'
    });
  };

  return SubscriptionPlan;
};
