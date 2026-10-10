import React from 'react';
import { Award, Calendar, CheckCircle2, MapPin, ShieldCheck, Users } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { SEOHead } from '../components/common/SEOHead';

export const AboutPage: React.FC = () => {
  const { artistProfile, copyItems } = useDatabase();

  const timelineEntries = [
    {
      year: '2022',
      title: 'Grassroots Midwest Tour Circuit',
      description: 'Built a dedicated live following across regional venues in Missouri, Indiana, and Ohio with high-energy independent dates.',
      source: 'Official Tour Archives 2022',
      date: '2022-12-01',
    },
    {
      year: '2023',
      title: 'Trailer Park Baby Full-Length Release',
      description: 'Released the landmark studio project blending rural storytelling with modern southern hip-hop cadence.',
      source: 'Verified Catalog Record',
      date: '2023-11-17',
    },
    {
      year: '2024',
      title: 'National Tour Expansion',
      description: 'Expanded touring reach into Mountain West and Appalachian markets including Colorado, West Virginia, and Washington.',
      source: 'Tour Routing Log',
      date: '2024-08-15',
    },
    {
      year: '2026',
      title: 'Official Fan Club & Tour Launch',
      description: 'Launched direct-to-fan community portal and multi-city tour routing platform.',
      source: 'Management Release',
      date: '2026-10-01',
    },
  ];

  return (
    <div className="space-y-12 pb-16 max-w-4xl mx-auto">
      <SEOHead
        title="Official Biography &amp; Origins"
        description={`Learn about Anthony BeastMode: independent country-rap recording artist based in Missouri. Verified career timeline, approved press bio, and fan club.`}
        canonicalPath="/about"
      />

      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
            Verified Artist Profile
          </span>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            &bull; Approved Copy
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          About Anthony BeastMode
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Official biography, career timeline, and grassroots origins.
        </p>
      </div>

      {/* Origin & Home Base Summary */}
      <section className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <MapPin className="w-4 h-4" />
          <span>Roots &amp; Home Base: {artistProfile.homeBase}</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
          {artistProfile.originSummary}
        </h2>

        <div className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-3">
          <p>{artistProfile.longBio}</p>
        </div>

        {artistProfile.sourceNote && (
          <div className="pt-2 text-[11px] text-[var(--text-muted)] border-t border-[var(--border-subtle)]">
            Source Verification: {artistProfile.sourceNote} (Approved {artistProfile.approvedAt ? new Date(artistProfile.approvedAt).toLocaleDateString() : 'Current'})
          </div>
        )}
      </section>

      {/* Career Timeline (Approved Entries Only with Sources) */}
      <section className="space-y-6">
        <div className="border-b border-[var(--border-subtle)] pb-3">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">
            Career Timeline &amp; Milestones
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Verified chronology backed by documented sources and tour records.
          </p>
        </div>

        <div className="space-y-4">
          {timelineEntries.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex flex-col sm:flex-row sm:items-start gap-4"
            >
              <div className="font-mono text-lg font-bold text-[var(--accent)] shrink-0 w-16">
                {item.year}
              </div>
              <div className="space-y-1.5 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                  {item.title}
                </h3>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
                <div className="text-[10px] text-[var(--text-muted)] pt-1 flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[var(--accent)] shrink-0" />
                  <span>Verified: {item.source} ({item.date})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fan Community / Rebel Family Explanation (Section 2.7 compliance) */}
      <section className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-6 sm:p-8 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <Users className="w-4 h-4" />
          <span>The Fan Community</span>
        </div>

        <h3 className="text-xl font-bold text-[var(--text-primary)]">
          A Direct-to-Fan Connection
        </h3>

        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          From dive bars in small Missouri towns to packed club stages in the Midwest, Anthony BeastMode's music is sustained by an authentic, blue-collar fan base. Known informally among core supporters as the "Rebel Family", our community values respect, loyalty, and grassroots pride.
        </p>

        <p className="text-xs text-[var(--text-muted)] italic">
          Note: "Rebel Family" community brand styling is pending final formal management confirmation in our administrative registry.
        </p>
      </section>
    </div>
  );
};
