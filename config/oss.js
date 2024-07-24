const AWS = require('aws-sdk');
const settings = require('../setting');

exports.client = new AWS.S3({
    s3ForcePathStyle: true,
    credentials: settings.oss.credentials,
    region: settings.oss.region,
    endpoint: settings.oss.endpoint
});