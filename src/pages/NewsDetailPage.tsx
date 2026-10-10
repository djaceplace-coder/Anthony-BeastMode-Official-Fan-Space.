import React from 'react';
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react';
import { NewsPost } from '../types/database';
import { useDatabase } from '../context/DatabaseContext';
import { SEOHead } from '../components/common/SEOHead';

interface NewsDetailPageProps {
  post: NewsPost;
  onBack: () => void;
  onSelectPost: (post: NewsPost) => void;
}

export const NewsDetailPage: React.FC<NewsDetailPageProps> = ({
  post,
  onBack,
  onSelectPost,
}) => {
  const { newsPosts } = useDatabase();

  const relatedPosts = newsPosts
    .filter((p) => p.id !== post.id && p.tags.some((t) => post.tags.includes(t)))
    .slice(0, 2);

  return (
    <div className="space-y-10 pb-16 max-w-3xl mx-auto">
      <SEOHead
        title={post.title}
        description={post.body.slice(0, 150)}
        canonicalPath={`/news/${post.slug}`}
        ogImage={post.heroImageUrl}
      />

      <div>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Updates</span>
        </button>
      </div>

      <article className="space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--text-muted)]">
            <span>{new Date(post.publishAt).toLocaleDateString()}</span>
            <span>&bull;</span>
            <span className="text-[var(--accent)] uppercase font-semibold">{post.authorTeam}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)] leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {post.heroImageUrl && (
          <div className="rounded-2xl overflow-hidden border border-[var(--border-subtle)] aspect-video w-full bg-[var(--bg-elevated)]">
            <img src={post.heroImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed space-y-4 whitespace-pre-line">
          {post.body}
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-[var(--border-subtle)]">
          <h3 className="text-base font-bold text-[var(--text-primary)]">Related Dispatches</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedPosts.map((rel) => (
              <div
                key={rel.id}
                onClick={() => onSelectPost(rel)}
                className="cursor-pointer p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] transition-all space-y-1.5"
              >
                <span className="text-[10px] font-mono text-[var(--accent)] uppercase font-semibold">
                  {rel.tags[0]}
                </span>
                <h4 className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{rel.title}</h4>
                <p className="text-[11px] text-[var(--text-muted)] line-clamp-2">{rel.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
