# Open Questions & Design Decisions for Anthony BeastMode

This document records decisions that require confirmation from the artist's management team, along with our recommended default implementations to prevent blocking the build.

---

### Question 1: Official Artist Name Styling
- **Question**: Is the official canonical name spelling and typography "Anthony BeastMode" (one word camel-cased), "Anthony Beast Mode" (two words), or "ANTHONY BEASTMODE" (all caps)?
- **Recommended Default**: Use **"Anthony BeastMode"** across all headings, metadata, and schema, while keeping the database display name configurable in `artist_profile`.
- **Status**: Pending team sign-off.

---

### Question 2: Fan Community Brand ("Rebel Family" vs. "Fan Club")
- **Question**: Should the fan club community be officially titled "Rebel Family" on public launch, or should it remain "Fan Club" pending trademark / management sign-off?
- **Recommended Default**: Display **"Fan Club"** publicly with a badge/note *"Pending Team Approval"* in administrative views, while providing support for "Rebel Family" segment tags in member profiles.
- **Status**: Pending team approval (Section 2.7).

---

### Question 3: Structured Data Schema Entity Type (`Person` vs. `MusicGroup`)
- **Question**: Should Schema.org structured data represent Anthony BeastMode as a `schema.org/Person` (solo artist) or a `schema.org/MusicGroup` (band/outlaw collective)?
- **Recommended Default**: Set primary schema to **`Person`** with `@type: ["Person", "MusicGroup"]` fallback to maximize rich snippet coverage for solo touring acts with backing bands.
- **Status**: Recommended default active.

---

### Question 4: Default Color Theme (Dark Mode vs. Light Mode)
- **Question**: Section 3.3 notes: "Dark mode is the default only if the team approves it." Which theme should load by default on first visit?
- **Recommended Default**: **Dark mode** (deep charcoal/noir `#0B0C10` with rustic warm amber/brass `#E5A93C` accent and parchment text `#F5F5F7`), fitting outlaw country/southern rap aesthetics with seamless toggle to high-contrast Light mode.
- **Status**: Dark mode set as default with persistent visitor theme toggle.

---

### Question 5: Ticketing Vendor Integration Whitelist
- **Question**: Which ticketing vendors are authorized for official ticket links? (e.g., TicketLeap, Eventbrite, Handstamp, Bandsintown, Etix, Prekindle, Venue Direct).
- **Recommended Default**: Allow verified direct domains (`ticketleap.com`, `eventbrite.com`, `handstamp.com`, `bandsintown.com`, `etix.com`, `prekindle.com`, plus verified `.com` venue domains) validated by admin domain check before publishing.
- **Status**: Domain validator enforced in admin show editor.

---

### Question 6: Initial City Priority Tiering
- **Question**: Are the initial launch cities verified:
  - Tier 1: Blue Springs MO, Kansas City MO, St. Louis MO, Dayton OH, Battle Creek MI, Evansville IN, Memphis TN
  - Tier 2: Thomas WV, Englewood CO, Arlington WA
  - Tier 3: San Diego CA
- **Recommended Default**: Implement these exact 11 cities in the initial Firestore seed data and admin City Priority matrix, allowing dynamic management via `/admin/cities`.
- **Status**: Configured in database blueprint and seed data.

---

### Question 7: Explicit Content Gating Age Threshold
- **Question**: Confirm that explicit tracks require a simple 18+ confirmation flag stored locally (and in member profile) without collecting birthdates.
- **Recommended Default**: Strict adherence to Section 1.6: boolean `confirmed_18_plus` timestamped in `localStorage` for visitors and `members/{uid}` for logged-in members.
- **Status**: Standard compliance implemented.
