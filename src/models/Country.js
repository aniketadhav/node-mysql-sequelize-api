const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../db");

class Country extends Model {}

Country.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    isoCode: { type: DataTypes.STRING(3), allowNull: true }, // e.g., "IN", "US"
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { sequelize, modelName: "Country", tableName: "countries", timestamps: true }
);

module.exports = Country;
