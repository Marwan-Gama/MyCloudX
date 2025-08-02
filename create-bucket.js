const AWS = require("aws-sdk");
require("dotenv").config();

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-east-1",
});

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET || "mycloudx-files";

async function createBucket() {
  try {
    console.log(`Creating S3 bucket: ${BUCKET_NAME}`);

    const params = {
      Bucket: BUCKET_NAME,
      CreateBucketConfiguration: {
        LocationConstraint:
          process.env.AWS_REGION === "us-east-1"
            ? undefined
            : process.env.AWS_REGION,
      },
    };

    await s3.createBucket(params).promise();
    console.log(`✅ Successfully created bucket: ${BUCKET_NAME}`);

    // Set up CORS configuration for web access
    const corsParams = {
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"], // In production, specify your domain
            ExposeHeaders: ["ETag"],
          },
        ],
      },
    };

    await s3.putBucketCors(corsParams).promise();
    console.log("✅ CORS configuration applied");

    // Set up bucket policy for private access
    const bucketPolicy = {
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PrivateAccess",
            Effect: "Deny",
            Principal: "*",
            Action: "s3:*",
            Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
            Condition: {
              Bool: {
                "aws:SecureTransport": "false",
              },
            },
          },
        ],
      }),
    };

    await s3.putBucketPolicy(bucketPolicy).promise();
    console.log("✅ Bucket policy applied (HTTPS only)");

    console.log("\n🎉 Bucket setup complete!");
    console.log(`Bucket Name: ${BUCKET_NAME}`);
    console.log(`Region: ${process.env.AWS_REGION || "us-east-1"}`);
    console.log("\nNext steps:");
    console.log("1. Make sure your AWS credentials are properly configured");
    console.log("2. Update your .env files with the correct bucket name");
    console.log("3. Test file uploads in your application");
  } catch (error) {
    if (error.code === "BucketAlreadyExists") {
      console.log(`⚠️  Bucket ${BUCKET_NAME} already exists`);
    } else if (error.code === "BucketAlreadyOwnedByYou") {
      console.log(`⚠️  Bucket ${BUCKET_NAME} is already owned by you`);
    } else {
      console.error("❌ Error creating bucket:", error.message);
      console.error("\nMake sure you have:");
      console.error("1. Valid AWS credentials in your environment");
      console.error("2. Proper permissions to create S3 buckets");
      console.error(
        "3. A unique bucket name (S3 bucket names must be globally unique)"
      );
    }
  }
}

// Check if required environment variables are set
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  console.error("❌ Missing AWS credentials!");
  console.error("Please set the following environment variables:");
  console.error("- AWS_ACCESS_KEY_ID");
  console.error("- AWS_SECRET_ACCESS_KEY");
  console.error("- AWS_REGION (optional, defaults to us-east-1)");
  console.error("- AWS_S3_BUCKET (optional, defaults to mycloudx-files)");
  process.exit(1);
}

createBucket();
