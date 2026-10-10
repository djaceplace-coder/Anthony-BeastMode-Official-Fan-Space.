import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Share2,
  Ticket,
  Users,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { City, Show } from '../types/database';
import { TourDateRow } from '../components/tour/TourDateRow';
import { OfferCard } from '../components/offers/OfferCard';
import { SEOHead } from '../components/common/SEOHead';

interface CityPageProps {
  city: City;
  navigate: (route: string) => void;
  onSelectShow: (show: Show) => void;
}

export const CityPage: React.FC<CityPageProps> = ({ city, navigate, onSelectShow }) => {
  const { shows, venues, offers, submitInquiry } = useDatabase();
  const { setSelectedCityId, selectedCityId } = useAuth();
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [fanEmail, setFanEmail] = useState('');

  // Shows in this city
  const cityShows = shows
    .filter((s) => s.cityId === city.id)
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcomingCityShows = cityShows.filter((s) => s.status !== 'past');
  const pastCityShows = cityShows.filter((s) => s.status === 'past');
  const nextShow = upcomingCityShows[0];

  // Venues in this city
  const cityVenues = venues.filter((v) => v.cityId === city.id);

  // Local partner offers scoped specifically to this city
  const localOffers = offers.filter(
    (o) => o.status === 'approved' && o.cityId === city.id
  );

  const isSelectedAsHomeCity = selectedCityId === city.id;

  const handleCityAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fanEmail) return;
    await submitInquiry({
      category: 'fans',
      name: 'City Fan',
      email: fanEmail,
      city: city.name,
      topic: 'City Tour Alert Opt-In',
      message: `Direct presale alert subscription for ${city.name}, ${city.state}`,
    });
    setAlertSubscribed(true);
    setSelectedCityId(city.id);
  };

  // Structured event schema for local search
  const cityEventSchema = nextShow
    ? {
        '@type': 'Event',
        name: `Anthony BeastMode Live in ${city.name}`,
        startDate: `${nextShow.date}T${nextShow.showTime}`,
        eventStatus: nextShow.status === 'cancelled' ? 'https://schema.org/EventCancelled' : 'https://schema.org/EventScheduled',
        location: {
          '@type': 'Place',
          name: cityVenues[0]?.name || `${city.name} Venue`,
          address: {
            '@type': 'PostalAddress',
            addressLocality: city.name,
            addressRegion: city.state,
            addressCountry: 'US',
          },
        },
        offers: {
          '@type': 'Offer',
          url: nextShow.officialTicketUrl,
          price: nextShow.priceLabel,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        },
      }
    : undefined;

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title={`${city.name}, ${city.state} Tour Hub &amp; Tickets`}
        description={`Anthony BeastMode live shows, venue information, and presale ticket alerts for ${city.name}, ${city.state}.`}
        canonicalPath={`/tour/${city.slug}`}
        ogImage={city.heroImageUrl}
        schemaData={cityEventSchema}
      />

      {/* City Hero Banner (16:9 Landscape) */}
      <section className="relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] bg-[var(--bg-secondary)] shadow-sm">
        <div className="relative h-64 sm:h-80 w-full">
          {city.heroImageUrl ? (
            <img
              src={city.heroImageUrl}
              alt={`${city.name}, ${city.state} city banner`}
              className="w-full h-full object-cover brightness-60"
            />
          ) : (
            <div className="w-full h-full bg-[var(--bg-elevated)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent to-black/30" />

          {/* Hero Details Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1 text-white">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/60 text-[var(--accent)] border border-[var(--accent)]/30 backdrop-blur-sm">
                  Priority Tier {city.priorityTier} Tour Stop
                </span>
                <span className="text-xs text-gray-300 font-mono">{city.timeZone}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                {city.name}, {city.state}
              </h1>
              {city.cityNote && (
                <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
                  {city.cityNote}
                </p>
              )}
            </div>

            <button
              onClick={() => setSelectedCityId(city.id)}
              className={`px-4 py-2 rounded-md text-xs font-semibold transition-all shrink-0 ${
                isSelectedAsHomeCity
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)]'
              }`}
            >
              {isSelectedAsHomeCity ? '✓ Set as Your Local Hub' : 'Set as My Local Hub'}
            </button>
          </div>
        </div>
      </section>

      {/* Next Show Spotlight (if active) */}
      {nextShow && (
        <section className="rounded-2xl border-2 border-[var(--accent)] bg-[var(--bg-secondary)] p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] flex items-center space-x-1.5">
              <Calendar className="w-4 h-4" />
              <span>Next Upcoming Concert in {city.name}</span>
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">{nextShow.date}</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-[var(--text-primary)]">
                {cityVenues.find((v) => v.id === nextShow.venueId)?.name || 'Venue TBA'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                Doors: {nextShow.doorsTime || 'TBA'} &bull; Showtime: {nextShow.showTime} &bull; Age Policy: {nextShow.agePolicy.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-xs text-[var(--text-muted)] font-medium">
                {nextShow.priceLabel ? `${nextShow.priceLabel} (Per ${nextShow.priceSource})` : 'Price at checkout'}
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button
                onClick={() => onSelectShow(nextShow)}
                className="px-4 py-2.5 text-xs font-medium rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                Show Details &amp; VIP
              </button>
              {nextShow.officialTicketUrl && (
                <a
                  href={nextShow.officialTicketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 text-xs font-bold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center space-x-1.5 shadow-sm"
                >
                  <Ticket className="w-4 h-4" />
                  <span>Buy Tickets</span>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* All Upcoming Shows in this City */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Scheduled Shows in {city.name} ({upcomingCityShows.length})
        </h2>
        {upcomingCityShows.length > 0 ? (
          <div className="space-y-3">
            {upcomingCityShows.map((s) => (
              <TourDateRow key={s.id} show={s} onViewShow={onSelectShow} />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-2">
            <p className="text-xs text-[var(--text-muted)]">
              No upcoming dates currently scheduled for {city.name}. Request a tour date below to register interest.
            </p>
          </div>
        )}
      </section>

      {/* Venue Information Card */}
      {cityVenues.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Local Venue Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cityVenues.map((v) => (
              <div
                key={v.id}
                className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3"
              >
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{v.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>{v.address}</span>
                  </p>
                </div>
                {v.capacityRange && (
                  <p className="text-xs text-[var(--text-secondary)]">
                    <span className="font-semibold">Capacity Range:</span> {v.capacityRange}
                  </p>
                )}
                {v.website && (
                  <a
                    href={v.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                  >
                    <span>Official Venue Site</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Local Partner Offers Scoped to This City */}
      {localOffers.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Local Offers for {city.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* City Fan Alert Opt-In & Rebel Family Community Block */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <Bell className="w-4 h-4" />
          <span>Local Fan Alerts</span>
        </div>

        <div className="max-w-2xl space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            Get Direct {city.name} Presale &amp; Show Alerts
          </h3>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Never miss an intimate club gig or presale ticket drop in {city.name}. We send verified notices only when tour dates in your area are announced.
          </p>
        </div>

        {alertSubscribed ? (
          <div className="p-4 rounded-xl bg-[var(--accent)]/10 text-xs text-[var(--accent)] font-semibold border border-[var(--accent)]/30">
            ✓ You are subscribed to {city.name} tour alerts.
          </div>
        ) : (
          <form onSubmit={handleCityAlertSubmit} className="flex flex-col sm:flex-row gap-2.5 max-w-md pt-1">
            <input
              type="email"
              placeholder="Your email address"
              value={fanEmail}
              onChange={(e) => setFanEmail(e.target.value)}
              required
              className="flex-1 px-3 py-2 text-xs rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors"
            >
              Get Alerts
            </button>
          </form>
        )}
      </section>

      {/* Past Shows in This City Archive (Section 4 requirement) */}
      {pastCityShows.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Past Shows in {city.name} (Last 12 Months)
          </h2>
          <div className="space-y-2">
            {pastCityShows.map((s) => (
              <TourDateRow key={s.id} show={s} onViewShow={onSelectShow} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
