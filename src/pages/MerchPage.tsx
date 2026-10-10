import React from 'react';
import { ExternalLink, ShieldAlert, ShoppingBag } from 'lucide-react';
import { SEOHead } from '../components/common/SEOHead';

export const MerchPage: React.FC = () => {
  const officialMerchItems = [
    {
      id: 'merch-1',
      title: 'Trailer Park Baby Heavyweight Tour Tee',
      priceLabel: '$35.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      description: 'Vintage mineral wash 100% heavyweight cotton with album graphic front and Midwest tour dates back.',
      officialStoreUrl: 'https://anthonybeastmode.myshopify.com/products/tour-tee',
    },
    {
      id: 'merch-2',
      title: 'Outlaw Country Roads Embroidered Trucker Hat',
      priceLabel: '$28.00',
      status: 'low_stock',
      imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=600&q=80',
      description: 'Classic foam snapback with custom brass-stitched outlaw patch.',
      officialStoreUrl: 'https://anthonybeastmode.myshopify.com/products/trucker-hat',
    },
    {
      id: 'merch-3',
      title: 'Missouri Rebel Family Pullover Hoodie',
      priceLabel: '$65.00',
      status: 'available',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
      description: 'Fleece-lined winter hoodie with ribbed cuffs and distressed backprint.',
      officialStoreUrl: 'https://anthonybeastmode.myshopify.com/products/hoodie',
    },
    {
      id: 'merch-4',
      title: 'Limited Edition Vinyl: Trailer Park Baby (180g)',
      priceLabel: '$40.00',
      status: 'sold_out',
      imageUrl: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=600&q=80',
      description: 'First pressing smoke-gray vinyl with 12-page lyric booklet and liner credits.',
      officialStoreUrl: 'https://anthonybeastmode.myshopify.com/products/vinyl',
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      <SEOHead
        title="Official Merchandise Highlights"
        description="Official Anthony BeastMode tour apparel, hats, hoodies, and vinyl. Direct links to the authorized online store."
        canonicalPath="/merch"
      />

      {/* Header */}
      <div className="border-b border-[var(--border-subtle)] pb-6 space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">
          Official Apparel &amp; Goods
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-primary)]">
          Merchandise Highlights
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          All orders are handled and fulfilled securely through our official external webstore. No cards or checkout on this domain.
        </p>
      </div>

      {/* Merch Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {officialMerchItems.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden flex flex-col justify-between hover:border-[var(--accent)] transition-all"
          >
            <div>
              <div className="relative aspect-square w-full overflow-hidden bg-[var(--bg-elevated)]">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
                <span
                  className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${
                    item.status === 'sold_out'
                      ? 'bg-red-500/80 text-white'
                      : item.status === 'low_stock'
                      ? 'bg-amber-500/80 text-black'
                      : 'bg-black/70 text-emerald-400'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">
                    {item.title}
                  </h3>
                  <span className="text-xs font-mono font-bold text-[var(--accent)] shrink-0 ml-2">
                    {item.priceLabel}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              {item.status === 'sold_out' ? (
                <button
                  disabled
                  className="w-full py-2 px-3 text-xs font-medium rounded-md bg-gray-800 text-gray-500 cursor-not-allowed text-center"
                >
                  Sold Out at Store
                </button>
              ) : (
                <a
                  href={item.officialStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>Buy at Official Store</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Note */}
      <div className="p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-xs text-[var(--text-muted)] text-center">
        Merchandise inventory and sizing are managed exclusively by the official fulfillment partner. Shipping, returns, and exchanges are governed by the store's checkout policies.
      </div>
    </div>
  );
};
