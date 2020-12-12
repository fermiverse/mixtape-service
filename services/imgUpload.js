const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

aws.config.update({
    secretAccessKey: "9d8zQiWNWstZyRy/XToY89E45K9B1tzT2f12r0vs",
    accessKeyId: "AKIAJGAUB4FX6GHG2SXA",
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
