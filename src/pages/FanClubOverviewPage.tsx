import React from 'react';
import {
  Bell,
  CheckCircle,
  HelpCircle,
  MessageSquare,
  Shield,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface FanClubOverviewPageProps {
  navigate: (route: string) => void;
}

export const FanClubOverviewPage: React.FC<FanClubOverviewPageProps> = ({ navigate }) => {
  const approvedBenefits = [
    {
      title: 'Local Tour Presale Notices',
      description: 'Receive advance notice whenever Anthony BeastMode schedules a date in your selected city.',
      icon: Ticket,
    },
    {
      title: 'Direct Fan Support Chat',
      description: 'Privately message our community coordination team with questions about VIP upgrades, shows, or meetups.',
      icon: MessageSquare,
    },
    {
      title: 'New Release First-Listens',
      description: 'Get platform streaming links the moment new studio projects and singles drop.',
      icon: Bell,
    },
    {
      title: 'Verified Member Segment Perks',
      description: 'Access regional fan meetup coordination and sponsored partner discounts.',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-12 pb-16 max-w-4xl mx-auto">
      <SEOHead
        title="Fan Club Community &amp; Membership"
        description="Join the official Anthony BeastMode Fan Club (Rebel Family). Free membership, local concert presale alerts, and direct team chat."
        canonicalPath="/fan-club"
      />

      {/* Hero Banner */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8 sm:p-12 text-center space-y-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold border border-[var(--accent)]/20">
          <Users className="w-3.5 h-3.5" />
          <span>Official Community Portal</span>
        </div>

        <div className="max-w-2xl mx-auto space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black text-[var(--text-primary)] tracking-tight">
            The Rebel Family Fan Club
          </h1>
          <p className="text-xs sm:text-base text-[var(--text-secondary)] leading-relaxed">
            A direct, spam-free line between Anthony BeastMode and dedicated supporters. No paywalls or subscriptions for live tour access.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/signup')}
            className="px-8 py-3 text-xs sm:text-sm font-bold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-all shadow-md"
          >
            Join Free Now
          </button>
          <button
            onClick={() => navigate('/signin')}
            className="px-6 py-3 text-xs sm:text-sm font-semibold rounded-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--accent)]"
          >
            Member Sign In
          </button>
        </div>
      </section>

      {/* Approved Benefits List */}
      <section className="space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            What Membership Includes
          </h2>
          <p className="text-xs text-[var(--text-muted)]">
            Verified features active for all registered members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {approvedBenefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3"
              >
                <div className="w-10 h-10 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center border border-[var(--accent)]/20">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">{b.title}</h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Free Tier Standard Notice */}
      <section className="p-6 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-primary)] flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Transparent Membership: 100% Free Tier</span>
        </h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          Version 1.0 of the Fan Club is completely free. We do not store credit card details or lock presale tour links behind recurring subscriptions. If special commemorative VIP physical kits are introduced in the future, they will be billed securely via authorized external storefronts.
        </p>
      </section>
    </div>
  );
};
