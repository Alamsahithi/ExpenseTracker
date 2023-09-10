const AWS = require("aws-sdk");
require("dotenv").config();

const uploadToS3 = async (data, fileName) => {
  const BUCKET_NAME = process.env.AWS_S3_BUCKETNAME;
  const s3Bucket = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  });
  return new Promise((resolve, reject) => {
    s3Bucket.upload(
      { Bucket: BUCKET_NAME, Key: fileName, Body: data, ACL: "public-read" },
      (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      }
    );
  });
};

module.exports = { uploadToS3 };
