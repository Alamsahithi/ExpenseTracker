const { DataTypes } = require("sequelize");
const sequelize = require("../configurations/databaseConfig");

const ForgotPasswordRequests = sequelize.define("ForgotPasswordRequests", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isactive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

module.exports = ForgotPasswordRequests;
