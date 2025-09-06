module.exports = {
  HOST: process.env.DB_HOST,
  port: process.env.DB_PORT,
  DB: process.env.DB_NAME,
  USER: process.env.DB_USER,
  PASSWORD: process.env.DB_PASSWORD,
  dialect: process.env.DB_DIALECT || "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: 20,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

