# 🚀 Quick Deploy Guide - MailPulse

## Step 1: Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial MailPulse v1 implementation"
```

## Step 2: Create GitHub Repository
1. Go to [github.com](https://github.com/new)
2. Create repository named "mailpulse"
3. Don't initialize with README (we already have files)
4. Copy the repository URL

```bash
git remote add origin https://github.com/YOUR_USERNAME/mailpulse.git
git branch -M main
git push -u origin main
```

## Step 3: Setup Neon Database
1. Go to [neon.tech](https://neon.tech)
2. Sign up/login → Create Project → "MailPulse"
3. Copy connection string from dashboard
4. Run migrations:
```bash
npm run db:generate
npm run db:migrate
```

## Step 4: Setup Google OAuth
1. [Google Cloud Console](https://console.cloud.google.com)
2. Create/select project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID:
   - Type: Web application
   - Authorized origins: `http://localhost:3000`, `https://YOUR-APP.vercel.app`
   - Redirect URIs: Add `/api/auth/callback/google` to both URLs
4. Copy Client ID & Secret

## Step 5: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. "New Project" → Import from GitHub → Select "mailpulse"
3. **Environment Variables** (add these):
```
DATABASE_URL=postgresql://user:pass@host:port/db
NEXTAUTH_SECRET=run_openssl_rand_base64_32
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```
4. Click "Deploy" 🚀

## Step 6: Install Chrome Extension
1. Update `chrome-extension/src/content.js` line 148:
```javascript
const response = await fetch('https://your-app.vercel.app/api/track/send', {
```
2. Go to `chrome://extensions/`
3. Enable Developer mode → Load unpacked → Select `chrome-extension` folder

## Step 7: Test Everything
1. Visit your Vercel URL → Sign in with Google
2. Open Gmail → Compose email → Toggle "Track this email"
3. Send email → Check dashboard for tracking data
4. Open sent email → Should see Slack notification

## 🎯 You're Live!
- **App**: `https://your-app.vercel.app`
- **Dashboard**: `https://your-app.vercel.app/dashboard`
- **Extension**: Installed in Chrome

That's it! MailPulse is now deployed and ready to track emails! 📧✨