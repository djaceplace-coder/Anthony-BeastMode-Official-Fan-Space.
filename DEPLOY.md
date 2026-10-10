# Pre-Launch Checklist & Deployment Guide — Anthony BeastMode

This document contains mandatory security, compliance, and infrastructure blockers that must be satisfied prior to publishing this application to production.

---

## 1. Hard Launch Blockers (Must Be Resolved Before Launch)

### Blocker 1: Enforce Email Verification (Rule 1.9)
- **Current State**: Email verification is currently **disabled** to facilitate end-to-end testing and rapid feature verification without mail server rate limits.
- **Action Required Before Launch**:
  - Update `src/context/AuthContext.tsx` to mandate `user.emailVerified === true` before granting member access.
  - Enable email verification link dispatch in the Firebase Authentication console.
  - In `firestore.rules`, re-enable `request.auth.token.email_verified == true` for standard member writes.

### Blocker 2: Register Firebase App Check
- **Current State**: Mock rate limits active in client form components.
- **Action Required Before Launch**:
  - Register the production domain with Google reCAPTCHA Enterprise.
  - Initialize Firebase App Check in `src/firebase/config.ts` using `initializeAppCheck(app, { provider: new ReCaptchaEnterpriseProvider('SITE_KEY'), isTokenAutoRefreshEnabled: true })`.
  - Enforce App Check in Firestore database security settings in Google Cloud Console.

### Blocker 3: Legal Policy Review Sign-Off
- **Current State**: Pages at `/privacy`, `/terms`, `/cookies`, `/accessibility`, and `/age-policy` are tagged *"Pending Legal Review"*.
- **Action Required**: The artist's legal counsel must review the age policy and sponsorship disclosures and approve formal publishing.

### Blocker 4: Ticket Link & Price Verification Recency
- **Current State**: Sample shows are verified as of October 2026.
- **Action Required**: Per Rule 1.10 & 6.4, the tour coordinator must confirm official ticketing URLs for all live dates and update `price_verified_on` within 14 days of public announcement.

---

## 2. Infrastructure & Environment Setup

### Environment Separation
- **Development**: Local development running with Vite on port 3000.
- **Staging**: Firebase project `reflecting-zephyr-v6589` on Cloud Run.
- **Production**: Isolated Firebase project with separate API keys and storage buckets.

### Environment Variables
Configure in hosting environment:
```env
GEMINI_API_KEY=""       # Server-side AI key if requested in future updates
APP_URL="https://anthonybeastmode.com" # Canonical domain for sitemap and OpenGraph
```

---

## 3. Pre-Flight Verification Checklist

- [x] **Zero Card Processing**: Verify no Stripe, PayPal, or card forms exist anywhere in the repository (Rule 1.5).
- [x] **No Hosted Audio**: Verify all playback is routed through official platform embeds (Rule 1.3).
- [x] **No Unverified Claims**: Verify all biographical statements in `artist_profile` and `about` have documented source citations (Rule 1.1).
- [x] **Birthdate-Free Age Gate**: Confirm 18+ explicit gating stores only a boolean timestamp without collecting birthdates (Rule 1.6).
- [x] **Admin URL Concealment**: Confirm `/admin` is omitted from `robots.txt`, sitemaps, and public navigation, and returns generic 404 to unauthorized visitors (Rule 1.8).
- [x] **Security Rules Deployed**: `firestore.rules` deployed with Zero-Trust ABAC enforcement.
- [x] **Rich Results Validation**: Schema.org JSON-LD structured data for `Event`, `MusicAlbum`, and `Person` validated for search indexing.

---

## 4. Rollback Plan
If an unverified ticket link or broken release embed is reported:
1. Access `/admin/tours` or `/admin/releases`.
2. Toggle status to `Draft` or `Paused` to remove the item from public indexing instantly without requiring a redeploy.
3. For database-wide state rollbacks, restore the most recent daily Cloud Firestore backup via Google Cloud Console.
