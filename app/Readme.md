# Vicinity

A web app for finding and supporting local businesses in your area. Businesses can list themselves, post deals, and manage reviews. Users can search, save favorites, leave reviews, and message business owners.

## What It Does

Built with Next.js 14, TypeScript, React, Tailwind CSS, and Supabase. Two main user types: community members who browse and review businesses, and business owners who manage their profiles, deals, and customer conversations.

## Features

- Search & browse local businesses with filters and sorting
- AI-powered semantic search (search by mood, taste, cuisine — not just keywords)
- Save favorite businesses to your profile
- Leave reviews and ratings (1–5 stars)
- Edit and delete your own reviews
- View and copy promo codes and deals from businesses
- Upload photos for your business and create a gallery
- Business owners can manage profile info, hours, contact details
- AI-generated business descriptions
- AI-powered review sentiment analysis
- Real-time messaging between users and business owners
- Real-time updates when reviews or deals change
- AI chat assistant for platform help
- Dark/light mode toggle
- Fully responsive — works on phone, tablet, desktop

## Source Code

The code is organized with Next.js 14 App Router. React components handle the UI and manage data using hooks. TypeScript is used throughout for type safety.

Pages are in the `app/` folder. Business owners manage their profile on `/business/profile`, users view their dashboard on `/user/dashboard`. API routes in `/api/` handle backend logic like AI search, review analysis, chat, and reCAPTCHA verification.

React hooks power the functionality. `useState` manages form data and UI state. `useEffect` fetches data from Supabase and listens for real-time changes. When someone posts a review, a `useEffect` hook detects the change and updates the page instantly. `useMemo` caches computed data to avoid unnecessary recalculations.

Components are reusable pieces of UI — `BusinessCard` displays business info, `Navbar` is the header, `BusinessLayout` wraps all business dashboard pages with a sidebar. They receive data as props and re-render when that data changes.

Authentication uses `AuthContext` — a React Context that stores the logged-in user info and makes it available to all pages without prop drilling.

Theme management uses `ThemeContext` — persists the user's dark/light preference to localStorage and syncs the `dark` class on the HTML root element.

Real-time updates use Supabase subscriptions. When a review is posted, Supabase sends an event, the `useEffect` listens for it, and React updates the page.

Images get uploaded to Supabase Storage. The URLs are stored in the database as arrays so one business can have multiple photos.

## Tech Stack

- Next.js 14 (React framework, App Router)
- TypeScript
- React 18 (with hooks)
- Tailwind CSS (styling)
- Framer Motion (animations)
- Supabase (database, auth, storage, real-time subscriptions)
- Groq AI (semantic search, chat, descriptions, review analysis)
- Google reCAPTCHA v3 (bot protection)
- Recharts (dashboard charts)

## File Structure

```
app/
├── api/                    # Backend API routes
│   ├── ai-search/          # AI-powered business search
│   ├── analyze-reviews/    # Review sentiment analysis
│   ├── chat/               # AI chatbot endpoint
│   ├── generate-description/ # AI business description generator
│   └── verify-recaptcha/   # reCAPTCHA token verification
├── auth/callback/          # Post-login redirect handler
├── browse/                 # Public browse page (unauthenticated)
├── business/               # Business owner pages
│   ├── [id]/               # Public business detail page
│   ├── dashboard/          # Metrics and overview
│   ├── deals/              # Deal management
│   ├── messages/           # Customer conversations
│   ├── profile/            # Profile editor
│   ├── reviews/            # Review dashboard with AI analysis
│   └── settings/           # Account settings
├── user/                   # Community user pages
│   ├── dashboard/          # Browse with filters and favorites
│   ├── messages/           # Messaging with businesses
│   ├── profile/            # User profile and stats
│   ├── reviews/            # User's reviews with edit/delete
│   └── saved/              # Saved businesses
├── login/
├── signup/
├── forgot-password/
├── layout.tsx              # Root layout (providers, global styles)
└── page.tsx                # Landing page

components/                 # Reusable React components
├── ui/                     # Visual effects (beams, fog)
├── AIChat.tsx              # Floating AI chat widget
├── AISearchBar.tsx         # AI search input with loading state
├── BusinessCard.tsx        # Business listing card
├── BusinessLayout.tsx      # Business dashboard layout + sidebar
├── DescriptionGenerator.tsx # AI description editor
├── ReviewAnalysis.tsx      # AI review insights display
└── ...                     # Navbars, footer, logo, theme toggle

context/                    # React context providers
├── AuthContext.tsx          # Authentication state and methods
└── ThemeContext.tsx         # Dark/light theme state

lib/                        # Shared utilities
├── auth.ts                 # Supabase auth helpers
├── supabase.ts             # Supabase client factory
├── ui.ts                   # UI constants (nav items, footer links)
├── userAccountUtils.ts     # User CRUD, reviews, favorites, messaging helpers
└── utils.ts                # General utilities (cn class merger)

styles/
└── globals.css             # Global styles, CSS variables, animations
```

## Database

Tables: businesses, reviews, favorites, deals, conversations, messages

- `businesses` stores name, description, address, city, state, zip, phone, email, website, cover image, gallery (array), tags (array), hours (JSON), rating, review count.
- `reviews` stores rating (1–5), comment, user, business, and timestamp.
- `favorites` links users to their saved businesses.
- `deals` stores promo codes, discount type, discount amount, expiration date, active status.
- `conversations` links users and businesses for messaging threads.
- `messages` stores individual messages within conversation threads.

User authentication is handled by Supabase Auth. User type (`community` or `business`) is stored in `user_metadata`.

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## Deployment

```bash
npm install
npm run build
npm start
```

Deploy to Vercel or your own server.