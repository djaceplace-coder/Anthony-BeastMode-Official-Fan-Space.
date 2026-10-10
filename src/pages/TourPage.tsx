import React, { useState } from 'react';
import {
  Archive,
  Calendar,
  CheckCircle,
  Filter,
  MapPin,
  Send,
  Ticket,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { TourDateRow } from '../components/tour/TourDateRow';
import { SEOHead } from '../components/common/SEOHead';
import { Show } from '../types/database';

interface TourPageProps {
  navigate: (route: string) => void;
  onSelectShow: (show: Show) => void;
}

export const TourPage: React.FC<TourPageProps> = ({ navigate, onSelectShow }) => {
  const { shows, cities, submitInquiry } = useDatabase();
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Request city form state
  const [requestedCity, setRequestedCity] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // States available in show directory
  const availableStates = Array.from(
    new Set(
      shows.map((s) => {
        const c = cities.find((city) => city.id === s.cityId);
        return c?.state;
      }).filter(Boolean)
    )
  );

  // Active / Upcoming shows
  const upcomingShows = shows
    .filter((s) => s.status !== 'past')
    .sort((a, b) => a.date.localeCompare(b.date));

  const filteredShows = upcomingShows.filter((s) => {
    const city = cities.find((c) => c.id === s.cityId);
    if (selectedState !== 'all' && city?.state !== selectedState) return false;
    if (selectedAge !== 'all' && s.agePolicy !== selectedAge) return false;
    if (selectedStatus !== 'all' && s.status !== selectedStatus) return false;
    return true;
  });

  const pastShowsCount = shows.filter((s) => s.status === 'past').length;

  const handleCityRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedCity || !requesterEmail) return;
    await submitInquiry({
      category: 'fans',
      name: requesterName || 'Fan',
      email: requesterEmail,
      city: requestedCity,
      topic: 'City Tour Request',
      message: `Fan tour routing request for: ${requestedCity}`,
    });
    setRequestSubmitted(true);
  };

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title="Official Tour Dates &amp; Live Shows"
        description="Official Anthony BeastMode live tour schedule. Verified concert dates, direct venue ticketing links, doors, and age policies."
        canonicalPath="/tour"
      />

      {/* Header and Archive Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border-subtle)] pb-6 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            Live Concert Schedule
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mt-1">
            Tour Dates &amp; Venues
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            All tickets linked solely to official ticketing partners. Stale shows automatically archive.
          </p>
        </div>

        <button
          onClick={() => navigate('/tour/archive')}
          className="self-start md:self-auto px-4 py-2 text-xs font-semibold rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-all flex items-center space-x-1.5"
        >
          <Archive className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Past Show Archive ({pastShowsCount}) &rarr;</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-[var(--text-muted)]">
          <Filter className="w-4 h-4 text-[var(--accent)]" />
          <span>Filter Dates:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* State Filter */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            aria-label="Filter by State"
          >
            <option value="all">All States</option>
            {availableStates.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          {/* Age Policy Filter */}
          <select
            value={selectedAge}
            onChange={(e) => setSelectedAge(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            aria-label="Filter by Age Policy"
          >
            <option value="all">All Age Policies</option>
            <option value="all_ages">All Ages</option>
            <option value="18_plus">18+ Only</option>
            <option value="21_plus">21+ Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            aria-label="Filter by Show Status"
          >
            <option value="all">All Statuses</option>
            <option value="on_sale">On Sale</option>
            <option value="low_tickets">Low Tickets</option>
            <option value="sold_out">Sold Out</option>
          </select>
        </div>
      </div>

      {/* Shows List */}
      <div className="space-y-3">
        {filteredShows.length > 0 ? (
          filteredShows.map((show) => (
            <TourDateRow
              key={show.id}
              show={show}
              onViewShow={onSelectShow}
            />
          ))
        ) : (
          <div className="p-8 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
            <Calendar className="w-8 h-8 text-[var(--accent)] mx-auto opacity-80" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              No shows found matching your filter criteria.
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Try resetting your filters or submit a city request below.
            </p>
          </div>
        )}
      </div>

      {/* "Request a City" Fan Submission Box (Section 4 & Section 6.12 requirement) */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <MapPin className="w-4 h-4" />
          <span>Grassroots Routing</span>
        </div>

        <div className="max-w-2xl space-y-1">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Don't See Your City on the Tour?
          </h2>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Tell the booking team where to bring the next live show. City requests are reviewed weekly and directly inform venue holds and tour routing.
          </p>
        </div>

        {requestSubmitted ? (
          <div className="p-4 rounded-xl bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-xs text-[var(--accent)] flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Thank you! Your city request has been sent directly to the tour coordinator.</span>
          </div>
        ) : (
          <form onSubmit={handleCityRequest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <input
              type="text"
              placeholder="City, State (e.g., Dallas, TX)"
              value={requestedCity}
              onChange={(e) => setRequestedCity(e.target.value)}
              required
              className="px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <input
              type="email"
              placeholder="Your Email"
              value={requesterEmail}
              onChange={(e) => setRequesterEmail(e.target.value)}
              required
              className="px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit City Request</span>
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
