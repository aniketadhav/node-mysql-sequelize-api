const User = require("./User");
const Task = require("./Task");
const Country = require("./Country");
const State = require("./State");

User.hasMany(Task, { foreignKey: "userId", as: "tasks", onDelete: "CASCADE" });
Task.belongsTo(User, { foreignKey: "userId", as: "user" });

// NEW master data relations
Country.hasMany(State, {
  foreignKey: "countryId",
  as: "states",
  onDelete: "RESTRICT",
});
State.belongsTo(Country, { foreignKey: "countryId", as: "country" });

module.exports = { User, Task, Country, State };
