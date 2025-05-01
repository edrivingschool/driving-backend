const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION
});

exports.uploadFile = (file) => {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${uuidv4()}${path.extname(file.originalname)}`,
        Body: fileStream,
        ContentType: file.mimetype
    };

    return s3.upload(uploadParams).promise();
};
