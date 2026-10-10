import React from 'react';
import { ExternalLink, Headphones, Info } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { PlatformButtonGroup } from '../components/music/PlatformButtonGroup';
import { SEOHead } from '../components/common/SEOHead';
import { Release } from '../types/database';

interface ListenHubPageProps {
  navigate: (route: string) => void;
  onSelectRelease: (release: Release) => void;
}

export const ListenHubPage: React.FC<ListenHubPageProps> = ({ navigate, onSelectRelease }) => {
  const { releases, artistProfile } = useDatabase();

  const artistProfiles: Record<string, string> = {
    spotify: 'https://open.spotify.com/artist/anthony-beastmode',
    apple_music: 'https://music.apple.com/us/artist/anthony-beastmode',
    youtube_music: 'https://music.youtube.com/channel/anthony-beastmode',
    amazon_music: 'https://music.amazon.com/artists/anthony-beastmode',
    tidal: 'https://tidal.com/artist/anthony-beastmode',
    deezer: 'https://www.deezer.com/artist/anthony-beastmode',
    bandcamp: 'https://anthonybeastmode.bandcamp.com',
  };

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title="Streaming Platform Hub (/music/listen)"
        description="Stream Anthony BeastMode on your favorite platform: Spotify, Apple Music, YouTube Music, Tidal, Deezer, and Bandcamp."
        canonicalPath="/music/listen"
      />

      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
          Direct Streaming Portal
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          Listen Hub
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl">
          Quickly access the Anthony BeastMode discography on your preferred audio platform. Every stream and follow helps fuel independent tour routing.
        </p>
      </div>

      {/* Artist Profile Hub */}
      <section className="p-6 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center border border-[var(--accent)]/20">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Follow Anthony BeastMode Artist Profiles
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Save the artist to your library on any platform
            </p>
          </div>
        </div>

        <PlatformButtonGroup platformLinks={artistProfiles} size="md" />
      </section>

      {/* Release by Release Hub */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Catalog By Release
        </h2>

        <div className="space-y-4">
          {releases.map((release) => (
            <div
              key={release.id}
              className="p-5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-4">
                <div
                  onClick={() => onSelectRelease(release)}
                  className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-[var(--border-subtle)] cursor-pointer"
                >
                  {release.coverUrl ? (
                    <img src={release.coverUrl} alt={release.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-elevated)]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold uppercase text-[var(--accent)]">{release.type}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">&bull; {release.releaseDate}</span>
                  </div>
                  <h3
                    onClick={() => onSelectRelease(release)}
                    className="text-base font-bold text-[var(--text-primary)] hover:text-[var(--accent)] cursor-pointer transition-colors"
                  >
                    {release.title}
                  </h3>
                  <button
                    onClick={() => onSelectRelease(release)}
                    className="text-xs text-[var(--text-secondary)] hover:underline mt-0.5"
                  >
                    View tracklist &amp; liner notes &rarr;
                  </button>
                </div>
              </div>

              <div className="shrink-0 self-start md:self-center">
                <PlatformButtonGroup platformLinks={release.platformLinks} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explanatory note (Section 4 requirement) */}
      <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-start space-x-3 text-xs text-[var(--text-muted)] leading-relaxed">
        <Info className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
        <p>
          Streams on every listed platform (Spotify, Apple Music, YouTube Music, Deezer, Bandcamp, and others) count directly toward official charting metrics and the artist's independent royalty distributions. Thank you for listening legitimately.
        </p>
      </div>
    </div>
  );
};
