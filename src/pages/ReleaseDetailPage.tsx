import React from 'react';
import {
  ArrowLeft,
  Calendar,
  Disc3,
  ExternalLink,
  Info,
  Layers,
  Music,
  Share2,
  ShieldAlert,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { Release, Track } from '../types/database';
import { PlatformButtonGroup } from '../components/music/PlatformButtonGroup';
import { EmbedFacade } from '../components/music/EmbedFacade';
import { TrackRow } from '../components/music/TrackRow';
import { SEOHead } from '../components/common/SEOHead';

interface ReleaseDetailPageProps {
  release: Release;
  onBack: () => void;
  onSelectRelease: (release: Release) => void;
}

export const ReleaseDetailPage: React.FC<ReleaseDetailPageProps> = ({
  release,
  onBack,
  onSelectRelease,
}) => {
  const { tracks, releases } = useDatabase();

  // Tracks for this release
  const releaseTracks = tracks
    .filter((t) => t.releaseId === release.id)
    .sort((a, b) => a.trackNumber - b.trackNumber);

  // Related releases (same format or other featured)
  const relatedReleases = releases
    .filter((r) => r.id !== release.id)
    .slice(0, 3);

  // Total runtime
  const totalSeconds = releaseTracks.reduce((acc, t) => acc + (t.durationSeconds || 0), 0);
  const runtimeMin = Math.floor(totalSeconds / 60);

  // Release schema for SEO
  const releaseSchema = {
    '@type': 'MusicAlbum',
    name: release.title,
    byArtist: {
      '@type': 'Person',
      name: 'Anthony BeastMode',
    },
    datePublished: release.releaseDate,
    numTracks: releaseTracks.length,
    genre: ['Country Rap', 'Outlaw Country', 'Southern Hip-Hop'],
  };

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title={`${release.title} (${release.type.toUpperCase()})`}
        description={`Stream ${release.title} by Anthony BeastMode. Official tracklist, player embed, and streaming links.`}
        canonicalPath={`/music/${release.slug}`}
        ogImage={release.coverUrl}
        ogType="music.album"
        schemaData={releaseSchema}
      />

      {/* Back button */}
      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Music Catalog</span>
        </button>
      </div>

      {/* Main Release Hero (Two-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column: 1:1 Cover Art & Quick Badges */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
            {release.coverUrl ? (
              <img
                src={release.coverUrl}
                alt={`${release.title} artwork`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-elevated)]">
                <Disc3 className="w-16 h-16 text-[var(--accent)] mb-2" />
                <span className="text-xs text-[var(--text-muted)]">Official Artwork Pending</span>
              </div>
            )}

            {release.explicit && (
              <span className="absolute top-3 right-3 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-amber-400 border border-amber-400/30">
                18+ Explicit
              </span>
            )}
          </div>

          {/* Clean Version Alternate Link (if present) */}
          {release.cleanVersionUrl && (
            <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-secondary)] font-medium">Clean Version Available:</span>
              <a
                href={release.cleanVersionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline inline-flex items-center space-x-1 font-semibold"
              >
                <span>Listen Clean</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Title, Metadata, Platform Buttons, Description */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30">
                {release.type}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {release.releaseDate}
              </span>
              {releaseTracks.length > 0 && (
                <>
                  <span className="text-xs text-[var(--text-muted)]">&bull;</span>
                  <span className="text-xs text-[var(--text-muted)]">
                    {releaseTracks.length} tracks {runtimeMin > 0 && `(${runtimeMin} min)`}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[var(--text-primary)] tracking-tight">
              {release.title}
            </h1>
            <p className="text-sm font-medium text-[var(--accent)]">
              Anthony BeastMode
            </p>
          </div>

          {/* Description / Liner Notes (approved copy) */}
          {release.description && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl">
              {release.description}
            </p>
          )}

          {/* Streaming Platform Group */}
          <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Select Streaming Service:
            </h3>
            <PlatformButtonGroup platformLinks={release.platformLinks} />
          </div>

          {/* Embed Facade Player */}
          {release.embedUrl && (
            <div className="pt-2">
              <EmbedFacade
                embedUrl={release.embedUrl}
                provider={release.embedProvider}
                explicit={release.explicit}
                title={release.title}
              />
            </div>
          )}
        </div>
      </div>

      {/* Track List Section */}
      <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text-primary)]">
            Tracklist ({releaseTracks.length})
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            All tracks streamed via official external players
          </span>
        </div>

        {releaseTracks.length > 0 ? (
          <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] divide-y divide-[var(--border-subtle)] overflow-hidden">
            {releaseTracks.map((track, idx) => (
              <TrackRow key={track.id} track={track} index={idx} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
            Track listing being verified by management.
          </div>
        )}
      </section>

      {/* Credits and Approved Liner Notes */}
      {release.credits && release.credits.length > 0 && (
        <section className="space-y-3 pt-6 border-t border-[var(--border-subtle)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Official Production &amp; Writing Credits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {release.credits.map((c, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs"
              >
                <div className="font-semibold text-[var(--text-primary)]">{c.role}</div>
                <div className="text-[var(--text-secondary)]">{c.name}</div>
                {c.source && (
                  <div className="text-[10px] text-[var(--text-muted)] mt-1">Source: {c.source}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Releases */}
      {relatedReleases.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            More from Anthony BeastMode
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedReleases.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectRelease(rel)}
                className="cursor-pointer p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all flex items-center space-x-3"
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-[var(--border-subtle)]">
                  {rel.coverUrl ? (
                    <img src={rel.coverUrl} alt={rel.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-elevated)]" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-[var(--text-primary)] truncate">{rel.title}</h4>
                  <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">{rel.type} &bull; {rel.releaseDate.split('-')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
