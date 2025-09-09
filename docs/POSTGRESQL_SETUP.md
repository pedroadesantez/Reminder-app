# PostgreSQL Backend Setup Guide

## 🐘 **Complete Migration from Firebase to PostgreSQL**

Your Planner & Reminder App now uses a robust PostgreSQL backend with Node.js API server instead of Firebase.

## 🚀 **Quick Start**

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### 1. Database Setup

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Create database
createdb planner_db

# Set environment variables
DATABASE_URL="postgresql://username:password@localhost:5432/planner_db"
```

**Option B: Cloud PostgreSQL (Recommended)**
- **Supabase**: Free tier, easy setup
- **Railway**: $5/month, automatic deployments
- **PlanetScale**: MySQL-compatible PostgreSQL
- **Neon**: Serverless PostgreSQL

### 2. API Server Setup

```bash
# Navigate to API directory
cd planner-reminder-app/api

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### 3. React Native App Setup

```bash
# Install new dependencies
cd ../
npm install

# Remove node_modules and reinstall to ensure clean state
rm -rf node_modules package-lock.json
npm install

# Start the app
npm start
```

## 📝 **Environment Configuration**

### API Server (.env)
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/planner_db"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# Email (optional - for notifications)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

### React Native App
Update API base URL in `src/services/api.js`:
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://your-api-domain.com/api';  // Production
```

## 🏗️ **Database Schema**

### Core Tables
- **users**: User accounts with preferences and gamification stats
- **tasks**: Tasks with priority, categories, and metadata
- **categories**: User-defined task categories
- **reminders**: Scheduled notifications for tasks
- **badges**: Achievement system (planned)

### Key Features
- **Relationships**: Proper foreign keys and constraints
- **Indexing**: Optimized queries for large datasets
- **Cascading**: Automatic cleanup when users/tasks deleted
- **JSON Fields**: Flexible data storage for tags and preferences

## 🔧 **API Endpoints**

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Tasks
- `GET /api/tasks` - List tasks (with filtering/pagination)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Task statistics

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Reminders
- `GET /api/reminders` - List reminders
- `POST /api/reminders` - Create reminder
- `POST /api/reminders/:id/snooze` - Snooze reminder

## 🚀 **Deployment Options**

### API Server Deployment

**Railway (Recommended)**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway deploy
```

**Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Heroku**
```bash
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
git push heroku main
```

### React Native Deployment
```bash
# Build for production
eas build --platform android
eas build --platform ios

# Or classic Expo build
expo build:android
expo build:ios
```

## ✨ **Key Improvements over Firebase**

### Performance
- **Faster Queries**: SQL joins vs multiple Firebase queries
- **Better Caching**: Redis integration ready
- **Optimized Indexes**: Custom database optimization

### Features
- **Complex Queries**: Advanced filtering and sorting
- **Transactions**: ACID compliance for data integrity
- **Real-time**: WebSocket support for live updates
- **Full-text Search**: PostgreSQL search capabilities

### Cost & Control
- **Lower Costs**: No per-read/write charges
- **Data Ownership**: Complete control over your data
- **Custom Logic**: Server-side business rules
- **Backup Control**: Custom backup strategies

## 🔐 **Security Features**

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API call protection
- **Input Validation**: Joi schema validation
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 📊 **Database Management**

### Prisma Studio (Database GUI)
```bash
cd api
npx prisma studio
# Opens web interface at http://localhost:5555
```

### Common Commands
```bash
# View database schema
npx prisma db pull

# Reset database (development only)
npx prisma db reset

# Generate client after schema changes
npx prisma generate

# View database with GUI
npx prisma studio
```

## 🐛 **Troubleshooting**

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Ensure PostgreSQL is running
- Verify network connectivity

**Authentication Errors**
- Check JWT_SECRET is set
- Verify token hasn't expired
- Clear AsyncStorage: `AsyncStorage.clear()`

**API Not Responding**
- Check server is running on correct port
- Verify React Native API_BASE_URL
- Check network permissions in app.json

### Development Tips
```bash
# Check API health
curl http://localhost:3000/health

# View API logs
npm run dev

# Database logs
tail -f /usr/local/var/log/postgresql@14.log
```

## 🎯 **Next Steps**

1. **Add more features**: Categories, advanced reminders
2. **Implement offline sync**: SQLite + API synchronization  
3. **Add real-time features**: WebSocket connections
4. **Performance optimization**: Redis caching, query optimization
5. **Mobile deployment**: App store submission

---

**Your app now has a production-ready PostgreSQL backend! 🎉**

The migration from Firebase to PostgreSQL provides better performance, lower costs, and complete data control while maintaining all the features you need for a modern task management app.