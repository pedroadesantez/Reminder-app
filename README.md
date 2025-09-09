# 📱 Planner & Reminder App

A modern, cross-platform task management and reminder application built with React Native (Expo) and Node.js with PostgreSQL backend.

## ✨ Features

### Core Functionality
- ✅ **Task Management**: Create, edit, delete, and organize tasks
- 📅 **Calendar Views**: Daily, weekly, and monthly calendar views
- 🔔 **Smart Reminders**: Push notifications with snooze and recurring options
- 🎯 **Priority System**: High, medium, and low priority tasks
- 📂 **Categories**: Organize tasks with custom categories
- 🏷️ **Tags**: Flexible tagging system for better organization

### Advanced Features
- 🎤 **Voice Input**: Voice-to-text task creation (planned)
- 🤖 **AI Scheduling**: Smart scheduling suggestions (planned)
- 📴 **Offline Support**: Local SQLite with cloud sync (planned)
- 🎮 **Gamification**: Task streaks, points, and badges
- 🔄 **Real-time Sync**: WebSocket-based real-time updates
- 🌙 **Dark Mode**: Beautiful dark/light theme switching

### UI/UX
- 🎨 **Modern Design**: Notion and Apple Calendar inspired interface
- ✨ **Smooth Animations**: Fluid transitions and micro-interactions
- 📱 **Responsive**: Optimized for all screen sizes
- ♿ **Accessible**: WCAG compliant with screen reader support

## 🏗️ Architecture

```
planner-reminder-app/
├── frontend/          # React Native (Expo) mobile app
├── backend/           # Node.js Express API server
├── docs/              # Project documentation
└── scripts/           # Development & deployment scripts
```

### Tech Stack

**Frontend (React Native)**
- Expo SDK
- Redux Toolkit for state management
- React Navigation for routing
- React Native Paper for UI components
- Expo Notifications for push notifications

**Backend (Node.js)**
- Express.js web framework
- PostgreSQL with Prisma ORM
- JWT authentication
- WebSocket support with Socket.io
- Email notifications with Nodemailer

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Expo CLI (optional, for easier development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/planner-reminder-app.git
   cd planner-reminder-app
   ```

2. **Quick setup with script**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

3. **Manual setup**
   ```bash
   # Install dependencies
   npm install
   
   # Setup frontend
   cd frontend && npm install && cd ..
   
   # Setup backend
   cd backend && npm install && npx prisma generate && cd ..
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment templates
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   
   # Update with your configuration
   ```

5. **Database Setup**
   ```bash
   # Set up PostgreSQL database
   createdb planner_db
   
   # Run migrations
   npm run db:migrate
   ```

6. **Start Development**
   ```bash
   npm run dev
   ```

## 📱 Development

### Available Scripts

**Root Scripts**
- `npm run dev` - Start both frontend and backend
- `npm run setup` - Full project setup
- `npm run build` - Build both applications
- `npm run test` - Run all tests
- `npm run lint` - Run all linting

**Frontend Scripts**
- `npm run dev:frontend` - Start React Native development server
- `npm run build:frontend` - Build for production
- `npm run test:frontend` - Run frontend tests

**Backend Scripts**
- `npm run dev:backend` - Start API server with hot reload
- `npm run build:backend` - Build backend for production
- `npm run test:backend` - Run backend tests

**Database Scripts**
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma database studio
- `npm run db:reset` - Reset database (development only)

### Project Structure

```
planner-reminder-app/
├── 📁 frontend/                    # React Native App
│   ├── 📁 src/
│   │   ├── 📁 components/          # Reusable UI components
│   │   ├── 📁 screens/             # Screen components
│   │   ├── 📁 navigation/          # Navigation configuration
│   │   ├── 📁 services/            # API services and utilities
│   │   ├── 📁 store/               # Redux store and slices
│   │   ├── 📁 themes/              # Theme configuration
│   │   └── 📁 utils/               # Helper functions
│   ├── 📁 assets/                  # Images, fonts, icons
│   └── 📄 app.json                 # Expo configuration
│
├── 📁 backend/                     # Node.js API Server
│   ├── 📁 src/
│   │   ├── 📁 controllers/         # Route handlers
│   │   ├── 📁 routes/              # API routes
│   │   ├── 📁 middleware/          # Express middleware
│   │   └── 📁 utils/               # Helper functions
│   ├── 📁 prisma/                  # Database schema
│   └── 📄 server.js                # Express server entry
│
├── 📁 docs/                        # Documentation
├── 📁 scripts/                     # Utility scripts
└── 📄 README.md                    # This file
```

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts, preferences, and stats
- **tasks**: Tasks with priorities, categories, and metadata
- **categories**: User-defined task categories
- **reminders**: Scheduled notifications
- **badges**: Achievement system (gamification)

### Key Features
- Proper foreign key relationships
- Optimized indexes for performance
- Soft deletes for data integrity
- JSON fields for flexible metadata

## 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Joi schema validation
- **CORS Protection**: Configured for security
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
GET  /api/auth/profile     # Get user profile
PUT  /api/auth/profile     # Update user profile
```

### Task Management
```
GET    /api/tasks          # List tasks (with filtering)
POST   /api/tasks          # Create task
GET    /api/tasks/:id      # Get specific task
PUT    /api/tasks/:id      # Update task
DELETE /api/tasks/:id      # Delete task
GET    /api/tasks/stats    # Task statistics
```

### Categories & Reminders
```
GET    /api/categories     # List categories
POST   /api/categories     # Create category
GET    /api/reminders      # List reminders
POST   /api/reminders      # Create reminder
```

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Backend Deployment Options
- **Railway**: `railway deploy`
- **Heroku**: `git push heroku main`
- **Vercel**: `vercel --prod`
- **DigitalOcean App Platform**

### Frontend Deployment
```bash
# Expo build
cd frontend
expo build:android
expo build:ios

# Or EAS build
eas build --platform all
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from Notion and Apple Calendar
- Icons from React Native Vector Icons
- UI components from React Native Paper
- Database ORM powered by Prisma

## 📞 Support

For support, email support@plannerapp.com or join our Discord community.

---

**Built with ❤️ using React Native, Node.js, and PostgreSQL**