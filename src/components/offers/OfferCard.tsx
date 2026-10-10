import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, ShieldAlert, Tag } from 'lucide-react';
import { PartnerOffer } from '../../types/database';
import { useDatabase } from '../../context/DatabaseContext';

interface OfferCardProps {
  offer: PartnerOffer;
}

export const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  const { recordOfferClick, cities } = useDatabase();
  const [finePrintOpen, setFinePrintOpen] = useState(false);

  const city = offer.cityId ? cities.find((c) => c.id === offer.cityId) : null;

  const handleClick = () => {
    recordOfferClick(offer.id);
  };

  return (
    <article className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] overflow-hidden shadow-sm hover:border-[var(--accent)] transition-all flex flex-col justify-between">
      <div className="p-5 space-y-4">
        {/* Top Header: Partner Identity & Fixed Sponsored Label */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center space-x-3">
            {offer.partnerLogoUrl ? (
              <img
                src={offer.partnerLogoUrl}
                alt={`${offer.partnerName} logo`}
                loading="lazy"
                className="w-8 h-8 rounded-full object-cover border border-[var(--border-subtle)]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center text-xs font-bold text-[var(--accent)]">
                {offer.partnerName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {offer.partnerName}
              </h4>
              {city && (
                <span className="text-[10px] text-[var(--accent)] font-medium">
                  Exclusive to {city.name}, {city.state}
                </span>
              )}
            </div>
          </div>

          {/* Mandatory Non-Removable Sponsored Label */}
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Sponsored
          </span>
        </div>

        {/* Headline & Discount Text */}
        <div className="space-y-1.5">
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug">
            {offer.headline}
          </h3>
          <p className="text-xs text-[var(--accent)] font-semibold">
            {offer.discountText}
          </p>
        </div>

        {/* Call to Action Button */}
        <div className="pt-2">
          <a
            href={offer.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="w-full py-2.5 px-4 text-xs font-semibold rounded-md bg-[var(--accent)] text-[#0B0C10] hover:bg-[var(--accent-hover)] transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <span>{offer.ctaLabel || 'View Offer'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Expandable Fine Print Drawer Directly Under Offer */}
      <div className="border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
        <button
          onClick={() => setFinePrintOpen(!finePrintOpen)}
          aria-expanded={finePrintOpen}
          className="w-full px-5 py-2.5 text-left text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center justify-between transition-colors"
        >
          <span>Offer Details &amp; Full Fine Print</span>
          {finePrintOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {finePrintOpen && (
          <div className="px-5 pb-4 pt-1 text-[11px] text-[var(--text-secondary)] leading-relaxed space-y-2 border-t border-[var(--border-subtle)]/50">
            <p className="whitespace-pre-line">{offer.finePrint}</p>
            <div className="pt-1 text-[10px] text-[var(--text-muted)] flex items-center justify-between">
              <span>Valid through {new Date(offer.endAt).toLocaleDateString()}</span>
              {offer.signedTermsRef && <span>Terms Ref: {offer.signedTermsRef}</span>}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
