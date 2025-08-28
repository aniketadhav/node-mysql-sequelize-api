const app = require("./app");
const { sequelize } = require("./db");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    if (process.env.NODE_ENV !== "production") {
      await sequelize.sync({ alter: true });
      console.log("🛠️  Models synchronized");
    }

    app.listen(PORT, () => console.log(`🚀 Server running on :${PORT}`));
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  }
})();
