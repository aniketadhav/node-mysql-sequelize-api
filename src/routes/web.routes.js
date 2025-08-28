// src/routes/web.routes.js
const router = require("express").Router();
const auth = require("../middleware/auth");
const web = require("../controllers/web.controller");

// Protect all web/ai search endpoints
router.use(auth());

// Pure search (returns results)
router.post("/search", web.search);

// RAG-lite: search + LLM answer with citations
router.post("/answer-with-web", web.answerWithWeb);

module.exports = router;
