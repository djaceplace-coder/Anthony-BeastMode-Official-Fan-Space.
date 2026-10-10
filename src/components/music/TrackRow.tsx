import React, { useState } from 'react';
import { ExternalLink, Music, ShieldAlert } from 'lucide-react';
import { Track } from '../../types/database';
import { useAuth } from '../../context/AuthContext';
import { AgeGateModal } from '../common/AgeGateModal';

interface TrackRowProps {
  track: Track;
  index: number;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, index }) => {
  const { is18PlusConfirmed } = useAuth();
  const [showAgeModal, setShowAgeModal] = useState(false);

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStreamClick = (e: React.MouseEvent, url: string) => {
    if (track.explicit && !is18PlusConfirmed) {
      e.preventDefault();
      setShowAgeModal(true);
    }
  };

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-md hover:bg-[var(--bg-elevated)] transition-colors border-b border-[var(--border-subtle)] text-xs">
      <div className="flex items-center space-x-3 min-w-0">
        <span className="w-5 text-center font-mono text-[var(--text-muted)] shrink-0">
          {track.trackNumber || index + 1}
        </span>
        <div className="truncate">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-[var(--text-primary)] truncate">
              {track.title}
            </span>
            {track.explicit && (
              <span className="px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 text-[9px] font-bold border border-amber-500/20 shrink-0">
                E
              </span>
            )}
          </div>
          {/* Lyrics Status Pill */}
          <div className="mt-0.5 text-[10px] text-[var(--text-muted)]">
            {track.lyricsStatus === 'instrumental' && (
              <span className="text-emerald-500">Instrumental track</span>
            )}
            {track.lyricsStatus === 'licensed' && track.licensedLyricsUrl && (
              <a
                href={track.licensedLyricsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--accent)] underline inline-flex items-center space-x-0.5"
              >
                <span>Licensed lyrics</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
            {track.lyricsStatus === 'not_shown' && (
              <span>Lyrics: Unlicensed / Not Shown</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 shrink-0 font-mono text-[var(--text-muted)]">
        <span>{formatDuration(track.durationSeconds)}</span>
        {track.platformLinks && Object.entries(track.platformLinks || {})[0] && (
          <a
            href={Object.entries(track.platformLinks || {})[0][1]}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleStreamClick(e, Object.entries(track.platformLinks || {})[0][1])}
            className="text-[var(--accent)] hover:underline flex items-center space-x-1"
          >
            <span>Stream</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {showAgeModal && (
        <AgeGateModal
          isOpen={showAgeModal}
          onClose={() => setShowAgeModal(false)}
          onConfirm={() => {
            setShowAgeModal(false);
            if (track.platformLinks && Object.entries(track.platformLinks || {})[0]) {
              window.open(Object.entries(track.platformLinks || {})[0][1], '_blank', 'noopener,noreferrer');
            }
          }}
          itemTitle={track.title}
        />
      )}
    </div>
  );
};
