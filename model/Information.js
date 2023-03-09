// Define the User model
const Sequelize = require("sequelize");
const File = require("./File");
require('dotenv').config()

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
});

const Information = sequelize.define("informations", {
    id: {
        type: Sequelize.BIGINT,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    file_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
    },
    embedding: {
        type: Sequelize.TEXT,
        allowNull: true,
    },
    token: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
});

// Sync the User model with the database
Information.sync()
    .then(() => console.log("Information table created"))
    .catch((err) => console.error("Error creating information table:", err));


module.exports = Information