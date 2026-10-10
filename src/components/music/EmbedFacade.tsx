import React, { useState } from 'react';
import { Play, ShieldAlert, Volume2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AgeGateModal } from '../common/AgeGateModal';

interface EmbedFacadeProps {
  embedUrl?: string;
  provider?: 'spotify' | 'apple_music' | 'deezer' | 'youtube' | 'none';
  explicit?: boolean;
  title: string;
}

const ALLOWED_EMBED_HOSTS = [
  'open.spotify.com',
  'embed.music.apple.com',
  'widget.deezer.com',
  'www.youtube.com',
  'youtube.com',
  'bandcamp.com',
];

export const EmbedFacade: React.FC<EmbedFacadeProps> = ({
  embedUrl,
  provider = 'spotify',
  explicit = false,
  title,
}) => {
  const { is18PlusConfirmed } = useAuth();
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);

  if (!embedUrl || provider === 'none') {
    return null;
  }

  // Validate URL host against allowlist
  let isValidHost = false;
  try {
    const parsed = new URL(embedUrl);
    isValidHost = ALLOWED_EMBED_HOSTS.some((host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`));
  } catch {
    isValidHost = false;
  }

  if (!isValidHost) {
    return (
      <div className="p-4 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)]">
        Official player embed awaiting domain verification.
      </div>
    );
  }

  const handleActivateClick = () => {
    if (explicit && !is18PlusConfirmed) {
      setShowAgeModal(true);
    } else {
      setIsLoaded(true);
    }
  };

  const handleAgeConfirmed = () => {
    setShowAgeModal(false);
    setIsLoaded(true);
  };

  return (
    <div className="w-full my-4">
      {!isLoaded ? (
        <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-all hover:border-[var(--accent)]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0 border border-[var(--accent)]/20">
                <Volume2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                    Official {provider.replace('_', ' ').toUpperCase()} Player
                  </h4>
                  {explicit && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      18+ Explicit
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Privacy facade: click below to load the secure platform player. No third-party cookies until loaded.
                </p>
              </div>
            </div>

            <button
              onClick={handleActivateClick}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center space-x-2 shrink-0 shadow-sm"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Show Player</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <iframe
            src={embedUrl}
            title={`${title} official player`}
            width="100%"
            height={provider === 'spotify' ? '152' : '175'}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="border-0"
          />
        </div>
      )}

      {showAgeModal && (
        <AgeGateModal
          isOpen={showAgeModal}
          onClose={() => setShowAgeModal(false)}
          onConfirm={handleAgeConfirmed}
          itemTitle={title}
        />
      )}
    </div>
  );
};
