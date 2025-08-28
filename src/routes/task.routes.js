const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/task.controller");

router.use(auth());
router.post("/create", ctrl.create);
router.post("/list", ctrl.list);
router.post("/update", ctrl.update);
router.post("/delete", ctrl.removePost);

module.exports = router;
