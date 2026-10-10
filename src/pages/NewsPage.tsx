import React, { useState } from 'react';
import { Calendar, Filter, Tag } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { SEOHead } from '../components/common/SEOHead';
import { NewsPost } from '../types/database';

interface NewsPageProps {
  onSelectPost: (post: NewsPost) => void;
}

export const NewsPage: React.FC<NewsPageProps> = ({ onSelectPost }) => {
  const { newsPosts } = useDatabase();
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const availableTags = ['all', 'tour', 'music', 'announcements', 'community'];

  const filteredPosts = newsPosts.filter((post) => {
    if (selectedTag === 'all') return true;
    return post.tags.includes(selectedTag);
  });

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title="Official News &amp; Tour Updates"
        description="Latest tour dates announcements, music drops, and community updates from Anthony BeastMode."
        canonicalPath="/news"
      />

      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
          Official Dispatches
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          News &amp; Tour Announcements
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Verified updates directly from Anthony BeastMode tour operations and management.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-[11px] font-semibold text-[var(--text-muted)] mr-2 flex items-center space-x-1">
          <Filter className="w-3.5 h-3.5" />
          <span>Category:</span>
        </span>
        {availableTags.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTag(t)}
            className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
              selectedTag === t
                ? 'bg-[var(--accent)] text-[#0B0C10] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
            }`}
          >
            {t === 'all' ? 'All Updates' : t}
          </button>
        ))}
      </div>

      {/* Articles Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => onSelectPost(post)}
            className="cursor-pointer rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col justify-between hover:border-[var(--accent)] transition-all group"
          >
            <div>
              {post.heroImageUrl && (
                <div className="relative aspect-video w-full overflow-hidden bg-[var(--bg-elevated)]">
                  <img
                    src={post.heroImageUrl}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              <div className="p-5 space-y-2.5">
                <div className="flex items-center space-x-2 text-[10px] text-[var(--text-muted)] font-mono">
                  <span>{new Date(post.publishAt).toLocaleDateString()}</span>
                  <span>&bull;</span>
                  <span className="text-[var(--accent)] uppercase font-semibold">{post.tags[0]}</span>
                </div>

                <h2 className="text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">
                  {post.body}
                </p>
              </div>
            </div>

            <div className="p-5 pt-0 flex items-center justify-between text-xs text-[var(--accent)] font-semibold">
              <span>Read Full Article &rarr;</span>
              <span className="text-[10px] text-[var(--text-muted)] font-normal">{post.authorTeam}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
