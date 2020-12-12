const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

require("dotenv").config();
console.log(require('dotenv').config())

aws.config.update({
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
    accessKeyId: process.env.ACCESS_KEY_ID,
    region: "ap-south-1"
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
    }
};

const getFileExtension = (filename) => {
    let ls = filename.split(".");
    return "." + ls[ls.length - 1];
};

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3: s3,
        bucket: "mixtape-images",
        metadata: function (req, file, cb) {
            cb(null, {
                name: Math.random().toString(32)
            })
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + getFileExtension(file.originalname))
        }
    })
});

module.exports.upload = upload;

const getObj = async (bucket, key) => {
    try {
        const params = {
            Bucket: bucket,
            Key: key 
        };

        const data = await s3.getObject(params).promise();

        return data.Body;

    } catch (err) {
        throw new Error(`Could not retrieve file from S3: ${err.message}`);
    }
};

module.exports.getObj = getObj;


const removeObj = async (bucket, key) => {
    try {
        const params = {
            Bucket: bucket,
            Key: key 
        };

        const data = await s3.deleteObject(params).promise();

        return data.Body;

    } catch (err) {
        throw new Error(`Could not retrieve file from S3: ${err.message}`);
    }
};

module.exports.removeObj = removeObj;
