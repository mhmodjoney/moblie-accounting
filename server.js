const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require('dotenv').config();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS - ALLOW FRONTEND DEVELOPMENT SERVERS
const corsOptions = {
  origin: process.env.CORS_ORIGIN || [
    "http://localhost:3000",    // React default
    "http://localhost:5173",    // Vite default
    "http://localhost:3001",    // Alternative React port
    "http://localhost:8080"     // Your backend port
  ],
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

const db = require("./app/models");

db.sequelize.sync({ alter: true })
  .then(() => {
    console.log("Synced db.");
  })
  .catch((err) => {
    console.log("Failed to sync db: " + err.message);
    console.log("Full error:", err);
    console.log("Error stack:", err.stack);
  });

// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to bezkoder application." });
});

app.use("/api/auth", require("./app/routes/user.routes"));
app.use("/api/subscriptions", require("./app/routes/subscription.routes"));
app.use("/api/subscription-plans", require("./app/routes/subscription.plan.routes"));
require("./app/routes/upload.routes")(app);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
