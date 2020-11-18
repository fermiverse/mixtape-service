const router = require("express").Router();
let cors = require("cors");
let User = require("../models/users.model");

router.use(cors());

router.route("/").get((req, res) => {
    res.json({ping: 1});
});

module.exports = router;

