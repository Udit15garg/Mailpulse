# MailPulse Deployment Guide

## 🚀 Deploy to Vercel + Neon Database

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Neon account (free tier works)
- Google Cloud Console project for OAuth

---

## 1. Database Setup (Neon)

### Create Neon Database
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create new project: "MailPulse"
3. Copy the connection string from dashboard
4. Format: `postgresql://username:password@hostname:port/database`

### Generate Database Schema
```bash
# Install dependencies
npm install

# Generate migration files
npm run db:generate

# Apply migrations to Neon
npm run db:migrate
```

---

## 2. Google OAuth Setup

### Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Authorized JavaScript origins:
   - `http://localhost:3000` (development)
   - `https://your-app-name.vercel.app` (production)
7. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://your-app-name.vercel.app/api/auth/callback/google`
8. Copy **Client ID** and **Client Secret**

---

## 3. Slack Integration (Optional)

### Create Slack Webhook
1. Go to your Slack workspace
2. Navigate to **Apps** → **Incoming Webhooks**
3. Create new webhook for desired channel
4. Copy webhook URL (starts with `https://hooks.slack.com/services/`)

---

## 4. Vercel Deployment

### Method 1: GitHub Integration (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial MailPulse deployment"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the mailpulse project

3. **Environment Variables:**
   Add these in Vercel dashboard under **Settings** → **Environment Variables**:

   ```
   DATABASE_URL=postgresql://username:password@hostname:port/database
   NEXTAUTH_SECRET=your-random-secret-string-32-chars-min
   NEXTAUTH_URL=https://your-app-name.vercel.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
   ```

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically build and deploy

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add SLACK_WEBHOOK_URL

# Redeploy with env vars
vercel --prod
```

---

## 5. Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Random secret for JWT signing | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app's base URL | `https://mailpulse.vercel.app` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | `123456789-abc.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | `GOCSPX-abcdefghijklmnop` |
| `SLACK_WEBHOOK_URL` | Slack incoming webhook URL | `https://hooks.slack.com/services/...` |

---

## 6. Chrome Extension Setup

### Update Extension for Production
1. Open `chrome-extension/src/content.js`
2. Update line 148 to use your Vercel URL:
   ```javascript
   const response = await fetch('https://your-app-name.vercel.app/api/track/send', {
   ```

### Install Extension
1. Go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the `chrome-extension` folder
5. Extension should appear in Chrome toolbar

---

## 7. Verification Steps

### Test the Application
1. **Visit your Vercel URL**
2. **Sign in with Google**
3. **Go to Dashboard** - should load without errors
4. **Open Gmail** - extension toggle should appear in compose
5. **Send tracked email** - should create entry in dashboard
6. **Open the email** - should trigger Slack notification

### Check Logs
- **Vercel Functions:** Go to Vercel dashboard → Functions tab
- **Database:** Use Neon dashboard query editor
- **Chrome Extension:** Open Developer Tools → Console

---

## 8. Production Checklist

- [ ] Neon database created and migrated
- [ ] Google OAuth configured with production URLs
- [ ] All environment variables set in Vercel
- [ ] Chrome extension updated with production API URL
- [ ] Slack webhook tested
- [ ] Application deployed and accessible
- [ ] Gmail integration working
- [ ] Email tracking functional
- [ ] Dashboard displaying data correctly

---

## 🎯 Your URLs

After deployment, you'll have:
- **App URL:** `https://your-app-name.vercel.app`
- **Dashboard:** `https://your-app-name.vercel.app/dashboard`
- **Pixel API:** `https://your-app-name.vercel.app/api/p/[token].gif`

---

## Troubleshooting

### Common Issues
1. **Database connection fails:** Check DATABASE_URL format
2. **OAuth redirect mismatch:** Verify Google Console redirect URIs
3. **Extension not working:** Check API URL in content.js
4. **Slack not sending:** Verify webhook URL format

### Environment Variable Generation
```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Ready to deploy! 🚀