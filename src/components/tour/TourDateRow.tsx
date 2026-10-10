import React from 'react';
import { Calendar, Clock, ExternalLink, MapPin, Shield } from 'lucide-react';
import { Show } from '../../types/database';
import { useDatabase } from '../../context/DatabaseContext';

interface TourDateRowProps {
  show: Show;
  onViewShow?: (show: Show) => void;
}

export const TourDateRow: React.FC<TourDateRowProps> = ({ show, onViewShow }) => {
  const { cities, venues, recordTicketClick } = useDatabase();

  const city = cities.find((c) => c.id === show.cityId);
  const venue = venues.find((v) => v.id === show.venueId);

  // Format Date: e.g. "NOV 14"
  const dateObj = new Date(show.date + 'T12:00:00');
  const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayStr = dateObj.toLocaleDateString('en-US', { day: '2-digit' });
  const weekdayStr = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

  // Price Verification Logic (Rule 1.10 & 6.4):
  // Must have price_label, price_source, price_verified_on AND verified within 14 days
  let isPriceVerified = false;
  let formattedPriceDisplay = 'Price at checkout';

  if (show.priceLabel && show.priceSource && show.priceVerifiedOn) {
    const verifiedDate = new Date(show.priceVerifiedOn);
    const now = new Date();
    const diffDays = (now.getTime() - verifiedDate.getTime()) / (1000 * 3600 * 24);
    if (diffDays <= 14) {
      isPriceVerified = true;
      formattedPriceDisplay = show.priceLabel;
    }
  }

  // Age policy label
  const ageLabels: Record<string, string> = {
    all_ages: 'All Ages',
    '18_plus': '18+ Only',
    '21_plus': '21+ Only',
  };

  // Status badges
  const statusStyles: Record<string, { label: string; style: string }> = {
    on_sale: { label: 'On Sale', style: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    low_tickets: { label: 'Low Tickets', style: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    sold_out: { label: 'Sold Out', style: 'bg-red-500/10 text-red-500 border-red-500/20' },
    cancelled: { label: 'Cancelled', style: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
    postponed: { label: 'Postponed', style: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
    past: { label: 'Past Show', style: 'bg-gray-800 text-gray-500 border-gray-700' },
  };

  const currentStatus = statusStyles[show.status] || { label: show.status, style: 'bg-gray-500/10 text-gray-400' };

  const handleTicketClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordTicketClick(show.id, show.cityId);
  };

  return (
    <div
      onClick={() => onViewShow && onViewShow(show)}
      className="group relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] hover:shadow-md transition-all gap-4 cursor-pointer"
    >
      {/* Left: Date Block & Location Info */}
      <div className="flex items-start sm:items-center space-x-4">
        {/* Calendar Badge */}
        <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shrink-0 font-mono">
          <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-wider">
            {monthStr}
          </span>
          <span className="text-xl font-extrabold text-[var(--text-primary)] leading-none">
            {dayStr}
          </span>
          <span className="text-[9px] text-[var(--text-muted)] uppercase">
            {weekdayStr}
          </span>
        </div>

        {/* City & Venue */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap">
            <h4 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
              {city ? `${city.name}, ${city.state}` : 'City TBA'}
            </h4>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${currentStatus.style}`}
              aria-label={`Status: ${currentStatus.label}`}
            >
              {currentStatus.label}
            </span>
          </div>

          <div className="flex items-center space-x-3 text-xs text-[var(--text-secondary)] flex-wrap">
            <span className="font-medium text-[var(--text-primary)]">
              {venue ? venue.name : 'Venue TBA'}
            </span>
            <span>&bull;</span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-[var(--text-muted)]" />
              <span>{show.showTime}</span>
            </span>
            <span>&bull;</span>
            <span className="px-1.5 py-0.2 rounded bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[10px]">
              {ageLabels[show.agePolicy] || 'All Ages'}
            </span>
          </div>

          {/* Price Sourcing & Verification Notice */}
          <div className="text-[11px] text-[var(--text-muted)] flex items-center space-x-1">
            <span>{formattedPriceDisplay}</span>
            {isPriceVerified && (
              <span className="text-[10px] opacity-80">
                (Per {show.priceSource}, verified {show.priceVerifiedOn})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-3 self-end md:self-center shrink-0">
        {show.status === 'cancelled' ? (
          <span className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-800 rounded-md">
            Show Cancelled
          </span>
        ) : show.status === 'past' ? (
          <button
            onClick={() => onViewShow && onViewShow(show)}
            className="px-4 py-2 text-xs font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)] rounded-md hover:text-[var(--text-primary)]"
          >
            View Recap
          </button>
        ) : show.officialTicketUrl ? (
          <a
            href={show.officialTicketUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTicketClick}
            className="px-4 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center space-x-1.5 shadow-sm"
          >
            <span>Tickets</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="px-3.5 py-2 text-xs font-medium text-[var(--text-muted)] bg-[var(--bg-elevated)] rounded-md border border-[var(--border-subtle)]">
            Tickets Coming Soon
          </span>
        )}
      </div>
    </div>
  );
};
