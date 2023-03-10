const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Sequelize = require("sequelize");
const router = require('./router')
const app = express();
require('dotenv').config()
app.use(bodyParser.json());
app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
// Initialize Sequelize
const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: "mysql",
});

// Test database connection
sequelize
  .authenticate()
  .then(() => console.log("Connected to MySQL database"))
  .catch((err) => console.error("Unable to connect to the database:", err));

// Define the API routes

app.use('/', router)

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));