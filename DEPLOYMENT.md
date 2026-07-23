# Vercel Deployment & Production Setup Guide

This guide outlines how to deploy your template to **Vercel** with full environment variables, custom domain configuration, and production security rules.

---

## 🚀 Deploying to Vercel

### Method 1: Push to GitHub & Import (Recommended)

1. Push your local project repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of minimal SaaS template"
   git branch -M main
   git remote add origin https://github.com/your-username/your-saas-repo.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** -> **Project**.
3. Select your GitHub repository and click **Import**.
4. Framework Preset will automatically detect **Next.js**.

---

## 🔑 Environment Variables Configuration

Expand the **Environment Variables** section on Vercel and add all keys from your `.env.local`:

| Name | Example / Value |
|------|-----------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-app.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `your-app` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-app.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:123456789:web:abcdef` |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |

Click **Deploy**.

---

## 🔒 Firebase Authorized Domains Checklist

After deploying to Vercel, add your Vercel URL to Firebase Authorized Domains for Authentication to work properly:

1. Copy your Vercel deployment URL (e.g. `your-app.vercel.app`).
2. Go to **Firebase Console** -> **Authentication** -> **Settings** -> **Authorized domains**.
3. Click **Add domain**.
4. Paste `your-app.vercel.app` and click **Save**.

---

## 🛠 Testing Production Build Locally

You can test the production build locally anytime before pushing:

```bash
npm run build
npm run start
```
