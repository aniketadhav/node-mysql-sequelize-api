const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../db');

class Task extends Model {}

Task.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    done: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { sequelize, modelName: 'Task', tableName: 'tasks', timestamps: true }
);

module.exports = Task;
