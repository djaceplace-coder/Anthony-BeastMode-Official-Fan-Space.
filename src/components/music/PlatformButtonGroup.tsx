import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PlatformLink } from '../../types/database';

interface PlatformButtonGroupProps {
  platformLinks: Record<string, PlatformLink | string>;
  size?: 'sm' | 'md';
}

const PLATFORM_META: Record<string, { label: string; color: string }> = {
  spotify: { label: 'Spotify', color: 'hover:border-[#1DB954] hover:text-[#1DB954]' },
  apple_music: { label: 'Apple Music', color: 'hover:border-[#FA2D48] hover:text-[#FA2D48]' },
  youtube_music: { label: 'YouTube Music', color: 'hover:border-[#FF0000] hover:text-[#FF0000]' },
  amazon_music: { label: 'Amazon Music', color: 'hover:border-[#00A8E1] hover:text-[#00A8E1]' },
  tidal: { label: 'Tidal', color: 'hover:border-white hover:text-white' },
  deezer: { label: 'Deezer', color: 'hover:border-[#A238FF] hover:text-[#A238FF]' },
  audiomack: { label: 'Audiomack', color: 'hover:border-[#FFA200] hover:text-[#FFA200]' },
  bandcamp: { label: 'Bandcamp', color: 'hover:border-[#629AA9] hover:text-[#629AA9]' },
};

export const PlatformButtonGroup: React.FC<PlatformButtonGroupProps> = ({
  platformLinks,
  size = 'md',
}) => {
  const entries = Object.entries(platformLinks).filter(([, val]) => {
    if (!val) return false;
    if (typeof val === 'string') return val.trim().length > 0;
    return val.url && val.url.trim().length > 0;
  });

  if (entries.length === 0) {
    return (
      <p className="text-xs text-[var(--text-muted)] italic">
        Platform links updating shortly.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {entries.map(([key, val]) => {
        const url = typeof val === 'string' ? val : val.url;
        const meta = PLATFORM_META[key] || { label: key, color: 'hover:border-[var(--accent)]' };

        return (
          <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center space-x-1.5 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)] font-medium text-[var(--text-secondary)] transition-all ${meta.color} ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
            }`}
          >
            <span>{meta.label}</span>
            <ExternalLink className="w-3 h-3 opacity-60" />
          </a>
        );
      })}
    </div>
  );
};
