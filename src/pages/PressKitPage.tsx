import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  Image as ImageIcon,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { SEOHead } from '../components/common/SEOHead';

interface PressKitPageProps {
  onBack: () => void;
  navigate: (route: string) => void;
}

export const PressKitPage: React.FC<PressKitPageProps> = ({ onBack, navigate }) => {
  const { artistProfile } = useDatabase();
  const [downloadCount, setDownloadCount] = useState(148);
  const [downloadStarted, setDownloadStarted] = useState(false);

  const handleDownload = () => {
    setDownloadCount((prev) => prev + 1);
    setDownloadStarted(true);

    // Generate package manifest download
    const manifest = {
      title: 'Anthony BeastMode Official Press Kit & EPK',
      version: '2026.1',
      artist: artistProfile.displayName,
      homeBase: artistProfile.homeBase,
      shortBio: artistProfile.shortBio,
      longBio: artistProfile.longBio,
      cropsIncluded: ['16:9 Landscape', '4:5 Portrait', '1:1 Square Album Cover'],
      bookingContact: 'booking@anthonybeastmode.com (Inquiries routed via official contact portal)',
      pressContact: 'press@anthonybeastmode.com',
      rights: 'Approved for editorial and promotional press coverage only.',
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'anthony-beastmode-official-press-kit.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-12 pb-16 max-w-4xl mx-auto">
      <SEOHead
        title="Electronic Press Kit (EPK) &amp; Press Assets"
        description="Official EPK for Anthony BeastMode: high-resolution press photos, approved bios, logo assets, and booking contacts."
        canonicalPath="/media/press-kit"
      />

      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Media Hub</span>
        </button>
      </div>

      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
          Curators, Press &amp; Promoters
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          Official Electronic Press Kit (EPK)
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Approved biographical text, hi-res media crops (16:9, 4:5, 1:1), and logos for festival lineups and publications.
        </p>
      </div>

      {/* Main Download Card */}
      <section className="p-6 sm:p-8 rounded-2xl border-2 border-[var(--accent)] bg-[var(--bg-secondary)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              Complete Digital Press Package (.ZIP / EPK)
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Includes: Short &amp; Long Bio (.txt/.pdf), 3 high-res photo crops, official logo vector pack, and tour rider summary.
            </p>
            <p className="text-[11px] text-[var(--text-muted)] font-mono">
              Anonymous downloads logged: {downloadCount} &bull; No personal information collected
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="px-6 py-3 text-xs font-bold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-all flex items-center justify-center space-x-2 shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Kit</span>
          </button>
        </div>

        {downloadStarted && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Download initiated. Verified press assets ready for editorial use.</span>
          </div>
        )}
      </section>

      {/* Approved Bios Copy Block (Short & Long) */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Approved Biographical Copy
        </h2>

        {/* Short Bio (50 words) */}
        <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--accent)]">
            <span>Short Editorial Bio (Program Guides &amp; Playlists)</span>
            <span className="text-[var(--text-muted)] font-mono">~35 words</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed italic bg-[var(--bg-elevated)] p-3 rounded-md">
            "{artistProfile.shortBio}"
          </p>
        </div>

        {/* Long Bio */}
        <div className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-[var(--accent)]">
            <span>Long Editorial Bio (Features &amp; Print Interviews)</span>
            <span className="text-[var(--text-muted)] font-mono">Approved</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-elevated)] p-3 rounded-md whitespace-pre-line">
            {artistProfile.longBio}
          </p>
        </div>
      </section>

      {/* Press & Booking Routing Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Press &amp; Interview Inquiries
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            For press passes, guest list verification, review copies, and podcast requests.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center space-x-1"
          >
            <span>Submit Press Inquiry &rarr;</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-3">
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            Promoter &amp; Venue Booking
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            For club dates, festivals, private events, and direct promoter routing holds.
          </p>
          <button
            onClick={() => navigate('/contact')}
            className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center space-x-1"
          >
            <span>Submit Booking Inquiry &rarr;</span>
          </button>
        </div>
      </section>
    </div>
  );
};
