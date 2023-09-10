const Sequelize = require("sequelize");
const sequelize = require("../configs/databaseConfig");

class Download extends Sequelize.Model {}
Download.init(
  {
    downloadedAt: { type: Sequelize.DataTypes.STRING(255), allowNull: false },
    url: { type: Sequelize.DataTypes.STRING, allowNull: false },
  },
  { sequelize, modelName: "download" }
);

module.exports = Download;
