const router = require("express").Router();
let cors = require("cors");
let User = require("../models/users.model");
const { upload, getObj, removeObj } = require("../services/imgUpload");

/*
const whitelist = ["https://mixtape.fermiverse.com"];
const corsOptions = {
    origin: whitelist,
    methods: ["GET", "POST", "PUT"]
};
router.use(cors(corsOptions));
*/
router.use(cors());

router.route("/").get((req, res) => {
    res.json({ping: 1});
});

router.route("/").post(async (req, res) => {
    res.json({body: req.body});
});

router.route("/:sid").get(async (req, res) => {
    try {
        let {sid} = req.params;
        if (sid) {
            await User.findOne({spotifyId: sid}).then((user) => {
                if (user) res.status(200).json({user: user});
                else res.status(404).json({error: "User does not exist"});
            }).catch((err) => {
                res.status(404).json({error: "User does not exist"});
            })
        } else {
            res.status(400).json({error: "Missing spotify Id"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

const filterFields = (fields) => {
    let nonNullKeys = Object.keys(fields).filter(key => key !== null);
    let nonNullFields = {};
    for (let keys of nonNullKeys) {
        nonNullFields[key] = fields[key];
    }
    return nonNullFields;
};

router.route("/:sid/update").post(async (req, res) => {
    try {
        let {sid} = req.params;
        let {name, genres, description, cover} = req.body;
        if (sid) {
            await User.findOneAndUpdate({spotifyId: sid}, {
                $set: {
                    name, genres, description, cover
                }
            }).then((user) => {
                if (user) res.status(200).json({conf: "User updated"});
                else res.status(404).json({error: "User does not exist"});
            }).catch((err) => {
                res.status(404).json({error: "User does not exist"});
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

const getName = (name) => {
    return name.split("%20").join(" ");
};

router.route("/:sid/mixes/find").get(async (req, res) => {
    try {
        let {sid} = req.params;
        let {name} = req.query;
        if (sid && name) {
            await User.findOne({
                spotifyId: sid,
                mixes: {
                    $elemMatch: {
                        name: getName(name)
                    }
                }
            }, {
                mixes: {
                    $elemMatch: {
                        name: name
                    }
                }
            }).then((user) => {
                res.status(200).json({mix: user.mixes[0]});
            }).catch((err) => {
                res.status(404).json({error: "Mix does not exist"});
            })
        } else {
            res.status(400).json({error: "Missing spotify Id"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/:sid/mixes/findbyid").get(async (req, res) => {
    try {
        let {sid} = req.params;
        let {id} = req.query;
        if (sid && id) {
            await User.findOne({
                spotifyId: sid,
                mixes: {
                    $elemMatch: {
                        id: id
                    }
                }
            }, {
                mixes: {
                    $elemMatch: {
                        id: id
                    }
                }
            }).then((user) => {
                res.status(200).json({mix: user.mixes[0]});
            }).catch((err) => {
                res.status(404).json({error: "User does not exist"});
            })
        } else {
            res.status(400).json({error: "Missing spotify Id"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

const updateMixes = (mixes, newMix) => {
    let newMixes = mixes.filter(mix => mix.id !== newMix.id);
    newMixes.push(newMix);
    return newMixes
};

router.route("/:sid/mixes/add").post(async (req, res) => {
    try {
        let {sid} = req.params;
        let {mix, update} = req.body;
        if (sid && mix) {
            if (update) {
                await User.findOne({
                    spotifyId: sid
                }).then((user) => {
                    User.findOneAndUpdate({
                        spotifyId: sid
                    }, 
                    {
                        $set: {
                            mixes: updateMixes(user.mixes, mix)
                        }
                    }).then(() => {
                        res.status(200).json({conf: "Mixes updated"});
                    }).catch((err) => {
                        res.status(404).json({error: "User does not exist"});
                        console.log(err);
                    });
                }).catch((err) => {
                    res.status(404).json({error: "User does not exist"});
                    console.log(err);
                });
            } else {
                await User.findOneAndUpdate({
                    spotifyId: sid
                }, {
                    $push: {
                        mixes: mix
                    }
                }).then((user) => {
                    res.status(200).json({conf: "Mix added"});
                }).catch((err) => {
                    res.status(404).json({error: "User does not exist"});
                    console.log(err);
                });
            }
        } else {
            res.status(400).json({error: "Unable to add mix"});
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
            res.status(400).json({error: "Unable to delete mix"});
        }
    } catch (error) {
        res.status(400).json({error: "Malformed request"});
    }
});

const singleUpload = upload.single("image");

const getImageUri = (sid, key) => {
    return `https://api.fermiverse.com/users/${sid}/images/?key=${key}`;
};

router.route("/:sid/images/upload").post((req, res) => {
    try {
        //console.log(req);
        let {sid} = req.params;
        if (sid) {
            singleUpload(req, res, function (err) {
                if (err) {
                    return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
                }
                if (req.file) {
                    let newImage = {
                        uri: getImageUri(sid, req.file.key),
                        name: req.file.key,
                        size: req.file.size,
                        sourceName: req.file.originalname
                    };
                    let resp;
                    User.findOneAndUpdate({spotifyId: sid}, {
                        $push: {
                            images: newImage
                        }
                    }).then(data => {
                        return res.json({uri: getImageUri(sid, req.file.key)});
                    }).catch(err => {
                        console.log(err);
                        return res.json({error: "Error updating DB"});
                    });
                }
            });
        } else {
            res.status(400).json({error: "Unable to upload file"});
        }
    } catch (err) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/:sid/images/delete").post(async (req, res) => {
    try {
        //console.log(req);
        let {sid} = req.params;
        let {key} = req.body;
        if (sid && key) {
            await removeObj("mixtape-images", key).then((data) => {
                res.json({conf: "Image successfully deleted"});
            }).catch((err) => {
                res.json({error: "Unable to delete image"});
            })
        } else {
            res.status(400).json({error: "Unable to delete image"});
        }
    } catch (err) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/:sid/images").get(async (req, res) => {
    try {
        //console.log(req);
        let {sid} = req.params;
        let {key} = req.query;
        if (sid && key) {
            await getObj("mixtape-images", key).then((data) => {
                res.writeHead(200, {"Content-Type": "image/gif"});
                res.write(data, "binary");
                res.end();
            }).catch((err) => {
                res.json({error: "Unable to pull image"})
            })
        } else {
            res.status(400).json({error: "Unable to fetch image"});
        }
    } catch (err) {
        res.status(400).json({error: "Malformed request"});
    }
});

router.route("/create").post(async (req, res) => {
    try {
        let {name, spotifyId} = req.body;
        if (name && spotifyId) {
            const user = new User({
                name: name,
                spotifyId: spotifyId
            });
            await user.save(function(err, user) {
                if (err) {
                    res.status(400).json({error: "Could not create user"});
                    console.log(err);
                }
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