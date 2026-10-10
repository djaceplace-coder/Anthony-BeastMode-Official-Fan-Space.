import React from 'react';
import { Disc3, Volume2 } from 'lucide-react';
import { Release } from '../../types/database';

interface ReleaseCardProps {
  release: Release;
  onSelect: (release: Release) => void;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, onSelect }) => {
  const releaseYear = release.releaseDate ? release.releaseDate.split('-')[0] : '2026';

  return (
    <article
      onClick={() => onSelect(release)}
      className="group relative cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-3 transition-all hover:border-[var(--accent)] hover:shadow-lg flex flex-col justify-between"
    >
      <div>
        {/* Aspect Ratio 1:1 Cover Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
          {release.coverUrl ? (
            <img
              src={release.coverUrl}
              alt={`${release.title} cover art`}
              loading="lazy"
              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-[var(--text-muted)]">
              <Disc3 className="w-12 h-12 mb-2 stroke-1 text-[var(--accent)]" />
              <span className="text-[11px] font-medium">Cover Pending Team Approval</span>
            </div>
          )}

          {/* Explicit Badge */}
          {release.explicit && (
            <span className="absolute top-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400 backdrop-blur-sm border border-amber-400/30">
              18+ Explicit
            </span>
          )}

          {/* Release Type Badge */}
          <span className="absolute bottom-2 left-2 rounded bg-black/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-primary)] backdrop-blur-sm">
            {release.type}
          </span>
        </div>

        {/* Title & Metadata */}
        <div className="mt-3 space-y-1">
          <h3 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
            {release.title}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Anthony BeastMode &bull; {releaseYear}
          </p>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-mono">
          {release.status === 'announced' ? 'Pre-Save' : 'Stream Now'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(release);
          }}
          className="inline-flex items-center space-x-1 text-xs font-semibold text-[var(--accent)] group-hover:text-[var(--accent-hover)]"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span>Listen</span>
        </button>
      </div>
    </article>
  );
};
