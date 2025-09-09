# Planner & Reminder App Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- Firebase account

### Installation

1. **Install Dependencies**
   ```bash
   cd planner-reminder-app
   npm install
   ```

2. **Firebase Setup**
   - Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication (Email/Password, Google)
   - Create Firestore database
   - Enable Cloud Messaging
   - Get your Firebase config and update `src/services/firebase.js`

3. **Start Development Server**
   ```bash
   npm start
   ```

## 🔧 Firebase Configuration

Replace the config in `src/services/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
  measurementId: "your-measurement-id"
};
```

## 📱 Features Implemented

### ✅ Phase 1 (Complete)
- React Native + Expo project setup
- Firebase integration (Auth, Firestore, Notifications)
- Redux state management
- Theme system with dark/light mode
- Bottom tab navigation
- Authentication screens (Login/Register)
- Task management CRUD operations
- Task filtering and sorting
- Beautiful UI components

### 🚧 Phase 2 (In Progress)
- Calendar views (daily, weekly, monthly)
- Advanced notification system
- Voice input integration
- Offline support

### 📋 Planned Features
- AI-powered smart scheduling
- Gamification (streaks, badges)
- Advanced reminders with snooze
- Recurring tasks
- Data sync across devices
- Analytics and insights

## 🎨 Design System

The app features a modern, clean design inspired by Notion and Apple Calendar:
- Glassmorphism effects
- Smooth animations
- Consistent spacing and typography
- Accessible color schemes
- Dark/Light mode support

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Shared components
│   ├── tasks/          # Task-related components
│   ├── calendar/       # Calendar components
│   └── reminders/      # Reminder components
├── screens/            # App screens
│   ├── auth/          # Authentication screens
│   └── main/          # Main app screens
├── navigation/         # Navigation configuration
├── services/          # External services (Firebase, etc.)
├── store/             # Redux store and slices
├── themes/            # Theme configuration
├── utils/             # Helper functions
└── hooks/             # Custom React hooks
```

## 🚀 Running the App

### Development
```bash
npm start                    # Start Metro bundler
npm run android             # Run on Android
npm run ios                 # Run on iOS
npm run web                 # Run on web
```

### Building for Production
```bash
eas build --platform android
eas build --platform ios
```

## 🎯 Next Steps

1. Complete calendar implementation
2. Add advanced notification features
3. Implement voice commands
4. Add offline capabilities
5. Deploy to app stores

## 📞 Support

For questions or issues, please check the documentation or create an issue in the project repository.

---

**Built with ❤️ using React Native & Firebase**