// Define the User model
const Sequelize = require("sequelize");
require('dotenv').config()

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USERNAME, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
});

const Url = sequelize.define("urls", {
    id: {
        type: Sequelize.BIGINT,
        unique: true,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
    },
    url: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});
// Sync the User model with the database
Url.sync()
    .then(() => {
        console.log("Url table created")
        Url.findAll().then(urls => {
            if(urls.length == 0) {
                Url.create({
                    url: 'temp.com'
                })
            }
        })
    })
    .catch((err) => console.error("Error creating url table:", err));


module.exports = Url