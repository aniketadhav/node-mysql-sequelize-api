const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/state.controller");

router.use(auth());

router.post("/create", ctrl.create);
router.post("/list", ctrl.list);
router.post("/get-by-id", ctrl.getById);

module.exports = router;
