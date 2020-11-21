const router = require("express").Router();
let cors = require("cors");
let User = require("../models/users.model");

router.use(cors());

const findUpdatedMix = (mixes, id) => {
    for (let mix of mixes) {
        if (mix.id === id) return mix;
    }
    return null;
};

router.route("/").get(async (req, res) => {
    try {
        let {from, mix, to} = req.query;
        if (from && mix && to) {
            await User.findOneAndUpdate({
                spotifyId: from,
                "mixes.id": mix
            }, {
                $push: {
                    "mixes.$.to": {
                        spotifyId: to
                    }
                }
            }, {new: true}).then((user) => {
                let newMix = findUpdatedMix(user.mixes, mix);
                User.updateOne({
                    spotifyId: to
                }, {
                    $push: {
                        mixes: newMix
                    }
                }).then((user) => {
                    res.status(200).json({conf: "Mix updated"});
                }).catch((err) => {
                    res.status(404).json({err: "Error adding mix"});
                });    
            }).catch((err) => {
                res.status(404).json({err: "Error updating"})
            });
        }
    } catch (error) {
        res.status(400).json({err: "Malformed request"})
    }
});

router.route("/").post((req, res) => {
    res.json({ping: req.body});
});

module.exports = router;

