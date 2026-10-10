# Design System Specification — Anthony BeastMode

A Bandcamp-inspired clean, calm, and music-first design system with generous whitespace, crisp typography, and album art as the visual center.

---

## 1. Design Tokens

### Color Palette (WCAG AA Compliant)

| Token Name | Dark Mode (Default) | Light Mode | Purpose |
| :--- | :--- | :--- | :--- |
| `bgPrimary` | `#0B0C10` (Deep Noir) | `#F9FAFB` (Soft Off-White) | Main page background |
| `bgSecondary` | `#14161D` (Charcoal) | `#FFFFFF` (Pure White) | Card and container backgrounds |
| `bgElevated` | `#1F222E` (Slate Tint) | `#F3F4F6` (Light Gray) | Inputs, badges, active states |
| `borderSubtle` | `#2A2E3D` | `#E5E7EB` | Dividers and card borders |
| `textPrimary` | `#F5F5F7` (Parchment) | `#111827` (Charcoal Black) | Headings, primary text |
| `textSecondary`| `#A0A5B5` | `#4B5563` | Body copy, secondary metadata |
| `textMuted` | `#6B7280` | `#9CA3AF` | Timestamp labels, captions |
| `accentPrimary`| `#E5A93C` (Warm Brass) | `#B87714` (Deep Amber) | CTAs, active highlights |
| `accentHover` | `#F3BE58` | `#985F08` | Hover interactions |
| `statusOnSale` | `#10B981` (Emerald) | `#059669` | On-sale status pills |
| `statusLowTix` | `#F59E0B` (Amber) | `#D97706` | Low-ticket status warning |
| `statusSoldOut`| `#EF4444` (Ruby) | `#DC2626` | Sold-out show indicator |

### Typography Stack
- **Display & Headings**: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Body & Metadata**: `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **Monospace (Dates, IDs, Codes)**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **Reading Length**: Body copy constrained to 65–75 characters per line to guarantee comfortable legibility.

### Radii & Spacing
- `radius-sm`: `6px` (Pills, badges)
- `radius-md`: `10px` (Buttons, inputs)
- `radius-lg`: `14px` (Cards, dialog containers)
- `radius-xl`: `16px` – `24px` (Hero banners)

---

## 2. Component Inventory

1. **`ReleaseCard`**: Square (1:1) album artwork, explicit badge, release type pill, title, and "Listen" action.
2. **`TrackRow`**: Track index, title, explicit indicator, formatted runtime (MM:SS), lyrics licensing pill, and direct stream action.
3. **`TourDateRow`**: Monospace calendar date block, city/state, venue name, doors/showtime, age policy badge, verified price label, and official vendor ticket button.
4. **`OfferCard`**: Permanent "Sponsored" badge, partner logo, headline, discount copy, and expandable legal fine-print drawer.
5. **`EmbedFacade`**: Privacy facade previewing platform player and title; loads official iframe only after user clicks "Show Player".
6. **`AgeGateModal`**: Focus-trapped 18+ content advisory dialog storing an anonymous boolean flag without collecting birthdates.
7. **`CookieConsent`**: Granular privacy banner offering "Essential Only", "Accept All", and "Manage" options.
8. **`MemberChat`**: Real-time private messaging thread between fan members and staff.

---

## 3. Template Layout Descriptions

- **Home (`/`)**: High-impact album hero on left with platform buttons on right; upcoming 3 shows strip; 4-item discography preview; sponsored partner offers; Fan Club CTA.
- **Music Catalog (`/music`)**: Discography card grid with format filters (Album, EP, Single, Mixtape), explicit filter, sorting (newest/oldest/A-Z), and "Start With" curated discovery picks.
- **Release Page (`/music/[release-slug]`)**: Two-column layout with 1:1 artwork on left, platform buttons & embed facade on right, tracklist with lyrics licensing status below, and verified production credits.
- **Tour Page (`/tour`)**: Date-sorted show list with State and Age Policy filters; link to Past Shows archive; "Request a City" grassroots routing box.
- **City Hub (`/tour/[city-slug]`)**: 16:9 landscape city hero image; next show spotlight with verified price and vendor link; venue card with address and capacity range; local city-scoped partner offers; city alert opt-in form.
- **Show Detail (`/tour/[city-slug]/[show-slug]`)**: Date, doors, showtime, time zone, age policy, verified price sourcing note, pre-show VIP upgrade cards, and `.ics` calendar file download.
- **Fan Club Sign-Up (`/signup`)**: Name, email, password, optional city dropdown, fan segment selection chips, 18+ explicit confirmation checkbox, and terms acceptance.
- **Member Dashboard (`/account`)**: Tabbed interface featuring profile settings, local city selector, live team chat thread, member perk offers, and GDPR data export/deletion.
- **Operations Console (`/admin`)**: Dark-mode administrative workspace with KPI metrics, show scheduler, release editor, City Priority matrix, copy approval queue, support inbox, and audit logs.
