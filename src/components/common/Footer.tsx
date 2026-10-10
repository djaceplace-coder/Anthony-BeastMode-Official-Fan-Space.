import React, { useState } from 'react';
import { Mail, CheckCircle, ExternalLink } from 'lucide-react';
import { useDatabase } from '../../context/DatabaseContext';

interface FooterProps {
  navigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const { artistProfile } = useDatabase();
  const [emailInput, setEmailInput] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    setSubscribed(true);
    setEmailInput('');
  };

  const legalLinks = [
    { label: 'Privacy Policy', route: '/privacy' },
    { label: 'Terms of Service', route: '/terms' },
    { label: 'Cookie Preferences', route: '/cookies' },
    { label: 'Accessibility', route: '/accessibility' },
    { label: 'Age Policy (18+)', route: '/age-policy' },
    { label: 'FAQ', route: '/faq' },
    { label: 'Contact', route: '/contact' },
  ];

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-subtle)] text-[var(--text-secondary)] mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Artist Base */}
          <div className="md:col-span-1 space-y-3">
            <h3 className="text-base font-bold text-[var(--text-primary)] tracking-wide">
              {artistProfile.displayName}
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Official tour dates, discography streaming hub, and community Fan Club. Rooted in{' '}
              <span className="text-[var(--text-primary)] font-medium">{artistProfile.homeBase}</span>.
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              All live event tickets sold solely via verified venue ticketing partners. No ticket markups or resale.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Explore
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => navigate('/music')} className="hover:text-[var(--accent)] transition-colors">
                  Discography &amp; Releases
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/music/listen')} className="hover:text-[var(--accent)] transition-colors">
                  Streaming Platform Hub
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/tour')} className="hover:text-[var(--accent)] transition-colors">
                  Tour Schedule &amp; Dates
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/fan-club')} className="hover:text-[var(--accent)] transition-colors">
                  Fan Club Membership
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/media/press-kit')} className="hover:text-[var(--accent)] transition-colors">
                  Official Press Kit &amp; Bio
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Standards */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Governance &amp; Policy
            </h4>
            <ul className="space-y-1.5 text-xs">
              {legalLinks.map((link) => (
                <li key={link.route}>
                  <button
                    onClick={() => navigate(link.route)}
                    className="hover:text-[var(--accent)] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Direct Tour &amp; Music Alerts
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Receive direct notices for verified city shows and new music drops. No spam.
            </p>

            {subscribed ? (
              <div className="flex items-center space-x-2 text-xs text-[var(--accent)] bg-[var(--accent)]/10 p-2.5 rounded-md border border-[var(--accent)]/20">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Thank you. You are on the direct alert list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Enter your email"
                    required
                    aria-label="Email address for tour alerts"
                    className="w-full px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-3 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center space-x-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Get Alerts</span>
                </button>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Privacy-first. You may unsubscribe anytime in one click.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Disclaimers */}
        <div className="pt-8 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-4">
          <p>
            &copy; {new Date().getFullYear()} {artistProfile.displayName}. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-[11px]">
            <span>Prices per ticketing vendor, subject to change.</span>
            <span>•</span>
            <span>18+ age confirmation required for explicit audio.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
