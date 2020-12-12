const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const shortUserSchema = new Schema({
    spotifyId: {
        type: String,
        required: true
    }
});

const trackSchema = new Schema({
    uri: {
        type: String, 
        required: true
    },
    name: {
        type: String, 
        required: true
    },
    duration_ms: {
        type: Number,
        required: true
    },
    artists: {
        type: [String],
        required: true
    },
    likes: {
        type: [shortUserSchema]
    }
});

const mixSchema = new Schema({
    id: {
        type: String,
        required: true
    },
    tracks: {
        type: [trackSchema]
    },
    from: {
        type: shortUserSchema,
        required: true
    }, 
    to: {
        type: [shortUserSchema]
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    cover: {
        type: String
    }
}, {
    timestamps: true
});

const imageSchema = new Schema({
    sourceName: String,
    name: String,
    size: Number,
    uri: String
});

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    spotifyId: {
        type: String,
        required: true
    },
    mixes: {
        type: [mixSchema],
        required: false, 
        default: []
    }, 
    cover: {
        type: String,
        required: false, 
        default: ""
    },
    genres: {
        type: [String],
        required: false,
        default: []
    },
    description: {
        type: String,
        required: false,
        default: ""
    },
    images: {
        type: [imageSchema],
        required: false,
        default: []
    }
}, {
    timestamps: true
});

const User = mongoose.model("user", userSchema);

module.exports = User; 