import React from 'react';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { SEOHead } from '../components/common/SEOHead';
import { Show } from '../types/database';

interface TourArchivePageProps {
  onBack: () => void;
  onSelectShow: (show: Show) => void;
}

export const TourArchivePage: React.FC<TourArchivePageProps> = ({ onBack, onSelectShow }) => {
  const { shows, cities, venues } = useDatabase();

  const pastShows = shows
    .filter((s) => s.status === 'past')
    .sort((a, b) => b.date.localeCompare(a.date));

  // Group by year
  const groupedByYear = pastShows.reduce((acc, show) => {
    const year = show.date.split('-')[0] || '2025';
    if (!acc[year]) acc[year] = [];
    acc[year].push(show);
    return acc;
  }, {} as Record<string, Show[]>);

  const years = Object.keys(groupedByYear).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-10 pb-16">
      <SEOHead
        title="Tour Archive &amp; Past Concerts"
        description="Historic tour archives and past concert dates for Anthony BeastMode."
        canonicalPath="/tour/archive"
      />

      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Upcoming Tour Dates</span>
        </button>
      </div>

      <div className="border-b border-[var(--border-subtle)] pb-4">
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">
          Tour Archive
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
          Historical record of completed shows, tour routing, and recaps.
        </p>
      </div>

      {years.length > 0 ? (
        <div className="space-y-8">
          {years.map((year) => (
            <section key={year} className="space-y-4">
              <h2 className="text-xl font-bold text-[var(--accent)] font-mono border-b border-[var(--border-subtle)] pb-2">
                {year} Tour Dates
              </h2>
              <div className="space-y-3">
                {groupedByYear[year].map((show) => {
                  const city = cities.find((c) => c.id === show.cityId);
                  const venue = venues.find((v) => v.id === show.venueId);

                  return (
                    <div
                      key={show.id}
                      onClick={() => onSelectShow(show)}
                      className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-xs font-mono font-bold text-[var(--text-muted)] w-24">
                          {show.date}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-[var(--text-primary)]">
                            {city ? `${city.name}, ${city.state}` : 'City'} &bull; {venue ? venue.name : 'Venue'}
                          </h3>
                          {show.recapCopy && (
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                              {show.recapCopy}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-semibold text-[var(--accent)] hover:underline shrink-0 self-end sm:self-center">
                        View Recap &rarr;
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
          No archived past shows on file.
        </div>
      )}
    </div>
  );
};
