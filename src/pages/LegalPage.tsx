import React from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface LegalPageProps {
  pageType: 'privacy' | 'terms' | 'cookies' | 'accessibility' | 'age-policy';
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ pageType, onBack }) => {
  const contentMap = {
    privacy: {
      title: 'Privacy Policy',
      updated: 'October 1, 2026',
      body: `This Privacy Policy describes how Anthony BeastMode ("we", "us", "our") collects, uses, and safeguards information when you visit this website.

1. Data Minimization & Collection
We strictly collect only the minimal data necessary to provide our fan club services and tour routing:
- Fan Club Members: Display name, email address, optional city choice, and notification preferences.
- Age Confirmation: A boolean 18+ confirmation flag and timestamp. We do NOT collect or store birthdates, government IDs, or payment card information.
- Inquiries: Name, email address, and message details submitted through our contact portal.

2. Anonymous Metrics
We aggregate anonymous event counts (e.g., ticket button clicks per city, offer impressions) to understand tour demand. No individual IP address or tracking cookies are shared with data brokers or advertising networks.

3. External Links & Ticketing
All tickets are purchased directly through verified third-party ticketing platforms (e.g. Eventbrite, TicketLeap, Bandsintown). Your financial information is handled solely on those external domains under their respective privacy policies.

4. Your Rights & Data Deletion
Registered members may download a complete JSON export of their account data or request permanent deletion anytime in Account Settings.`,
    },
    terms: {
      title: 'Terms of Service',
      updated: 'October 1, 2026',
      body: `Please review these Terms of Service before using the Anthony BeastMode fan website.

1. Permitted Use
This website is provided for informational and community engagement purposes relating to artist Anthony BeastMode. You agree not to scrape, inject malicious payloads, spam contact forms, or attempt unauthorized access to administrative endpoints.

2. No Ticket Sales or Card Processing
This site does not sell, resell, or process transactions for tickets or merchandise. All tickets are purchased directly from independent ticketing vendors. We assume no liability for event cancellations, venue policies, or third-party refund disputes.

3. Intellectual Property
All artist photography, recordings, marks, and design layouts are protected by applicable copyright and trademark laws. Audio and video content are streamed via official third-party embeds only.`,
    },
    cookies: {
      title: 'Cookie & Tracking Policy',
      updated: 'October 1, 2026',
      body: `Our website defaults to a privacy-first posture.

1. Strictly Essential Storage
We store authentication session tokens, your 18+ explicit content confirmation flag, and light/dark theme preference locally on your device. These are necessary for basic site functionality.

2. Analytics & Measurement
We do not load third-party advertising tracking scripts without your explicit consent. With consent, we measure non-personal aggregate city demand to help route upcoming concert dates.`,
    },
    accessibility: {
      title: 'Accessibility Statement',
      updated: 'October 1, 2026',
      body: `We are committed to digital accessibility and adhering to WCAG 2.1 Level AA standards.

1. Keyboard & Screen Reader Navigation
All interactive controls, modals (including the 18+ content advisory gate), forms, and accordions are fully keyboard accessible with visible focus indicators.

2. Motion & Contrast
Our user interface respects the prefers-reduced-motion media query by disabling non-essential transitions. Text contrast across both Dark and Light themes meets or exceeds WCAG AA ratios.

If you encounter any accessibility barrier, please reach out via our contact portal.`,
    },
    'age-policy': {
      title: 'Age Policy & Explicit Content Gating',
      updated: 'October 1, 2026',
      body: `1. Online Explicit Content Advisory (18+)
Certain songs, audio embeds, and visuals in the Anthony BeastMode catalog feature explicit language, adult themes, and rural storytelling.
- In accordance with our standards, visitors are prompted to confirm they are 18 years of age or older before explicit audio embeds or track lists load.
- We do NOT collect, inspect, or store your date of birth or ID. We store only an anonymous boolean confirmation timestamp in your browser or member profile.

2. Live Concert Age Policies
Age admission policies for concerts (e.g. All Ages, 18+, 21+) are established by individual venues and local municipal ordinances.
- Always check the Age Policy badge displayed beside each tour date before purchasing tickets.
- Ticketing vendors and venue security will require valid government identification at the door.`,
    },
  };

  const activeContent = contentMap[pageType] || contentMap.privacy;

  return (
    <div className="space-y-10 pb-16 max-w-3xl mx-auto">
      <SEOHead
        title={activeContent.title}
        description={`Legal terms, privacy practices, and age guidelines for Anthony BeastMode website.`}
        canonicalPath={`/${pageType}`}
      />

      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/30">
            Pending Legal Review
          </span>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            Last Updated: {activeContent.updated}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          {activeContent.title}
        </h1>
      </div>

      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-4 whitespace-pre-line">
        {activeContent.body}
      </div>
    </div>
  );
};
