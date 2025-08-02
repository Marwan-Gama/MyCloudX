@echo off
echo ========================================
echo MySQL Setup for MyCloudX
echo ========================================
echo.

echo Checking if MySQL is installed...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MySQL is not installed or not in PATH
    echo.
    echo Please install MySQL first:
    echo 1. Download from: https://dev.mysql.com/downloads/mysql/
    echo 2. Install with root password: rootpassword
    echo 3. Add MySQL to your PATH
    echo.
    pause
    exit /b 1
)

echo MySQL is installed!
echo.

echo Starting MySQL service...
net start mysql80 >nul 2>&1
if %errorlevel% neq 0 (
    echo Failed to start MySQL service
    echo Please start MySQL manually or check if it's already running
    echo.
    pause
    exit /b 1
)

echo MySQL service started!
echo.

echo Creating database...
mysql -u root -prootpassword -e "CREATE DATABASE IF NOT EXISTS mycloudx;" >nul 2>&1
if %errorlevel% neq 0 (
    echo Failed to create database
    echo Please check your MySQL credentials
    echo.
    pause
    exit /b 1
)

echo Database 'mycloudx' created successfully!
echo.

echo Setting up Prisma...
cd backend
npx prisma generate
if %errorlevel% neq 0 (
    echo Failed to generate Prisma client
    echo.
    pause
    exit /b 1
)

echo Prisma client generated!
echo.

echo Pushing schema to database...
npx prisma db push
if %errorlevel% neq 0 (
    echo Failed to push schema to database
    echo.
    pause
    exit /b 1
)

echo Schema pushed successfully!
echo.

echo ========================================
echo MySQL Setup Complete!
echo ========================================
echo.
echo Database: mycloudx
echo Tables created:
echo - users
echo - files
echo - file_shares
echo - password_reset_tokens
echo.
echo You can now start your application:
echo 1. Backend: npm run dev
echo 2. Frontend: npm start
echo.
pause 