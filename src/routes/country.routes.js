const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/country.controller");

router.use(auth());

router.post("/create", ctrl.create);
router.post("/list", ctrl.list);
router.post("/list-with-states", ctrl.listWithStates);

// New route for creating country with states bundle - Transaction API
router.post("/create-bundle", ctrl.createBundle);

module.exports = router;
