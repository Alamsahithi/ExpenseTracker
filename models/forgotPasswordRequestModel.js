const Sequelize = require("sequelize");
const sequelize = require("../configs/databaseConfig");

class ForgotPasswordRequest extends Sequelize.Model {}

ForgotPasswordRequest.init(
  {
    id: {
      type: Sequelize.DataTypes.UUID,
      defaultValue: Sequelize.DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    isActive: {
      type: Sequelize.DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  { sequelize, modelName: "forgotPasswordRequest" }
);

module.exports = ForgotPasswordRequest;
