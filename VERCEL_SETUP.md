# Vercel Deployment Setup for PollSync

## Environment Variables Required

### For the Client (Vercel)

Set these environment variables in your Vercel project settings:

1. **NEXT_PUBLIC_API_URL**
   - Value: `https://your-railway-backend-url.railway.app/api`
   - Example: `https://pollsync-production.up.railway.app/api`
   - This tells the frontend where to find the backend API

2. **NEXT_PUBLIC_GOOGLE_CLIENT_ID**
   - Value: Your Google OAuth Client ID
   - Current: `954429684706-ikbobiphrab2833c9k1ghpa74ov089us.apps.googleusercontent.com`

### How to Set Environment Variables in Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings"
3. Click on "Environment Variables"
4. Add each variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: Your Railway backend URL + `/api`
   - Environment: Production, Preview, Development (select all)
5. Click "Save"
6. Redeploy your application

### For the Backend (Railway)

Your Railway backend should have these environment variables set:

1. **MONGODB_URI** - Your MongoDB connection string
2. **JWT_SECRET** - Secret key for JWT tokens
3. **FRONTEND_URL** - Your Vercel frontend URL (e.g., `https://pollsync.vercel.app`)
4. **ALLOWED_ORIGINS** - Comma-separated list of allowed origins (optional, for multiple domains)
   - Example: `https://pollsync.vercel.app,https://pollsync-preview.vercel.app`
5. **KOPOKOPO_CLIENT_ID** - Kopokopo API client ID
6. **KOPOKOPO_CLIENT_SECRET** - Kopokopo API client secret
7. **KOPOKOPO_API_KEY** - Kopokopo API key
8. **KOPOKOPO_TILL_NUMBER** - Your M-Pesa till number
9. **KOPOKOPO_CALLBACK_URL** - Your Railway backend URL + `/api/payment/callback`
10. **EMAIL_USER** - Gmail address for sending emails
11. **EMAIL_APP_PASSWORD** - Gmail app password
12. **PORT** - 5000 (or Railway's default)
13. **NODE_ENV** - production

## Troubleshooting Pricing Page

If the pricing page shows "Unable to load pricing plans":

1. **Check API URL**
   - Open browser console (F12)
   - Look for the log: "🔍 Fetching pricing from: [URL]"
   - Verify the URL is correct

2. **Check CORS**
   - The backend must allow requests from your Vercel domain
   - Check `server/index.js` CORS configuration

3. **Check Backend Health**
   - Visit: `https://your-railway-url.railway.app/api/health`
   - Should return: `{"status":"ok"}`

4. **Check Pricing Endpoint**
   - Visit: `https://your-railway-url.railway.app/api/pricing`
   - Should return JSON with pricing plans

5. **Initialize Pricing Plans**
   - SSH into Railway or run locally:
   ```bash
   cd server
   node init-pricing.js
   ```

## Testing Locally

1. Start backend:
   ```bash
   cd server
   npm start
   ```

2. Start frontend:
   ```bash
   cd client
   npm run dev
   ```

3. Visit: `http://localhost:3000/pricing`

## Production URLs

- **Frontend (Vercel)**: https://pollsync.vercel.app (or your custom domain)
- **Backend (Railway)**: https://your-app.up.railway.app
- **API Base**: https://your-app.up.railway.app/api

## Quick Fix Checklist

- [ ] Backend is deployed and running on Railway
- [ ] MongoDB is connected and has pricing plans
- [ ] NEXT_PUBLIC_API_URL is set in Vercel
- [ ] CORS allows Vercel domain in backend
- [ ] Backend /api/pricing endpoint returns data
- [ ] Vercel project is redeployed after env var changes
