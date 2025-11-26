# PollSync Deployment Guide

## ✅ Build Verification

The project has been tested and verified to build successfully with both npm and yarn.

### Client Build Status
```bash
✓ Compiled successfully
✓ TypeScript check passed
✓ Static pages generated
✓ Production build ready
```

## 🚀 Quick Start

### Development
```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm run dev
```

### Production Build
```bash
# Frontend
cd client
npm run build
npm start

# Or with yarn
yarn build
yarn start
```

## 📦 Deployment Options

### 1. Vercel (Recommended for Frontend)

**Setup:**
1. Push code to GitHub
2. Import project in Vercel
3. Set root directory to `client`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-api-url.com/api
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```
5. Deploy!

**Build Command:** `npm run build`
**Output Directory:** `.next`
**Install Command:** `npm install`

### 2. Railway/Render (Backend)

**Setup:**
1. Create new service
2. Connect GitHub repository
3. Set root directory to `server`
4. Add environment variables from `.env.example`
5. Deploy!

**Build Command:** `npm install`
**Start Command:** `npm start`
**Port:** 5000 (or Railway/Render assigned port)

### 3. DigitalOcean App Platform

**Frontend:**
- Type: Static Site
- Build Command: `cd client && npm install && npm run build`
- Output Directory: `client/.next`

**Backend:**
- Type: Web Service
- Build Command: `cd server && npm install`
- Run Command: `cd server && npm start`

### 4. Docker Deployment

**Frontend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

**Backend Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm install
COPY server/ ./
EXPOSE 5000
CMD ["npm", "start"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000/api
    depends_on:
      - backend

  mongodb:
    image: mongo:5
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## 🔧 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pollsync
JWT_SECRET=your_super_secret_jwt_key_here
KOPOKOPO_CLIENT_ID=your_kopokopo_client_id
KOPOKOPO_CLIENT_SECRET=your_kopokopo_client_secret
KOPOKOPO_API_KEY=your_kopokopo_api_key
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-16-character-app-password
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

## 📋 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] MongoDB Atlas cluster created and accessible
- [ ] Gmail App Password generated
- [ ] Kopokopo API credentials obtained
- [ ] Google OAuth credentials configured
- [ ] Build tested locally (`npm run build`)
- [ ] CORS configured for production domain
- [ ] Image upload paths configured
- [ ] Socket.io URL updated for production

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB connection uses authentication
- [ ] API endpoints use HTTPS
- [ ] CORS restricted to specific domains
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] File upload size limits set
- [ ] Environment variables not committed to Git

## 🚨 Common Issues & Solutions

### Build Fails
```bash
# Clean cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### TypeScript Errors
- Check all interface definitions match actual data
- Ensure all optional properties are marked with `?`
- Run `npm run build` to catch errors before deployment

### Socket.io Connection Issues
- Update `NEXT_PUBLIC_API_URL` to production URL
- Ensure WebSocket connections allowed by hosting provider
- Check CORS configuration includes Socket.io

### Image Upload Issues
- Verify `uploads/` directory exists and is writable
- Check file size limits in hosting provider
- Ensure proper image paths in production

## 📊 Performance Optimization

### Frontend
- Images optimized with Next.js Image component
- Code splitting enabled
- Static pages pre-rendered
- Compression enabled

### Backend
- MongoDB indexes on frequently queried fields
- Connection pooling enabled
- Response compression with gzip
- Rate limiting to prevent abuse

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: backend
```

## 📱 Post-Deployment

1. **Test all features:**
   - User registration/login
   - Election creation
   - Voting functionality
   - Payment processing
   - Email notifications
   - Real-time updates

2. **Monitor:**
   - Server logs
   - Error tracking (Sentry recommended)
   - Performance metrics
   - Database queries

3. **Backup:**
   - Regular MongoDB backups
   - Environment variables backup
   - Code repository backup

## 🆘 Support

For deployment issues:
- Check logs in hosting provider dashboard
- Review environment variables
- Test API endpoints with Postman
- Check MongoDB connection
- Verify CORS settings

---

**Ready to Deploy!** 🚀

Your PollSync application is production-ready and can be deployed to any modern hosting platform.
