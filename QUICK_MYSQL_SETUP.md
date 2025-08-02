# Quick MySQL Setup for MyCloudX

## 🎯 Current Status

✅ **Frontend**: Running on port 3000  
✅ **Backend**: Running on port 5000  
❌ **MySQL**: Not installed/running

## 🚀 Quick Setup Options

### Option 1: Install MySQL (Recommended)

1. **Download MySQL**: [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)
2. **Install MySQL Community Server** for Windows
3. **Set root password**: `rootpassword`
4. **Add MySQL to PATH** during installation

### Option 2: Use XAMPP (Easiest)

1. **Download XAMPP**: [XAMPP Downloads](https://www.apachefriends.org/download.html)
2. **Install XAMPP**
3. **Start MySQL** from XAMPP Control Panel
4. **Create database** `mycloudx` in phpMyAdmin

### Option 3: Use Online MySQL (Free)

1. **Sign up for free MySQL hosting**:
   - [PlanetScale](https://planetscale.com/) (Free tier)
   - [Railway](https://railway.app/) (Free tier)
   - [Clever Cloud](https://www.clever-cloud.com/) (Free tier)

## 🔧 After MySQL Installation

### Step 1: Create Database

```sql
CREATE DATABASE mycloudx;
CREATE USER 'mycloudx'@'localhost' IDENTIFIED BY 'mycloudxpassword';
GRANT ALL PRIVILEGES ON mycloudx.* TO 'mycloudx'@'localhost';
FLUSH PRIVILEGES;
```

### Step 2: Update Environment

Your `.env` file is already configured with:

```env
DATABASE_URL="mysql://mycloudx:mycloudxpassword@localhost:3306/mycloudx"
```

### Step 3: Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### Step 4: Push Schema to Database

```bash
npx prisma db push
```

## 📊 Database Tables Created

1. **`users`** - User accounts
2. **`files`** - File metadata
3. **`file_shares`** - File sharing
4. **`password_reset_tokens`** - Password reset

## 🎯 Test Your Setup

1. **Start backend**: `npm run dev` (already running)
2. **Start frontend**: `npm start` (already running)
3. **Test application**: Visit `http://localhost:3000`

## 🔍 Troubleshooting

### If MySQL is not connecting:

1. **Check if MySQL is running**:

   ```bash
   net start | findstr mysql
   ```

2. **Test connection**:

   ```bash
   mysql -u mycloudx -pmycloudxpassword -e "SHOW DATABASES;"
   ```

3. **Check port 3306**:
   ```bash
   netstat -ano | findstr 3306
   ```

### If you get "Access denied":

1. **Reset MySQL password**:

   ```sql
   ALTER USER 'mycloudx'@'localhost' IDENTIFIED BY 'mycloudxpassword';
   FLUSH PRIVILEGES;
   ```

2. **Or use root user**:
   ```env
   DATABASE_URL="mysql://root:rootpassword@localhost:3306/mycloudx"
   ```

## 🎉 Success Indicators

When MySQL is working correctly:

- ✅ `npx prisma db push` completes without errors
- ✅ Backend starts without database connection errors
- ✅ You can register/login in the frontend
- ✅ File upload/download works

## 📞 Need Help?

If you're still having issues:

1. **Try XAMPP** - It's the easiest option
2. **Use online MySQL** - No local installation needed
3. **Check the detailed guide**: `MYSQL_SETUP_GUIDE.md`
