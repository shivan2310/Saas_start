# Firebase Setup & Configuration Guide

Follow these steps to configure Firebase Authentication and Firestore Database for this template.

---

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Click **Create a project** (or **Add project**).
3. Name your project (e.g., `my-saas-app`).
4. Disable or enable Google Analytics (optional) and click **Create project**.

---

## 2. Register Web Application

1. On the Project Overview page, click the **Web icon (`</>`)** to add an app.
2. Enter an App nickname (e.g., `SaaS Web Client`).
3. Click **Register app**.
4. Copy your `firebaseConfig` keys into your `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=my-saas-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=my-saas-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=my-saas-app.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef...
```

---

## 3. Enable Email/Password Authentication

1. In the Firebase left sidebar, click **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, select **Email/Password**.
4. Toggle **Enable** for Email/Password and click **Save**.

---

## 4. Enable Firestore Database & Apply Security Rules

1. In the left sidebar, click **Build** -> **Firestore Database**.
2. Click **Create database**.
3. Choose your database location and click **Next**.
4. Start in **Production mode**.
5. Click **Rules** tab at the top.
6. Replace the existing contents with the rules from `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
    match /todos/{todoId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

7. Click **Publish**.

---

## 5. Email Verification (Required for Production / Vercel)

Firebase sends verification emails when a user signs up. For your **deployed Vercel site** to send and handle these emails correctly:

### A. Add your Vercel domain to Authorized Domains

1. Copy your live site URL (e.g. `https://your-app.vercel.app`).
2. Go to **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**.
3. Click **Add domain** and add:
   - `your-app.vercel.app` (your Vercel production domain)
   - Any custom domain you use (e.g. `yourdomain.com`)
4. Click **Save**.

Without this step, verification emails may fail with an unauthorized domain error.

### B. Set environment variables on Vercel

In **Vercel** → your project → **Settings** → **Environment Variables**, add all Firebase keys from `.env.example`, including:

```env
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Redeploy after adding or changing environment variables.

### C. Check your inbox

- Verification emails come from `noreply@YOUR_PROJECT_ID.firebaseapp.com`.
- Check **Spam**, **Promotions**, and **Junk** folders.
- Use **Resend Email** on the dashboard if needed.

### D. Customize the email template (optional)

1. Go to **Authentication** → **Templates** → **Email address verification**.
2. Confirm the template is enabled and the sender name looks correct.

---
