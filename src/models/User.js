const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db');

class User extends Model {}

User.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING(80), allowNull: false },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: { type: DataTypes.STRING(120), allowNull: false },
    role: { type: DataTypes.ENUM('user', 'admin'), defaultValue: 'user' },
  },
  { sequelize, modelName: 'User', tableName: 'users', timestamps: true }
);

module.exports = User;
