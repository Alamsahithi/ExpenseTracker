const { DataTypes } = require("sequelize");
const sequelize = require("../configs/databaseConfig");

const User = sequelize.define("User", {
  fullName: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(200), allowNull: false },
  phone: { type: DataTypes.STRING(200), allowNull: false },
  password: { type: DataTypes.STRING(200), allowNull: false },
  premiumUser: { type: DataTypes.BOOLEAN, allowNull: false },
  totalExpenses: { type: DataTypes.INTEGER, allowNull: false },
});

User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;

  return values;
};

module.exports = User;
