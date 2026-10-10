import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  Eye,
  Film,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

interface MediaHubPageProps {
  navigate: (route: string) => void;
}

export const MediaHubPage: React.FC<MediaHubPageProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'videos' | 'interviews'>('photos');
  const [activeLightboxImage, setActiveLightboxImage] = useState<string | null>(null);

  const approvedPhotos = [
    {
      id: 'photo-1',
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      caption: 'Live concert stage spotlight — Midwest Tour',
      credit: 'Official Tour Media',
      city: 'Kansas City, MO',
      year: '2026',
      ratio: '16:9 Landscape',
    },
    {
      id: 'photo-2',
      url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      caption: 'Crowd energy and guitar performance',
      credit: 'Live Vault Photography',
      city: 'Dayton, OH',
      year: '2026',
      ratio: '16:9 Landscape',
    },
    {
      id: 'photo-3',
      url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      caption: 'Acoustic songwriting studio session',
      credit: 'Sound Lab Midwest',
      city: 'Blue Springs, MO',
      year: '2025',
      ratio: '1:1 Square',
    },
    {
      id: 'photo-4',
      url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
      caption: 'Outdoor festival stage performance',
      credit: 'Tri-State Media Group',
      city: 'Evansville, IN',
      year: '2025',
      ratio: '16:9 Landscape',
    },
  ];

  const officialVideos = [
    {
      id: 'vid-1',
      title: 'Trailer Park Baby (Official Visualizer)',
      date: '2023-11-20',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      outlet: 'Official YouTube Channel',
      caption: 'Official audio visualizer for Trailer Park Baby.',
    },
    {
      id: 'vid-2',
      title: 'Live Tour Highlight Reel (Midwest Shows)',
      date: '2024-05-10',
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      outlet: 'Anthony BeastMode Official',
      caption: 'Live performance compilation from grassroots club tour.',
    },
  ];

  const licensedInterviews = [
    {
      id: 'int-1',
      title: 'Country Rap Independents: The Rise of Anthony BeastMode',
      outlet: 'Heartland Music Journal',
      date: '2024-03-12',
      summary: 'Discussing the blending of rural Missouri blues with modern 808 percussion and direct fan loyalty.',
      hasTranscript: true,
      url: 'https://example.com/heartland-interview',
    },
    {
      id: 'int-2',
      title: 'Independent Tour Routing & Grassroots Fan Clubs',
      outlet: 'Underground Roots Radio',
      date: '2023-09-18',
      summary: 'Conversations on building sustainable tour circuits without major label distribution.',
      hasTranscript: false,
      url: 'https://example.com/roots-radio',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title="Official Media Hub: Photos, Videos &amp; Interviews"
        description="Official photo gallery, music video embeds, press kit, and licensed interviews for Anthony BeastMode."
        canonicalPath="/media"
      />

      {/* Header & Press Kit Direct Link */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-[var(--border-subtle)] pb-6 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            Approved Media Vault
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] mt-1">
            Media &amp; Press Assets
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Official concert photography, music videos, interviews, and media kit downloads.
          </p>
        </div>

        <button
          onClick={() => navigate('/media/press-kit')}
          className="self-start md:self-auto px-4 py-2 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-all flex items-center space-x-1.5 shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Press Kit &rarr;</span>
        </button>
      </div>

      {/* Media Type Tabs */}
      <div className="flex border-b border-[var(--border-subtle)] gap-6 text-xs font-bold uppercase tracking-wider">
        <button
          onClick={() => setActiveTab('photos')}
          className={`pb-3 transition-colors flex items-center space-x-1.5 border-b-2 ${
            activeTab === 'photos'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Photos ({approvedPhotos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('videos')}
          className={`pb-3 transition-colors flex items-center space-x-1.5 border-b-2 ${
            activeTab === 'videos'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Videos ({officialVideos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('interviews')}
          className={`pb-3 transition-colors flex items-center space-x-1.5 border-b-2 ${
            activeTab === 'interviews'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Interviews ({licensedInterviews.length})</span>
        </button>
      </div>

      {/* Photo Gallery Tab */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {approvedPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setActiveLightboxImage(photo.url)}
              className="cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden group hover:border-[var(--accent)] transition-all flex flex-col justify-between"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg-elevated)]">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Eye className="w-6 h-6" />
                </div>
              </div>

              <div className="p-3.5 space-y-1">
                <p className="text-xs font-semibold text-[var(--text-primary)] line-clamp-1">
                  {photo.caption}
                </p>
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] pt-1">
                  <span>{photo.city}</span>
                  <span>{photo.credit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Grid Tab (Official Embeds, No Autoplay) */}
      {activeTab === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {officialVideos.map((vid) => (
            <div
              key={vid.id}
              className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-[10px] text-[var(--accent)] font-bold uppercase tracking-wider">
                  <span>{vid.outlet}</span>
                  <span>&bull;</span>
                  <span className="text-[var(--text-muted)]">{vid.date}</span>
                </div>
                <h3 className="text-base font-bold text-[var(--text-primary)]">
                  {vid.title}
                </h3>
              </div>

              <div className="aspect-video w-full rounded-lg overflow-hidden border border-[var(--border-subtle)] bg-black">
                <iframe
                  src={vid.embedUrl}
                  title={vid.title}
                  width="100%"
                  height="100%"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                  className="w-full h-full border-0"
                />
              </div>

              {vid.caption && (
                <p className="text-xs text-[var(--text-secondary)]">{vid.caption}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Interviews Tab */}
      {activeTab === 'interviews' && (
        <div className="space-y-4">
          {licensedInterviews.map((intItem) => (
            <div
              key={intItem.id}
              className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">
                  {intItem.outlet} &bull; {intItem.date}
                </span>
                {intItem.hasTranscript && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                    Licensed Transcript
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-[var(--text-primary)]">
                {intItem.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {intItem.summary}
              </p>
              <div className="pt-2">
                <a
                  href={intItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                >
                  <span>Read Full Article at {intItem.outlet}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxImage && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
        >
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveLightboxImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-[var(--accent)] text-xs flex items-center space-x-1"
            >
              <X className="w-5 h-5" />
              <span>Close (Esc)</span>
            </button>
            <img
              src={activeLightboxImage}
              alt="Expanded photo preview"
              className="w-full max-h-[80vh] object-contain rounded-lg border border-[var(--border-subtle)]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
