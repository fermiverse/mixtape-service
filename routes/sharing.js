const router = require("express").Router();
let cors = require("cors");
let User = require("../models/users.model");

router.use(cors());

router.route("/").get((req, res) => {
    res.json({ping: 1});
});

router.route("/").post((req, res) => {
    res.json({ping: req.body});
});

module.exports = router;

