# Anthony BeastMode Official Fan Club & Tour Website

A complete, production-grade fan club and tour management platform for independent recording artist **Anthony BeastMode**.

Built with a Bandcamp-inspired clean, calm, and music-first aesthetic, featuring zero-trust Firestore architecture, privacy-safe analytics, birthdate-free 18+ explicit content gating, and comprehensive city-level tour hub routing.

---

## Key Features & Architecture

- **Clean, Calm Design System**: Restrained layout grammar, neutral scale, warm brass accent (`#E5A93C`), and accessible high-contrast Dark & Light modes meeting WCAG AA standards.
- **Music-First Streaming Hub**:
  - Discography filtering (Album, EP, Single, Mixtape) with "Start With" curated discovery.
  - Privacy-preserving official iframe embed facade (Spotify, Apple Music, Deezer, YouTube) loading only on user consent.
  - No hosted audio or unlicensed lyrics (`lyrics_status: not_shown | licensed | instrumental`).
- **18+ Explicit Content Gating (Rule 1.6)**:
  - Age gate modal requiring 18+ confirmation before explicit tracks or audio players load.
  - Zero birthdates collected; stored as a boolean timestamp in `localStorage` and member profiles.
- **City-Level Tour Strategy**:
  - Dynamic city hub templates (`/tour/[city-slug]`) for 11 targeted launch cities across 3 priority tiers.
  - Sourced and verified ticket pricing: prices display only if verified by an admin within 14 days; otherwise displays "Price at checkout".
  - Calendar download (.ics generator) on show details.
- **Sponsored Partner Offers (Rule 1.7 & Section 7)**:
  - Fixed, non-removable "Sponsored" badge on every promotion.
  - Mandatory expandable legal fine-print drawer directly below offer copy.
  - Scoped targeting (All Visitors, Fan Club Members, City-specific).
- **Fan Club Community ("Rebel Family")**:
  - Free 1.0 membership without subscription paywalls or credit card forms.
  - Real-time private chat thread between fan members and the team using Firestore subcollections.
  - Granular notification preferences and GDPR-compliant JSON data export & deletion.
- **Hidden & Enforced Administrative Operations (Rule 1.8)**:
  - Admin endpoints live strictly at `/admin` and `/admin/login`.
  - Non-admins visiting `/admin` receive a generic 404 page with no leakage.
  - Complete operational editors for Shows, Releases, City Priorities, Copy Approval Queues, and Inbound Support Inboxes.

---

## Local Setup & Development

### Prerequisites
- Node.js 20+
- npm or bun

### Installation
```bash
git clone <repo-url>
cd anthony-beastmode
npm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure your Firebase credentials in `firebase-applet-config.json` are present.

### Running Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3000`.

### Building for Production
```bash
npm run build
```

---

## Security & Launch Blockers (Rule 1.9 & DEPLOY.md)

1. **Email Verification Blocker**: Per Rule 1.9, email verification is temporarily disabled during test phases. It **must** be enforced before public marketing launch.
2. **Firebase App Check**: Must be configured with reCAPTCHA Enterprise before opening registration to the public.
3. **Admin Credential Security**: Super admin role is enforced server-side via `firestore.rules` and `adereraadenike@gmail.com`.
