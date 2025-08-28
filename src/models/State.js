const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../db");

class State extends Model {}

State.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: false },
    code: { type: DataTypes.STRING(10), allowNull: true }, // e.g., "MH"
    // FK to Country
    countryId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "State", tableName: "states", timestamps: true }
);

module.exports = State;
