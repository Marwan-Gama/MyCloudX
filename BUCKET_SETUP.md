# AWS S3 Bucket Setup for MyCloudX

This guide will help you create and configure an AWS S3 bucket for your MyCloudX file storage system.

## Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI** (optional but recommended): Install from [AWS CLI website](https://aws.amazon.com/cli/)
3. **Node.js**: For running the bucket creation script

## Method 1: Using the Automated Script (Recommended)

### Step 1: Install Dependencies

```bash
# Install AWS SDK if not already installed
npm install aws-sdk dotenv
```

### Step 2: Set Up AWS Credentials

Create a `.env` file in the root directory with your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=mycloudx-files
```

### Step 3: Run the Bucket Creation Script

```bash
node create-bucket.js
```

The script will:

- Create the S3 bucket
- Configure CORS for web access
- Set up security policies
- Provide feedback on the process

## Method 2: Manual AWS Console Setup

### Step 1: Create the Bucket

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3/)
2. Click "Create bucket"
3. Enter bucket name: `mycloudx-files` (or your preferred name)
4. Select your preferred region
5. Keep default settings for versioning and encryption
6. Click "Create bucket"

### Step 2: Configure CORS

1. Select your bucket
2. Go to "Permissions" tab
3. Scroll down to "Cross-origin resource sharing (CORS)"
4. Click "Edit" and add this configuration:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### Step 3: Set Up Bucket Policy

1. In the "Permissions" tab, click "Bucket policy"
2. Add this policy (replace `your-bucket-name` with your actual bucket name):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PrivateAccess",
      "Effect": "Deny",
      "Principal": "*",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::your-bucket-name/*",
      "Condition": {
        "Bool": {
          "aws:SecureTransport": "false"
        }
      }
    }
  ]
}
```

## Method 3: Using AWS CLI

### Step 1: Configure AWS CLI

```bash
aws configure
```

Enter your AWS credentials when prompted.

### Step 2: Create Bucket

```bash
aws s3 mb s3://mycloudx-files --region us-east-1
```

### Step 3: Configure CORS

Create a file named `cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

Then apply it:

```bash
aws s3api put-bucket-cors --bucket mycloudx-files --cors-configuration file://cors.json
```

## Security Best Practices

### 1. IAM User Setup

Create a dedicated IAM user for your application with minimal permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::mycloudx-files",
        "arn:aws:s3:::mycloudx-files/*"
      ]
    }
  ]
}
```

### 2. Environment Variables

Update your backend `.env` file:

```env
AWS_ACCESS_KEY_ID=your-iam-user-access-key
AWS_SECRET_ACCESS_KEY=your-iam-user-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=mycloudx-files
```

Update your frontend `.env` file:

```env
REACT_APP_S3_BUCKET=mycloudx-files
```

## Testing the Setup

### Test File Upload

1. Start your backend server
2. Try uploading a file through your application
3. Check the S3 console to verify the file appears

### Test File Download

1. Generate a signed URL for a file
2. Try accessing the file through the URL
3. Verify the file downloads correctly

## Troubleshooting

### Common Issues

1. **Access Denied**: Check IAM permissions and bucket policy
2. **CORS Errors**: Verify CORS configuration is correct
3. **Bucket Not Found**: Ensure bucket name is correct and exists
4. **Region Mismatch**: Make sure your AWS region matches the bucket region

### Debug Commands

```bash
# List your buckets
aws s3 ls

# Check bucket CORS
aws s3api get-bucket-cors --bucket mycloudx-files

# Check bucket policy
aws s3api get-bucket-policy --bucket mycloudx-files
```

## Next Steps

After creating the bucket:

1. Update your application's environment variables
2. Test file uploads and downloads
3. Consider setting up CloudFront for better performance
4. Implement proper error handling in your application
5. Set up monitoring and logging for S3 operations

## Cost Optimization

- Use S3 Intelligent Tiering for automatic cost optimization
- Set up lifecycle policies for old files
- Monitor your usage with AWS Cost Explorer
- Consider using S3 Transfer Acceleration for better upload speeds
