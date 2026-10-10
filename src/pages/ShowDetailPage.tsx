import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  ExternalLink,
  MapPin,
  Shield,
  Sparkles,
  Ticket,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Show } from '../types/database';
import { SEOHead } from '../components/common/SEOHead';

interface ShowDetailPageProps {
  show: Show;
  onBack: () => void;
  navigate: (route: string) => void;
}

export const ShowDetailPage: React.FC<ShowDetailPageProps> = ({
  show,
  onBack,
  navigate,
}) => {
  const { cities, venues, recordTicketClick } = useDatabase();

  const city = cities.find((c) => c.id === show.cityId);
  const venue = venues.find((v) => v.id === show.venueId);

  // Generate .ics calendar download
  const handleDownloadCalendar = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Anthony BeastMode Tour//EN',
      'BEGIN:VEVENT',
      `SUMMARY:Anthony BeastMode Live at ${venue?.name || 'Concert Hall'}`,
      `DESCRIPTION:Anthony BeastMode Tour Date in ${city?.name || 'City'}, ${city?.state || 'State'}. Doors: ${show.doorsTime || 'TBA'}, Showtime: ${show.showTime}. Official Tickets: ${show.officialTicketUrl}`,
      `LOCATION:${venue?.name || ''}, ${venue?.address || ''}`,
      `DTSTART:${show.date.replace(/-/g, '')}T200000`,
      `DTEND:${show.date.replace(/-/g, '')}T230000`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `anthony-beastmode-${city?.slug || 'show'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTicketClick = () => {
    recordTicketClick(show.id, show.cityId);
  };

  return (
    <div className="space-y-10 pb-16 max-w-4xl mx-auto">
      <SEOHead
        title={`Anthony BeastMode at ${venue?.name || 'Venue'} (${city?.name || 'City'})`}
        description={`Live concert details, door times, age policy, and official tickets for Anthony BeastMode in ${city?.name}, ${city?.state}.`}
        canonicalPath={`/tour/${city?.slug || 'date'}/${show.id}`}
      />

      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tour Schedule</span>
        </button>
      </div>

      {/* Public Notice if Cancelled / Postponed */}
      {show.publicNotice && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 space-y-1">
          <span className="font-bold uppercase tracking-wider">Official Event Notice:</span>
          <p>{show.publicNotice}</p>
        </div>
      )}

      {/* Main Show Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-4">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
              {show.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Time Zone: {show.timeZone}
            </span>
          </div>

          <button
            onClick={handleDownloadCalendar}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Add to Calendar (.ics)</span>
          </button>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
            Anthony BeastMode Live in {city ? `${city.name}, ${city.state}` : 'Concert'}
          </h1>
          <p className="text-base text-[var(--accent)] font-semibold">
            {venue ? venue.name : 'Venue TBA'}
          </p>
        </div>

        {/* Vital Show Metadata Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs">
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">Date</span>
            <span className="font-bold text-[var(--text-primary)]">{show.date}</span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">Doors / Showtime</span>
            <span className="font-bold text-[var(--text-primary)]">{show.doorsTime || 'TBA'} / {show.showTime}</span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">Age Policy</span>
            <span className="font-bold text-[var(--text-primary)]">{show.agePolicy.replace('_', ' ').toUpperCase()}</span>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">Verified Price</span>
            <span className="font-bold text-[var(--text-primary)]">{show.priceLabel || 'Price at checkout'}</span>
          </div>
        </div>

        {/* Opener Note (approved copy) */}
        {show.opener && (
          <div className="text-xs text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">Supporting Acts:</span> {show.opener}
          </div>
        )}

        {/* Ticket Action Button with Vendor Attribution */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[var(--border-subtle)]">
          <div className="text-xs text-[var(--text-muted)]">
            <p>
              Verified via <strong className="text-[var(--text-primary)]">{show.ticketVendorName}</strong>.
            </p>
            <p className="text-[11px]">
              Last verified: {show.priceVerifiedOn || 'Recently'}. Subject to ticketing vendor fees.
            </p>
          </div>

          {show.officialTicketUrl ? (
            <a
              href={show.officialTicketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleTicketClick}
              className="px-6 py-3 text-xs font-bold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center space-x-2 shadow-sm shrink-0"
            >
              <Ticket className="w-4 h-4" />
              <span>Buy Official Tickets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="px-5 py-2.5 text-xs text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-md">
              Tickets Coming Soon
            </span>
          )}
        </div>
      </div>

      {/* Pre-Show Experiences / VIP Passes (Section 6.8) */}
      {show.experiences && show.experiences.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span>Pre-Show Experiences &amp; VIP Upgrades</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {show.experiences.map((exp) => (
              <div
                key={exp.id}
                className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3"
              >
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-[var(--text-primary)]">{exp.title}</h4>
                  <span className="text-xs font-bold text-[var(--accent)]">{exp.priceLabel}</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{exp.description}</p>
                <a
                  href={exp.officialTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--accent)] hover:underline pt-1"
                >
                  <span>Purchase Upgrade at Official Vendor</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Post-show Recap (if past show) */}
      {show.status === 'past' && show.recapCopy && (
        <div className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
            Concert Recap
          </h3>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            {show.recapCopy}
          </p>
        </div>
      )}

      {/* Venue Detail Card */}
      {venue && (
        <section className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-3">
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Venue Information</h3>
          <p className="text-xs text-[var(--text-secondary)] flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span>{venue.name} &bull; {venue.address}</span>
          </p>
          {venue.capacityRange && (
            <p className="text-xs text-[var(--text-muted)]">Capacity: {venue.capacityRange}</p>
          )}
          {venue.website && (
            <a
              href={venue.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-[var(--accent)] hover:underline"
            >
              <span>Visit Venue Website</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </section>
      )}
    </div>
  );
};
