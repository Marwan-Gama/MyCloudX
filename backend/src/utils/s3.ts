import AWS from "aws-sdk";
import { S3UploadResult } from "../types";

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET!;

// Upload file to S3
export const uploadToS3 = async (
  file: Buffer,
  key: string,
  contentType: string
): Promise<S3UploadResult> => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    ACL: "private",
  };

  const result = await s3.upload(params).promise();

  return {
    key: result.Key,
    url: result.Location,
    bucket: result.Bucket,
  };
};

// Generate signed URL for file download
export const generateSignedUrl = async (
  key: string,
  expiresIn: number = 3600
): Promise<string> => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn,
  };

  return s3.getSignedUrl("getObject", params);
};

// Delete file from S3
export const deleteFromS3 = async (key: string): Promise<void> => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};

// Check if file exists in S3
export const fileExistsInS3 = async (key: string): Promise<boolean> => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    return false;
  }
};

// Generate unique file key
export const generateFileKey = (
  userId: string,
  originalName: string
): string => {
  const timestamp = Date.now();
  const randomString = Math.random()
    .toString(36)
    .substring(2, 15);
  const extension = originalName.split(".").pop();
  return `users/${userId}/${timestamp}-${randomString}.${extension}`;
};

// Get file size from S3
export const getFileSize = async (key: string): Promise<number> => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
  };

  const result = await s3.headObject(params).promise();
  return result.ContentLength || 0;
};
