// src/routes/ai.routes.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/ai.controller");

// protect all AI endpoints with JWT (you can relax later if you want)
router.use(auth());

// POST-only endpoints
router.post("/complete", ctrl.complete);
router.post("/complete-stream", ctrl.completeStream);

module.exports = router;
