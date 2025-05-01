require('dotenv').config();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
});

/**
 * Uploads a file buffer to S3 and returns the public URL.
 * @param {Express.Multer.File} file - The file object from multer.
 * @param {string} folderName - Optional folder in the bucket.
 * @returns {Promise<string>} - Public URL of uploaded file.
 */
const uploadToS3 = async (file, folderName = '') => {
    try {
        const fileBuffer = file.buffer;
        const originalFileName = file.originalname;

        const fileExtension = mime.extension(mime.lookup(originalFileName) || "application/octet-stream");
        const uniqueFileName = `${folderName ? folderName + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: uniqueFileName,
            Body: fileBuffer,
            ContentType: mime.lookup(originalFileName) || "application/octet-stream",
            ACL: "public-read",
        };
        await s3.send(new PutObjectCommand(uploadParams));
        return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    } catch (error) {
        console.error("S3 Upload Error:", error.message);
        throw new Error("Failed to upload file to S3");
    }
};

module.exports = { uploadToS3 };
