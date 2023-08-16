const Sequelize = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DATABASE,process.env.DB_USERNAME,process.env.DB_PASSWORD,{ 
  port: "3306",
  dialect: "mysql",
  pool: {
   host: process.env.DB_HOST,
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: false,
});

module.exports = sequelize;
