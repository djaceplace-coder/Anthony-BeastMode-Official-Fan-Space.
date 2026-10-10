import React from 'react';
import {
  Calendar,
  Disc3,
  ExternalLink,
  Flame,
  MapPin,
  Play,
  Sparkles,
  Ticket,
  Users,
  Volume2,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useAuth } from '../context/AuthContext';
import { ReleaseCard } from '../components/music/ReleaseCard';
import { TourDateRow } from '../components/tour/TourDateRow';
import { OfferCard } from '../components/offers/OfferCard';
import { PlatformButtonGroup } from '../components/music/PlatformButtonGroup';
import { SEOHead } from '../components/common/SEOHead';
import { Release, Show } from '../types/database';

interface HomePageProps {
  navigate: (route: string) => void;
  onSelectRelease: (release: Release) => void;
  onSelectShow: (show: Show) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  navigate,
  onSelectRelease,
  onSelectShow,
}) => {
  const { artistProfile, releases, shows, offers, newsPosts, cities } = useDatabase();
  const { selectedCityId } = useAuth();

  // Latest released project
  const featuredRelease = releases.find((r) => r.featured) || releases[0];

  // Up to 3 upcoming shows sorted by date
  const upcomingShows = shows
    .filter((s) => s.status !== 'past' && s.status !== 'cancelled')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3);

  // Personalized next show for selected city (if selected)
  const cityNextShow = selectedCityId
    ? shows.find((s) => s.cityId === selectedCityId && s.status !== 'past')
    : null;
  const selectedCity = selectedCityId ? cities.find((c) => c.id === selectedCityId) : null;

  // Active sponsored offers
  const activeOffers = offers.filter((o) => o.status === 'approved').slice(0, 2);

  // Latest news posts
  const latestNews = newsPosts.slice(0, 3);

  return (
    <div className="space-y-16 pb-16">
      <SEOHead
        title="Official Tour Dates, Releases & Fan Club"
        description={`${artistProfile.displayName} official music hub, live tour dates, city tour hubs, and community fan club. Rooted in Missouri.`}
        canonicalPath="/"
      />

      {/* Hero Section: Bandcamp-inspired clean, restrained layout */}
      <section className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-10 lg:p-12 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Latest Release Focus */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative aspect-square w-full max-w-[340px] sm:max-w-[380px] rounded-xl overflow-hidden shadow-2xl border border-[var(--border-subtle)] group">
              {featuredRelease?.coverUrl ? (
                <img
                  src={featuredRelease.coverUrl}
                  alt={`${featuredRelease.title} album cover`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--bg-elevated)] flex flex-col items-center justify-center p-6 text-center">
                  <Disc3 className="w-16 h-16 text-[var(--accent)] mb-2" />
                  <span className="text-xs text-[var(--text-muted)]">Official Cover Pending</span>
                </div>
              )}
              {featuredRelease?.explicit && (
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400 border border-amber-400/30">
                  18+ Explicit
                </span>
              )}
            </div>
          </div>

          {/* Right: Narrative, Streaming Actions, City Proximity */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
                  Latest Official Release
                </span>
                <span className="text-[11px] text-[var(--text-muted)] font-mono">&bull; {featuredRelease?.type.toUpperCase()}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--text-primary)] tracking-tight">
                {featuredRelease?.title || artistProfile.displayName}
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl">
                {featuredRelease?.description || artistProfile.shortBio}
              </p>
            </div>

            {/* Platform links */}
            {featuredRelease && (
              <div className="space-y-3 pt-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Listen On Your Platform:
                </span>
                <PlatformButtonGroup platformLinks={featuredRelease.platformLinks} />
              </div>
            )}

            {/* Next Show in Viewer's Selected City (if set) */}
            {cityNextShow && selectedCity ? (
              <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--accent)] flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Next Show in {selectedCity.name}, {selectedCity.state}</span>
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{cityNextShow.date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--text-primary)] font-medium">
                    {cityNextShow.showTime} &bull; {cityNextShow.priceLabel || 'Price at checkout'}
                  </p>
                  <button
                    onClick={() => onSelectShow(cityNextShow)}
                    className="text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    View Show Details &rarr;
                  </button>
                </div>
              </div>
            ) : null}

            {/* Primary Action Row */}
            <div className="flex flex-wrap gap-3 pt-2">
              {featuredRelease && (
                <button
                  onClick={() => onSelectRelease(featuredRelease)}
                  className="px-5 py-2.5 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-all flex items-center space-x-2 shadow-sm"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Open Release Hub</span>
                </button>
              )}
              <button
                onClick={() => navigate('/tour')}
                className="px-5 py-2.5 text-xs font-semibold rounded-md bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4 text-[var(--accent)]" />
                <span>All Tour Dates</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Shows Strip */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Upcoming Tour Dates
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Official ticketing vendors only. Verified prices subject to change per vendor.
            </p>
          </div>
          <button
            onClick={() => navigate('/tour')}
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            View Full Tour ({shows.length}) &rarr;
          </button>
        </div>

        <div className="space-y-3">
          {upcomingShows.length > 0 ? (
            upcomingShows.map((show) => (
              <TourDateRow
                key={show.id}
                show={show}
                onViewShow={onSelectShow}
              />
            ))
          ) : (
            <div className="p-8 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-muted)]">
                New dates are currently being routed. Join the Fan Club for instant local presale alerts.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Discography Highlights Strip */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Featured Discography
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Official releases streamed through authorized platform players.
            </p>
          </div>
          <button
            onClick={() => navigate('/music')}
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            Full Catalog ({releases.length}) &rarr;
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {releases.slice(0, 4).map((rel) => (
            <ReleaseCard
              key={rel.id}
              release={rel}
              onSelect={onSelectRelease}
            />
          ))}
        </div>
      </section>

      {/* Sponsored Partner Offers Strip (if approved offers exist) */}
      {activeOffers.length > 0 && (
        <section className="space-y-6">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              Partner Offers &amp; Member Perks
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Verified sponsor discounts with full terms and conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeOffers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* Fan Club Call to Action Banner */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-8 sm:p-10 relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold border border-[var(--accent)]/20">
            <Users className="w-3.5 h-3.5" />
            <span>Official Fan Club Community</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)]">
            Join the Rebel Family Fan Club
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Free membership built with Bandcamp-like clarity. Get first access to local tour announcements, direct replies from the fan support team, and verified partner perks. No spam, no card fees.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--text-muted)] pt-2">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>City-targeted presale notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Direct member chat with artist team</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Exclusive pre-show meetup invites</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
              <span>Privacy-first, zero third-party tracking</span>
            </div>
          </div>
          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2.5 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-all shadow-sm"
            >
              Join Fan Club (Free)
            </button>
            <button
              onClick={() => navigate('/fan-club')}
              className="px-5 py-2.5 text-xs font-medium rounded-md border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* News & Tour Announcements */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
              News &amp; Official Dispatches
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Verified announcements published by Anthony BeastMode tour coordination.
            </p>
          </div>
          <button
            onClick={() => navigate('/news')}
            className="text-xs font-semibold text-[var(--accent)] hover:underline"
          >
            All News &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {latestNews.map((post) => (
            <article
              key={post.id}
              onClick={() => navigate(`/news/${post.slug}`)}
              className="cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 hover:border-[var(--accent)] transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-[11px] text-[var(--text-muted)] font-mono">
                  <span>{new Date(post.publishAt).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span className="uppercase text-[var(--accent)]">{post.tags[0]}</span>
                </div>
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug hover:text-[var(--accent)] transition-colors">
                  {post.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] line-clamp-3 leading-relaxed">
                  {post.body}
                </p>
              </div>
              <span className="text-xs font-semibold text-[var(--accent)] pt-2 inline-flex items-center">
                Read Update &rarr;
              </span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
