const router = require("express").Router();

router.get("/health", (req, res) => res.json({ ok: true, ts: Date.now() }));
router.use("/auth", require("./auth.routes"));
router.use("/tasks", require("./task.routes"));
router.use("/countries", require("./country.routes"));
router.use("/states", require("./state.routes"));

router.use("/ai", require("./ai.routes"));
router.use("/web", require("./web.routes"));

module.exports = router;
