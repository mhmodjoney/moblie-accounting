const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

let sequelize;

if (dbConfig.URL) {
  sequelize = new Sequelize(dbConfig.URL, {
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false,
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    }
  });
} else {
  sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    pool: dbConfig.pool,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
}

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user.model.js")(sequelize, Sequelize);
db.subscription = require("./subscription.model.js")(sequelize, Sequelize);
db.subscription_plan = require("./subscription.plan.model.js")(sequelize, Sequelize);

// Set up associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
