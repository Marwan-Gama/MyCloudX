# MyCloudX Setup Guide

This guide will help you set up and deploy the MyCloudX cloud file management system.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- AWS S3 bucket
- SMTP email service (Gmail, SendGrid, etc.)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/mycloudx.git
cd mycloudx
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

#### Environment Variables (Backend)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/mycloudx"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# AWS S3
AWS_ACCESS_KEY_ID="your-aws-access-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="mycloudx-files"

# Email (SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@mycloudx.com"

# Server
PORT=5000
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env with your configuration
nano .env
```

#### Environment Variables (Frontend)

```env
REACT_APP_API_URL="http://localhost:5000/api"
REACT_APP_S3_BUCKET="mycloudx-files"
REACT_APP_FRONTEND_URL="http://localhost:3000"
```

### 5. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manual Docker Build

```bash
# Backend
cd backend
docker build -t mycloudx-backend .
docker run -p 5000:5000 mycloudx-backend

# Frontend
cd frontend
docker build -t mycloudx-frontend .
docker run -p 3000:3000 mycloudx-frontend
```

## ☁️ AWS EC2 Deployment

### 1. Launch EC2 Instance

- Choose Ubuntu 22.04 LTS
- Instance type: t3.medium or larger
- Security group: Allow SSH (22), HTTP (80), HTTPS (443)

### 2. Connect and Run Deployment Script

```bash
# Connect to your EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Download and run deployment script
wget https://raw.githubusercontent.com/yourusername/mycloudx/main/deploy.sh
chmod +x deploy.sh
./deploy.sh
```

### 3. Configure Domain and SSL

```bash
# Update Nginx configuration with your domain
sudo nano /etc/nginx/sites-available/mycloudx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

## 🔧 Configuration

### AWS S3 Setup

1. Create an S3 bucket
2. Configure CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

3. Create IAM user with S3 access
4. Get access keys and add to environment variables

### Email Service Setup

#### Gmail

1. Enable 2-factor authentication
2. Generate app password
3. Use app password in SMTP_PASS

#### SendGrid

1. Create SendGrid account
2. Create API key
3. Use SMTP settings from SendGrid dashboard

### Database Setup

#### Local MySQL

```bash
sudo mysql -u root -p
CREATE DATABASE mycloudx;
CREATE USER 'mycloudx'@'localhost' IDENTIFIED BY 'your-password';
GRANT ALL PRIVILEGES ON mycloudx.* TO 'mycloudx'@'localhost';
FLUSH PRIVILEGES;
```

#### AWS RDS

1. Create RDS MySQL instance
2. Configure security group
3. Update DATABASE_URL in environment variables

## 🔒 Security Considerations

### Production Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable firewall rules
- [ ] Use environment variables for all secrets
- [ ] Set up automatic backups
- [ ] Configure log rotation
- [ ] Use PM2 for process management
- [ ] Set up monitoring and alerts

### Security Headers

The application includes:

- Helmet.js for security headers
- CORS protection
- Rate limiting
- Input validation with Zod
- SQL injection prevention via Prisma
- JWT in HTTP-only cookies

## 📊 Monitoring and Maintenance

### PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart application
pm2 restart all

# Update application
pm2 reload all
```

### Backup Strategy

```bash
# Manual database backup
mysqldump -u root -p mycloudx > backup.sql

# Restore database
mysql -u root -p mycloudx < backup.sql
```

### Log Management

```bash
# View application logs
pm2 logs

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# View system logs
sudo journalctl -u nginx
sudo journalctl -u mysql
```

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start

- Check if port 5000 is available
- Verify environment variables
- Check database connection
- View logs: `pm2 logs mycloudx-backend`

#### Frontend won't connect to backend

- Verify REACT_APP_API_URL
- Check CORS configuration
- Ensure backend is running
- Check network connectivity

#### File upload fails

- Verify AWS S3 credentials
- Check bucket permissions
- Ensure file size is under 50MB
- Check network connectivity

#### Database connection issues

- Verify DATABASE_URL format
- Check MySQL service status
- Verify user permissions
- Check firewall rules

### Performance Optimization

1. **Database**

   - Add indexes for frequently queried columns
   - Optimize queries
   - Use connection pooling

2. **File Storage**

   - Use CDN for static assets
   - Implement file compression
   - Use S3 lifecycle policies

3. **Application**
   - Enable gzip compression
   - Use caching headers
   - Optimize bundle size
   - Implement pagination

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer**

   - Use AWS ALB or Nginx
   - Configure health checks
   - Set up auto-scaling groups

2. **Database**

   - Use read replicas
   - Implement database sharding
   - Use connection pooling

3. **File Storage**
   - Use CloudFront CDN
   - Implement multi-region storage
   - Use S3 transfer acceleration

### Vertical Scaling

1. **EC2 Instance**

   - Upgrade instance type
   - Add more memory
   - Use EBS optimized volumes

2. **Database**
   - Upgrade RDS instance
   - Add more storage
   - Enable performance insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the troubleshooting section
- Review the documentation
- Contact the development team
