async function uploadReadableStream(s3, bucket, key, stream) {
    // Arguments: 
    // s3 = S3 Instance config, bucket name, file name, stream -> createReadStream(file)
    const params = {Bucket: bucket, Key: key, Body: stream};
    return s3.upload(params).promise();
  }
module.exports = uploadReadableStream;