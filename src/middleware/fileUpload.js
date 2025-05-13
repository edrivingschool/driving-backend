const fileUpload = require('express-fileupload');

module.exports = fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    abortOnLimit: true,
    parseNested: true,
    useTempFiles: false
});