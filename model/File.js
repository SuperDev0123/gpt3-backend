// Define the User model
const Sequelize = require("sequelize");
const Information = require("./Information");
require('dotenv').config()

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
});

const File = sequelize.define("files", {
    id: {
        type: Sequelize.BIGINT,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    filename: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});
// Sync the User model with the database
File.sync()
    .then(() => console.log("File table created"))
    .catch((err) => console.error("Error creating file table:", err));


module.exports = File