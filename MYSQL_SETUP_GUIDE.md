# MySQL Setup Guide for MyCloudX

## 🚀 Quick Setup Options

### Option 1: Using Docker (Recommended - No Installation Required)

If you have Docker installed:

```bash
# Start MySQL with Docker
docker run --name mycloudx-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=mycloudx \
  -e MYSQL_USER=mycloudx \
  -e MYSQL_PASSWORD=mycloudxpassword \
  -p 3306:3306 \
  -d mysql:8.0

# Or use the Docker Compose file
docker-compose -f docker-compose.mysql.yml up -d
```

### Option 2: Install MySQL Locally

1. **Download MySQL**: [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. **Install MySQL Community Server**
3. **Set root password**: `rootpassword`
4. **Create database**:
   ```sql
   CREATE DATABASE mycloudx;
   CREATE USER 'mycloudx'@'localhost' IDENTIFIED BY 'mycloudxpassword';
   GRANT ALL PRIVILEGES ON mycloudx.* TO 'mycloudx'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Option 3: Using XAMPP

1. **Download XAMPP**: [XAMPP Downloads](https://www.apachefriends.org/download.html)
2. **Install and start MySQL**
3. **Create database** `mycloudx` in phpMyAdmin

## 🔧 Environment Configuration

### Step 1: Update Environment File

```bash
cd backend
copy env.mysql.template .env
```

### Step 2: Verify Database Connection

```bash
# Test MySQL connection
mysql -u mycloudx -pmycloudxpassword -h localhost -e "USE mycloudx; SHOW TABLES;"
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Push Schema to Database

```bash
npx prisma db push
```

## 📊 Database Tables

The following tables will be created:

1. **`users`** - User accounts

   - `id`, `email`, `name`, `password`, `avatar`, `createdAt`, `updatedAt`

2. **`files`** - File metadata

   - `id`, `name`, `originalName`, `mimeType`, `size`, `s3Key`, `s3Url`, `thumbnail`, `isDeleted`, `deletedAt`, `category`, `createdAt`, `updatedAt`, `ownerId`

3. **`file_shares`** - File sharing

   - `id`, `createdAt`, `updatedAt`, `fileId`, `sharedByUserId`, `sharedWithUserId`

4. **`password_reset_tokens`** - Password reset
   - `id`, `token`, `expiresAt`, `createdAt`, `userId`

## 🔍 Troubleshooting

### Connection Issues

1. **Access denied**: Check credentials in `.env`
2. **Connection refused**: Ensure MySQL is running
3. **Database doesn't exist**: Create database first

### Common Commands

```bash
# Check MySQL status
net start | findstr mysql

# Connect to MySQL
mysql -u mycloudx -pmycloudxpassword

# Show databases
SHOW DATABASES;

# Use database
USE mycloudx;

# Show tables
SHOW TABLES;
```

### Reset Database

```bash
# Drop and recreate
mysql -u mycloudx -pmycloudxpassword -e "DROP DATABASE IF EXISTS mycloudx; CREATE DATABASE mycloudx;"

# Push schema again
npx prisma db push
```

## 🎯 Next Steps

After MySQL setup:

1. **Start backend**: `npm run dev`
2. **Start frontend**: `npm start`
3. **Test application**: `http://localhost:3000`

## 📝 Environment Variables

Your `.env` file should contain:

```env
DATABASE_URL="mysql://mycloudx:mycloudxpassword@localhost:3306/mycloudx"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="mycloudx-files"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@mycloudx.com"
PORT=5000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
```
