import React, { useState } from 'react';
import { Filter, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { ReleaseCard } from '../components/music/ReleaseCard';
import { SEOHead } from '../components/common/SEOHead';
import { Release, ReleaseType } from '../types/database';

interface MusicPageProps {
  navigate: (route: string) => void;
  onSelectRelease: (release: Release) => void;
}

export const MusicPage: React.FC<MusicPageProps> = ({ navigate, onSelectRelease }) => {
  const { releases } = useDatabase();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filterExplicit, setFilterExplicit] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'az'>('newest');

  // Filter logic
  const filteredReleases = releases.filter((rel) => {
    if (selectedType !== 'all' && rel.type !== selectedType) return false;
    if (filterExplicit === 'clean' && rel.explicit) return false;
    if (filterExplicit === 'explicit' && !rel.explicit) return false;
    return true;
  });

  // Sort logic
  const sortedReleases = [...filteredReleases].sort((a, b) => {
    if (sortBy === 'newest') return b.releaseDate.localeCompare(a.releaseDate);
    if (sortBy === 'oldest') return a.releaseDate.localeCompare(b.releaseDate);
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    return 0;
  });

  // Curated "Start With" featured releases
  const featuredReleases = releases.filter((r) => r.featured);

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title="Discography &amp; Releases"
        description="Official discography for Anthony BeastMode: albums, EPs, and singles. Stream on Spotify, Apple Music, YouTube Music, and Bandcamp."
        canonicalPath="/music"
      />

      {/* Header & Quick Hub Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border-subtle)] pb-6 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            Official Catalog
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] mt-1">
            Music &amp; Discography
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Explore studio albums, singles, and underground releases with verified platform players.
          </p>
        </div>

        <button
          onClick={() => navigate('/music/listen')}
          className="self-start md:self-auto px-4 py-2 text-xs font-semibold rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] text-[var(--text-primary)] transition-all"
        >
          Open Streaming Platform Hub &rarr;
        </button>
      </div>

      {/* Curated "Start With" Section (Section 5.8) */}
      {featuredReleases.length > 0 && selectedType === 'all' && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <span>Start With: Essential Releases</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {featuredReleases.map((rel) => (
              <div
                key={`featured-${rel.id}`}
                onClick={() => onSelectRelease(rel)}
                className="cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 hover:border-[var(--accent)] transition-all flex items-center space-x-4"
              >
                <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 border border-[var(--border-subtle)]">
                  {rel.coverUrl ? (
                    <img src={rel.coverUrl} alt={rel.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-elevated)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--accent)]">{rel.type}</span>
                    {rel.explicit && (
                      <span className="text-[9px] font-bold px-1 rounded bg-black/60 text-amber-400">18+</span>
                    )}
                  </div>
                  <h3 className="text-sm font-bold text-[var(--text-primary)] truncate mt-0.5">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] line-clamp-1 mt-0.5">
                    {rel.description || 'Verified release.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-2 flex items-center space-x-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Format:</span>
          </span>
          {['all', 'album', 'ep', 'single', 'mixtape'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                selectedType === t
                  ? 'bg-[var(--accent)] text-[#0B0C10] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
              }`}
            >
              {t === 'all' ? 'All Formats' : t}
            </button>
          ))}
        </div>

        {/* Content Advisory & Sort Controls */}
        <div className="flex items-center space-x-3 text-xs w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={filterExplicit}
            onChange={(e) => setFilterExplicit(e.target.value)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            aria-label="Filter explicit content"
          >
            <option value="all">All Content</option>
            <option value="clean">Clean Only</option>
            <option value="explicit">Explicit (18+)</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            aria-label="Sort releases"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="az">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {sortedReleases.length > 0 ? (
          sortedReleases.map((release) => (
            <ReleaseCard
              key={release.id}
              release={release}
              onSelect={onSelectRelease}
            />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-xs text-[var(--text-muted)] bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-subtle)]">
            No releases found matching the selected filter criteria.
          </div>
        )}
      </div>
    </div>
  );
};
