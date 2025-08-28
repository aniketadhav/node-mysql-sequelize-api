const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/auth.controller");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.post("/me", auth(), ctrl.me);

module.exports = router;
