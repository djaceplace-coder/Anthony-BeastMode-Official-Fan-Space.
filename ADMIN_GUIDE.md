# Admin Operations Guide — Anthony BeastMode Management

This operational guide provides step-by-step instructions for management and support staff using the `/admin` operations console.

---

### Workflow 1: Add a New Release (Section 17.1)
1. Navigate to `/admin/releases` and click **"Create Release"**.
2. Enter the release Title, format Type (Album, EP, Single, Mixtape), and canonical URL Slug.
3. Input the official 1:1 square artwork URL and release date.
4. Input official streaming URLs for Spotify, Apple Music, YouTube Music, Deezer, etc. (The system validates that the domains match authorized platform hosts).
5. Add an official embed URL if an approved iframe widget exists (The system validates against the host allowlist).
6. Set the explicit content flag. If the release contains explicit lyrics, this automatically enforces the 18+ gate on the public page.
7. Enter approved liner notes and production credits.
8. Set status to "Approved" and save. The release will immediately appear on `/music` and in the `/music/listen` platform hub.

---

### Workflow 2: Add a Tour Date & Shows (Section 17.2)
1. Navigate to `/admin/tours` and click **"Add Show"**.
2. Select the target City and Venue from the dropdown records.
3. Enter the concert date, doors time, showtime, and venue time zone.
4. Select the venue's Age Policy (`All Ages`, `18+ Only`, `21+ Only`).
5. Enter the Official Ticket URL from the ticketing vendor (e.g. Eventbrite, TicketLeap, Bandsintown).
6. Enter the Price Label (e.g., "$25 advance"), Price Source (vendor name), and Price Verified Date (must be within 14 days for the price to render on public listings).
7. If pre-show experiences or VIP upgrades exist, add them under the experiences array.
8. Click **"Save Tour Date"**. The show will automatically propagate to `/tour`, the home upcoming shows strip, and the relevant `/tour/[city-slug]` hub.

---

### Workflow 3: Launch a New City (Section 17.3)
1. Navigate to `/admin/cities` and click **"Add City"**.
2. Input the City name, State abbreviation, and URL slug (e.g. `memphis-tn`).
3. Set the Priority Tier (`1`, `2`, or `3`).
4. Enter private city metrics: Monthly Spotify Listeners, past ticket sales, and social follower counts from Spotify for Artists and social analytics.
5. Enter an approved, one-line public City Note and an internal routing decision note.
6. Toggle "Enabled" to active and click **"Save City Hub"**.
7. The dynamic page `/tour/[city-slug]` is generated immediately from the template with local venue information and alerts.

---

### Workflow 4: Create and Publish a Partner Offer (Section 17.4)
1. Navigate to `/admin/offers` and click **"New Partner Offer"**.
2. Enter the Partner Brand Name, logo URL, headline, and exact approved discount text.
3. Enter the Signed Terms Reference (e.g., `AGR-RAZER-2026-08`).
4. Select the audience Scope (`All Visitors`, `Members Only`, `Specific City`).
5. Set start and expiry dates.
6. **Mandatory Step**: Enter the complete, unedited legal fine print in the fine print field. (The system blocks saving or publishing if this is empty per Rule 1.7).
7. Note that the "Sponsored" badge is permanent and automatically applied to the preview.
8. Set status to "Approved & Live" and save.

---

### Workflow 5: Cancel or Move a Show (Section 17.5)
1. Open `/admin/tours` and click **"Edit"** on the target show.
2. Change the show status to `Cancelled` or `Postponed`.
3. In the "Public Notice" field, enter the approved explanation (e.g., *"Rescheduled due to severe weather. All original tickets honored for the new date."*).
4. Save the show. The public tour row will immediately render a clear status badge and notice, and the Schema.org JSON-LD structured data will update to `EventCancelled`.

---

### Workflow 6: Handle a Fan Support Message (Section 17.6)
1. Open `/admin/inbox` and select the **"Fans Desk"** tab.
2. Select an inquiry from the queue on the left to inspect the fan's message and location.
3. Click one of the pre-approved canned responses to load standard verified copy, or draft a personalized reply.
4. Record any private context in the "Internal Staff Notes" field (never visible to fans).
5. Update the pipeline status to `Closed` once resolved.

---

### Workflow 7: Handle a Promoter Booking Inquiry (Section 17.7)
1. Open `/admin/inbox` and select the **"Booking Desk"** tab.
2. Review the proposed venue, date, capacity, and city.
3. Advance the inquiry through the booking pipeline:
   `New` &rarr; `Contacted` &rarr; `Hold Placed` &rarr; `Offer Sent` &rarr; `Booked` / `Declined`.
4. Log all negotiation terms in the internal staff notes field to ensure booking terms remain strictly confidential.

---

### Workflow 8: Review and Approve Factual Copy (Section 17.8)
1. Open `/admin/copy` to inspect all pending copy items.
2. Review each item's text, author, and mandatory source note citation.
3. If factual documentation is verified, click **"Approve & Publish"**.
4. If a claim lacks verifiable citation, click **"Request Changes"**. The public site will only render copy once approved.
