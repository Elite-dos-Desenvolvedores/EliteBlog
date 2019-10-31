var client = require('pkgcloud').storage.createClient({
    provider: 'amazon',
    key: process.env.IMAGER_S3_KEY,
    keyId: process.env.IMAGER_S3_KEYID,
    container: process.env.IMAGER_S3_BUCKET,
    region: process.env.IMAGER_S3_REGION
});

module.exports = client;