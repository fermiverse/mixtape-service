const router = require("express").Router();
let cors = require("cors");
let User = require("../models/users.model");

router.use(cors());

router.route("/:sid").get(async (req, res) => {
    try {
        let {sid} = req.params;
        if (sid) {
            await User.findOne({spotifyId: sid}).then((user) => {
                res.status(200).json({user: user});
            }).catch((err) => {
                res.json({error: "User does not exist"});
            })
        } else {
            res.status(400).json({error: "Missing spotify Id"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/:sid/mixes/all").get(async (req, res) => {
    try {
        let {sid} = req.params;
        if (sid) {
            await User.findOne({spotifyId: sid}).then((user) => {
                res.status(200).json({mixes: user.mixes});
            }).catch((err) => {
                res.json({error: "User does not exist"});
            })
        } else {
            res.status(400).json({error: "Missing spotify Id"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/:sid/mixes/find").get(async (req, res) => {
    try {
        let {sid} = req.params;
        let {name} = req.query;
        if (sid && name) {
            await User.findOne({
                spotifyId: sid,
                mixes: {
                    $elemMatch: {
                        name: name
                    }
                }
            }, {
                mixes: {
                    $elemMatch: {
                        name: name
                    }
                }
            }).then((mix) => {
                res.status(200).json({mix: mix});
            }).catch((err) => {
                res.json({error: "User does not exist"});
            })
        } else {
            res.status(400).json({error: "Missing spotify Id"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/:sid/mixes/add").post(async (req, res) => {
    try {
        let {sid} = req.params;
        let {mix} = req.body;
        if (sid && mix) {
            await User.findOneAndUpdate({
                spotifyId: sid
            }, {
                $push: {
                    mixes: mix
                }
            }).then((user) => {
                res.status(200).json({conf: "Mix added"});
            }).catch((err) => {
                res.json({error: "User does not exist"});
            })
        } else {
            res.status(400).json({error: "Unable to add mix"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/:sid/mixes/update").post(async (req, res) => {
    try {
        let {sid} = req.params;
        let {mix} = req.body;
        if (sid && mix) {
            await User.findOneAndUpdate({
                spotifyId: sid,
                mixes: {
                    $elemMatch: {
                        id: mix.id
                    }
                }
            }, {
                $pull: {
                    mixes: {
                        id: mix.id
                    }
                }, 
                $push: {
                    mixes: mix
                }
            }).then((user) => {
                res.status(200).json({conf: "Mix updated"});
            }).catch((err) => {
                res.json({error: "User does not exist"});
            })
        } else {
            res.status(400).json({error: "Unable to modify mix"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/:sid/mixes/delete").post(async (req, res) => {
    try {
        let {sid} = req.params;
        let {mix} = req.body;
        if (sid && mix) {
            await User.findOneAndUpdate({
                spotifyId: sid,
                mixes: {
                    $elemMatch: {
                        id: mix.id
                    }
                }
            }, {
                $pull: {
                    mixes: {
                        id: mix.id
                    }
                }
            }).then((user) => {
                res.status(200).json({conf: "Mix deleted"});
            }).catch((err) => {
                res.json({error: "User does not exist"});
            })
        } else {
            res.status(400).json({error: "Unable to modify mix"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/create").post(async (req, res) => {
    try {
        let {name, spotifyId} = req.body;
        if (name && spotifyId) {
            const user = new User({
                name,
                spotifyId
            });
            await user.save(function(err, user) {
                if (err) res.status(400).json({error: "Could not create user"});
                else res.status(200).json({id: user._id});
            });
        } else {
            res.status(400).json({error: "Could not create user"});
        }
    } catch (error) {
        res.status(400).json({error: "Could not create user"});
    }   
});

module.exports = router;