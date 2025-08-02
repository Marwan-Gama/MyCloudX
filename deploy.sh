#!/bin/bash

# MyCloudX Deployment Script for AWS EC2
# This script sets up the complete MyCloudX application on an Ubuntu EC2 instance

set -e

echo "🚀 Starting MyCloudX deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Node.js 18
echo "📦 Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL 8.0
echo "📦 Installing MySQL 8.0..."
sudo apt install -y mysql-server

# Secure MySQL installation
echo "🔒 Securing MySQL installation..."
sudo mysql_secure_installation

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/mycloudx
sudo chown $USER:$USER /var/www/mycloudx

# Clone repository (replace with your actual repository URL)
echo "📥 Cloning repository..."
cd /var/www/mycloudx
git clone https://github.com/yourusername/mycloudx.git .

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
npm run build

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install
npm run build

# Set up environment variables
echo "⚙️ Setting up environment variables..."
cd /var/www/mycloudx/backend
cp env.example .env

# Edit .env file with your actual values
echo "Please edit the .env file with your actual configuration values:"
echo "DATABASE_URL, JWT_SECRET, AWS credentials, SMTP settings, etc."
read -p "Press Enter after editing the .env file..."

# Set up database
echo "🗄️ Setting up database..."
cd /var/www/mycloudx/backend
npx prisma generate
npx prisma db push

# Configure Nginx
echo "🌐 Configuring Nginx..."
sudo tee /etc/nginx/sites-available/mycloudx > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain

    # Frontend
    location / {
        root /var/www/mycloudx/frontend/build;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:5000/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/mycloudx /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Start backend with PM2
echo "🚀 Starting backend with PM2..."
cd /var/www/mycloudx/backend
pm2 start dist/index.js --name "mycloudx-backend"
pm2 save
pm2 startup

# Start frontend with PM2 (if needed)
echo "🚀 Starting frontend with PM2..."
cd /var/www/mycloudx/frontend
pm2 start npm --name "mycloudx-frontend" -- start
pm2 save

# Set up SSL certificate (if domain is configured)
echo "🔒 Setting up SSL certificate..."
read -p "Do you want to set up SSL certificate? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter your domain name: " domain
    sudo certbot --nginx -d $domain
fi

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Set up automatic backups
echo "💾 Setting up automatic backups..."
sudo mkdir -p /var/backups/mycloudx
sudo tee /etc/cron.daily/mycloudx-backup > /dev/null <<EOF
#!/bin/bash
BACKUP_DIR="/var/backups/mycloudx"
DATE=\$(date +%Y%m%d_%H%M%S)

# Backup database
mysqldump -u root -p mycloudx > \$BACKUP_DIR/db_backup_\$DATE.sql

# Backup application files
tar -czf \$BACKUP_DIR/app_backup_\$DATE.tar.gz /var/www/mycloudx

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /etc/cron.daily/mycloudx-backup

# Set up log rotation
echo "📝 Setting up log rotation..."
sudo tee /etc/logrotate.d/mycloudx > /dev/null <<EOF
/var/www/mycloudx/backend/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
EOF

echo "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your MyCloudX application is now running at:"
echo "   Frontend: http://your-domain.com"
echo "   Backend API: http://your-domain.com/api"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "🔧 Useful commands:"
echo "   - View logs: pm2 logs"
echo "   - Restart app: pm2 restart all"
echo "   - Monitor: pm2 monit"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Update your domain name in Nginx configuration"
echo "   2. Configure your AWS S3 bucket and credentials"
echo "   3. Set up your SMTP email service"
echo "   4. Update JWT_SECRET in the .env file"
echo "   5. Configure your firewall rules" 