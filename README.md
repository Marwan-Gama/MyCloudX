# MyCloudX - Modern Cloud File Management System

A secure, full-stack cloud file management system similar to Google Drive, built with React, Node.js, and AWS S3.

## 🚀 Features

### 🔐 Authentication

- User registration and login with JWT
- Secure password reset via email
- HTTP-only cookie authentication

### 📁 File Management

- Upload files up to 50MB with progress tracking
- View files inline (images, videos, audio, PDFs)
- Rename, move, and organize files
- Soft delete with trash recovery
- Real-time search and filtering

### 🤝 File Sharing

- Share files with other users by email
- Read-only access for shared files
- Email notifications for sharing

### 🎨 Modern UI/UX

- Responsive design with Bootstrap
- Light/dark mode toggle
- Collapsible sidebar navigation
- Grid and list view modes
- Floating Action Button (FAB)

## 📦 Tech Stack

### Frontend

- React 18 + TypeScript
- Bootstrap 5 for UI components
- React Router for navigation
- Axios for API calls

### Backend

- Node.js + Express + TypeScript
- Prisma ORM with MySQL
- JWT authentication
- AWS S3 for file storage
- Nodemailer for email services

### Infrastructure

- MySQL database
- AWS S3 for cloud storage
- JWT for secure authentication

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+
- AWS S3 bucket
- SMTP email service

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd MyCloudX

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Configuration

```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend (.env)
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

### 3. Database Setup

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. Start Development Servers

```bash
# Start backend (from backend directory)
npm run dev

# Start frontend (from frontend directory)
npm start
```

## 📁 Project Structure

```
MyCloudX/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Auth & validation middleware
│   │   ├── models/          # Prisma models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Utility functions
│   ├── prisma/              # Database schema
│   └── package.json
├── frontend/                # React application
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── types/           # TypeScript types
│   │   └── utils/           # Utility functions
│   └── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/mycloudx"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

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

# Server
PORT=5000
NODE_ENV="development"
```

#### Frontend (.env)

```env
REACT_APP_API_URL="http://localhost:5000/api"
REACT_APP_S3_BUCKET="mycloudx-files"
```

## 🚀 Deployment

### AWS EC2 Deployment

1. Set up EC2 instance with Ubuntu
2. Install Node.js, MySQL, and PM2
3. Configure environment variables
4. Use PM2 to run the application
5. Set up Nginx as reverse proxy
6. Configure SSL with Let's Encrypt

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🔒 Security Features

- JWT stored in HTTP-only cookies
- bcrypt password hashing
- CORS protection
- Helmet.js security headers
- Input validation with Zod
- SQL injection prevention via Prisma
- File type validation
- Rate limiting

## 📈 Performance

- File upload with progress tracking
- Client-side search and filtering
- Pagination for large file lists
- Optimized image loading
- Error boundaries for fault tolerance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
