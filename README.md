# Library App

A demo library management system built with React + TypeScript + Firebase.

## What This Project Does
This app provides two separate experiences:
- User portal: browse books, view details, request borrows, and see recommendations.
- Admin portal: manage books, categories, borrow requests, and users.


## Main Features
- Authentication with role-based access (`admin` / `user`)
- Browse and search books by title, author, tags, and category
- Book details + borrow request flow
- Borrow request lifecycle (pending, approved, rejected, returned)
- Admin book management (create, edit, delete)
- Admin category management
- Admin user management:
  - Set user as admin/user
  - Enable/disable user
  - Expire/clear expiry
  - Trigger password reset email
- AI features with Gemini:
  - Generate book descriptions
  - Recommend similar books from catalog candidates

## Brief Architecture
- Frontend: React + TypeScript + Vite
- UI: component-based pages/layouts for Admin and User dashboards
- Data layer: Firebase Firestore collections (`users`, `books`, `categories`, `borrowRequests`)
- Auth: Firebase Authentication + Firestore profile/role resolution
- AI integration: Gemini SDK used in `src/lib/ai/*` and exposed via `src/lib/functions.ts`

### High-Level Flow
1. User logs in via Firebase Auth.
2. Role is resolved from Firestore and routed to Admin or User area.
3. UI pages read/write Firestore directly for core library operations.
4. AI utilities call Gemini for description generation and recommendations.

## Important Security Note (Gemini Key)
For fast demo deployment, Gemini API is currently called directly from the UI.
This means the API key is present in frontend runtime environment variables.

Planned production approach:
- Move AI calls to a backend service (NestJS).
- Keep API keys server-side only.
- Expose secured backend endpoints to the frontend.
- Deploy backend + frontend separately to protect credentials and improve control/observability.

## Tech Stack
- React 19
- TypeScript
- Vite
- Firebase Auth
- Firestore
- Gemini (`@google/generative-ai`)
- Tailwind + shadcn/ui components

## Run Locally
```bash
npm install
npm run dev
```

Required env vars in `.env.local`:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_GEMINI_API_KEY`
