# Architecture & Project Structure

## 📂 Folder Overview

```
.
├── app/                        # Next.js App Router routes & layouts
│   ├── api/                    # Server API endpoints
│   │   ├── health/             # System health check
│   │   └── user/               # User API endpoint
│   ├── dashboard/              # Protected application dashboard
│   │   ├── settings/           # User profile & security settings
│   │   ├── layout.tsx          # Session guard layout
│   │   └── page.tsx            # Dashboard overview
│   ├── forgot-password/        # Password reset flow
│   ├── login/                  # User login flow
│   ├── signup/                 # Registration flow
│   ├── error.tsx               # Root error boundary
│   ├── globals.css             # Design tokens & resets
│   ├── layout.tsx              # Root HTML & Providers layout
│   ├── loading.tsx             # Root loading indicator
│   ├── not-found.tsx           # 404 page
│   ├── page.tsx                # Public landing page
│   ├── robots.ts               # SEO robots configuration
│   └── sitemap.ts              # SEO sitemap generation
├── components/                 # UI Component Library
│   ├── dashboard/              # Dashboard specific widgets (Sidebar, TopNavbar)
│   ├── landing/                # Public landing page sections (Hero, Features, CTA)
│   ├── layout/                 # Main site layout (Navbar, Footer)
│   ├── ui/                     # Primitives (Button, Input, Card, Modal, Toast, Spinner, Skeleton)
│   └── ErrorBoundary.tsx       # Client error catch boundary
├── context/                    # React Contexts (AuthContext)
├── firebase/                   # Firebase configuration (Client & Security rules)
├── hooks/                      # Custom hooks (useAuth)
├── lib/                        # Utilities & Zod validation schemas
│   ├── validations/            # Zod form schemas
│   └── utils.ts                # Class merging & date formatting
├── services/                   # Decoupled business logic & DB services (authService, userService)
├── types/                      # TypeScript definitions
├── middleware.ts               # Security headers & HTTP request guard
├── firestore.rules             # Production security rules for Firestore
├── tailwind.config.ts          # Pure black & white theme tokens
└── tsconfig.json               # Strict compiler options & path aliases (@/*)
```

---

## 🎨 Design System & Philosophy

- **Pure Minimalism**: `#FFFFFF` background, `#F8F8F8` surface card background, `#000000` text & accents, `#E5E5E5` borders.
- **No Gradients / Colorful Decor**: High-contrast typography hierarchy using Inter font.
- **8px Border Radius**: Consistent `rounded` corner radius across buttons, inputs, modals, and cards.

---

## ⚡ State Management Strategy

To avoid redundant third-party state managers (like Redux or Zustand) for a clean SaaS foundation:
1. **React Context (`AuthContext`)**: Handles global user session persistence and Firestore profile state.
2. **React Hook Form**: Handles form input states locally without re-rendering parent components.
3. **Local Component State (`useState`)**: Used for transient UI toggles (e.g., mobile drawer, modal visibility).
