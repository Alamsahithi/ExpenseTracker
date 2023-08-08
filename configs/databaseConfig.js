const Sequelize = require("sequelize");

const sequelize = new Sequelize({
  host: "localhost",
  port: "3306",
  database: "expensetracker",
  dialect: "mysql",
  username: "root",
  password: "SriSahi@22",
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  logging: false,
});

module.exports = sequelize;
