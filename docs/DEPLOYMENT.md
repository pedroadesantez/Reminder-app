# 🚀 Deployment Guide

## Production Deployment Options

### Backend Deployment

#### Railway (Recommended)
Fast, simple deployment with automatic PostgreSQL database.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Add PostgreSQL database
railway add postgresql

# Deploy
railway deploy

# Set environment variables
railway variables set JWT_SECRET="your-production-jwt-secret"
railway variables set NODE_ENV="production"
```

**Benefits:**
- Automatic SSL certificates
- Built-in PostgreSQL database
- Git-based deployments
- Reasonable pricing ($5/month)

#### Heroku
Traditional Platform-as-a-Service option.

```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create app
heroku create planner-reminder-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET="your-production-jwt-secret"
heroku config:set NODE_ENV="production"

# Deploy
git push heroku main

# Run database migrations
heroku run npm run db:migrate
```

#### Vercel
Serverless deployment option.

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
# Add PostgreSQL database (external service required)
```

#### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Run Command**: `npm start`
3. Add PostgreSQL managed database
4. Set environment variables
5. Deploy

### Frontend Deployment

#### Expo Application Services (EAS)
Modern Expo build service (recommended).

```bash
# Install EAS CLI
npm install -g @expo/cli

# Configure EAS
cd frontend
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both
eas build --platform all

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

#### Classic Expo Build (Legacy)

```bash
cd frontend

# Build for Android
expo build:android

# Build for iOS
expo build:ios

# Build for web
expo build:web
```

#### React Native CLI Build

If you've ejected from Expo:

```bash
cd frontend

# Android
cd android
./gradlew assembleRelease

# iOS
cd ios
xcodebuild -workspace MyApp.xcworkspace -scheme MyApp archive
```

## Environment Configuration

### Production Environment Variables

Create production environment files:

**Backend (.env.production)**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://user:pass@host:5432/db"
JWT_SECRET="very-long-and-secure-production-secret"
CORS_ORIGIN="https://your-app-domain.com"
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Email configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=error
```

**Frontend (.env.production)**
```env
API_BASE_URL=https://your-api-domain.com/api
WEBSOCKET_URL=wss://your-api-domain.com
ENABLE_ANALYTICS=true
ENABLE_CRASH_REPORTING=true
```

### Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret
2. **Database**: Use SSL connections in production
3. **CORS**: Restrict to your actual domains
4. **Rate Limiting**: Adjust limits for production traffic
5. **Logging**: Use structured logging and monitoring

## Database Setup

### PostgreSQL Cloud Providers

#### Supabase (Recommended)
- Generous free tier
- Built-in real-time features
- Automatic backups

```bash
# Get connection string from Supabase dashboard
DATABASE_URL="postgresql://user:pass@db.supabase.co:5432/postgres"
```

#### PlanetScale
- MySQL-compatible PostgreSQL
- Branching for schema changes
- Excellent developer experience

#### Neon
- Serverless PostgreSQL
- Auto-scaling
- Built-in connection pooling

#### AWS RDS
- Fully managed PostgreSQL
- High availability options
- Advanced monitoring

### Database Migrations

```bash
# Production migration
npm run db:migrate

# Backup before migration
pg_dump $DATABASE_URL > backup.sql

# Restore if needed
psql $DATABASE_URL < backup.sql
```

## Performance Optimization

### Backend Optimizations

1. **Connection Pooling**
   ```javascript
   // prisma/schema.prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
     connection_limit = 20
   }
   ```

2. **Caching with Redis**
   ```bash
   # Add Redis to your deployment
   npm install redis
   ```

3. **Compression**
   ```javascript
   const compression = require('compression');
   app.use(compression());
   ```

### Frontend Optimizations

1. **Bundle Splitting**
   ```javascript
   // metro.config.js
   const { getDefaultConfig } = require('expo/metro-config');
   const config = getDefaultConfig(__dirname);
   config.resolver.assetExts.push('db');
   module.exports = config;
   ```

2. **Image Optimization**
   ```javascript
   // Use optimized image formats
   import { Image } from 'expo-image';
   ```

## Monitoring & Analytics

### Error Tracking

#### Sentry Integration

**Backend:**
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

**Frontend:**
```javascript
import * as Sentry from "sentry-expo";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
```

### Application Monitoring

1. **Uptime Monitoring**: UptimeRobot, Pingdom
2. **Performance**: New Relic, DataDog
3. **Analytics**: Google Analytics, Mixpanel
4. **Crash Reporting**: Sentry, Bugsnag

## SSL/TLS Configuration

### Automatic SSL (Recommended)
- Railway: Automatic SSL
- Vercel: Automatic SSL
- Heroku: Automatic SSL

### Manual SSL with Let's Encrypt
```bash
# Install Certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d your-api-domain.com

# Update Nginx configuration
server {
    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/your-domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain/privkey.pem;
}
```

## CI/CD Pipeline

### GitHub Actions Example

**.github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      - name: Run tests
        run: |
          cd backend
          npm test
      - name: Deploy to Railway
        run: railway deploy
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Setup Expo
        uses: expo/expo-github-action@v7
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Build and Submit
        run: |
          cd frontend
          eas build --platform all --non-interactive
```

## Backup Strategy

### Database Backups

```bash
# Automated daily backups
crontab -e
0 2 * * * pg_dump $DATABASE_URL > /backups/db-$(date +%Y%m%d).sql

# AWS S3 backup
aws s3 cp /backups/db-$(date +%Y%m%d).sql s3://your-backup-bucket/
```

### File Backups

```bash
# Application files
tar -czf app-backup-$(date +%Y%m%d).tar.gz /path/to/app

# Upload to cloud storage
aws s3 cp app-backup-$(date +%Y%m%d).tar.gz s3://your-backup-bucket/
```

## Health Checks

### API Health Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected' // Check DB connection
  });
});
```

### Monitoring Setup
```bash
# Set up monitoring alerts
curl -X POST "your-monitoring-service/alerts" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-api.com/health",
    "interval": 300,
    "timeout": 10
  }'
```

## Troubleshooting Common Issues

### Database Connection Issues
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1;"

# Check connection limits
psql $DATABASE_URL -c "SELECT count(*) FROM pg_stat_activity;"
```

### Memory Issues
```javascript
// Monitor memory usage
console.log('Memory usage:', process.memoryUsage());

// Increase Node.js memory limit
node --max-old-space-size=4096 server.js
```

### SSL Certificate Issues
```bash
# Test SSL certificate
openssl s_client -connect your-domain.com:443

# Check certificate expiration
openssl x509 -in certificate.crt -text -noout | grep "Not After"
```