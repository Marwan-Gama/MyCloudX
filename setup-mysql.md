# MySQL Setup Guide for MyCloudX

This guide will help you set up MySQL for your MyCloudX project.

## Option 1: Install MySQL Locally (Recommended)

### Step 1: Download MySQL

1. Go to [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. Download MySQL Community Server for Windows
3. Choose the MSI installer (recommended)

### Step 2: Install MySQL

1. Run the downloaded MSI installer
2. Choose "Developer Default" or "Server only" installation type
3. Follow the installation wizard
4. Set root password as: `rootpassword`
5. Complete the installation

### Step 3: Verify Installation

Open Command Prompt or PowerShell and run:

```bash
mysql --version
```

### Step 4: Start MySQL Service

```bash
# Start MySQL service
net start mysql80

# Or if you have a different version
net start mysql
```

### Step 5: Create Database

```bash
# Connect to MySQL as root
mysql -u root -p

# Enter password: rootpassword

# Create the database
CREATE DATABASE mycloudx;
USE mycloudx;

# Create a user (optional)
CREATE USER 'mycloudx'@'localhost' IDENTIFIED BY 'mycloudxpassword';
GRANT ALL PRIVILEGES ON mycloudx.* TO 'mycloudx'@'localhost';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

## Option 2: Using XAMPP (Alternative)

### Step 1: Download XAMPP

1. Go to [XAMPP Downloads](https://www.apachefriends.org/download.html)
2. Download XAMPP for Windows
3. Install XAMPP

### Step 2: Start MySQL

1. Open XAMPP Control Panel
2. Start MySQL service
3. Click "Admin" to open phpMyAdmin
4. Create database named `mycloudx`

### Step 3: Update Environment

Update your `.env` file:

```env
DATABASE_URL="mysql://root:@localhost:3306/mycloudx"
```

## Option 3: Using Docker (If Docker is available)

### Step 1: Start MySQL Container

```bash
docker run --name mycloudx-mysql \
  -e MYSQL_ROOT_PASSWORD=rootpassword \
  -e MYSQL_DATABASE=mycloudx \
  -e MYSQL_USER=mycloudx \
  -e MYSQL_PASSWORD=mycloudxpassword \
  -p 3306:3306 \
  -d mysql:8.0
```

### Step 2: Update Environment

Update your `.env` file:

```env
DATABASE_URL="mysql://mycloudx:mycloudxpassword@localhost:3306/mycloudx"
```

## After MySQL Setup

### Step 1: Update Environment File

Copy the template and update with your MySQL credentials:

```bash
cd backend
copy env.template .env
```

### Step 2: Generate Prisma Client

```bash
npx prisma generate
```

### Step 3: Push Schema to Database

```bash
npx prisma db push
```

### Step 4: Verify Tables Created

```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can see all created tables.

## Database Tables Created

The following tables will be created:

1. **users** - User accounts and authentication
2. **files** - File metadata and storage information
3. **file_shares** - File sharing relationships
4. **password_reset_tokens** - Password reset functionality

## Troubleshooting

### Connection Issues

1. **Access denied**: Check username/password in DATABASE_URL
2. **Connection refused**: Make sure MySQL service is running
3. **Database doesn't exist**: Create the database first

### Common Commands

```bash
# Check MySQL status
net start | findstr mysql

# Connect to MySQL
mysql -u root -p

# Show databases
SHOW DATABASES;

# Use database
USE mycloudx;

# Show tables
SHOW TABLES;
```

### Reset Database

If you need to reset the database:

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE IF EXISTS mycloudx; CREATE DATABASE mycloudx;"

# Push schema again
npx prisma db push
```

## Next Steps

After MySQL is set up:

1. Start the backend server: `npm run dev`
2. Start the frontend server: `npm start`
3. Test the application at `http://localhost:3000`
