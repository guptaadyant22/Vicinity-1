# Vicinity

A web app for finding and supporting local businesses in your area. Businesses can list themselves, post deals, and manage reviews. Users can search, save favorites, leave reviews, and message business owners.

## What It Does

Built with Next.js 14, TypeScript, React, Tailwind CSS, and Supabase. Two main user types: community members who browse and review businesses, and business owners who manage their profiles, deals, and customer conversations.

## Features

- Search & Browse: Local businesses directory with dynamic category/type filtering, sorting, and location-aware views.
- AI Semantic Search: Search by mood, taste, or specific needs (e.g., "quiet study spot with good matcha") using Groq AI.
- AI Recommendation Engine ("For You"): Custom recommendation generator that uses Groq to analyze the user's saved businesses and recommend similar nearby options.
- AI Business Advisor Panel: Generates business health scores, performance summaries, and lists prioritized action plans based on profile status, customer reviews, and deals performance.
- AI Review Sentiment Analysis & Streaming Summaries: Sentiment analysis of customer feedback on business dashboards. Streaming AI summaries (via Server-Sent Events/SSE) that outline customer favorites and repeating pain points in 2-3 sentences.
- Comprehensive Accessibility Suite: ADHD Friendly Mode (focus mask overlays that track vertical mouse movements), font scaling (100% - 200%) and text bolding, line height and letter spacing adjustments, OpenDyslexic font family integration, link and title highlighting, visual color filters (Monochrome, Low/High Saturation, High/Light/Dark Contrast), high-visibility oversized cursor, reading Guide Overlay (yellow guide bar that follows the cursor).
- Business Performance PDF Reports: Client-side generation of detailed PDF business reports that can be directly emailed to owners using SMTP.
- Real-Time Customer Messaging: Interactive chat channels between business owners and community members.
- Deals & Promo Codes: Manage promotional offers, track engagement click counts, and see analytics.
- Reviews & Ratings: Detailed 1-5 star review system where community users can write, edit, and delete their opinions.
- AI Description Generator: Autogenerates compelling, custom business profiles based on category and tags.
- Security & Bot Protection: Google reCAPTCHA v3 verification during signup flows.
- Dark/Light Mode: Full theme customization persisted across sessions.

## Technical Stack & Public Libraries Used

Core Framework & Build Tools:
- Next.js 14 (next): React-based meta-framework using the App Router architecture and server-side functions.
- React 18 (react / react-dom): Rendering engine utilizing hook-based state management.
- TypeScript (typescript): Strong, compile-time type-safety.

Database, Authentication & Real-Time Sync:
- Supabase (@supabase/supabase-js & @supabase/ssr):
  Database: PostgreSQL data persistence for businesses, reviews, deals, and conversations.
  Auth: Email/password authentication and Google OAuth sign-in flow.
  Storage: Cover photo and business gallery image bucket storage.
  Real-Time: Supabase database replication listener channels for live UI updates (messaging, reviews).

Artificial Intelligence (AI):
- Groq Cloud API & SDK (groq-sdk): Ultra-fast inference engine running Llama-based models: llama-3.1-8b-instant for general recommendations and chatbot responses, and meta-llama/llama-4-scout-17b-16e-instruct for structured JSON data and streaming review summaries.

Animations & Graphics:
- Framer Motion (framer-motion): Fluid UI transitions, micro-interactions, and motion layout configurations.
- GreenSock Animation Platform (gsap): High-performance, timeline-based UI animations.
- Three.js (three): WebGL 3D element rendering.
- OGL (ogl): Ultra-lightweight WebGL graphics library for advanced canvas effect layers.
- Lottie (lottie-react & @lottiefiles/dotlottie-react): Renders lightweight, vector-based interactive illustrations.

Data Visualization & Utilities:
- Recharts (recharts): Composable, React-native SVG charts displaying business owner dashboard metrics.
- jsPDF (jspdf): Client-side PDF generation package used to compile business data reports.
- Nodemailer (nodemailer): Node.js email agent implementing Gmail SMTP to send generated PDF reports directly.
- Google reCAPTCHA v3: Client-side/API verification to prevent automated bot signups.

UI Components & Styling:
- Tailwind CSS (tailwindcss): Utility-first CSS styling.
- Radix UI (radix-ui): Headless, accessible visual primitives.
- shadcn/ui (shadcn): Reusable modular styling system combining Radix and Tailwind.
- Styling Helpers: clsx (Utility for constructing classnames conditionally), tailwind-merge (Resolves Tailwind CSS class conflicts merge-wise), class-variance-authority (Standardizes component variants styling).
- Icon Libraries: lucide-react, @hugeicons/react & @hugeicons/core-free-icons, react-icons, @heroicons/react.

## File Structure

```
app/
├── api/                       # Next.js API route endpoints
│   ├── ai-search/             # Semantic AI business search
│   ├── analyze-reviews/       # sentiment analysis API
│   ├── business-insights/     # AI advisor generator
│   ├── chat/                  # AI assistant chatbot endpoint
│   ├── for-you/               # Personalization recommendation engine
│   ├── generate-description/  # AI business bio description writer
│   ├── reviews-summary/       # Streaming AI reviews aggregator (SSE)
│   ├── send-report-email/     # SMTP Gmail Nodemailer report dispatcher
│   ├── user-names/            # Map IDs to profile display names
│   └── verify-recaptcha/      # reCAPTCHA bot-protection check
├── auth/callback/             # Post-auth token catcher
├── browse/                    # Unauthenticated listing lookup
├── business/                  # Business dashboard views
│   ├── [id]/                  # Public profile page details
│   ├── dashboard/             # Stats review & overview graphs
│   ├── deals/                 # Promo code creator & tracker
│   ├── messages/              # Owner-to-user customer chat
│   ├── profile/               # Editor + AI cover image/details
│   ├── reviews/               # Review list with sentiment gauges
│   └── settings/              # PDF export & email report trigger
├── user/                      # Community member account views
│   ├── dashboard/             # Search, filter, and recommendation hub
│   ├── messages/              # Message channel threads with owners
│   ├── profile/               # Stats and info editor
│   ├── reviews/               # History logs of authored reviews
│   └── saved/                 # Saved favorites catalog
├── login/                     # Login page with Google OAuth support
├── signup/                    # Sign up with reCAPTCHA + type choice
├── forgot-password/           # Password recovery triggers
├── global.d.ts                # TypeScript globals configuration
├── layout.tsx                 # HTML Shell, Theme/Auth/A11y context
└── page.tsx                   # Main platform landing page

components/
├── accessibility/
│   ├── AccessibilityProvider.tsx
│   └── AccessibilityWidget.tsx
├── ui/
│   ├── beams-collision.tsx
│   └── fog.tsx
├── AIChat.tsx
├── AIInsightsCard.tsx
├── AISearchBar.tsx
├── BusinessCard.tsx
├── BusinessLayout.tsx
├── DescriptionGenerator.tsx
├── ReviewAnalysis.tsx
├── ThemeToggle.tsx
├── UserNavbar.tsx
├── AuthNavbar.tsx
├── ProfileNavbar.tsx
├── Navbar.tsx
├── Footer.tsx
├── VicinityLogo.tsx
└── providers.tsx

context/
├── AuthContext.tsx
└── ThemeContext.tsx

hooks/
└── useAccessibility.ts

lib/
├── auth.ts
├── supabase.ts
├── ui.ts
├── userAccountUtils.ts
└── utils.ts

styles/
├── globals.css
└── accessibility.css
```

## Database

Tables: businesses, reviews, favorites, deals, conversations, messages

- businesses stores name, description, address, city, state, zip, phone, email, website, cover image, gallery (array), tags (array), hours (JSON), rating, review count.
- reviews stores rating (1–5), comment, user, business, and timestamp.
- favorites links users to their saved businesses.
- deals stores promo codes, discount type, discount amount, expiration date, active status, and action clicks.
- conversations links users and businesses for messaging threads.
- messages stores individual messages within conversation threads.

User authentication is handled by Supabase Auth. User type (community or business) is stored in user_metadata.

## Environment Variables

Configure these settings inside `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_api_key
GMAIL_USER=your_gmail_address
GMAIL_APP_PASSWORD=your_gmail_app_password
RECAPTCHA_SECRET_KEY=your_recaptcha_secret
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
```

## Deployment & Setup

```bash
# Install dependencies
npm install

# Run the local development server
npm run dev

# Build for production
npm run build

# Start the production bundle
npm start
```