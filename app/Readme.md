Vicinity
A web app for finding and supporting local businesses in your area. Businesses can list themselves, post deals, and manage reviews. Users can search, save favorites, and leave reviews.

What It Does
Built with Next.js, React, Tailwind, and Supabase. Two main user types: community members who browse/review businesses, and business owners who manage their profiles.

Features
Search & browse local businesses

AI-powered semantic search (search by mood, taste, cuisine instead of just keywords)

Save favorite businesses to your profile

Leave reviews and ratings (1-5 stars)

Edit/delete your own reviews

View and copy promo codes and deals from businesses

Upload photos for your business and create a gallery

Business owners can manage their profile info, hours, contact details

Real-time updates when reviews or deals change

Dark/light mode toggle

Fully responsive - works on phone, tablet, desktop

Source Code
The code is organized with Next.js 14 App Router. React components handle the UI and manage data using hooks.

Pages are in the app/ folder. Business owners manage their profile on /business/profile, users view their dashboard on /user/dashboard. API routes in /api/ handle backend logic like AI search, review analysis, and authentication.

React hooks power the functionality. useState manages form data and UI state. useEffect fetches data from Supabase and listens for real-time changes. When someone posts a review, a useEffect hook detects the change and updates the page instantly. useMemo caches computed data to avoid unnecessary recalculations.

Components are reusable pieces of UI - BusinessCard displays business info, Navbar is the header. They receive data as props and re-render when that data changes.

Aurora background uses WebGL and is based on the Aurora component from ReactBits library. It creates a real-time shader-based animation with noise functions for a smooth, fluid animated background effect.

Authentication uses AuthContext - a React Context that stores the logged-in user info and makes it available to all pages without prop drilling.

Real-time updates use Supabase subscriptions. When a review is posted, Supabase sends an event, the useEffect listens for it, and React updates the page.

Images get uploaded to Supabase Storage. The URLs are stored in the database as arrays so one business can have multiple photos.

Open Source
Aurora background component uses code from ReactBits library (MIT License). All other code is original.

Tech Stack
Next.js 14 (React framework)

React 18 (with hooks)

Tailwind CSS (styling)

Framer Motion (animations)

Supabase (database, auth, storage, real-time)

ReactBits (Aurora component)

AI API (semantic search)

File Structure
text
app/
├── api/               # Backend routes
│   ├── ai-search/
│   ├── analyze-reviews/
│   ├── chat/
│   ├── generate-description/
│   ├── verify-recaptcha/
│   └── auth/
├── business/          # Business owner pages
│   ├── [id]/
│   ├── dashboard/
│   ├── deals/
│   ├── profile/
│   ├── reviews/
│   └── settings/
├── user/              # Community user pages
│   ├── dashboard/
│   ├── profile/
│   ├── reviews/
│   └── saved/
├── login/
├── signup/
├── forgot-password/
├── layout.js
└── page.js

components/           # Reusable React components
context/              # React Context (auth, state)
lib/                  # Utility functions
styles/               # CSS files
Database
Tables: users, businesses, reviews, favorites, deals

businesses stores name, description, address, city, state, zip, phone, email, website, cover image, gallery (array), tags (array), hours (JSON), rating, review count.

reviews stores rating (1-5), comment, user, business, and timestamp.

favorites links users to their saved businesses.

deals stores promo codes, discount type, discount amount, expiration date.

Deployment
npm run build then deploy to Vercel or your own server.