const AWS = require('aws-sdk');

const endpointRaw = process.env.S3_ENDPOINT || 'http://minio:9000';
const endpoint = new AWS.Endpoint(endpointRaw);

const s3 = new AWS.S3({
  endpoint,
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_KEY,
  s3ForcePathStyle: true,
  signatureVersion: 'v4',
  region: process.env.S3_REGION || 'us-east-1'
});

/**
 * Upload a Buffer to S3 (or MinIO) and return a public URL.
 */
async function uploadBufferToS3(key, buffer, contentType = 'application/octet-stream') {
  const bucket = process.env.S3_BUCKET || 'posters';
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read'
  };
  await s3.putObject(params).promise();

  // Construct URL: endpoint/bucket/key
  const ep = endpointRaw.replace(/\/$/, '');
  return `${ep}/${bucket}/${key}`;
}

module.exports = { uploadBufferToS3 };
