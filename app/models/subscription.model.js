module.exports = (sequelize, DataTypes) => {
  const Subscription = sequelize.define("subscription", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    subscription_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active"
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
    payment_id: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending"
    },
    payment_method: {
      type: DataTypes.STRING,
      allowNull: true
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
    auto_renew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    trial_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'subscriptions'
  });

  // Define associations
  Subscription.associate = (models) => {
    Subscription.belongsTo(models.user, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return Subscription;
};
