# Daybook

Daybook is a private personal organizer for keeping your to-dos, expenses, important dates, and diary entries together. It is built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Firebase (Auth & Firestore)**.

---

## 🌟 Key Features

- **Pure Black & White Minimalist UI**: High-contrast, clean typography (Inter font), 8px border radii, zero unnecessary gradients or colorful clutter.
- **Firebase Authentication**: Email + password login, registration, logout, session persistence, protected route guards, email verification, and password reset.
- **Firestore Database Integration**: User profile sync in Firestore `users` collection (`uid`, `displayName`, `email`, `role`, `createdAt`, `updatedAt`).
- **Form Validation**: Powered by `React Hook Form` and `Zod` schemas with instant client/server validation errors.
- **Production Security**: Next.js middleware with security headers (`CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`), safe environment setup, and Firestore security rules.
- **Type Safety Everywhere**: 100% strict TypeScript without any `any` types.
- **SEO Ready**: Configured `robots.ts`, `sitemap.ts`, OpenGraph, and Twitter Card metadata tags.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+
- **npm**: v9+

### 2. Environment Setup
Clone or copy this repository, then create `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Firebase credentials in `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Documentation Links

- [Architecture & Project Structure](./ARCHITECTURE.md)
- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Deployment & Vercel Guide](./DEPLOYMENT.md)

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org)
- **Language**: [TypeScript](https://www.typescriptlang.org)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Auth & DB**: [Firebase SDK v10](https://firebase.google.com)
- **Validation**: [Zod](https://zod.dev) & [React Hook Form](https://react-hook-form.com)
- **Deployment**: [Vercel](https://vercel.com)
